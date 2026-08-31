import path from 'node:path';
import {StateStore} from './state-store.js';
import {ensureState, chooseNextJob, startJob, checkpoint, finishJob} from './engine.js';

const root = process.env.ZAYTOONA_STATE_DIR || path.resolve('state');
const store = new StateStore(path.join(root, 'runtime.json'));
const heartbeatMs = Math.max(10_000, Number(process.env.ZAYTOONA_HEARTBEAT_MS || 60_000));

async function cycle() {
  const state = ensureState(await store.load());
  const job = chooseNextJob(state);
  if (!job) { await store.save(state); return {status:'SLEEP'}; }
  startJob(state, job);
  await store.save(state);
  try {
    // v1 runtime contract: orchestration is live; domain executors are injected per job.
    // A job without an executor is not falsely marked successful.
    if (typeof job.executor !== 'string' || !job.executor) throw new Error('NO_EXECUTOR_CONFIGURED');
    finishJob(state, job, 'BLOCKED', [{type:'runtime', status:'BLOCKED', reason:'executor_not_installed'}]);
    checkpoint(state, job, 'BLOCKED');
  } catch (err) {
    finishJob(state, job, 'BLOCKED', [{type:'runtime', status:'BLOCKED', reason:err.message}]);
    checkpoint(state, job, 'BLOCKED');
  }
  await store.save(state);
  return {status:job.status, jobId:job.id};
}

let stopping = false;
for (const sig of ['SIGINT','SIGTERM']) process.on(sig, () => { stopping = true; });

console.log('ZAYTOONA Ω runtime started');
while (!stopping) {
  try { console.log(JSON.stringify(await cycle())); }
  catch (e) { console.error(JSON.stringify({status:'RUNTIME_ERROR', message:e.message})); }
  await new Promise(r => setTimeout(r, heartbeatMs));
}
console.log('ZAYTOONA Ω runtime stopped safely');
