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

export function chooseReadyJob(jobs) {
  return jobs.filter(j => j.status === 'READY' && (!j.dependsOn?.length || j.dependsOn.every(id => jobs.find(x=>x.id===id)?.status === 'PASSED')))
    .sort((a,b) => (b.priority??0)-(a.priority??0) || a.id.localeCompare(b.id))[0] ?? null;
}
