import fs from 'node:fs';
import { runVerticalSlice } from './orchestrator.mjs';

const path = 'zaytoona/runtime-state.json';
const now = new Date().toISOString();
let previous = {};
if (fs.existsSync(path)) previous = JSON.parse(fs.readFileSync(path, 'utf8'));

const run = runVerticalSlice();
const state = {
  schema: 1,
  updated_at: now,
  pulse: (previous.pulse ?? 0) + 1,
  release: run.release,
  assurance_state: run.assurance?.state ?? 'UNKNOWN',
  stage: run.stage,
  repairs: run.repairs,
  last_history_stage: run.history.at(-1)?.stage ?? null,
  next_action: run.release === 'CONDITIONAL_RELEASE' ? 'WAIT_FOR_NEXT_EVENT_OR_EXTERNAL_PILOT' : 'REPAIR_AND_REGRESSION',
  evidence: {
    deterministic_assurance: run.assurance?.state === 'READY_FOR_EXECUTION',
    red_team: Array.isArray(run.red_team) && run.red_team.every(x => x.detected)
  }
};
fs.writeFileSync(path, JSON.stringify(state, null, 2) + '\n');
console.log(JSON.stringify(state));
