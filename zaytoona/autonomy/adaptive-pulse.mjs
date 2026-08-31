const MIN_MS = 5 * 60_000;
const MAX_MS = 60 * 60_000;

export function planNextWake(state, now = Date.now()) {
  const jobs = Array.isArray(state?.jobs) ? state.jobs : [];
  const ready = jobs.filter(j => j?.status === 'READY');
  const recovering = jobs.filter(j => j?.status === 'RECOVERING');
  const blocked = jobs.filter(j => j?.status === 'BLOCKED');
  const failed = jobs.filter(j => Number(j?.attempts || 0) > 0 && ['FAILED', 'READY'].includes(j?.status));

  let delayMs = MAX_MS;
  let reason = 'IDLE';

  if (recovering.length) {
    delayMs = MIN_MS;
    reason = 'RECOVERY_DUE';
  } else if (ready.length) {
    delayMs = MIN_MS;
    reason = 'WORK_READY';
  } else if (failed.length) {
    delayMs = 10 * 60_000;
    reason = 'RECENT_FAILURE_BACKOFF';
  } else if (blocked.length && blocked.length === jobs.length) {
    delayMs = MAX_MS;
    reason = 'HUMAN_GATE_OR_BLOCKED';
  }

  const bounded = Math.min(MAX_MS, Math.max(MIN_MS, delayMs));
  return {
    version: 1,
    reason,
    delayMs: bounded,
    nextWakeAt: new Date(now + bounded).toISOString(),
    computedAt: new Date(now).toISOString()
  };
}
