# ZAYTOONA Ω — PROJECT STATE

**Version:** v1.0 architecture baseline candidate
**Branch:** zaytoona-omega-v1
**Current gate:** G0 Architecture — implementation baseline established; full acceptance NOT YET TESTED
**Primary test case:** الصف الأول → الرياضيات → الجمع ضمن ١٠

## Completed
- Reviewed the existing educational repository and its offline curriculum structure.
- Preserved the existing baseline; no existing production files were replaced.
- Added `zaytoona/ARCHITECTURE_v1.0.md`.
- Added canonical lesson package schema.
- Added adversarial acceptance fixtures.

## Existing baseline relied upon
- Offline LMS for grades 1–2.
- Existing curriculum data includes Grade 1 addition within 10 and Grade 2 progression.
- Existing system separates UI, generator, teacher tools, and curriculum data.

## Open
- Implement deterministic validator.
- Implement lesson-package generator against the schema.
- Implement explicit mathematical visual-order model.
- Implement repair + regression loop.
- Wire adversarial fixtures into executable tests.
- Add durable runtime state/checkpoint implementation.
- Run G1–G3 tests before any claim of readiness.
- Conduct a real teacher pilot before system-wide claims.

## Non-negotiable release conditions
- No critical math/visual/evidence/traceability failure.
- No release after failed validation without successful revalidation and regression.
- Tool failure must preserve state and trigger an alternate route.
- Pilot success must not be generalized to the whole system.

## Next action
Build the smallest executable assurance slice for the first test case: structured lesson object → deterministic checks → adversarial failures → repair/retest → assurance report.
