import test from 'node:test';
import assert from 'node:assert/strict';
import { validateLesson } from '../validator.mjs';

function validPackage() {
  return {
    id: 'g1-math-add10', version: '1.0',
    context: { grade: 1, subject: 'الرياضيات', topic: 'الجمع ضمن ١٠', curriculum_refs: ['الوحدة الثالثة/الدرس الثامن'] },
    objective: 'أن يجمع الطالب عددين مجموعهما لا يتجاوز ١٠.',
    success_criterion: 'يحل الطالب مسائل جمع مناسبة بدقة.',
    timeline: { total_minutes: 45, segments: [
      { name: 'تهيئة', minutes: 5 }, { name: 'محسوس', minutes: 10 }, { name: 'مصور', minutes: 8 },
      { name: 'رمزي', minutes: 8 }, { name: 'تدريب', minutes: 8 }, { name: 'تقويم', minutes: 6 }
    ]},
    activities: [{ id: 'a1', purpose: 'تمثيل الجمع', instructions: '...', objective_links: ['objective'] }],
    assessment: { items: [{ id: 'q1' }], answer_key: ['٧'] },
    artifacts: [{ id: 'worksheet', type: 'worksheet', status: 'validated' }],
    evidence: [{ claim: 'curriculum mapping', source: 'curriculum-offline.json', evidence: 'lesson entry', status: 'checked' }],
    assurance: { state: 'READY_FOR_EXECUTION', checks: [] },
    math_operations: [{ operand_1: 3, operator: '+', operand_2: 4, result: 7 }]
  };
}

test('valid package passes deterministic assurance checks', () => {
  const r = validateLesson(validPackage());
  assert.equal(r.state, 'READY_FOR_EXECUTION');
  assert.equal(r.failures.length, 0);
});

test('incorrect arithmetic is rejected', () => {
  const p = validPackage();
  p.math_operations[0].result = 8;
  const r = validateLesson(p);
  assert.equal(r.state, 'NO-GO');
  assert.ok(r.failures.some(x => x.id === 'MATH-001'));
});

test('lesson over 45 minutes is rejected', () => {
  const p = validPackage();
  p.timeline.total_minutes = 46;
  p.timeline.segments[0].minutes = 6;
  const r = validateLesson(p);
  assert.equal(r.state, 'NO-GO');
  assert.ok(r.failures.some(x => x.id === 'TIME-002'));
});

test('activity without objective link is rejected', () => {
  const p = validPackage();
  p.activities[0].objective_links = [];
  const r = validateLesson(p);
  assert.equal(r.state, 'NO-GO');
  assert.ok(r.failures.some(x => x.id === 'ALIGN-001'));
});

test('unsupported curriculum claim without evidence is rejected', () => {
  const p = validPackage();
  p.evidence[0].source = null;
  p.evidence[0].evidence = null;
  const r = validateLesson(p);
  assert.equal(r.state, 'NO-GO');
  assert.ok(r.failures.some(x => x.id === 'EVID-001'));
});
