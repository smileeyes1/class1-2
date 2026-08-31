/** ZAYTOONA Ω Adaptive Intelligence Layer v1.0
 * Deterministic decision functions: risk, value, agent routing, confidence, and stop criteria.
 * It proposes/chooses work; it never bypasses governance gates.
 */

const AGENTS = Object.freeze({
  curriculum:['curriculum','evidence'],
  math:['subject','math_visual'],
  visual:['visual','accessibility'],
  assessment:['assessment','pedagogy'],
  differentiation:['differentiation','pedagogy'],
  content:['pedagogy','subject','arabic'],
  release:['evidence','safety','red_team']
});

export function classifyRisk({ domain='content', uncertainty=0, impact=0, reversibility=1 } = {}) {
  const u = Math.max(0, Math.min(1, uncertainty));
  const i = Math.max(0, Math.min(1, impact));
  const r = Math.max(0, Math.min(1, reversibility));
  const score = Number((0.45*i + 0.35*u + 0.20*(1-r)).toFixed(3));
  return { domain, score, level: score >= 0.75 ? 'HIGH' : score >= 0.45 ? 'MEDIUM' : 'LOW' };
}

export function routeAgents(taskType, { risk='LOW', evidenceRequired=false } = {}) {
  const base = AGENTS[taskType] ?? ['pedagogy'];
  const routed = [...base];
  if (evidenceRequired || risk === 'HIGH') routed.push('evidence');
  if (risk === 'HIGH') routed.push('red_team','safety');
  return [...new Set(routed)];
}

export function rankActions(actions = []) {
  return [...actions].map(a => {
    const value = Number(a.value ?? 0);
    const confidence = Number(a.confidence ?? 0);
    const reversibility = Number(a.reversibility ?? 1);
    const cost = Math.max(Number(a.cost ?? 1), 0.01);
    const risk = Number(a.risk ?? 0);
    const score = (value * confidence * (0.5 + 0.5*reversibility) * (1-risk)) / cost;
    return { ...a, priority: Number(score.toFixed(4)) };
  }).sort((a,b) => b.priority-a.priority);
}

export function confidence({ evidence=0, independentChecks=0, uncertainty=1 } = {}) {
  const e = Math.max(0, Math.min(1, evidence));
  const c = Math.max(0, Math.min(1, independentChecks));
  const u = Math.max(0, Math.min(1, uncertainty));
  const score = Number((0.5*e + 0.35*c + 0.15*(1-u)).toFixed(3));
  return { score, level: score >= 0.85 ? 'HIGH' : score >= 0.60 ? 'MEDIUM' : 'LOW' };
}

export function shouldContinue({ criticalFailures=0, unresolvedFailures=0, progress=0, expectedValue=0, remainingCost=1 } = {}) {
  if (criticalFailures > 0) return { continue:true, reason:'critical_failure_requires_repair' };
  if (unresolvedFailures > 0) return { continue:true, reason:'unresolved_failure' };
  const ratio = expectedValue / Math.max(remainingCost, 0.01);
  if (progress > 0 || ratio >= 1) return { continue:true, reason:'positive_expected_value' };
  return { continue:false, reason:'insufficient_expected_value' };
}

export const INTELLIGENCE_CONTRACT = Object.freeze({
  version:'1.0',
  principles:['evidence_before_claim','risk_proportional_verification','minimum_effective_action','reversible_by_default','human_gate_for_high_impact']
});
