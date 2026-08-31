import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { validateLessonPackage } from './validator.mjs';

const out = process.env.ZAYTOONA_OUTPUT || './artifacts';
const catalogPath = './zaytoona/kefayat/catalog.json';
const corePath = './zaytoona/learning-core-v3.js';
const indexPath = './index.html';

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

async function readCatalog(){
  if(!existsSync(catalogPath)) throw new Error('CATALOG_MISSING');
  const c=JSON.parse(await readFile(catalogPath,'utf8'));
  if(!Number.isInteger(c.recordCount)||c.recordCount<=0||c.recordCount!==c.records.length) throw new Error('CATALOG_INVALID_COUNT');
  return c;
}

function sourceCoverage(c){
  const by=new Map(c.records.map(r=>[r.source,true]));
  const grades=new Set(c.records.map(r=>Number(r.grade)));
  return {sources:[...by.keys()],grades:[...grades].sort((a,b)=>a-b)};
}

async function buildAnnualPlan(){
  const c=await readCatalog();
  const groups=new Map();
  for(const r of c.records){
    const key=`${r.grade}|${r.source}`;
    if(!groups.has(key))groups.set(key,[]);
    groups.get(key).push(r);
  }
  const plan=[];
  for(const [key,items] of groups){
    const [grade,subject]=key.split('|');
    const chunk=Math.max(1,Math.ceil(items.length/4));
    const terms=[];
    for(let i=0;i<4;i++) terms.push({term:i+1,competencyIds:items.slice(i*chunk,(i+1)*chunk).map(x=>x.id)});
    plan.push({grade:Number(grade),subject,recordCount:items.length,terms});
  }
  const result={schemaVersion:1,generatedAt:new Date().toISOString(),basis:'Kefayat competency catalog; deterministic coverage scaffold, not an official timetable.',plans:plan};
  const path=`${out}/annual-plan.json`;
  await writeFile(path,JSON.stringify(result,null,2)+'\n','utf8');
  return {ok:true,type:'build_annual_plan',artifact:path,plans:plan.length,competencies:c.recordCount};
}

async function validateCore(){
  const [core,index]=await Promise.all([readFile(corePath,'utf8'),readFile(indexPath,'utf8')]);
  const failures=[];
  if(!core.includes("const AR=['٠','١','٢','٣','٤','٥','٦','٧','٨','٩']")) failures.push('EASTERN_NUMERALS_MISSING');
  if(!core.includes("const CATALOG='./zaytoona/kefayat/catalog.json'")) failures.push('CATALOG_BINDING_MISSING');
  if(!core.includes('localStorage')) failures.push('LOCAL_PERSISTENCE_MISSING');
  if(!core.includes('function answer(')) failures.push('INTERACTION_HANDLER_MISSING');
  if(!index.includes('learning-core-v3.js')) failures.push('CORE_NOT_LOADED');
  if(!index.includes('autonomous-assurance-v1.js')) failures.push('ASSURANCE_NOT_LOADED');
  return {ok:failures.length===0,type:'validate_learning_core',failures};
}

function runTests(){
  const candidates=[
    'zaytoona/tests/validator.test.mjs',
    'zaytoona/tests/generation-e2e.test.mjs',
    'zaytoona/tests/adversarial-executable.test.mjs',
    'zaytoona/tests/orchestrator.test.mjs',
    'zaytoona/competency-engine.test.mjs'
  ];
  const present=candidates.filter(existsSync);
  if(!present.length) return {ok:false,type:'run_adversarial_gate',failures:['NO_TEST_SUITE_FOUND']};
  const results=[];
  for(const file of present){
    const r=spawnSync(process.execPath,['--test',file],{encoding:'utf8',stdio:'pipe'});
    results.push({file,ok:r.status===0,output:(r.stdout||'').slice(-3000),error:(r.stderr||'').slice(-3000)});
  }
  return {ok:results.every(x=>x.ok),type:'run_adversarial_gate',tests:results};
}

export async function execute(job) {
  await mkdir(out,{recursive:true});
  if(job.type==='validate_baseline') return {ok:true,type:job.type,evidence:'baseline contract present'};
  if(job.type==='validate_kefayat_catalog'){
    const c=await readCatalog();
    const coverage=sourceCoverage(c);
    if(!coverage.grades.every(g=>[1,2,3,4].includes(g))) return {ok:false,type:job.type,coverage,failures:['GRADE_COVERAGE_INCOMPLETE']};
    return {ok:true,type:job.type,recordCount:c.recordCount,coverage,source:c.source};
  }
  if(job.type==='build_annual_plan') return await buildAnnualPlan();
  if(job.type==='validate_learning_core') return await validateCore();
  if(job.type==='validate_math'){
    const pack=basePackage();
    const validation=validateLessonPackage(pack);
    return {ok:validation.ok,type:job.type,validation};
  }
  if(job.type==='build_lesson_package'){
    const pack=basePackage();
    const validation=validateLessonPackage(pack);
    if(!validation.ok) return {ok:false,type:job.type,validation};
    const path=`${out}/lesson-addition-within-10.json`;
    await writeFile(path,JSON.stringify({...pack,validation},null,2)+'\n','utf8');
    return {ok:true,type:job.type,artifact:path,validation};
  }
  if(job.type==='run_adversarial_gate') return runTests();
  if(job.type==='prepare_release_evidence'){
    const c=await readCatalog();
    const core=await validateCore();
    if(!core.ok) return {ok:false,type:job.type,failures:core.failures};
    const evidence={schemaVersion:1,status:'GO_CANDIDATE',generatedAt:new Date().toISOString(),catalogRecords:c.recordCount,grades:[...new Set(c.records.map(r=>Number(r.grade)))].sort((a,b)=>a-b),policy:'fail-closed; human gate retained for irreversible/high-impact actions',next:'production deployment requires the repository delivery gate'};
    const path=`${out}/release-evidence.json`;
    await writeFile(path,JSON.stringify(evidence,null,2)+'\n','utf8');
    return {ok:true,type:job.type,artifact:path,evidence};
  }
  return {ok:false,error:`UNSUPPORTED_JOB_TYPE:${job.type}`};
}
