# ZAYTOONA Ω — PROJECT STATE

**Version:** v1.0 architecture baseline candidate
**Branch:** zaytoona-omega-v1
**PR:** #1 (draft)
**Current gate:** G0 Architecture — implementation baseline established; CI execution and full acceptance NOT YET TESTED
**Primary test case:** الصف الأول → الرياضيات → الجمع ضمن ١٠

## Completed
- Reviewed the existing educational repository and its offline curriculum structure.
- Preserved the existing baseline; no existing production files were replaced.
- Added educational operating architecture.
- Added canonical lesson-package schema.
- Added dependency-free deterministic validator.
- Added executable validator tests covering arithmetic, time, objective alignment, and evidence.
- Added adversarial acceptance fixtures.
- Added CI workflow for the deterministic validator tests.
- Created a draft PR rather than changing main directly.

## Existing baseline relied upon
- Offline LMS for grades 1–2.
- Existing curriculum data includes Grade 1 addition within 10 and Grade 2 progression.
- Existing system separates UI, generator, teacher tools, and curriculum data.

## Verification status
- Source/file presence: PASS (verified through repository reads).
- Branch isolation: PASS (changes are on `zaytoona-omega-v1`).
- Diff scope: PASS (new ZAYTOUNA layer only; no existing production file deleted/replaced).
- Executable test run: NOT TESTED in this environment.
- CI run: NOT TESTED; no workflow run is currently available for the latest commit.
- G1 Generation: NOT TESTED.
- G2 Validation: NOT TESTED end-to-end.
- G3 Adversarial: NOT TESTED end-to-end.
- G4 Pilot: NOT TESTED.

## Open
- Run CI and inspect failures.
- Harden validator based on actual failures.
- Implement lesson-package generator against the schema.
- Implement explicit mathematical visual-order model and visual assertions.
- Implement repair + regression loop.
- Wire all adversarial fixtures into executable tests.
- Add durable runtime state/checkpoint implementation.
- Add teacher-facing minimum-intervention flow.
- Add student learning flow.
- Run G1–G3 tests before any readiness claim.
- Conduct a real teacher pilot before system-wide claims.

## Non-negotiable release conditions
- No critical math/visual/evidence/traceability failure.
- No release after failed validation without successful revalidation and regression.
- Tool failure must preserve state and trigger an alternate route.
- Pilot success must not be generalized to the whole system.

## Next action
Execute the assurance tests in CI, then build the smallest complete generation-to-assurance slice for the first test case: structured lesson object → deterministic checks → adversarial failures → repair/retest → assurance report.
