import { recover } from './state.mjs';
export function recoveryDecision(job){const attempts=Number(job.attempts||0),max=Number(job.maxAttempts||3);if(attempts>=max)return {action:'BLOCKED',reason:'MAX_ATTEMPTS'};if(/TIMEOUT|429|503|ECONNRESET|ENETUNREACH/i.test(String(job.error||'')))return {action:'RETRY',mode:'TRANSIENT'};if(/CONFLICT|FENCED/i.test(String(job.error||'')))return {action:'REQUEUE',mode:'CONCURRENCY'};return {action:'REPAIR_RETRY',mode:'LOGIC'};}
export { recover };
