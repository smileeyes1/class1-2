# ZAYTOUNA Ω — PROJECT STATE

**Version:** v1.0 vertical-slice execution baseline
**Branch:** zaytoona-omega-v1
**PR:** #1 (draft, open)
**Primary test case:** الصف الأول → الرياضيات → الجمع ضمن ١٠
**Current gate:** G3 preparation — generation, deterministic validation, executable red-team and orchestration are implemented; external CI and real rendering/pilot remain unproven.

## Completed
- Architecture baseline and canonical lesson schema.
- Deterministic Grade 1 addition-within-10 generator and fixture.
- Deterministic validator for structure, time, alignment, evidence, arithmetic, explicit math visual order, and visual counts.
- Schema formalization for structured math operations and visual counts.
- Executable generation E2E tests.
- Executable adversarial tests for arithmetic, visual order, visual count, alignment, time and evidence.
- Autonomous vertical-slice orchestrator with an executable red-team gate.
- CI workflow covering validator, generation, red-team/repair, and orchestrator tests.
- Assurance report and durable project checkpoint.
- All changes remain isolated from `main`.

## Verification
- Local deterministic baseline/generation tests: PASS, 7/7.
- A local adversarial run exposed a real weakness: optional visual-order checks did not reject a wrong order. The validator was hardened to require the explicit contract whenever structured math operations exist.
- Adversarial tests were then strengthened to assert the exact failure class.
- Current implementation was committed after the hardening.
- GitHub Actions: NOT VERIFIED; the connected API currently reports no workflow run for the latest branch commit.

## Open
- Obtain/verify CI execution.
- Add a real JSON Schema validator runtime and schema-conformance tests.
- Add actual render-level visual assertions; structured checks alone do not prove pixels/layout.
- Build deterministic repair planning with cause localization and regression manifests.
- Add durable runtime checkpoint implementation rather than documentation only.
- Implement minimum-intervention teacher UI.
- Implement student learning and assessment flow.
- Add evidence-aware curriculum resolver over authoritative source artifacts.
- Run G1–G3 end-to-end in the real repository environment.
- Conduct G4 classroom pilot.

## Release rules
- Any critical math, visual, evidence or traceability failure = NO-GO.
- No repair acceptance without revalidation and regression.
- No claim of CI success without a recorded CI run.
- No claim of visual correctness from data checks alone.
- No claim of system-wide educational efficacy from a single pilot.

## Next autonomous action
Continue hardening the same vertical slice: schema-conformance test → repair/regression engine → render-level assertions → teacher minimum-intervention flow. Preserve `main`, keep checkpoints current, and use PASS/FAIL/BLOCKED/NOT TESTED truth states.
