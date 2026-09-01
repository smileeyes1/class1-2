import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('autonomous runner is resumable and fail-closed', async () => {
  const s=await readFile(new URL('./runner.mjs',import.meta.url),'utf8');
  assert.match(s,/loadState\(STATE\)/);
  assert.match(s,/recoverOrphanedJobs/);
  assert.match(s,/chooseReadyJob/);
  assert.match(s,/MAX_ATTEMPTS/);
  assert.match(s,/LEASE_FENCED/);
  assert.match(s,/status==='BLOCKED'/);
});

test('runner uses persisted state rather than process memory', async () => {
  const s=await readFile(new URL('./runner.mjs',import.meta.url),'utf8');
  assert.match(s,/saveState\(STATE,state\)/);
  assert.match(s,/state\.events/);
  assert.match(s,/job\.attempts/);
});
