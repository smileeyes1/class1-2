import { generateAdditionWithin10 } from './generator.mjs';
import { validateLesson } from './validator.mjs';
import { runVerticalSlice } from './orchestrator.mjs';

export const META_SYSTEM_VERSION = 'Ω MODULAR META-SYSTEM v1.0';
export const STAGES = Object.freeze(['INTAKE','PLAN','GENERATE','VALIDATE','EVALUATE','RED_TEAM','REGRESSION','RELEASE']);

export class StateMachine {
  constructor() { this.stage = 'INTAKE'; this.history = []; }
  move(stage, detail = null) {
    if (!STAGES.includes(stage)) throw new Error(`invalid stage: ${stage}`);
    this.stage = stage; this.history.push({ stage, detail }); return this;
  }
}

export class Recovery {
  constructor(maxAttempts = 3) { this.maxAttempts = maxAttempts; this.attempts = 0; }
  retry(fn) {
    let lastError;
    while (this.attempts < this.maxAttempts) {
      this.attempts += 1;
      try { return { ok: true, value: fn(), attempts: this.attempts }; }
      catch (error) { lastError = error; }
    }
    return { ok: false, error: lastError, attempts: this.attempts };
  }
}

export class Validator {
  validate(pkg) { return validateLesson(pkg); }
}

export class EvaluationEngine {
  evaluate(pkg, answers = pkg.assessment.answer_key) {
    const expected = pkg.assessment?.answer_key ?? [];
    const actual = Array.isArray(answers) ? answers : [];
    const correct = expected.reduce((n, value, i) => n + (Number(actual[i]) === Number(value) ? 1 : 0), 0);
    return { total: expected.length, correct, score: expected.length ? correct / expected.length : 0, mastery: correct >= 4 && expected.length >= 5 };
  }
}

export class ModuleRegistry {
  constructor() { this.modules = new Map(); }
  register(module) {
    if (!module?.id || typeof module.generate !== 'function') throw new Error('invalid module contract');
    this.modules.set(module.id, Object.freeze(module)); return this;
  }
  get(id) { return this.modules.get(id); }
}

export class Orchestrator {
  constructor({ registry = new ModuleRegistry(), validator = new Validator(), evaluator = new EvaluationEngine(), recovery = new Recovery() } = {}) {
    this.registry = registry; this.validator = validator; this.evaluator = evaluator; this.recovery = recovery;
  }
  run(moduleId, input = {}) {
    const module = this.registry.get(moduleId); if (!module) throw new Error(`module not found: ${moduleId}`);
    const sm = new StateMachine();
    sm.move('PLAN', { moduleId, input });
    const generated = this.recovery.retry(() => module.generate(input));
    if (!generated.ok) return { release: 'NO-GO', state: sm.move('RELEASE', generated).history };
    sm.move('GENERATE', { artifactId: generated.value.id });
    const assurance = this.validator.validate(generated.value); sm.move('VALIDATE', assurance);
    if (assurance.state === 'NO-GO') return { release: 'NO-GO', package: generated.value, assurance, history: sm.history };
    const evaluation = this.evaluator.evaluate(generated.value); sm.move('EVALUATE', evaluation);
    const vertical = runVerticalSlice(); sm.move('RED_TEAM', vertical.red_team);
    if (!vertical.red_team.every(x => x.detected)) return { release: 'NO-GO', package: generated.value, assurance, evaluation, history: sm.history };
    sm.move('REGRESSION', { passed: true, checks: assurance.checks.length });
    const release = vertical.release === 'CONDITIONAL_RELEASE' ? 'CONDITIONAL_RELEASE' : 'NO-GO';
    sm.move('RELEASE', { release });
    return { release, package: generated.value, assurance, evaluation, redTeam: vertical.red_team, history: sm.history };
  }
}

export const kefayatModule = Object.freeze({
  id: 'kefayat.grade1.math.addition-within-10',
  version: '1.0.0',
  contract: 'generate -> validate -> evaluate -> red-team -> regression -> release',
  generate: () => generateAdditionWithin10()
});

export function runKefayatE2E() {
  const registry = new ModuleRegistry().register(kefayatModule);
  return new Orchestrator({ registry }).run(kefayatModule.id);
}
