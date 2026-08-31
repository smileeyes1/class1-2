import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const dir = await mkdtemp(join(tmpdir(), 'zaytoona-prod-'));
process.env.ZAYTOONA_STATE = join(dir, 'state.json');
process.env.ZAYTOONA_EVIDENCE = join(dir, 'evidence.ndjson');
process.env.ZAYTOONA_MAX_ATTEMPTS = '3';
process.env.ZAYTOONA_LEASE_MS = '10000';

const { runOnce } = await import('./runtime.mjs');
const { saveState, loadState } = await import('./store.mjs');

function job(id='job-1') {
  return { id, status:'READY', priority:1, attempts:0, dependsOn:[] };
}

test('production gate: failure recovers and the same job can resume', async () => {
  await saveState(process.env.ZAYTOONA_STATE, {version:1, missions:[], jobs:[job()], events:[]});
  const failed = await runOnce(async () => { throw new Error('SIMULATED_CRASH'); });
  assert.equal(failed.status, 'READY');
  const resumed = await runOnce(async () => ({ok:true, proof:'resume-ok'}));
  assert.equal(resumed.status, 'PASSED');
  const state = await loadState(process.env.ZAYTOONA_STATE);
  assert.equal(state.jobs[0].status, 'PASSED');
});

test('production gate: expired lease is recovered before scheduling', async () => {
  await saveState(process.env.ZAYTOONA_STATE, {
    version:1, missions:[], jobs:[{...job('orphan'), status:'RUNNING', lease:{worker:999999,fence:'old',expiresAt:new Date(Date.now()-1000).toISOString()}}], events:[]
  });
  const result = await runOnce(async () => ({ok:true, proof:'lease-recovery-ok'}));
  assert.equal(result.status, 'PASSED');
});

test('production gate: evidence is durable and non-empty', async () => {
  const evidence = await readFile(process.env.ZAYTOONA_EVIDENCE, 'utf8');
  assert.match(evidence, /SIMULATED_CRASH/);
  assert.match(evidence, /PASSED/);
});
