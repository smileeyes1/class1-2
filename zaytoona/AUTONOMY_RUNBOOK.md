# ZAYTOONA Ω — AUTONOMY & CONTINUITY RUNBOOK v1.0

## Purpose
Keep safe project progress resumable and automatically re-check pending release work without claiming unsupported execution.

## Operating loop
STATE → INSPECT → PRIORITIZE → EXECUTE → VALIDATE → ADVERSARIAL TEST → REPAIR → REGRESSION → SAVE STATE → NEXT.

## Safe autonomy
Allowed without human approval: read project state, run deterministic tests, inspect CI/deployment state, create isolated artifacts/branches, make reversible low-risk fixes, update state, and prepare release candidates.

Requires human gate: destructive changes, irreversible production actions, sensitive child-data decisions, curriculum claims lacking evidence, real classroom pilot claims, and final release where required platform/account authorization is unavailable.

## Failure recovery
If a tool fails: diagnose; retry once only if conditions changed; switch tool/path; reduce scope; preserve state; execute the highest-value safe subset; mark BLOCKED only after reasonable alternatives are exhausted.

## Truth states
PASS = verified evidence exists.
FAIL = verified failure exists.
BLOCKED = reasonable alternatives exhausted and action cannot proceed.
NOT TESTED = not actually tested.

## Continuity record
Always preserve: current branch/commit, gate, completed work, open failures, risks, dependencies, evidence, next action, and recovery instructions.

## Release gate
No final release claim until automated assurance, relevant UI/render verification, integration checks, security/privacy checks, regression, deployment verification, and required human/pilot evidence are complete or explicitly marked NOT TESTED.
