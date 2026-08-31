import test from 'node:test';
import assert from 'node:assert/strict';
import { generateAdditionWithin10 } from '../generator.mjs';
import { validateLesson } from '../validator.mjs';

const attacks = {
  arithmetic: p => { p.math_operations[0].result = 99; },
  visualOrder: p => { p.math_operations[0].visual_order = 'result→equals→operand_2→operator→operand_1'; },
  visualCount: p => { p.visual_counts[0].actual_count += 1; },
  alignment: p => { p.activities[0].objective_links = []; },
  time: p => { p.timeline.total_minutes = 46; },
  evidence: p => { p.evidence[0].source = null; p.evidence[0].evidence = null; }
};

for (const [name, mutate] of Object.entries(attacks)) {
  test(`red-team rejects ${name}`, () => {
    const p = structuredClone(generateAdditionWithin10());
    mutate(p);
    const result = validateLesson(p);
    assert.equal(result.state, 'NO-GO');
    assert.ok(result.failures.length > 0);
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
