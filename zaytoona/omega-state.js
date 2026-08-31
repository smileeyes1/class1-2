/* ZAYTOONA Ω STATE v1.0 — durable, restart-safe browser state. */
(function(global){'use strict';
 const KEY='zaytoona:omega:state:v1';
 const now=()=>new Date().toISOString();
 const base=()=>({version:1,mission:null,status:'idle',phase:'idle',jobs:{},events:[],artifacts:[],evidence:[],checkpoint:null,updatedAt:now()});
 function load(){try{const x=JSON.parse(localStorage.getItem(KEY)||'null');return x&&x.version===1?x:base()}catch{return base()}}
 let state=load();
 function save(){state.updatedAt=now();localStorage.setItem(KEY,JSON.stringify(state));return state}
 const api={get:()=>JSON.parse(JSON.stringify(state)),reset:()=>{state=base();return save()},setMission(m){state.mission=m;state.status='running';state.phase='planning';return save()},setPhase(p){state.phase=p;return save()},setStatus(s){state.status=s;return save()},upsertJob(j){state.jobs[j.id]={...(state.jobs[j.id]||{}),...j,updatedAt:now()};return save()},event(type,data){state.events.push({id:crypto.randomUUID?crypto.randomUUID():String(Date.now()),type,data,at:now()});state.events=state.events.slice(-200);return save()},artifact(a){state.artifacts.push({...a,at:now()});return save()},evidence(e){state.evidence.push({...e,at:now()});return save()},checkpoint(label,data){state.checkpoint={label,data,at:now()};return save()},clearMission(){state.mission=null;state.status='idle';state.phase='idle';return save()}};
 global.ZaytoonaOmegaState=api;
})(window);