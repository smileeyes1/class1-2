import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';

const intervalMs = Math.max(5_000, Number(process.env.ZAYTOONA_POLL_MS || 30_000));
const heartbeatPath = process.env.ZAYTOONA_HEARTBEAT || './.zaytoona/heartbeat.json';
const stateDir = './.zaytoona';
let stopping = false;

await mkdir(stateDir, { recursive: true });

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function heartbeat(status, extra = {}) {
  await writeFile(heartbeatPath, JSON.stringify({
    version: 1,
    status,
    pid: process.pid,
    ts: new Date().toISOString(),
    ...extra
  }, null, 2));
}

function runWorker() {
  return new Promise(resolve => {
    const child = spawn(process.execPath, ['worker.mjs'], {
      cwd: process.cwd(),
      env: process.env,
      stdio: 'inherit'
    });
    child.on('exit', (code, signal) => resolve({ code: code ?? 1, signal }));
    child.on('error', error => resolve({ code: 1, error: String(error) }));
  });
}

async function cycle() {
  await heartbeat('RUNNING');
  const result = await runWorker();
  if (result.code === 2) {
    await heartbeat('HUMAN_GATE', { result });
    return;
  }
  if (result.code !== 0) {
    await heartbeat('RECOVERABLE_FAILURE', { result });
    return;
  }
  await heartbeat('IDLE_OR_PASSED', { result });
}

const stop = async () => {
  stopping = true;
  await heartbeat('STOPPING');
};
process.on('SIGTERM', stop);
process.on('SIGINT', stop);

while (!stopping) {
  try {
    await cycle();
  } catch (error) {
    await heartbeat('DAEMON_ERROR', { error: String(error) });
  }
  if (!stopping) await sleep(intervalMs);
}

await heartbeat('STOPPED');
