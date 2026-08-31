# ZAYTOONA Ω — PROJECT STATE

**Version:** v1.1 competency-driven educational engine slice
**Branch:** zaytoona/competency-engine-v1
**Base:** main @ 9e630dbd8a8f5b1699e8efdd8eb9b0ce232d8452
**Primary objective:** Make competencies a general learning spine for any supported grade, subject, domain, and topic. The addition-within-10 case remains a test fixture, not the system boundary.

## Completed
- Existing ZAYTOONA assurance and autonomy foundation preserved.
- Kefayat remains the competency source of truth.
- Generic browser competency engine added.
- Competency records normalized without assuming a specific subject/topic.
- Grade/subject/domain/query filtering added.
- Local mastery state added with NOT_STARTED / DEVELOPING / MASTERED states.
- Mastery summary and learning-plan primitives added.
- Teacher runtime now activates the competency engine when the Kefayat catalog becomes available.
- Automated competency-engine test added.
- Assurance workflow updated to execute the new test.

## Design boundary
- The engine is domain-agnostic.
- Subject-specific validators and learning activities remain separate specialists.
- The first mathematics addition slice is only a fixture for system verification.
- No system-wide efficacy claim is made from this slice.

## Current gate
G1/G2 competency-engine integration verification through pull-request CI.

## Required next gates
- Verify PR CI and fix failures.
- Verify catalog availability on the branch and source provenance.
- Add competency-to-objective/activity/assessment mapping primitives.
- Add evidence-aware mastery decisions rather than score-only mastery.
- Add student-facing adaptive next-step selection.
- Add teacher competency dashboard without increasing teacher input burden.
- Add adversarial/regression cases for generic filtering, missing fields, duplicate IDs, invalid scores, and empty catalogs.
- Verify deployed public UI only after mainline integration.

## Release rules
- No PASS without recorded evidence.
- No system-wide claim from one subject or one pilot.
- No regression acceptance without revalidation.
- Competency engine must remain generic and must not be hard-coded to addition within 10.
