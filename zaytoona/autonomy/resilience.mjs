export function classifyFailure(error) {
  const message = String(error?.message || error || 'UNKNOWN');
  if (/LEASE_FENCED|CONFLICT/i.test(message)) return {kind:'CONCURRENCY'};
  if (/TIMEOUT|ECONNRESET|ENETUNREACH|429|503/i.test(message)) return {kind:'TRANSIENT'};
  if (/NO_PROVIDER|NO_EXECUTOR/i.test(message)) return {kind:'DEPENDENCY'};
  return {kind:'LOGIC'};
}

export function nextRecovery({attempts = 0, maxAttempts = 3, failureKind = 'LOGIC'} = {}) {
  if (attempts >= maxAttempts) return {action:'BLOCKED', reason:'MAX_ATTEMPTS'};
  if (failureKind === 'CONCURRENCY') return {action:'REQUEUE', backoff:'SHORT'};
  if (failureKind === 'TRANSIENT') return {action:'RETRY', backoff:'EXPONENTIAL'};
  if (failureKind === 'DEPENDENCY') return {action:'FALLBACK_OR_BLOCK'};
  return {action:'REPAIR_THEN_RETRY', backoff:'NORMAL'};
}
