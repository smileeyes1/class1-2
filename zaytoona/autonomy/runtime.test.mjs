import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { assertTransition, chooseReadyJob } from './state-machine.mjs';

test('dependencies gate ready jobs', () => {
  const jobs=[{id:'a',status:'READY',priority:1},{id:'b',status:'READY',priority:9,dependsOn:['a']}];
  assert.equal(chooseReadyJob(jobs).id,'a');
  jobs[0].status='PASSED';
  assert.equal(chooseReadyJob(jobs).id,'b');
});

test('invalid transitions fail closed', () => {
  assert.throws(()=>assertTransition('PASSED','RUNNING'));
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
