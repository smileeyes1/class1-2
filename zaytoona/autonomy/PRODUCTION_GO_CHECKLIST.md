# ZAYTOONA Ω — Production GO Gate

## Operating loop
Discover → Diagnose → State assumptions → Try → Verify → Evaluate → Change path on failure → Adopt proven result → Fix root cause → Retest → Regression → Checkpoint → Resume → Continue.

## GO criteria
- [ ] Runtime execution path is available.
- [ ] Durable state survives process/container restart.
- [ ] In-flight work resumes from checkpoint.
- [ ] Lease/fencing prevents duplicate execution.
- [ ] Watchdog detects missed heartbeat and recovers.
- [ ] Provider failure has a tested fallback.
- [ ] Validation evidence is persisted.
- [ ] Repair is followed by regression.
- [ ] High-impact actions fail closed behind Human Gate.
- [ ] Actual deployed environment passes crash → restart → resume.

## Truth rule
PASS only with evidence. FAIL only with demonstrated failure. BLOCKED only after reasonable alternatives are exhausted. NOT TESTED when no test was executed.

## Continuity rule
A failed method must trigger a materially different method. Never loop indefinitely on the same failed path.

## Final boundary
Do not claim 24/7 HA until the real deployed runtime demonstrates restart, recovery, resume, and duplicate-execution protection.
