# ZAYTOONA Ω — PROJECT STATE

**Version:** v1.0 vertical-slice execution baseline
**Branch:** zaytoona-omega-v1
**PR:** #1 (draft, open)
**Primary test case:** الصف الأول → الرياضيات → الجمع ضمن ١٠
**Current gate:** G3 preparation — end-user vertical slice implemented; assurance run is queued; system-wide release remains NO-GO.

## Completed
- Architecture baseline and canonical lesson schema.
- Deterministic Grade 1 addition-within-10 generator and fixture.
- Deterministic validator for structure, time, alignment, evidence, arithmetic, explicit math visual order, and visual counts.
- Executable generation E2E and adversarial tests.
- Autonomous vertical-slice orchestrator.
- CI assurance workflow.
- Durable project checkpoint and assurance report.
- User-facing Arabic RTL teacher/student/assessment shell with print support and local score/build persistence.
- Installable manifest and offline service-worker shell.
- Static delivery workflow for GitHub Pages.
- All changes remain isolated from `main`.

## Verified
- Previous local deterministic baseline/generation tests: PASS, 7/7.
- Adversarial hardening identified and fixed the visual-order weakness.
- Current branch contains the corrected fixture and user-facing slice.

## Current external verification
- GitHub Actions has accepted the latest assurance workflow run for commit `c1c335f0...`; at the latest observation it was QUEUED, so CI is **NOT VERIFIED** until a completed successful run is recorded.
- Static delivery workflow exists but successful Pages deployment is **NOT VERIFIED**.

## Open
- Verify latest CI run and fix any failures.
- Add runtime JSON Schema validation and conformance tests.
- Add actual render-level visual assertions; data checks do not prove pixels/layout.
- Implement real repair planning, cause localization, regression manifests and retry policy.
- Implement durable runtime checkpoint/state in the application.
- Expand teacher minimum-intervention flow beyond the first test case.
- Expand student learning paths and evidence-aware assessment.
- Add evidence-aware curriculum resolver over authoritative source artifacts.
- Run G1–G3 end-to-end in the repository environment.
- Conduct G4 classroom pilot and collect evidence.
- Only after evidence supports it: release and scale to additional subjects/grades.

## Release rules
- Critical math, visual, evidence or traceability failure = NO-GO.
- No repair acceptance without revalidation and regression.
- No CI success claim without a recorded successful run.
- No visual correctness claim from structured data alone.
- No system-wide efficacy claim from a single pilot.

## Next autonomous action
Verify the latest CI run; if it fails, diagnose and patch without touching `main`. Then continue the same vertical slice through schema conformance → repair/regression → render assertions → teacher flow → student flow → pilot readiness. Update this checkpoint after each material gate.
