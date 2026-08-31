# ZAYTOONA Ω Runtime Architecture

## Production target
Owner is the final human gate. Routine operation is externalized to a durable runtime.

## Runtime layers
1. Durable mission/job state
2. Event and recovery wake sources
3. Worker execution with lease/fencing
4. Validation/evidence gate
5. Bounded recovery and checkpoint/resume
6. Watchdog/health monitoring
7. Audit and escalation

## Non-negotiable invariants
- Chat history is not authoritative state.
- No PASS without evidence.
- No infinite retries.
- No stale worker writes after lease loss.
- No irreversible/high-impact action without the owner gate.
- Crash recovery resumes from the latest safe checkpoint.

## Deployment gate
Production autonomy is NO-GO until crash/restart, duplicate-worker, tool-failure, repeated-failure, evidence, and escalation tests have all executed successfully.