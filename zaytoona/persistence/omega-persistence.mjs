/* Ω PERSISTENCE LAYER v1.0 — local state + GitHub snapshot contract */
export const PERSISTENCE_VERSION='Ω-PERSISTENCE-1.0';
export const DEFAULT_STATE={version:PERSISTENCE_VERSION,runId:null,status:'idle',currentTask:null,queue:[],checkpoints:[],sources:{},updatedAt:null};
const clone=x=>JSON.parse(JSON.stringify(x));
export function createState(seed={}){return {...clone(DEFAULT_STATE),...clone(seed),version:PERSISTENCE_VERSION,updatedAt:new Date().toISOString()};}
export function registerSource(state,source){const s=createState(state);if(!source?.id)throw Error('SOURCE_ID_REQUIRED');s.sources[source.id]={...source,updatedAt:new Date().toISOString()};return s;}
export function enqueue(state,task){const s=createState(state);if(!task?.id)throw Error('TASK_ID_REQUIRED');if(!s.queue.some(x=>x.id===task.id))s.queue.push({...task,status:task.status||'pending'});return s;}
export function checkpoint(state,patch){const s=createState(state),next={...s,...clone(patch),updatedAt:new Date().toISOString()};next.checkpoints=[...s.checkpoints,{at:next.updatedAt,taskId:next.currentTask?.id||null,status:next.status,state:clone(patch)}];return next;}
export function completeTask(state,id,result=null){const s=createState(state);s.queue=s.queue.map(t=>t.id===id?{...t,status:'completed',result}:t);return checkpoint(s,{status:'running',currentTask:null});}
export function failTask(state,id,error){const s=createState(state);s.queue=s.queue.map(t=>t.id===id?{...t,status:'failed',error:String(error)}:t);return checkpoint(s,{status:'recoverable',currentTask:null});}
export function resume(state){const s=createState(state);const pending=s.queue.find(t=>t.status==='running'||t.status==='pending'||t.status==='failed');return {...s,status:pending?'resuming':'idle',currentTask:pending||null,updatedAt:new Date().toISOString()};}
export function serialize(state){return JSON.stringify(createState(state),null,2)+'\n';}
export function validate(state){const s=createState(state),errors=[];if(!s.version)errors.push('VERSION');if(!Array.isArray(s.queue))errors.push('QUEUE');if(!Array.isArray(s.checkpoints))errors.push('CHECKPOINTS');if(!s.sources||typeof s.sources!=='object')errors.push('SOURCES');return {pass:errors.length===0,errors};}
export function createGitHubSnapshot(state){const v=validate(state);if(!v.pass)throw Error(`INVALID_STATE:${v.errors.join(',')}`);return {schema:'zaytoona-persistence-snapshot-v1',generatedAt:new Date().toISOString(),state:createState(state)};}
