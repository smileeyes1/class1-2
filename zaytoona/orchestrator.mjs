import { generateAdditionWithin10 } from './generator.mjs';
import { validateLesson } from './validator.mjs';

export const PIPELINE = Object.freeze([
  'INTAKE','PLAN','GENERATE','VALIDATE','RED_TEAM','REPAIR','REGRESSION','RELEASE'
]);

export function runVerticalSlice({ maxRepairAttempts = 2 } = {}) {
  const state = { stage: 'INTAKE', history: [], package: null, assurance: null, repairs: 0 };
  const advance = (stage, detail = null) => { state.stage = stage; state.history.push({ stage, detail }); };

  advance('PLAN', { test_case: 'grade1-math-addition-within-10' });
  state.package = generateAdditionWithin10();
  advance('GENERATE', { artifact_id: state.package.id });

  state.assurance = validateLesson(state.package);
  advance('VALIDATE', state.assurance);
  if (state.assurance.state === 'NO-GO') return { ...state, release: 'NO-GO' };

  advance('RED_TEAM', { mode: 'deterministic_fixture_suite', status: 'DEFERRED_TO_TEST_RUN' });

  while (state.assurance.state === 'NO-GO' && state.repairs < maxRepairAttempts) {
    state.repairs += 1;
    advance('REPAIR', { attempt: state.repairs, failures: state.assurance.failures });
    state.assurance = validateLesson(state.package);
    advance('REGRESSION', state.assurance);
  }

  const release = state.assurance.state === 'READY_FOR_EXECUTION' ? 'CONDITIONAL_RELEASE' : 'NO-GO';
  advance('RELEASE', { decision: release, reason: 'local deterministic assurance only; pilot and external CI remain unproven' });
  return { ...state, release };
}
