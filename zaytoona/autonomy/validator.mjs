export function validateMathPack(pack) {
  const failures = [];
  for (const q of pack.questions ?? []) {
    if (!Number.isInteger(q.a) || !Number.isInteger(q.b) || q.a < 0 || q.b < 0) failures.push(`${q.id}:invalid_operands`);
    if (q.a + q.b > 10) failures.push(`${q.id}:out_of_scope_sum`);
    if (q.answer !== q.a + q.b) failures.push(`${q.id}:wrong_answer`);
    if (q.visualCount !== q.a + q.b) failures.push(`${q.id}:visual_count_mismatch`);
    if (q.visualOrder !== 'EXPLICIT') failures.push(`${q.id}:visual_order_not_explicit`);
  }
  return {ok: failures.length === 0, failures, checked: pack.questions?.length ?? 0};
}

export function validateLessonPackage(pack) {
  const required = ['source','goal','competencies','activity','game','worksheet','scenario','assessment','rubric','evidence'];
  const missing = required.filter(k => pack[k] == null);
  const duration = Number(pack.durationMinutes);
  const math = validateMathPack(pack);
  return {ok: missing.length === 0 && duration === 45 && math.ok, missing, duration, math};
}
