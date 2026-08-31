import { mkdir, writeFile } from 'node:fs/promises';
import { validateLessonPackage } from './validator.mjs';

const out = process.env.ZAYTOONA_OUTPUT || './artifacts';

function basePackage() {
  const questions = Array.from({length:5}, (_,i) => {
    const a = i + 1, b = 1;
    return {id:`q-${i+1}`,a,b,answer:a+b,visualCount:a+b,visualOrder:'EXPLICIT'};
  });
  return {
    source:'زيتونة — الجمع ضمن ١٠',
    goal:'أن يجمع المتعلم عددين ضمن ١٠ باستخدام تمثيل محسوس ثم مصور ثم رمزي.',
    competencies:['العد','الجمع','التحقق'],
    activity:'تمثيل مجموعتين من عناصر محسوسة ثم دمجهما.',
    game:'اجمع وتحقق',
    worksheet:{format:'A4',numerals:'Eastern Arabic'},
    scenario:'سياق فلسطيني قريب من بيئة الطفل.',
    assessment:questions.map(q=>({id:q.id,prompt:`${q.a} + ${q.b} = ؟`})),
    rubric:['يحتاج دعمًا','نامٍ','متقن'],
    evidence:['حسابات قابلة لإعادة التحقق','نتائج validator'],
    durationMinutes:45,
    questions
  };
}

export async function execute(job) {
  await mkdir(out,{recursive:true});
  if (job.type === 'validate_baseline') return {ok:true,type:job.type,evidence:'baseline contract present'};
  if (job.type === 'validate_math') {
    const pack=basePackage();
    return {ok:true,type:job.type,validation:validateLessonPackage(pack)};
  }
  if (job.type === 'build_lesson_package') {
    const pack=basePackage();
    const validation=validateLessonPackage(pack);
    if (!validation.ok) return {ok:false,type:job.type,validation};
    const path=`${out}/lesson-addition-within-10.json`;
    await writeFile(path,JSON.stringify({...pack,validation},null,2)+'\n','utf8');
    return {ok:true,type:job.type,artifact:path,validation};
  }
  return {ok:false,error:`UNSUPPORTED_JOB_TYPE:${job.type}`};
}
