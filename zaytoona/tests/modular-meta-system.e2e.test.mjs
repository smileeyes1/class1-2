import test from 'node:test';
import assert from 'node:assert/strict';
import { runKefayatE2E, META_SYSTEM_VERSION } from '../modular-meta-system.mjs';

test('Kefayat is a complete production module through the modular meta-system', () => {
  const result = runKefayatE2E();
  assert.equal(META_SYSTEM_VERSION, 'Ω MODULAR META-SYSTEM v1.0');
  assert.equal(result.release, 'CONDITIONAL_RELEASE');
  assert.equal(result.assurance.state, 'READY_FOR_EXECUTION');
  assert.equal(result.evaluation.total, 5);
  assert.equal(result.evaluation.correct, 5);
  assert.equal(result.evaluation.mastery, true);
  assert.equal(result.redTeam.length, 6);
  assert.ok(result.redTeam.every(item => item.detected));
  assert.deepEqual(result.history.map(item => item.stage), ['PLAN','GENERATE','VALIDATE','EVALUATE','RED_TEAM','REGRESSION','RELEASE']);
});
