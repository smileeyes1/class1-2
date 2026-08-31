import { loadState, saveState } from './store.mjs';
import { plan } from './planner.mjs';

export async function supervise(statePath) {
  const state = await loadState(statePath);
  const decision = plan(state);
  state.control = {lastDecision:decision, decidedAt:new Date().toISOString()};
  await saveState(statePath,state);
  return decision;
}
