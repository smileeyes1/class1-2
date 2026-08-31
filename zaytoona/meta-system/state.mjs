import { STATES, TERMINAL } from './contracts.mjs';
const transitions={READY:['CLAIMED','STOPPED'],CLAIMED:['RUNNING','READY','STOPPED'],RUNNING:['VERIFYING','FAILED','STOPPED'],VERIFYING:['PASSED','FAILED','STOPPED'],FAILED:['RECOVERING','BLOCKED'],RECOVERING:['READY','BLOCKED'],PASSED:[],BLOCKED:[],STOPPED:[]};
export function transition(job,to){if(!STATES.includes(to)||!transitions[job.status]?.includes(to))throw new Error(`INVALID_TRANSITION:${job.status}->${to}`);return {...job,status:to,updatedAt:new Date().toISOString()};}
export function checkpoint(state){return JSON.parse(JSON.stringify({...state,checkpointAt:new Date().toISOString()}));}
export function recover(state){const next=checkpoint(state);for(const j of next.jobs){if(['CLAIMED','RUNNING','VERIFYING','RECOVERING'].includes(j.status)&&j.lease?.expiresAt&&Date.parse(j.lease.expiresAt)<=Date.now())Object.assign(j,{status:'READY',lease:null,recovery:{...(j.recovery||{}),count:(j.recovery?.count||0)+1,reason:'EXPIRED_LEASE'}})}return next;}
export function terminal(job){return TERMINAL.has(job.status)}
