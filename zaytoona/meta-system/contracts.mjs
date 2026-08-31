export const META_VERSION='1.0';
export const STATES=Object.freeze(['READY','CLAIMED','RUNNING','VERIFYING','PASSED','FAILED','RECOVERING','BLOCKED','STOPPED']);
export const TERMINAL=new Set(['PASSED','BLOCKED','STOPPED']);
export function jobContract(input={}){if(!input.id||!input.type)throw new Error('INVALID_JOB_CONTRACT');return Object.freeze({id:String(input.id),type:String(input.type),priority:Number(input.priority??0),dependsOn:[...(input.dependsOn||[])],attempts:Number(input.attempts??0),maxAttempts:Number(input.maxAttempts??3),status:input.status||'READY',risk:input.risk||'LOW',payload:input.payload??null});}
export function missionContract(input={}){if(!input.missionId||!input.goal)throw new Error('INVALID_MISSION_CONTRACT');return {version:META_VERSION,missionId:String(input.missionId),goal:String(input.goal),failClosed:input.failClosed!==false,ownerGate:input.ownerGate||'FINAL_HUMAN_ONLY',jobs:(input.jobs||[]).map(jobContract)};}
export const MODULE_CONTRACT=Object.freeze({required:['id','version','capabilities','run','verify'],failClosed:true});
