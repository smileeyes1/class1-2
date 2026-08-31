import { generateAdditionWithin10 } from './generator.mjs';
import { validateLesson } from './validator.mjs';

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
  const state = { stage:'INTAKE', history:[], package:null, assurance:null, red_team:null, repairs:0 };
  const advance = (stage, detail = null) => { state.stage = stage; state.history.push({ stage, detail }); };

  advance('PLAN', { test_case:'grade1-math-addition-within-10', visual_order:REQUIRED_VISUAL_ORDER });
  state.package = generateAdditionWithin10();
  advance('GENERATE', { artifact_id:state.package.id });

  state.assurance = validateLesson(state.package);
  advance('VALIDATE', state.assurance);
  if (state.assurance.state === 'NO-GO') return { ...state, release:'NO-GO' };

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
