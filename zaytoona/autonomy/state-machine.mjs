export const STATES = Object.freeze([
  'READY','CLAIMED','RUNNING','VERIFYING','PASSED','FAILED','RECOVERING','BLOCKED'
]);

export function assertTransition(from, to) {
  const allowed = {
    READY:['CLAIMED'], CLAIMED:['RUNNING','READY'], RUNNING:['VERIFYING','FAILED'],
    VERIFYING:['PASSED','FAILED'], FAILED:['RECOVERING','BLOCKED'],
    RECOVERING:['READY','CLAIMED','BLOCKED'], PASSED:[], BLOCKED:[]
  };
  if (!allowed[from]?.includes(to)) throw new Error(`Invalid transition: ${from} -> ${to}`);
  return to;
}

function leaseExpired(job, now=Date.now()) {
  return !job.lease?.expiresAt || Date.parse(job.lease.expiresAt) <= now;
}

export function recoverOrphanedJobs(jobs, now=Date.now()) {
  for (const job of jobs) {
    if (['CLAIMED','RUNNING','VERIFYING','RECOVERING'].includes(job.status) && leaseExpired(job, now)) {
      job.status = 'READY';
      job.lease = null;
      job.recovery = {...job.recovery, reason:'EXPIRED_LEASE', at:new Date(now).toISOString(), count:(job.recovery?.count||0)+1};
    }
  }
  return jobs;
}

export function chooseReadyJob(jobs) {
  return jobs.filter(j => j.status === 'READY' && (!j.dependsOn?.length || j.dependsOn.every(id => jobs.find(x=>x.id===id)?.status === 'PASSED')))
    .sort((a,b) => (b.priority??0)-(a.priority??0) || a.id.localeCompare(b.id))[0] ?? null;
}
