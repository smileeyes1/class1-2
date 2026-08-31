import { mkdir } from 'node:fs/promises';
import { loadState, saveState } from './store.mjs';
import { execute } from './executors.mjs';
import { runOnce } from './runtime.mjs';
import { supervise } from './supervisor.mjs';

const statePath = process.env.ZAYTOONA_STATE || './.zaytoona/state.json';
const missionPath = process.env.ZAYTOONA_MISSION || './mission.json';

async function bootstrap() {
  await mkdir('./.zaytoona',{recursive:true});
  const state = await loadState(statePath);
  const mission = await loadState(missionPath).catch(() => null);
  if (!mission?.jobs?.length) return;

  const active = state.missions?.at(-1);
  const changed = active?.missionId !== mission.missionId || active?.version !== mission.version;
  if (!state.jobs.length || changed) {
    const oldEvents = state.events || [];
    const resetJobs = mission.jobs.map(j => ({...j,attempts:0,lease:null,error:null,evidence:null}));
    await saveState(statePath, {
      version: mission.version,
      missions:[...(state.missions||[]), mission],
      jobs:resetJobs,
      events:[...oldEvents,{type:'MISSION_RECONCILED',missionId:mission.missionId,version:mission.version,at:new Date().toISOString()}]
    });
  }
}

await bootstrap();
const decision = await supervise(statePath);
if (decision.kind === 'ESCALATE') {
  console.log(JSON.stringify({status:'BLOCKED',reason:'HUMAN_GATE',jobId:decision.jobId,code:decision.code}));
  process.exitCode = 2;
} else if (decision.kind === 'IDLE') {
  console.log(JSON.stringify({status:'IDLE'}));
} else {
  const result = await runOnce(execute);
  console.log(JSON.stringify(result));
  if (['FAILED','BLOCKED'].includes(result.status)) process.exitCode = 1;
}
