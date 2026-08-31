import test from 'node:test';
import assert from 'node:assert/strict';
import { planNextWake } from './adaptive-pulse.mjs';

const NOW = Date.parse('2026-08-31T07:00:00.000Z');

test('ready work wakes at the earliest supported cadence', () => {
  const plan = planNextWake({jobs:[{id:'a',status:'READY'}]}, NOW);
  assert.equal(plan.reason, 'WORK_READY');
  assert.equal(plan.delayMs, 5 * 60_000);
  assert.equal(plan.nextWakeAt, '2026-08-31T07:05:00.000Z');
});

test('recovery has priority over idle backoff', () => {
  const plan = planNextWake({jobs:[{id:'a',status:'RECOVERING'}]}, NOW);
  assert.equal(plan.reason, 'RECOVERY_DUE');
  assert.equal(plan.delayMs, 5 * 60_000);
});

test('idle state backs off to reduce needless execution', () => {
  const plan = planNextWake({jobs:[]}, NOW);
  assert.equal(plan.reason, 'IDLE');
  assert.equal(plan.delayMs, 60 * 60_000);
});

test('blocked-only state remains safe and slow', () => {
  const plan = planNextWake({jobs:[{id:'a',status:'BLOCKED'}]}, NOW);
  assert.equal(plan.reason, 'HUMAN_GATE_OR_BLOCKED');
  assert.equal(plan.delayMs, 60 * 60_000);
});
