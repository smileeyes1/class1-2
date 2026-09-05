import test from 'node:test';
import assert from 'node:assert/strict';
import { MATH_GOLDEN_RENDER_RULE, buildMissingResultInternal, assertGoldenMissingResult } from '../math-golden-render.mjs';
import { generateAdditionWithin10 } from '../generator.mjs';
import { validateLesson } from '../validator.mjs';

test('golden rule is frozen to the proven practical example',()=>{
  assert.equal(MATH_GOLDEN_RENDER_RULE.immutableExample,'□ = ٣ + ٤');
  assert.equal(MATH_GOLDEN_RENDER_RULE.authority,'PROVEN_PRACTICAL_GOLDEN_RULE');
});

test('semantic ٤ + ٣ = □ is constructed internally as □ = ٣ + ٤',()=>{
  assert.equal(buildMissingResultInternal(4,3),'□ = ٣ + ٤');
});

test('operand order is preserved semantically and not commuted',()=>{
  assert.equal(buildMissingResultInternal(2,5),'□ = ٥ + ٢');
  assert.notEqual(buildMissingResultInternal(2,5),'□ = ٢ + ٥');
});

test('western input digits never leak into the internal visible math contract',()=>{
  assert.equal(buildMissingResultInternal(10,0),'□ = ٠ + ١٠');
  assert.doesNotMatch(buildMissingResultInternal(10,0),/[0-9]/);
});

test('contract assertion fails closed on any altered construction',()=>{
  assert.equal(assertGoldenMissingResult({operand1:4,operand2:3,internal:'□ = ٣ + ٤'}),true);
  assert.throws(()=>assertGoldenMissingResult({operand1:4,operand2:3,internal:'□ = ٤ + ٣'}),/MATH_GOLDEN_RENDER_VIOLATION/);
  assert.throws(()=>assertGoldenMissingResult({operand1:4,operand2:3,internal:'٤ + ٣ = □'}),/MATH_GOLDEN_RENDER_VIOLATION/);
});

test('production addition generator emits the golden internal render for every operation and assessment item',()=>{
  const pkg=generateAdditionWithin10();
  assert.equal(pkg.math_operations[1].operand_1,4);
  assert.equal(pkg.math_operations[1].operand_2,3);
  assert.equal(pkg.math_operations[1].internal_render,'□ = ٣ + ٤');
  assert.equal(pkg.assessment.items[1].internal_render,'□ = ٣ + ٤');
  assert.ok(pkg.math_operations.every(op=>op.render_rule===MATH_GOLDEN_RENDER_RULE.id));
  assert.ok(pkg.assessment.items.every(item=>item.render_rule===MATH_GOLDEN_RENDER_RULE.id));
  assert.equal(validateLesson(pkg).state,'READY_FOR_EXECUTION');
});

test('production validator returns NO-GO if generated golden render is altered',()=>{
  const pkg=generateAdditionWithin10();
  pkg.math_operations[1].internal_render='□ = ٤ + ٣';
  const result=validateLesson(pkg);
  assert.equal(result.state,'NO-GO');
  assert.ok(result.failures.some(f=>f.id==='MATH-GOLDEN-001'));
});
