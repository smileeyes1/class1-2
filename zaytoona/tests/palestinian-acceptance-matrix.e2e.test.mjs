import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import { validateCatalog } from '../meta-system/index.mjs';

const read=p=>fs.readFile(p,'utf8');
const catalog=JSON.parse(await read('zaytoona/kefayat/catalog.json'));

function env(sourceCatalog=catalog){
  const store=new Map();
  const nodes={};
  const node=key=>nodes[key]??=( {id:key,innerHTML:'',textContent:'',value:'',dataset:{},style:{},children:[],onclick:null,onchange:null,appendChild(x){this.children.push(x)},insertAdjacentHTML(){},querySelector(sel){return node(sel)},querySelectorAll(){return[]} } );
  const localStorage={setItem:(k,v)=>store.set(k,String(v)),getItem:k=>store.get(k)??null,removeItem:k=>store.delete(k)};
  const document={readyState:'loading',body:node('body'),head:node('head'),createElement:tag=>node(`created:${tag}`),getElementById:()=>null,querySelector:sel=>node(sel),querySelectorAll:()=>[],addEventListener(){}};
  const c={console,localStorage,document,crypto:{randomUUID:()=>`accept-${Math.random()}`},setTimeout,clearTimeout,Promise,Math,Date,structuredClone,fetch:async()=>({ok:true,json:async()=>sourceCatalog})};
  c.window=c;c.__nodes=nodes;vm.createContext(c);return c;
}
const load=async(c,p)=>vm.runInContext(await read(p),c,{filename:p});

async function boot(sourceCatalog=catalog){
  const c=env(sourceCatalog);
  await load(c,'zaytoona/annual-learning-engine-v1.js');
  await c.ZaytoonaAnnualLearning.load();
  await load(c,'zaytoona/smart-lesson-generator-v1.js');
  await load(c,'zaytoona/assessment-engine-v1.js');
  return c;
}

async function selectGrade(c,grade){
  const ctl=c.__nodes['#ae-grade'];
  assert.equal(typeof ctl?.onchange,'function','GRADE_CONTROL_NOT_WIRED');
  ctl.onchange({target:{value:String(grade)}});
}

for(const grade of [1,2]) test(`Palestinian acceptance: grade ${grade} full mastery/recovery cycle`,async()=>{
  const c=await boot();
  await selectGrade(c,grade);
  const plan=c.ZaytoonaAnnualLearning.plan();
  assert.ok(plan.length>0,`GRADE_${grade}_PLAN_EMPTY`);
  const competency=plan[0];
  assert.equal(competency.grade,grade);
  const lesson=c.ZaytoonaSmartLesson.build(competency);
  assert.equal(lesson.competencyId,competency.id);
  assert.equal(lesson.duration,45);
  const diagnostic=c.ZaytoonaAssessment.assess(lesson,60,.8);
  assert.equal(diagnostic.mastered,false,'DIAGNOSTIC_MUST_ROUTE_TO_RECOVERY');
  c.ZaytoonaAnnualLearning.setState(competency.id,{status:'تحتاج دعمًا',stageIndex:1,week:competency.week});
  assert.equal(c.ZaytoonaAnnualLearning.state(competency.id).status,'تحتاج دعمًا');
  const final=c.ZaytoonaAssessment.assess(lesson,100,.8);
  assert.equal(final.mastered,true);
  c.ZaytoonaAnnualLearning.setState(competency.id,{status:'متقنة',stageIndex:0,week:competency.week});
  assert.equal(c.ZaytoonaAnnualLearning.state(competency.id).status,'متقنة');
});

test('Palestinian acceptance: missing grade data fails closed',async()=>{
  const grade1Only={...catalog,records:catalog.records.filter(r=>Number(r.grade)===1)};
  grade1Only.recordCount=grade1Only.records.length;
  const c=await boot(grade1Only);
  await selectGrade(c,2);
  assert.equal(c.ZaytoonaAnnualLearning.plan().length,0,'MISSING_GRADE_MUST_NOT_FALLBACK_SILENTLY');
});

test('Palestinian acceptance: catalog count corruption is rejected',()=>{
  const corrupted={...catalog,recordCount:catalog.recordCount+1};
  const v=validateCatalog(corrupted);
  assert.equal(v.ok,false);
  assert.ok(v.failures.includes('COUNT_MISMATCH'));
});

test('Palestinian acceptance: provenance loss is rejected',()=>{
  const records=catalog.records.map((r,i)=>i===0?{...r,raw:null}:r);
  const corrupted={...catalog,records,recordCount:records.length};
  const v=validateCatalog(corrupted);
  assert.equal(v.ok,false);
  assert.ok(v.failures.some(x=>x.startsWith('PROVENANCE:')));
});

test('Palestinian acceptance: threshold boundary is deterministic',async()=>{
  const c=await boot();
  const competency=c.ZaytoonaAnnualLearning.plan()[0];
  const lesson=c.ZaytoonaSmartLesson.build(competency);
  assert.equal(c.ZaytoonaAssessment.assess(lesson,79,.8).mastered,false);
  assert.equal(c.ZaytoonaAssessment.assess(lesson,80,.8).mastered,true);
});

console.log(JSON.stringify({suite:'PALESTINIAN_ACCEPTANCE_MATRIX',grades:[1,2],scenarios:['mastery','recovery','missing-grade-fail-closed','count-corruption','provenance-loss','threshold-boundary']}));
