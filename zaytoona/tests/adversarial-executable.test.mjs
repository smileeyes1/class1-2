import test from 'node:test';
import assert from 'node:assert/strict';
import { generateAdditionWithin10 } from '../generator.mjs';
import { validateLesson } from '../validator.mjs';

const attacks = {
  arithmetic: { mutate: p => { p.math_operations[0].result = 99; }, id: 'MATH-001' },
  visualOrder: { mutate: p => { p.math_operations[0].visual_order = 'result→equals→operand_2→operator→operand_1'; }, id: 'MATH-VIS-001' },
  visualCount: { mutate: p => { p.visual_counts[0].actual_count += 1; }, id: 'VIS-COUNT-001' },
  alignment: { mutate: p => { p.activities[0].objective_links = []; }, id: 'ALIGN-001' },
  time: { mutate: p => { p.timeline.total_minutes = 46; }, id: 'TIME-002' },
  evidence: { mutate: p => { p.evidence[0].source = null; p.evidence[0].evidence = null; }, id: 'EVID-001' }
};

for (const [name, attack] of Object.entries(attacks)) {
  test(`red-team rejects ${name}`, () => {
    const p = structuredClone(generateAdditionWithin10());
    attack.mutate(p);
    const result = validateLesson(p);
    assert.equal(result.state, 'NO-GO');
    assert.ok(result.failures.some(x => x.id === attack.id));
  });
}

test('repair returns package to PASS after restoring the mutated field', () => {
  const p = structuredClone(generateAdditionWithin10());
  p.math_operations[0].result = 99;
  assert.equal(validateLesson(p).state, 'NO-GO');
  p.math_operations[0].result = p.math_operations[0].operand_1 + p.math_operations[0].operand_2;
  const repaired = validateLesson(p);
  assert.equal(repaired.state, 'READY_FOR_EXECUTION');
  assert.equal(repaired.failures.length, 0);
});
