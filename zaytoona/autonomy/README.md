# ZAYTOONA Ω Autonomous Runtime

This directory defines the implementation boundary for zero-routine-human operation.

## Mission
The runtime owns execution continuity. The owner is the final human gate only.

## State machine
READY -> CLAIMED -> RUNNING -> VERIFYING -> PASSED | FAILED -> RECOVERING -> RETRY/ALTERNATIVE/RESTORE -> VERIFYING
A terminal BLOCKED state preserves all evidence and next action.

## Core invariants
- Durable state is authoritative; chat history is not.
- Every mutation is idempotent or protected by a lease/fencing token.
- No task is marked PASS without evidence.
- A crash must be resumable from the latest safe checkpoint.
- Recovery is bounded; repeated identical failure cannot loop forever.
- High-impact/irreversible actions require the owner gate.
- Failed primary tools trigger a materially different safe path before escalation.

## Autonomous loop
1. Load durable mission state.
2. Consume events and inspect READY/recoverable jobs.
3. Select the highest-value safe action.
4. Acquire lease/fence.
5. Execute through the appropriate worker/tool.
6. Validate and adversarially test when required.
7. Persist evidence and checkpoint atomically.
8. Recover or replan on failure.
9. Sleep when no useful work exists; wake on event, dependency, recovery deadline, or heartbeat.

## Production components
- durable queue
- state store
- event ingestion
- worker pool
- lease/fencing service
- watchdog/supervisor
- recovery manager
- evidence ledger
- audit log
- secrets/permission boundary
- health metrics and alerts

## Owner escalation
Escalate only when safe automated recovery and reasonable alternative paths are exhausted, or when policy marks the decision as human-only. The escalation packet must contain: mission, current state, evidence, attempted paths, failure causes, risk, reversible options, and recommended decision.
