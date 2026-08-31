/* ZAYTOONA Ω STATE v1.1 — durable, restart-safe browser state with recovery metadata. */
(function(global){'use strict';
 const KEY='zaytoona:omega:state:v1';
 const now=()=>new Date().toISOString();
 const base=()=>({version:1,mission:null,runId:null,status:'idle',phase:'idle',jobs:{},events:[],artifacts:[],evidence:[],checkpoint:null,updatedAt:now()});
 function load(){try{const x=JSON.parse(localStorage.getItem(KEY)||'null');if(!x||x.version!==1)return base();return {...base(),...x,jobs:x.jobs||{},events:Array.isArray(x.events)?x.events:[],artifacts:Array.isArray(x.artifacts)?x.artifacts:[],evidence:Array.isArray(x.evidence)?x.evidence:[]}}catch{return base()}}
 let state=load();
 function save(){state.updatedAt=now();try{localStorage.setItem(KEY,JSON.stringify(state));return state}catch(e){state.lastError='storage-write-failed';return state}}
 const api={
  get:()=>JSON.parse(JSON.stringify(state)),
  reset:()=>{state=base();return save()},
  setMission(m){state.mission=m;state.runId=(global.crypto&&crypto.randomUUID)?crypto.randomUUID():String(Date.now());state.status='running';state.phase='planning';return save()},
  resumeMission(){if(!state.mission)state.mission='استئناف آخر مهمة';state.status='running';state.phase='recovery';return save()},
  setPhase(p){state.phase=p;return save()},
  setStatus(s){state.status=s;return save()},
  upsertJob(j){state.jobs[j.id]={...(state.jobs[j.id]||{}),...j,updatedAt:now()};return save()},
  event(type,data){state.events.push({id:(global.crypto&&crypto.randomUUID)?crypto.randomUUID():String(Date.now())+'-'+state.events.length,type,data,at:now()});state.events=state.events.slice(-200);return save()},
  artifact(a){state.artifacts.push({...a,at:now()});return save()},
  evidence(e){state.evidence.push({...e,at:now()});return save()},
  checkpoint(label,data){state.checkpoint={label,data,at:now()};return save()},
  clearMission(){state.mission=null;state.runId=null;state.status='idle';state.phase='idle';state.jobs={};state.checkpoint=null;return save()}
 };
 global.ZaytoonaOmegaState=api;
})(window);