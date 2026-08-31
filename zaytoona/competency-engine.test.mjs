import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source=fs.readFileSync(new URL('./competency-engine.js',import.meta.url),'utf8');
const store=new Map();
const context={window:{},localStorage:{getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,v)},document:{readyState:'loading',addEventListener(){}}};
vm.runInNewContext(source,context);
const engine=context.window.ZaytoonaCompetency;
assert.ok(engine);
const records=[
{id:'K1',grade:1,subject:'math',domain:'numbers',competency:'يمثل العدد',learningOutcome:'يمثل عددًا بصورة صحيحة'},
{id:'K2',grade:1,subject:'math',domain:'operations',competency:'يجمع عددين',learningOutcome:'يحل جمعًا بسيطًا'},
{id:'K3',grade:2,subject:'arabic',domain:'reading',competency:'يقرأ كلمات',learningOutcome:'يقرأ كلمات مألوفة'}
];
assert.equal(engine.filter(records,{grade:1,subject:'math'}).length,2);
assert.equal(engine.filter(records,{grade:1,subject:'math',query:'جمع'}).length,1);
assert.equal(engine.summary(records,{grade:1,subject:'math'}).notStarted,2);
engine.record('K2',1);
assert.equal(engine.mastery('K2').state,'MASTERED');
assert.equal(engine.summary(records,{grade:1,subject:'math'}).mastered,1);
console.log('competency engine tests: PASS');
