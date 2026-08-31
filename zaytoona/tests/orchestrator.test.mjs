import test from 'node:test';
import assert from 'node:assert/strict';
import { runVerticalSlice } from '../orchestrator.mjs';

test('autonomous vertical slice reaches conditional release only after red-team detection', () => {
  const run = runVerticalSlice();
  assert.equal(run.assurance.state, 'READY_FOR_EXECUTION');
  assert.equal(run.red_team.length, 6);
  assert.ok(run.red_team.every(x => x.detected));
  assert.equal(run.release, 'CONDITIONAL_RELEASE');
  assert.deepEqual(run.history.map(x => x.stage), ['PLAN','GENERATE','VALIDATE','RED_TEAM','RELEASE']);
});
