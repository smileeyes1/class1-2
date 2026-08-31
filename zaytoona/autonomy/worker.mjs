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
  if (!state.jobs.length) {
    const mission = await loadState(missionPath).catch(() => null);
    if (mission?.jobs?.length) await saveState(statePath, {version:1,missions:[mission],jobs:mission.jobs,events:[]});
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
