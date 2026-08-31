import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { assertTransition, chooseReadyJob, recoverOrphanedJobs } from './state-machine.mjs';

test('dependencies gate ready jobs', () => {
  const jobs=[{id:'a',status:'READY',priority:1},{id:'b',status:'READY',priority:9,dependsOn:['a']}];
  assert.equal(chooseReadyJob(jobs).id,'a');
  jobs[0].status='PASSED';
  assert.equal(chooseReadyJob(jobs).id,'b');
});

test('invalid transitions fail closed', () => {
  assert.throws(()=>assertTransition('PASSED','RUNNING'));
});

test('expired lease is recovered to READY for restart', () => {
  const jobs=[{id:'x',status:'RUNNING',lease:{worker:99,fence:'old',expiresAt:'2000-01-01T00:00:00.000Z'}}];
  recoverOrphanedJobs(jobs, Date.parse('2026-01-01T00:00:00.000Z'));
  assert.equal(jobs[0].status,'READY');
  assert.equal(jobs[0].lease,null);
  assert.equal(jobs[0].recovery.reason,'EXPIRED_LEASE');
});

test('live lease is not stolen', () => {
  const jobs=[{id:'x',status:'RUNNING',lease:{worker:99,fence:'live',expiresAt:'2027-01-01T00:00:00.000Z'}}];
  recoverOrphanedJobs(jobs, Date.parse('2026-01-01T00:00:00.000Z'));
  assert.equal(jobs[0].status,'RUNNING');
  assert.equal(jobs[0].lease.fence,'live');
});

test('state path can be isolated for crash/restart tests', async () => {
  const dir=await mkdtemp(join(tmpdir(),'zaytoona-'));
  const path=join(dir,'state.json');
  const {saveState,loadState}=await import('./store.mjs');
  await saveState(path,{version:1,missions:[],jobs:[{id:'x',status:'READY'}],events:[]});
  const state=await loadState(path);
  assert.equal(state.jobs[0].id,'x');
  await rm(dir,{recursive:true,force:true});
});
