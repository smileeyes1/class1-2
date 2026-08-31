import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const root=new URL('../',import.meta.url);
const read=n=>fs.readFileSync(new URL(n,root),'utf8');
const src=read('annual-learning-engine-v1.js');

function env(records){
  const store=new Map();
  const localStorage={setItem:(k,v)=>store.set(k,String(v)),getItem:k=>store.get(k)??null,removeItem:k=>store.delete(k)};
  const body={appendChild(){},innerHTML:''};
  const document={readyState:'complete',getElementById:()=>null,querySelector:()=>null,body,createElement:()=>({id:'',dir:'',innerHTML:'',insertAdjacentHTML(){},appendChild(){}}),addEventListener(){}};
  const c={console,localStorage,document,window:null,fetch:async()=>({ok:true,json:async()=>({records})}),setTimeout,clearTimeout,Promise,Math,Date};
  c.window=c;vm.createContext(c);return c;
}

test('engine exposes annual planner and preserves source records',async()=>{
  const records=[
    {id:'a1',grade:1,source:'arabic','المجال':'قراءة','الكفايات الفرعية':'يقرأ كلمات','ناتج التعلم':'يقرأ كلمة صحيحة'},
    {id:'m1',grade:1,source:'math','المجال':'أعداد','الكفايات الفرعية':'يجمع','ناتج التعلم':'يجمع ضمن ١٠'},
    {id:'a2',grade:2,source:'arabic','المجال':'قراءة','الكفايات الفرعية':'يقرأ نصًا','ناتج التعلم':'يقرأ نصًا قصيرًا'}
  ];
  const c=env(records);vm.runInContext(src,c);await new Promise(r=>setTimeout(r,0));
  assert.ok(c.ZaytoonaAnnualLearning);
  assert.equal(c.ZaytoonaAnnualLearning.plan().length,1);
  assert.equal(c.ZaytoonaAnnualLearning.plan()[0].id,'a1');
  assert.equal(c.ZaytoonaAnnualLearning.state('a1').status,'لم تبدأ');
});

test('mastery persists and planner deprioritizes mastered competencies',async()=>{
  const records=[
    {id:'a1',grade:1,source:'arabic','الكفايات الفرعية':'أ','ناتج التعلم':'أ'},
    {id:'a2',grade:1,source:'arabic','الكفايات الفرعية':'ب','ناتج التعلم':'ب'}
  ];
  const c=env(records);vm.runInContext(src,c);await new Promise(r=>setTimeout(r,0));
  c.ZaytoonaAnnualLearning.setState('a1',{status:'متقنة',stageIndex:0,week:1});
  assert.equal(c.ZaytoonaAnnualLearning.state('a1').status,'متقنة');
  const p=c.ZaytoonaAnnualLearning.plan();
  assert.equal(p[0].id,'a2');
});

test('source text is not rewritten by annual layer',async()=>{
  const original='يقرأ الطالب نصًا قصيرًا ويحدد الفكرة الرئيسة';
  const c=env([{id:'x',grade:1,source:'arabic','الكفايات الفرعية':original,'ناتج التعلم':original}]);
  vm.runInContext(src,c);await new Promise(r=>setTimeout(r,0));
  assert.equal(c.ZaytoonaAnnualLearning.plan()[0].sub,original);
  assert.equal(c.ZaytoonaAnnualLearning.plan()[0].outcome,original);
});
