/* ZAYTOONA Ω FACTORY v1.0 — dependency-aware parallel-safe task orchestration. */
(function(global){'use strict';
 const S=()=>global.ZaytoonaOmegaState;
 const registry=new Map();
 const sleep=ms=>new Promise(r=>setTimeout(r,ms));
 function register(def){registry.set(def.id,def);}
 function ready(job,all){return (job.dependsOn||[]).every(id=>all[id]&&all[id].status==='done')}
 async function run(def,ctx){const s=S();let j=s.get().jobs[def.id]||{};s.upsertJob({id:def.id,title:def.title,status:'running',attempts:(j.attempts||0)+1,dependsOn:def.dependsOn||[]});s.event('job.started',{id:def.id});try{const result=await def.run(ctx);s.upsertJob({id:def.id,status:'done',result});s.event('job.done',{id:def.id});return {ok:true,id:def.id,result}}catch(error){const msg=error&&error.message||String(error);s.upsertJob({id:def.id,status:'failed',error:msg});s.event('job.failed',{id:def.id,error:msg});return {ok:false,id:def.id,error:msg}}}
 async function execute(defs,ctx){defs.forEach(register);const all={};defs.forEach(d=>all[d.id]={id:d.id,status:'pending'});let remaining=new Set(defs.map(d=>d.id));let rounds=0;while(remaining.size&&rounds++<100){const runnable=[...remaining].map(id=>registry.get(id)).filter(d=>ready(d,all));if(!runnable.length){return {ok:false,blocked:[...remaining],reason:'dependency-cycle-or-missing-dependency'}};const results=await Promise.all(runnable.map(d=>run(d,ctx)));results.forEach(r=>{all[r.id]={...all[r.id],status:r.ok?'done':'failed'};remaining.delete(r.id)});if(results.some(r=>!r.ok))return {ok:false,failed:results.filter(r=>!r.ok),completed:[...Object.values(all).filter(x=>x.status==='done').map(x=>x.id)]};await sleep(0)}return {ok:remaining.size===0,completed:[...Object.values(all).filter(x=>x.status==='done').map(x=>x.id)]}}
 global.ZaytoonaOmegaFactory={register,execute};
})(window);