import { mkdir } from 'node:fs/promises';
import { loadState, saveState } from './store.mjs';
import { execute } from './executors.mjs';
import { runOnce } from './runtime.mjs';

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
const result = await runOnce(execute);
console.log(JSON.stringify(result));
