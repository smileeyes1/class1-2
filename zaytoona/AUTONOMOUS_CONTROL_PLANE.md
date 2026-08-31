# ZAYTOONA Ω — Autonomous Control Plane v1.0

## Mission
Operate toward open ZAYTOONA goals with zero routine human operation. The owner is the final escalation gate, not the runtime trigger.

## Control hierarchy
GOALS → STATE/WORLD MODEL → EVENT/HEARTBEAT → PLANNER → DECISION → ROUTER → EXECUTION → VALIDATION → RECOVERY → CHECKPOINT → REPLAN.

## Wake sources
1. Repository/CI/deployment events where available.
2. Completion/failure/dependency events.
3. Open goals with executable READY work.
4. Recovery timers/backoff.
5. Periodic heartbeat as a safety net, never as the primary intelligence.

## Autonomy policy
- Automatically execute low-risk, reversible, evidence-producing work.
- Prefer idempotent actions.
- Acquire a lease before mutable execution; release/expire it safely.
- Never allow stale workers to write after lease loss (fencing).
- Retry only with bounded attempts and changed conditions/path.
- Prefer alternate tools/models/paths after a meaningful failure.
- Stop safely when evidence, authorization, or required infrastructure is unavailable.

## Recovery ladder
DETECT → DIAGNOSE → RETRY → ALTERNATIVE → FALLBACK → RESTORE CHECKPOINT → SAFE HALT.

## State contract
Every active job records: goal, status, owner/lease, dependencies, attempt count, current action, last evidence, checkpoint, recovery path, next action, and escalation reason.

## Truth contract
PASS requires evidence. FAIL requires verified failure. BLOCKED means reasonable safe alternatives were exhausted. NOT TESTED means no test occurred. Never infer real classroom success from generated artifacts.

## Owner escalation
Escalate only after automated recovery and safe alternatives fail, or when a decision is inherently high-impact/irreversible. The owner must receive a concise evidence package and proposed options, not an unexplained failure.

## Self-improvement boundary
The system may propose and test optimizations in isolation. Promotion requires passing regression and policy checks. It may not silently weaken truth, safety, child protection, authorization, auditability, or human-gate rules.

## Continuity invariant
A runtime crash must not equal mission loss. Durable state and checkpoints are authoritative; on restart, reconstruct state and resume the earliest safe unresolved action.
