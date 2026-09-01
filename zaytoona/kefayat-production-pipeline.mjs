import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import vm from 'node:vm';

const read=p=>readFile(p,'utf8');
const catalog=JSON.parse(await read('zaytoona/kefayat/catalog.json'));
assert.ok(catalog.recordCount>0,'CATALOG_EMPTY');
assert.equal(catalog.records.length,catalog.recordCount,'CATALOG_COUNT_MISMATCH');

const competency=catalog.records.find(r=>Number(r.grade)===1 && ['arabic','math','islamic','nurturing'].includes(r.source))||catalog.records[0];
assert.ok(competency?.id,'KEFAYAT_COMPETENCY_MISSING');

const store=new Map();
function env(){
 const localStorage={setItem:(k,v)=>store.set(k,String(v)),getItem:k=>store.get(k)??null,removeItem:k=>store.delete(k)};
 const el=()=>({innerHTML:'',textContent:'',value:'',dataset:{},children:[],onclick:null,appendChild(x){this.children.push(x)},insertAdjacentHTML(){},querySelector(){return el()},querySelectorAll(){return []}});
 const document={body:el(),createElement:()=>el(),getElementById:()=>null,querySelector:()=>null,querySelectorAll:()=>[]};
 const c={console,localStorage,document,crypto:{randomUUID:()=>`e2e-${Math.random()}`},setTimeout,clearTimeout,Promise,Math,Date,structuredClone,fetch:async()=>({ok:true,json:async()=>catalog})};
 c.window=c;vm.createContext(c);return c;
}
const load=async(c,p)=>vm.runInContext(await read(p),c,{filename:p});

const c=env();
await load(c,'zaytoona/annual-learning-engine-v1.js');
await c.ZaytoonaAnnualLearning.load();
const annual=c.ZaytoonaAnnualLearning.plan();
const annualCompetency=annual.find(r=>r.id===competency.id)||annual[0];
assert.ok(annualCompetency,'ANNUAL_PLAN_EMPTY');
assert.equal(annualCompetency.id,competency.id,'ANNUAL_KEFAYAT_MISMATCH');
assert.ok(annualCompetency.week>=1&&annualCompetency.week<=36,'ANNUAL_WEEK_INVALID');

await load(c,'zaytoona/smart-lesson-generator-v1.js');
const lesson=c.ZaytoonaSmartLesson.build(annualCompetency);
assert.equal(lesson.competencyId,annualCompetency.id,'LESSON_COMPETENCY_MISMATCH');
assert.equal(lesson.grade,annualCompetency.grade,'LESSON_GRADE_MISMATCH');
assert.equal(lesson.duration,45,'LESSON_DURATION_INVALID');
assert.ok(lesson.stages.length>=6,'LESSON_STAGES_INCOMPLETE');

await load(c,'zaytoona/assessment-engine-v1.js');
const assessment=c.ZaytoonaAssessment.assess(lesson,100,0.8);
assert.equal(assessment.competencyId,lesson.competencyId,'ASSESSMENT_COMPETENCY_MISMATCH');
assert.equal(assessment.mastered,true,'ASSESSMENT_MASTERY_FAILED');

c.ZaytoonaAnnualLearning.setState(lesson.competencyId,{status:'متقنة',stageIndex:0,week:annualCompetency.week});
assert.equal(c.ZaytoonaAnnualLearning.state(lesson.competencyId).status,'متقنة','STATE_WRITE_FAILED');

const pkg={id:lesson.id,version:'kefayat-production-v1',context:{grade:lesson.grade,subject:lesson.subject,competencyId:lesson.competencyId},objective:lesson.goal,success_criterion:lesson.assessment.criterion,timeline:{total_minutes:45,segments:[{minutes:5},{minutes:10},{minutes:15},{minutes:10},{minutes:5}]},activities:[{objective_links:[lesson.competencyId]}],assessment:{items:[{criterion:lesson.assessment.criterion}]},artifacts:[{status:'generated'}],evidence:[{claim:lesson.assessment.criterion,status:'not_proven'}],assurance:{source:'Kefayat→Annual→Lesson→Assessment'}};

await load(c,'zaytoona/validator.mjs');
const validator=c.validateLesson;
assert.equal(typeof validator,'function','VALIDATOR_UNAVAILABLE');
const validation=validator(pkg);
assert.equal(validation.state,'READY_FOR_EXECUTION','VALIDATION_FAILED');

const recovered=env();
await load(recovered,'zaytoona/annual-learning-engine-v1.js');
await load(recovered,'zaytoona/assessment-engine-v1.js');
assert.equal(recovered.ZaytoonaAnnualLearning.state(lesson.competencyId).status,'متقنة','STATE_RECOVERY_FAILED');
assert.equal(recovered.ZaytoonaAssessment.get(lesson.competencyId).mastered,true,'ASSESSMENT_RECOVERY_FAILED');

console.log(JSON.stringify({status:'PASS',pipeline:['KEFAYAT','ORCHESTRATOR','ANNUAL_LEARNING','LESSON_GENERATOR','ASSESSMENT','VALIDATOR'],competency:{id:lesson.competencyId,grade:lesson.grade,subject:annualCompetency.subject,week:annualCompetency.week},lesson:{id:lesson.id,duration:lesson.duration,stages:lesson.stages.length},assessment:{score:assessment.score,mastered:assessment.mastered},validation:validation.state,recovery:true},null,2));
