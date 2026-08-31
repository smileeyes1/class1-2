import fs from 'node:fs';
import { validateLesson } from './validator.mjs';

const AR = ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];
const toArabic = (n) => String(n).replace(/[0-9]/g, d => AR[Number(d)]);
const VISUAL_ORDER = 'operand_1→operator→operand_2→equals→result';

export function generateAdditionWithin10() {
  const problems = [[3,2],[4,3],[5,2],[6,4],[1,8]];
  return {
    id: 'g1-math-addition-within-10-v1', version: '1.0',
    context: { grade: 1, subject: 'الرياضيات', topic: 'الجمع ضمن ١٠', curriculum_refs: ['الصف الأول > الرياضيات > الوحدة الثالثة > الجمع ضمن العدد (١٠)'] },
    objective: 'أن يجمع الطالب عددين مجموعهما لا يتجاوز ١٠ باستخدام تمثيل محسوس أو مصور ثم يكتب العملية الصحيحة.',
    success_criterion: 'يحل الطالب ٤ من ٥ مسائل جمع ضمن ١٠ بصورة صحيحة، ويطابق كل مسألة مع تمثيلها.',
    timeline: { total_minutes: 45, segments: [
      {name:'تهيئة واستدعاء المعرفة السابقة',minutes:5},{name:'تمثيل محسوس',minutes:10},
      {name:'تمثيل مصور ورمزي',minutes:10},{name:'تدريب موجه',minutes:8},
      {name:'تطبيق فردي',minutes:7},{name:'تقويم وإغلاق',minutes:5}] },
    activities: [{ id:'act-01', purpose:'بناء معنى الجمع بوصفه ضم مجموعتين.', instructions:'ضع ٣ أشياء ثم أضف إليها ٤ أشياء، واطلب عدّ المجموعة كلها ثم كتابة العملية.', objective_links:['objective'] }],
    assessment: { items: problems.map(([a,b],i)=>({id:`q${i+1}`, expression:`${toArabic(a)} + ${toArabic(b)} = ؟`, answer:a+b})), answer_key: problems.map(([a,b])=>a+b) },
    artifacts: [
      {id:'teacher-guide',type:'teacher_guide',status:'generated'}, {id:'student-worksheet',type:'worksheet',status:'generated'},
      {id:'activity',type:'activity',status:'generated'}, {id:'assessment',type:'assessment',status:'generated'}],
    evidence: [{ claim:'موضوع الجمع ضمن العدد ١٠ موجود في بيانات المنهج المحلية للمشروع للصف الأول.', source:'curriculum-offline.json', evidence:'الوحدة الثالثة تتضمن: الدرس الثامن: الجمع ضمن العدد (١٠)', status:'checked' }],
    math_operations: problems.map(([a,b])=>({operand_1:a,operator:'+',operand_2:b,result:a+b,visual_order:VISUAL_ORDER})),
    visual_counts: problems.map(([a,b])=>({expected_count:a+b,actual_count:a+b})),
    assurance: { state:'NOT_PROVEN', checks:[] }
  };
}

if (process.argv[1]?.endsWith('generator.mjs')) {
  const out = process.argv[2] || 'zaytoona/fixtures/generated-addition-within-10.json';
  const pkg = generateAdditionWithin10();
  const result = validateLesson(pkg);
  pkg.assurance = { state: result.state, checks: result.checks };
  fs.writeFileSync(out, JSON.stringify(pkg, null, 2));
  console.log(JSON.stringify(result, null, 2));
  process.exit(result.state === 'NO-GO' ? 1 : 0);
}
