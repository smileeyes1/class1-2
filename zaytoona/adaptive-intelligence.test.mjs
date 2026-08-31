import assert from 'node:assert/strict';
import { classifyRisk, routeAgents, rankActions, confidence, shouldContinue } from './adaptive-intelligence.mjs';

assert.equal(classifyRisk({impact:1, uncertainty:1, reversibility:0}).level, 'HIGH');
assert.deepEqual(routeAgents('math', {risk:'HIGH'}), ['subject','math_visual','evidence','red_team','safety']);
assert.equal(rankActions([{id:'cheap',value:2,confidence:1,cost:1},{id:'costly',value:2,confidence:1,cost:10}])[0].id, 'cheap');
assert.equal(confidence({evidence:1,independentChecks:1,uncertainty:0}).level, 'HIGH');
assert.equal(shouldContinue({criticalFailures:1}).continue, true);
assert.equal(shouldContinue({progress:0,expectedValue:0,remainingCost:10}).continue, false);
console.log('adaptive intelligence tests: PASS');
