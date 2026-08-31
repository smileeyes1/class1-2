import crypto from 'node:crypto';

const id = () => crypto.randomUUID();

export function ensureState(state) {
  state.version ??= 1;
  state.goals ??= [];
  state.jobs ??= [];
  state.events ??= [];
  state.checkpoints ??= [];
  return state;
}

export function ingestEvent(state, type, payload = {}) {
  state.events.push({id:id(), type, payload, at:new Date().toISOString()});
}

export function chooseNextJob(state) {
  const active = new Set(state.jobs.filter(j => ['DONE','FAILED','BLOCKED'].includes(j.status)).map(j => j.id));
  const ready = state.jobs.filter(j => j.status === 'READY' && (!j.dependencies || j.dependencies.every(d => active.has(d))));
  ready.sort((a,b) => (b.priority ?? 0) - (a.priority ?? 0));
  return ready[0] ?? null;
}

export function startJob(state, job) {
  job.status = 'RUNNING';
  job.attempts = (job.attempts ?? 0) + 1;
  job.startedAt = new Date().toISOString();
  job.lease = id();
  return job;
}

export function checkpoint(state, job, outcome) {
  state.checkpoints.push({id:id(), jobId:job.id, at:new Date().toISOString(), outcome, nextAction:job.nextAction ?? null});
}

export function finishJob(state, job, status, evidence = []) {
  job.status = status;
  job.evidence = evidence;
  job.finishedAt = new Date().toISOString();
  job.lease = null;
}
