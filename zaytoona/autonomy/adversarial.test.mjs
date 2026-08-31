import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

async function isolated() {
  const dir = await mkdtemp(join(tmpdir(), 'zaytoona-chaos-'));
  process.env.ZAYTOONA_STATE = join(dir, 'state.json');
  process.env.ZAYTOONA_EVIDENCE = join(dir, 'evidence.ndjson');
  const store = await import(`./store.mjs?${Date.now()}-${Math.random()}`);
  const runtime = await import(`./runtime.mjs?${Date.now()}-${Math.random()}`);
  return { dir, store, runtime };
}

test('recovery: failed execution returns job to READY, then next run can resume', async () => {
  const { dir, store, runtime } = await isolated();
  try {
    await store.saveState(process.env.ZAYTOONA_STATE, {
      version: 1, missions: [], events: [],
      jobs: [{ id: 'chaos-resume', status: 'READY', priority: 100, attempts: 0 }]
    });
    const first = await runtime.runOnce(async () => { throw new Error('SIMULATED_WORKER_CRASH'); });
    assert.equal(first.status, 'READY');
    const second = await runtime.runOnce(async () => ({ ok: true, artifact: 'resume-proof' }));
    assert.equal(second.status, 'PASSED');
    const evidence = await readFile(process.env.ZAYTOONA_EVIDENCE, 'utf8');
    assert.match(evidence, /SIMULATED_WORKER_CRASH/);
    assert.match(evidence, /"type":"PASSED"/);
  } finally { await rm(dir, { recursive: true, force: true }); }
});

test('safety: missing executor is blocked rather than falsely passed', async () => {
  const { dir, store, runtime } = await isolated();
  try {
    await store.saveState(process.env.ZAYTOONA_STATE, {
      version: 1, missions: [], events: [],
      jobs: [{ id: 'no-executor', status: 'READY', priority: 100 }]
    });
    const result = await runtime.runOnce(undefined);
    assert.equal(result.status, 'BLOCKED');
    assert.equal(result.reason, 'NO_EXECUTOR_CONFIGURED');
  } finally { await rm(dir, { recursive: true, force: true }); }
});

test('recovery: repeated failure is bounded and ends BLOCKED', async () => {
  const { dir, store, runtime } = await isolated();
  try {
    await store.saveState(process.env.ZAYTOONA_STATE, {
      version: 1, missions: [], events: [],
      jobs: [{ id: 'bounded-failure', status: 'READY', priority: 100, attempts: 0 }]
    });
    let result;
    for (let i = 0; i < 3; i++) result = await runtime.runOnce(async () => { throw new Error('SIMULATED_REPEAT_FAILURE'); });
    assert.equal(result.status, 'BLOCKED');
    const state = await store.loadState(process.env.ZAYTOONA_STATE);
    assert.equal(state.jobs[0].status, 'BLOCKED');
    assert.equal(state.jobs[0].attempts, 3);
  } finally { await rm(dir, { recursive: true, force: true }); }
});
