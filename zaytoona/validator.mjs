import fs from 'node:fs';
import { assertGoldenMissingResult, MATH_GOLDEN_RENDER_RULE } from './math-golden-render.mjs';

const REQUIRED_VISUAL_ORDER = 'operand_1→operator→operand_2→equals→result';

export function validateLesson(pkg) {
  const failures = [];
  const checks = [];
  const pass = (id) => checks.push({ id, result: 'PASS' });
  const fail = (id, reason) => { checks.push({ id, result: 'FAIL', evidence: reason }); failures.push({ id, reason }); };

  if (!pkg || typeof pkg !== 'object') return { state: 'NO-GO', checks: [{ id: 'STRUCT-001', result: 'FAIL', evidence: 'package is not an object' }], failures: [{ id: 'STRUCT-001', reason: 'package is not an object' }] };
  for (const key of ['id','version','context','objective','success_criterion','timeline','activities','assessment','artifacts','evidence','assurance']) {
    if (pkg[key] === undefined || pkg[key] === null) fail(`STRUCT-${key}`, `missing ${key}`); else pass(`STRUCT-${key}`);
  }

  const total = pkg.timeline?.total_minutes;
  const sum = (pkg.timeline?.segments ?? []).reduce((n, s) => n + Number(s.minutes || 0), 0);
  if (total === sum) pass('TIME-001'); else fail('TIME-001', `declared=${total}, sum=${sum}`);
  if (total <= 45) pass('TIME-002'); else fail('TIME-002', `lesson exceeds 45 minutes: ${total}`);

  const objective = String(pkg.objective || '').trim();
  if (objective) pass('OBJ-001'); else fail('OBJ-001', 'empty objective');
  const linked = (pkg.activities ?? []).every(a => Array.isArray(a.objective_links) && a.objective_links.length > 0);
  if (linked) pass('ALIGN-001'); else fail('ALIGN-001', 'activity without objective link');

  const assessmentPresent = Array.isArray(pkg.assessment?.items) && pkg.assessment.items.length > 0;
  if (assessmentPresent) pass('ASSESS-001'); else fail('ASSESS-001', 'assessment items missing');

  const artifactStatus = (pkg.artifacts ?? []).every(a => a.status === 'generated' || a.status === 'validated');
  if (artifactStatus) pass('ART-001'); else fail('ART-001', 'blocked artifact present');

  for (const e of (pkg.evidence ?? [])) {
    if (e.status !== 'not_proven' && e.status !== 'raw' && (!e.source || !e.evidence)) {
      fail('EVID-001', `claim lacks evidence: ${e.claim}`);
      break;
    }
  }
  if (!failures.some(f => f.id === 'EVID-001')) pass('EVID-001');

  for (const op of (pkg.math_operations ?? [])) {
    if (op.operator === '+' && Number(op.operand_1) + Number(op.operand_2) !== Number(op.result)) {
      fail('MATH-001', `${op.operand_1} + ${op.operand_2} != ${op.result}`);
      break;
    }
  }
  if (!failures.some(f => f.id === 'MATH-001')) pass('MATH-001');

  if ((pkg.math_operations ?? []).length === 0) {
    pass('MATH-VIS-001');
    pass('MATH-GOLDEN-001');
  } else {
    for (const op of pkg.math_operations) {
      if (op.visual_order !== REQUIRED_VISUAL_ORDER) {
        fail('MATH-VIS-001', `required=${REQUIRED_VISUAL_ORDER}, observed=${op.visual_order ?? 'missing'}`);
        break;
      }
    }
    if (!failures.some(f => f.id === 'MATH-VIS-001')) pass('MATH-VIS-001');

    for (const op of pkg.math_operations) {
      try {
        if (op.render_rule !== MATH_GOLDEN_RENDER_RULE.id) throw new Error(`render_rule=${op.render_rule ?? 'missing'}`);
        assertGoldenMissingResult({ operand1: op.operand_1, operand2: op.operand_2, internal: op.internal_render });
      } catch (error) {
        fail('MATH-GOLDEN-001', String(error?.message || error));
        break;
      }
    }
    if (!failures.some(f => f.id === 'MATH-GOLDEN-001')) pass('MATH-GOLDEN-001');
  }

  for (const item of (pkg.assessment?.items ?? [])) {
    if (item.render_rule === MATH_GOLDEN_RENDER_RULE.id) {
      const op = (pkg.math_operations ?? []).find(x => x.internal_render === item.internal_render);
      if (!op) { fail('ASSESS-GOLDEN-001', `assessment item ${item.id} is not bound to a validated math operation`); break; }
    }
  }
  if (!failures.some(f => f.id === 'ASSESS-GOLDEN-001')) pass('ASSESS-GOLDEN-001');

  for (const v of (pkg.visual_counts ?? [])) {
    const expected = Number(v.expected_count);
    const actual = Number(v.actual_count);
    if (!Number.isFinite(expected) || !Number.isFinite(actual) || expected !== actual) {
      fail('VIS-COUNT-001', `expected=${v.expected_count}, actual=${v.actual_count}`);
      break;
    }
  }
  if (!failures.some(f => f.id === 'VIS-COUNT-001')) pass('VIS-COUNT-001');

  const state = failures.length ? 'NO-GO' : 'READY_FOR_EXECUTION';
  return { state, checks, failures };
}

if (process.argv[1] && process.argv[1].endsWith('validator.mjs') && process.argv[2]) {
  const pkg = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
  const result = validateLesson(pkg);
  console.log(JSON.stringify(result, null, 2));
  process.exit(result.state === 'NO-GO' ? 1 : 0);
}
