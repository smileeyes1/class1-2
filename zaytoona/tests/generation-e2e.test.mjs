import test from 'node:test';
import assert from 'node:assert/strict';
import { generateAdditionWithin10 } from '../generator.mjs';
import { validateLesson } from '../validator.mjs';

test('addition within 10 vertical slice generates and validates', () => {
  const pkg = generateAdditionWithin10();
  const result = validateLesson(pkg);
  assert.equal(pkg.context.grade, 1);
  assert.equal(pkg.context.subject, 'الرياضيات');
  assert.equal(pkg.context.topic, 'الجمع ضمن ١٠');
  assert.equal(pkg.timeline.total_minutes, 45);
  assert.equal(pkg.math_operations.length, 5);
  assert.equal(result.state, 'READY_FOR_EXECUTION');
  assert.equal(result.failures.length, 0);
});

test('vertical slice contains no answer-key drift', () => {
  const pkg = generateAdditionWithin10();
  const computed = pkg.math_operations.map(o => o.operand_1 + o.operand_2);
  assert.deepEqual(pkg.assessment.answer_key, computed);
});
