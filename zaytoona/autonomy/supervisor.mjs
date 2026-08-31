import { loadState, saveState } from './store.mjs';
import { plan } from './planner.mjs';
import { planNextWake } from './adaptive-pulse.mjs';

export async function supervise(statePath) {
  const state = await loadState(statePath);
  const decision = plan(state);
  const pulse = planNextWake({...state, control:{lastDecision:decision}});
  state.control = {
    lastDecision: decision,
    decidedAt: new Date().toISOString(),
    nextWake: pulse
  };
  await saveState(statePath,state);
  return {...decision, nextWake:pulse};
}
