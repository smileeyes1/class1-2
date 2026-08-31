# ZAYTOONA Ω — Educational Operating Architecture v1.0

## Mission
تحويل النظام من مولّد موارد إلى منظومة إنتاج وضمان تعليمية فلسطينية عربية، تقلل العمل التشغيلي عن المعلم، وتدعم تعلم الطالب، وتعمل ذاتيًا داخل نطاق آمن وقابل للتحقق.

## Operating model
AUTO-BY-DEFAULT, HUMAN-GOVERNED.

The system may independently plan, delegate, generate, validate, repair, retest, package, and report when the task is bounded, reversible, and verifiable. Human approval remains required for consequential educational decisions, sensitive child decisions, irreversible external actions, and unresolved high-impact uncertainty.

## Control plane
1. ZAYTOUNA CORE — mission, constraints, risk, priority, stop/continue decisions.
2. ORCHESTRATOR — workflow/DAG, delegation, retries, dependencies, budgets.
3. POLICY/GOVERNANCE — authority boundaries, evidence states, safety, privacy.
4. STATE/RECOVERY — durable checkpoint, run state, artifact lineage, resumability.

## Knowledge plane
1. Curriculum Knowledge — locally available curriculum corpus and provenance.
2. Pedagogy Knowledge — age-appropriate instructional patterns.
3. Subject Knowledge — domain-specific validation.
4. Evidence Ledger — claim/source/evidence/scope/confidence.
5. Experience Memory — pilot observations, validated lessons, known failure modes.

## Agent plane
- Curriculum Agent
- Pedagogy Agent
- Subject Agent
- Arabic Agent
- Assessment Agent
- Differentiation Agent
- Activity/Game Agent
- Visual Agent
- Math & Visual-Order Agent
- Evidence Agent
- Accessibility Agent
- Safety/Privacy Agent
- Production Agent
- Analytics Agent
- Teacher-Coach Agent
- Red-Team Agent
- Repair Agent
- Meta-Optimization Agent

Agents are specialists, not sovereigns. They cannot silently change governance or another agent's authority. The Orchestrator resolves conflicts according to the control plane.

## Educational production pipeline
Teacher intent → curriculum alignment → learning objective → success criterion → lesson plan → activity → practice → assessment → differentiation → artifacts → validation → adversarial test → repair → regression → release package.

## Teacher experience
Minimum input: grade + subject + topic/goal. The system infers routine requirements and asks only high-impact questions. The teacher receives a ready-to-use package, a concise assurance report, and only the decisions that genuinely require professional judgment.

## Student experience
Learning should follow the appropriate progression: concrete → pictorial → symbolic → guided practice → application → check → feedback → mastery/remediation/enrichment. Student-facing language and interaction must be age-appropriate.

## Palestinian/Arabic requirements
- Arabic-first interface and content.
- Palestinian school context where supported by evidence.
- Distinguish official curriculum content from adaptation, system-authored material, inference, and unproven claims.
- Eastern Arabic numerals where the project specification requires them.
- Mathematical order is explicit data, never inferred from Unicode BiDi/CSS direction.

## Assurance gates
G0 Architecture → G1 Generation → G2 Validation → G3 Adversarial → G4 Pilot → G5 Release.

Critical failure at any gate = NO-GO until repaired and re-tested. Pilot success proves the tested case, not universal system validity.

## Core invariants
- No evidence → no factual/curriculum compliance claim.
- No revalidation → no release.
- No regression → no repair acceptance.
- A beautiful artifact with a broken learning objective is a failure.
- A correct equation with incorrect visual order is a failure.
- A scheduler tick without meaningful progress is not success.
- A tool failure changes the route, not the goal.
- Never weaken a gate merely to obtain PASS.

## Teacher Work Reduction metric
Measure baseline manual time versus system-assisted time, removed manual steps, defects caught before teacher review, repair cycles, generation time, and teacher intervention count.

## First system test case
Grade 1 → Mathematics → addition within 10.

This case is a systems test fixture. It is not treated as proof that all subjects, grades, or workflows are validated.
