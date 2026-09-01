import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';

// E2E contract: Kefayat → Annual Learning → Lesson Generator → Assessment → Recovery.
const read = p => fs.readFile(p, 'utf8');
const catalog = JSON.parse(await read('zaytoona/kefayat/catalog.json'));
assert.ok(catalog.recordCount > 0, 'catalog must be generated before E2E');

function env(){
  const store=new Map();
  const localStorage={setItem:(k,v)=>store.set(k,String(v)),getItem:k=>store.get(k)??null,removeItem:k=>store.delete(k)};
  const elements=new Map();
  const makeEl=id=>({id,dir:'',innerHTML:'',textContent:'',value:'',dataset:{},style:{},children:[],appendChild(x){this.children.push(x);},insertAdjacentHTML(){},querySelector(s){return elements.get(s)||{value:'',onclick:null};},querySelectorAll(){return[];}});
  const document={body:makeEl('body'),createElement:tag=>makeEl(tag),getElementById:id=>id==='annual-engine'?elements.get('#annual-engine'):null,querySelector:s=>elements.get(s)||null,querySelectorAll:()=>[]};
  const c={console,localStorage,document,crypto:{randomUUID:()=>`e2e-${Math.random()}`},setTimeout,clearTimeout,Promise,Math,Date,structuredClone,fetch:async()=>({ok:true,json:async()=>catalog})};
  c.window=c;vm.createContext(c);return c;
}
const load=async(c,p)=>vm.runInContext(await read(p),c,{filename:p});

test('E2E: Kefayat → annual → lesson → assessment → mastery → recovery',async()=>{
  const c=env();
  await load(c,'zaytoona/annual-learning-engine-v1.js');
  await c.ZaytoonaAnnualLearning.load();
  const plan=c.ZaytoonaAnnualLearning.plan();
  assert.ok(plan.length>0,'annual engine must select a real Kefayat competency');
  const competency=plan[0];
  assert.equal(competency.grade,1);
  assert.equal(competency.subject,'arabic');
  assert.ok(competency.week>=1&&competency.week<=36);
  await load(c,'zaytoona/smart-lesson-generator-v1.js');
  const lesson=c.ZaytoonaSmartLesson.build(competency);
  assert.equal(lesson.competencyId,competency.id);
  assert.equal(lesson.grade,competency.grade);
  assert.equal(lesson.duration,45);
  assert.ok(lesson.stages.length>=6);
  await load(c,'zaytoona/assessment-engine-v1.js');
  const assessment=c.ZaytoonaAssessment.assess(lesson,100,0.8);
  assert.equal(assessment.competencyId,competency.id);
  assert.equal(assessment.mastered,true);
  c.ZaytoonaAnnualLearning.setState(competency.id,{status:'متقنة',stageIndex:0,week:competency.week});
  assert.equal(c.ZaytoonaAnnualLearning.state(competency.id).status,'متقنة');
  assert.equal(c.ZaytoonaAssessment.get(competency.id).mastered,true);
  assert.ok(c.ZaytoonaAnnualLearning.plan().some(x=>x.id===competency.id),'RECOVERY_CATALOG_FAILED');
  console.log(JSON.stringify({status:'PASS',pipeline:['KEFAYAT','ANNUAL_LEARNING','LESSON_GENERATOR','ASSESSMENT','RECOVERY'],competency:{id:competency.id,grade:competency.grade,subject:competency.subject,week:competency.week},lesson:{id:lesson.id,duration:lesson.duration,stages:lesson.stages.length},assessment:{score:assessment.score,mastered:assessment.mastered}}));
});
