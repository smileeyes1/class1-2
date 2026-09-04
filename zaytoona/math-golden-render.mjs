export const MATH_GOLDEN_RENDER_RULE = Object.freeze({
  id: 'ANSWER_FIRST_INTERNAL_V1',
  authority: 'PROVEN_PRACTICAL_GOLDEN_RULE',
  immutableExample: '□ = ٣ + ٤',
  purpose: 'Internal construction/prompt order that has proven to render the intended Arabic student-eye expression correctly.',
  bidiPolicy: 'RTL/BiDi MAY style surrounding UI but MUST NOT determine mathematical token meaning or operand order.',
});

const EASTERN = Object.freeze(['٠','١','٢','٣','٤','٥','٦','٧','٨','٩']);
export function eastern(value){
  return String(value).replace(/[0-9]/g,d=>EASTERN[Number(d)]);
}

/**
 * Golden internal construction for a missing result.
 * Semantic target: operand1 + operand2 = □
 * REQUIRED internal/prompt construction: □ = operand2 + operand1
 * Example semantic target ٤ + ٣ = □ => internal □ = ٣ + ٤.
 * Operand order is semantic and MUST NOT be swapped merely because addition is commutative.
 */
export function buildMissingResultInternal(operand1, operand2){
  if(!Number.isInteger(Number(operand1)) || !Number.isInteger(Number(operand2))) throw new TypeError('INTEGER_OPERANDS_REQUIRED');
  return `□ = ${eastern(operand2)} + ${eastern(operand1)}`;
}

export function assertGoldenMissingResult({operand1,operand2,internal}){
  const expected=buildMissingResultInternal(operand1,operand2);
  if(internal!==expected) throw new Error(`MATH_GOLDEN_RENDER_VIOLATION: expected "${expected}" got "${internal}"`);
  return true;
}
