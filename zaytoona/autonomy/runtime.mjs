import { mkdir, writeFile } from 'node:fs/promises';
import { loadState, saveState } from './store.mjs';
import { assertTransition, chooseReadyJob, recoverOrphanedJobs } from './state-machine.mjs';

const STATE = process.env.ZAYTOONA_STATE || './.zaytoona/state.json';
const EVIDENCE = process.env.ZAYTOONA_EVIDENCE || './.zaytoona/evidence.ndjson';
const HEARTBEAT_MS = Math.max(5000, Number(process.env.ZAYTOONA_HEARTBEAT_MS || 30000));
const MAX_ATTEMPTS = Math.max(1, Number(process.env.ZAYTOONA_MAX_ATTEMPTS || 3));
const LEASE_MS = Math.max(10000, Number(process.env.ZAYTOONA_LEASE_MS || 120000));

async function evidence(event) {
  await mkdir(new URL('.', `file://${process.cwd()}/.zaytoona/`), {recursive:true});
  await writeFile(EVIDENCE, JSON.stringify({...event, at:new Date().toISOString()})+'\n', {encoding:'utf8', flag:'a'});
}

function leaseIsLive(job) { return Boolean(job.lease?.expiresAt && Date.parse(job.lease.expiresAt) > Date.now()); }

async function recoverStale(state) {
  const before = JSON.stringify(state.jobs);
  recoverOrphanedJobs(state.jobs);
  if (before !== JSON.stringify(state.jobs)) {
    state = await saveState(STATE, state);
    for (const job of state.jobs.filter(j => j.recovery?.reason === 'EXPIRED_LEASE' && j.recovery?.at === state.updatedAt)) {
      await evidence({type:'RESUME_READY',jobId:job.id,reason:'EXPIRED_LEASE'});
    }
  }
  return state;
}

export async function runOnce(executor) {
  if (typeof executor !== 'function') return {status:'BLOCKED',reason:'NO_EXECUTOR_CONFIGURED'};
  let state = await loadState(STATE);
  state = await recoverStale(state);
  const job = chooseReadyJob(state.jobs);
  if (!job) return {status:'IDLE'};
  if (leaseIsLive(job) && job.lease.worker !== process.pid) return {status:'BUSY',jobId:job.id};

  job.status = assertTransition(job.status,'CLAIMED');
  const fence = `${process.pid}:${Date.now()}:${Math.random().toString(36).slice(2)}`;
  job.lease = {worker:process.pid,fence,acquiredAt:new Date().toISOString(),expiresAt:new Date(Date.now()+LEASE_MS).toISOString()};
  state = await saveState(STATE,state);
  await evidence({type:'CLAIMED',jobId:job.id,worker:process.pid,fence});

  try {
    job.status = assertTransition(job.status,'RUNNING');
    job.attempts = (job.attempts||0)+1;
    state = await saveState(STATE,state);
    const result = await executor({...job,fence});
    const persisted = await loadState(STATE);
    const persistedJob = persisted.jobs.find(j => j.id === job.id);
    if (persistedJob?.lease?.fence !== fence) throw new Error('LEASE_FENCED');
    job.status = assertTransition(job.status,'VERIFYING');
    job.evidence = result;
    if (!result?.ok) throw new Error('EXECUTOR_RETURNED_NON_OK');
    job.status = assertTransition(job.status,'PASSED');
    job.lease = null;
    await saveState(STATE,state);
    await evidence({type:'PASSED',jobId:job.id,evidence:result});
    return {status:'PASSED',jobId:job.id};
  } catch (error) {
    job.error = String(error?.message || error);
    if (job.status === 'RUNNING' || job.status === 'VERIFYING') job.status = assertTransition(job.status,'FAILED');
    state = await saveState(STATE,state);
    await evidence({type:'FAILED',jobId:job.id,error:job.error,attempts:job.attempts});
    job.status = assertTransition(job.status,'RECOVERING');
    if (job.attempts >= MAX_ATTEMPTS) { job.status = assertTransition(job.status,'BLOCKED'); job.lease = null; }
    else { job.status = assertTransition(job.status,'READY'); job.lease = null; }
    await saveState(STATE,state);
    await evidence({type:'RECOVERY',jobId:job.id,nextStatus:job.status});
    return {status:job.status,jobId:job.id};
  }
}

export async function start(executor) {
  let stopped = false; const stop = () => { stopped = true; };
  process.on('SIGTERM',stop); process.on('SIGINT',stop);
  while (!stopped) {
    await runOnce(executor).catch(async e => evidence({type:'RUNTIME_ERROR',error:String(e?.message||e)}));
    if (!stopped) await new Promise(r=>setTimeout(r,HEARTBEAT_MS));
  }
}

if (import.meta.url === `file://${process.argv[1]}`) start();
