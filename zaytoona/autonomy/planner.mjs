import { chooseReadyJob } from './state-machine.mjs';
import { authorize } from './policy.mjs';

export function plan(state) {
  const job = chooseReadyJob(state.jobs);
  if (!job) return {kind:'IDLE'};
  const gate = authorize(job);
  if (!gate.ok) return {kind:'ESCALATE',jobId:job.id,code:gate.code,reason:gate.reason};
  return {kind:'EXECUTE',jobId:job.id,priority:job.priority??0,type:job.type};
}
