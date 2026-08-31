const HUMAN_ONLY = new Set(['delete_data','change_security_policy','publish_sensitive','alter_owner_gate']);

export function authorize(job) {
  if (!job?.id || !job?.type) return {ok:false,code:'INVALID_JOB'};
  if (HUMAN_ONLY.has(job.type) || job.risk === 'HIGH') return {ok:false,code:'HUMAN_GATE',reason:'HIGH_IMPACT'};
  return {ok:true,code:'AUTONOMOUS_ALLOWED'};
}

export function retryDecision(job, maxAttempts=3) {
  if ((job?.attempts||0) >= maxAttempts) return {action:'BLOCK',reason:'RETRY_LIMIT'};
  return {action:'RETRY',reason:'BOUNDED_RETRY'};
}
