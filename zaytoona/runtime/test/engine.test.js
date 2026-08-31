import test from 'node:test';
import assert from 'node:assert/strict';
import {chooseNextJob, startJob, finishJob, checkpoint, ensureState, ingestEvent} from '../src/engine.js';

test('selects highest-priority ready job with completed dependencies', () => {
  const state = ensureState({goals:[], jobs:[
    {id:'a', status:'DONE'},
    {id:'b', status:'READY', priority:1, dependencies:['a']},
    {id:'c', status:'READY', priority:5}
  ]});
  assert.equal(chooseNextJob(state).id, 'c');
});

test('does not select job whose dependency is unresolved', () => {
  const state = ensureState({goals:[], jobs:[{id:'a', status:'RUNNING'},{id:'b', status:'READY', priority:9, dependencies:['a']}]});
  assert.equal(chooseNextJob(state), null);
});

test('job lifecycle produces checkpoint and evidence state', () => {
  const state = ensureState({goals:[], jobs:[{id:'a', status:'READY', priority:1, executor:'test'}]});
  const job = chooseNextJob(state);
  startJob(state, job);
  assert.equal(job.status, 'RUNNING');
  finishJob(state, job, 'DONE', [{type:'test', status:'PASS'}]);
  checkpoint(state, job, 'DONE');
  assert.equal(job.status, 'DONE');
  assert.equal(state.checkpoints.length, 1);
  assert.equal(job.evidence[0].status, 'PASS');
});

test('events are durable records', () => {
  const state = ensureState({goals:[], jobs:[]});
  ingestEvent(state, 'TEST_EVENT', {ok:true});
  assert.equal(state.events.length, 1);
  assert.equal(state.events[0].type, 'TEST_EVENT');
});
