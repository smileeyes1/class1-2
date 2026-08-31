import { mkdir, writeFile } from 'node:fs/promises';
import { loadState, saveState } from './store.mjs';
import { assertTransition, chooseReadyJob } from './state-machine.mjs';

const STATE = process.env.ZAYTOONA_STATE || './.zaytoona/state.json';
const EVIDENCE = process.env.ZAYTOONA_EVIDENCE || './.zaytoona/evidence.ndjson';
const HEARTBEAT_MS = Math.max(5000, Number(process.env.ZAYTOONA_HEARTBEAT_MS || 30000));
const MAX_ATTEMPTS = Math.max(1, Number(process.env.ZAYTOONA_MAX_ATTEMPTS || 3));

async function evidence(event) {
  await mkdir(new URL('.', `file://${process.cwd()}/.zaytoona/`), {recursive:true}).catch(()=>{});
  await writeFile(EVIDENCE, JSON.stringify({...event, at:new Date().toISOString()})+'\n', {encoding:'utf8', flag:'a'});
}

async function runOnce(executor = async job => ({ok:true, result:{jobId:job.id}})) {
  let state = await loadState(STATE);
  const job = chooseReadyJob(state.jobs);
  if (!job) return {status:'IDLE'};

  job.status = assertTransition(job.status,'CLAIMED');
  job.lease = {worker:process.pid, acquiredAt:new Date().toISOString()};
  state = await saveState(STATE,state);
  await evidence({type:'CLAIMED',jobId:job.id,worker:process.pid});

  try {
    job.status = assertTransition(job.status,'RUNNING');
    job.attempts = (job.attempts||0)+1;
    state = await saveState(STATE,state);
    const result = await executor(job);
    job.status = assertTransition(job.status,'VERIFYING');
    job.evidence = result;
    if (!result?.ok) throw new Error('Executor returned non-ok result');
    job.status = assertTransition(job.status,'PASSED');
    job.lease = null;
    await saveState(STATE,state);
    await evidence({type:'PASSED',jobId:job.id,evidence:result});
    return {status:'PASSED',jobId:job.id};
  } catch (error) {
    job.error = String(error?.message || error);
    job.status = assertTransition(job.status,'FAILED');
    state = await saveState(STATE,state);
    await evidence({type:'FAILED',jobId:job.id,error:job.error,attempts:job.attempts});
    job.status = assertTransition(job.status,'RECOVERING');
    if (job.attempts >= MAX_ATTEMPTS) {
      job.status = assertTransition(job.status,'BLOCKED');
      job.lease = null;
    } else {
      job.status = assertTransition(job.status,'READY');
      job.lease = null;
    }
    await saveState(STATE,state);
    await evidence({type:'RECOVERY',jobId:job.id,nextStatus:job.status});
    return {status:job.status,jobId:job.id};
  }
}

export async function start(executor) {
  let stopped = false;
  const stop = () => { stopped = true; };
  process.on('SIGTERM', stop); process.on('SIGINT', stop);
  while (!stopped) {
    await runOnce(executor).catch(async e => evidence({type:'RUNTIME_ERROR',error:String(e?.message||e)}));
    if (!stopped) await new Promise(r=>setTimeout(r,HEARTBEAT_MS));
  }
}

if (import.meta.url === `file://${process.argv[1]}`) start();
