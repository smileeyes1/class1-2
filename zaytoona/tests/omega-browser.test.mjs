import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const stateSrc=fs.readFileSync(new URL('../omega-state.js',import.meta.url),'utf8');
const factorySrc=fs.readFileSync(new URL('../omega-factory.js',import.meta.url),'utf8');
const commandSrc=fs.readFileSync(new URL('../omega-command.js',import.meta.url),'utf8');

function makeEnv(){
  const store=new Map();
  const localStorage={setItem:(k,v)=>store.set(k,String(v)),getItem:k=>store.get(k)??null,removeItem:k=>store.delete(k)};
  const document={querySelector:s=>({ '#teacher':{}, '#student':{} }[s]??null),querySelectorAll:s=>s==='button'?[1,2,3,4,5]:[] ,body:{innerText:'زيتونة ٢+٣=٥'}};
  const ctx={console,localStorage,document,crypto:{randomUUID:()=>`id-${Math.random()}`},setTimeout,clearTimeout,Promise,Math,Date,fetch:async()=>({ok:true,json:async()=>({arabic:3,math:4})})};
  ctx.window=ctx;
  vm.createContext(ctx);
  return ctx;
}
function load(ctx,src){vm.runInContext(src,ctx)}

 test('state survives reload and preserves completed jobs',()=>{
  const a=makeEnv();load(a,stateSrc);a.ZaytoonaOmegaState.setMission('اختبار');a.ZaytoonaOmegaState.upsertJob({id:'a',status:'done',result:'ok'});
  const b={...a};vm.createContext(b);load(b,stateSrc);assert.equal(b.ZaytoonaOmegaState.get().jobs.a.status,'done');assert.equal(b.ZaytoonaOmegaState.get().mission,'اختبار');
 });

test('factory runs independent jobs concurrently',async()=>{
 const c=makeEnv();load(c,stateSrc);load(c,factorySrc);c.ZaytoonaOmegaState.setMission('parallel');const active=[];let max=0;
 const mk=id=>({id,title:id,run:async()=>{active.push(id);max=Math.max(max,active.length);await new Promise(r=>setTimeout(r,30));active.splice(active.indexOf(id),1);return id}});
 const r=await c.ZaytoonaOmegaFactory.execute([mk('a'),mk('b')],{});assert.equal(r.ok,true);assert.equal(max,2);
});

test('resume skips completed jobs and reruns only failed jobs',async()=>{
 const c=makeEnv();load(c,stateSrc);load(c,factorySrc);c.ZaytoonaOmegaState.setMission('resume');let aRuns=0,bRuns=0,cRuns=0;
 const defs=[{id:'a',run:async()=>{aRuns++;return'a'}},{id:'b',dependsOn:['a'],run:async()=>{bRuns++;if(bRuns===1)throw Error('planned-failure');return'b'}},{id:'c',run:async()=>{cRuns++;return'c'}}];
 const first=await c.ZaytoonaOmegaFactory.execute(defs,{});assert.equal(first.ok,false);assert.equal(aRuns,1);assert.equal(cRuns,1);
 const second=await c.ZaytoonaOmegaFactory.execute(defs,{});assert.equal(second.ok,true);assert.equal(aRuns,1);assert.equal(cRuns,1);assert.equal(bRuns,2);
});

test('factory rejects dependency cycles without hanging',async()=>{
 const c=makeEnv();load(c,stateSrc);load(c,factorySrc);c.ZaytoonaOmegaState.setMission('cycle');const r=await c.ZaytoonaOmegaFactory.execute([{id:'a',dependsOn:['b'],run:async()=>1},{id:'b',dependsOn:['a'],run:async()=>2}],{});assert.equal(r.ok,false);assert.equal(r.reason,'dependency-cycle-or-missing-dependency');
});

test('new command mission gets a fresh run instead of inheriting old completion',async()=>{
 const c=makeEnv();load(c,stateSrc);load(c,factorySrc);load(c,commandSrc);const first=await c.ZaytoonaOmegaCommand.start('mission-one');assert.equal(first.ok,true);const run1=c.ZaytoonaOmegaCommand.state().runId;const second=await c.ZaytoonaOmegaCommand.start('mission-two');assert.equal(second.ok,true);const st=c.ZaytoonaOmegaCommand.state();assert.equal(st.mission,'mission-two');assert.notEqual(st.runId,run1);
});