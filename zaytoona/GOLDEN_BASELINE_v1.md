# Ω ZAYTOONA — GOLDEN BASELINE v1

Status: FROZEN SCOPED GO BASELINE

## Frozen scope
- Kefayat as the first production Module.
- Ω MODULAR META-SYSTEM v1 integration.
- Annual learning / lesson / assessment integration covered by the integrated student path.
- Runtime continuity: regression, container build, crash → restart → resume, Docker Compose configuration.
- Integrated Student E2E and Release Gate.
- Palestinian Arabic math Golden Render Rule for missing-result addition.

## MATH GOLDEN RENDER RULE — HARD LOCK
The proven practical internal/prompt construction is authoritative:

`□ = ٣ + ٤`

General form for semantic target `A + B = □`:

`□ = B + A`

This is NOT a suggestion, heuristic, fallback, or generic RTL/BiDi technique. It is the frozen proven construction rule. RTL/BiDi may style surrounding Arabic UI but MUST NOT decide mathematical meaning or token order. Operand₁ and operand₂ are semantic identities and MUST NOT be swapped merely because addition is commutative. Any generator, renderer, worksheet, PDF, HTML, lesson artifact, or future math Module affecting this case must use the centralized contract in `zaytoona/math-golden-render.mjs` and pass `zaytoona/tests/math-golden-render.test.mjs`.

A change that causes semantic target `٤ + ٣ = □` to be internally constructed by any other sequence than `□ = ٣ + ٤` is a regression and MUST produce NO-GO until repaired and reverified.

## Evidence anchors
- Modular meta-system implementation baseline: `66694a0b1ed0a8f54260a7230ef45b9f48fe129f`.
- Runtime lease-conflict repair: `a72d483f4e227e322f71ac3beb1315dc42c092a9`.
- E2E coverage repair: `6675285a2efb6a7e2f275305507465e477d1c26f`.
- Integrated E2E run: `33596642204` — success.
- Latest verified production-continuity run before this freeze: `33720693344` on head `e76e12989bc56a0dc12b7f22467c0cb54f9c868b` — success.
- Runtime environment observed in CI: Ubuntu 24.04.4, Node v24.19.0, npm 11.17.0.
- Math contract implementation: `9ab876fc7c946dea820cccbbe69c1969e5a1ea1e`.
- Math regression test: `1ea732ac5f3a516e63b7d3e71a5101efc6941186`.
- Release-gate integration: `67a571f6fd0056e5399f197e36fdf24f2db46f74`.

## Protection rule
Future modules or engines MUST NOT inherit GO automatically. Each must pass the same Module Contract → integration → adversarial/regression → Release Gate path. Existing Kefayat and Math Golden Render gates must not be weakened, bypassed, or silently altered.

## Change rule
Any change affecting the frozen scope requires fresh regression/integration evidence. Documentation-only or autonomous-state checkpoint commits do not redefine this baseline.
