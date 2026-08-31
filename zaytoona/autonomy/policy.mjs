const HUMAN_ONLY = new Set(['delete_data','change_security_policy','publish_sensitive','alter_owner_gate','publish_production','change_policy','change_permissions']);
const AUTONOMOUS = new Set(['validate_baseline','validate_math','build_lesson_package','verify','repair']);

export function authorize(job) {
  if (!job?.id || !job?.type) return {ok:false,code:'INVALID_JOB'};
  if (HUMAN_ONLY.has(job.type) || job.risk === 'HIGH') return {ok:false,code:'HUMAN_GATE',reason:'HIGH_IMPACT'};
  if (!AUTONOMOUS.has(job.type)) return {ok:false,code:'CAPABILITY_NOT_ALLOWLISTED'};
  return {ok:true,code:'AUTONOMOUS_ALLOWED'};
}

export function retryDecision(job, maxAttempts=3) {
  if ((job?.attempts||0) >= maxAttempts) return {action:'BLOCK',reason:'RETRY_LIMIT'};
  return {action:'RETRY',reason:'BOUNDED_RETRY'};
}
