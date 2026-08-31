import { generateAdditionWithin10 } from './generator.mjs';
import { validateLesson } from './validator.mjs';
import { classifyRisk, routeAgents, rankActions, shouldContinue } from './adaptive-intelligence.mjs';

const REQUIRED_VISUAL_ORDER = 'operand_1→operator→operand_2→equals→result';
export const PIPELINE = Object.freeze(['INTAKE','PLAN','GENERATE','VALIDATE','RED_TEAM','REPAIR','REGRESSION','RELEASE']);

function runRedTeam(pkg) {
  const attacks = [
    ['arithmetic', p => { p.math_operations[0].result = 99; }, 'MATH-001'],
    ['visual-order', p => { p.math_operations[0].visual_order = 'result→equals→operand_2→operator→operand_1'; }, 'MATH-VIS-001'],
    ['visual-count', p => { p.visual_counts[0].actual_count += 1; }, 'VIS-COUNT-001'],
    ['alignment', p => { p.activities[0].objective_links = []; }, 'ALIGN-001'],
    ['time', p => { p.timeline.total_minutes = 46; }, 'TIME-002'],
    ['evidence', p => { p.evidence[0].source = null; p.evidence[0].evidence = null; }, 'EVID-001']
  ];
  return attacks.map(([name, mutate, expected]) => {
    const candidate = structuredClone(pkg);
    mutate(candidate);
    const result = validateLesson(candidate);
    return { name, expected, detected: result.failures.some(f => f.id === expected), state: result.state };
  });
}

export function runVerticalSlice({ maxRepairAttempts = 2 } = {}) {
  const state = { stage:'INTAKE', history:[], package:null, assurance:null, red_team:null, repairs:0, risk:null, agents:[] };
  const advance = (stage, detail = null) => { state.stage = stage; state.history.push({ stage, detail }); };

  state.risk = classifyRisk({ domain:'grade1-math', uncertainty:0.25, impact:0.8, reversibility:0.8 });
  state.agents = routeAgents('math', { risk:state.risk.level, evidenceRequired:true });
  advance('PLAN', {
    test_case:'grade1-math-addition-within-10',
    visual_order:REQUIRED_VISUAL_ORDER,
    risk:state.risk,
    agents:state.agents,
    action_priority:rankActions([
      { id:'generate-and-validate', value:10, confidence:0.9, cost:2, risk:0.05, reversibility:1 },
      { id:'cosmetic-polish', value:2, confidence:0.8, cost:4, risk:0.1, reversibility:1 }
    ])[0].id
  });

  state.package = generateAdditionWithin10();
  advance('GENERATE', { artifact_id:state.package.id });

  state.assurance = validateLesson(state.package);
  advance('VALIDATE', state.assurance);

  if (state.assurance.state === 'NO-GO') {
    const decision = shouldContinue({ criticalFailures:state.assurance.failures.length, unresolvedFailures:state.assurance.failures.length, progress:1, expectedValue:10, remainingCost:2 });
    if (!decision.continue) return { ...state, release:'NO-GO' };
  }

  state.red_team = runRedTeam(state.package);
  advance('RED_TEAM', state.red_team);
  if (!state.red_team.every(x => x.detected)) return { ...state, release:'NO-GO' };

  while (state.assurance.state === 'NO-GO' && state.repairs < maxRepairAttempts) {
    state.repairs += 1;
    advance('REPAIR', { attempt:state.repairs, failures:state.assurance.failures });
    state.assurance = validateLesson(state.package);
    advance('REGRESSION', state.assurance);
  }

  const release = state.assurance.state === 'READY_FOR_EXECUTION' ? 'CONDITIONAL_RELEASE' : 'NO-GO';
  advance('RELEASE', { decision:release, reason:'deterministic local assurance passed; CI, rendering, and classroom pilot remain unproven' });
  return { ...state, release };
}
