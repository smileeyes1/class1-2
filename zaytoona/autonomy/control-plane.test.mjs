import test from 'node:test';
import assert from 'node:assert/strict';
import { writeFile, mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { supervise } from './supervisor.mjs';

async function fixture(job) {
  const dir = await mkdtemp(join(tmpdir(),'zaytoona-control-'));
  const path = join(dir,'state.json');
  await writeFile(path, JSON.stringify({version:1,missions:[],jobs:[job],events:[]}));
  return path;
}

test('planner chooses autonomous work and persists decision', async () => {
  const path = await fixture({id:'safe-job',type:'validate_math',status:'READY',priority:10});
  const decision = await supervise(path);
  assert.equal(decision.kind,'EXECUTE');
  const saved = JSON.parse(await readFile(path,'utf8'));
  assert.equal(saved.control.lastDecision.jobId,'safe-job');
});

test('high-impact work is escalated to human gate', async () => {
  const path = await fixture({id:'danger-job',type:'publish_sensitive',status:'READY',priority:100});
  const decision = await supervise(path);
  assert.equal(decision.kind,'ESCALATE');
  assert.equal(decision.code,'HUMAN_GATE');
});
