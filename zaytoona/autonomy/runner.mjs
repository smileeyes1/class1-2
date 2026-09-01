import { loadState, saveState } from './store.mjs';
import { execute } from './executors.mjs';
import { assertTransition, chooseReadyJob, recoverOrphanedJobs } from './state-machine.mjs';

const STATE = process.env.ZAYTOONA_STATE || './.zaytoona/state.json';
const MAX_ATTEMPTS = Math.max(1, Number(process.env.ZAYTOONA_MAX_ATTEMPTS || 3));
const LEASE_MS = Math.max(10000, Number(process.env.ZAYTOONA_LEASE_MS || 120000));

const now = () => new Date().toISOString();
const live = j => Boolean(j.lease?.expiresAt && Date.parse(j.lease.expiresAt) > Date.now());

function event(type, extra={}) { return {type, at:now(), ...extra}; }

async function cycle() {
  let state = await loadState(STATE);
  recoverOrphanedJobs(state.jobs);
  let job = chooseReadyJob(state.jobs);
  if (!job) return {status:'IDLE', stateUpdated: false};
  if (live(job) && job.lease.worker !== 'github-actions') return {status:'BUSY', jobId:job.id};

  const fence = `github-actions:${Date.now()}:${Math.random().toString(36).slice(2)}`;
  job.status = assertTransition(job.status,'CLAIMED');
  job.lease = {worker:'github-actions',fence,acquiredAt:now(),expiresAt:new Date(Date.now()+LEASE_MS).toISOString()};
  state.events = [...(state.events||[]),event('CLAIMED',{jobId:job.id,fence})];
  state = await saveState(STATE,state);

  try {
    job.status = assertTransition(job.status,'RUNNING');
    job.attempts = (job.attempts||0)+1;
    state = await saveState(STATE,state);
    const result = await execute({...job,fence});
    state = await loadState(STATE);
    job = state.jobs.find(j=>j.id===job.id);
    if (!job || job.lease?.fence !== fence) throw new Error('LEASE_FENCED');
    job.status = assertTransition(job.status,'VERIFYING');
    job.evidence = result;
    if (!result?.ok) throw new Error('EXECUTOR_RETURNED_NON_OK');
    job.status = assertTransition(job.status,'PASSED');
    job.lease = null;
    state.events = [...(state.events||[]),event('PASSED',{jobId:job.id})];
    await saveState(STATE,state);
    return {status:'PASSED',jobId:job.id,evidence:result};
  } catch (error) {
    state = await loadState(STATE);
    job = state.jobs.find(j=>j.id===job.id);
    if (!job) return {status:'BLOCKED',reason:'JOB_DISAPPEARED'};
    job.error = String(error?.message||error);
    if (job.status==='RUNNING'||job.status==='VERIFYING') job.status=assertTransition(job.status,'FAILED');
    job.status=assertTransition(job.status,'RECOVERING');
    if ((job.attempts||0)>=MAX_ATTEMPTS) job.status=assertTransition(job.status,'BLOCKED');
    else job.status=assertTransition(job.status,'READY');
    job.lease=null;
    state.events=[...(state.events||[]),event('RECOVERY',{jobId:job.id,error:job.error,attempts:job.attempts,nextStatus:job.status})];
    await saveState(STATE,state);
    return {status:job.status,jobId:job.id,error:job.error,attempts:job.attempts};
  }
}

const result = await cycle();
console.log(JSON.stringify(result,null,2));
if (result.status==='BLOCKED') process.exitCode=2;
