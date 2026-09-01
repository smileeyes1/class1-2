import { appendFile, mkdir, readFile } from 'node:fs/promises';
import { dirname } from 'node:path';

const JOURNAL = process.env.ZAYTOONA_JOURNAL || './.zaytoona/state.journal.ndjson';
const safe = x => JSON.stringify(x);

export async function appendEvent(event) {
  await mkdir(dirname(JOURNAL), { recursive: true });
  const record = { schema: 'zaytoona-state-journal-v1', seq: Date.now(), at: new Date().toISOString(), ...event };
  await appendFile(JOURNAL, safe(record) + '\n', 'utf8');
  return record;
}

export async function readJournal(path = JOURNAL) {
  try {
    const text = await readFile(path, 'utf8');
    return text.split('\n').filter(Boolean).map(x => JSON.parse(x));
  } catch (e) {
    if (e.code === 'ENOENT') return [];
    throw e;
  }
}

export async function recoverLatest(path = JOURNAL) {
  const rows = await readJournal(path);
  return rows.length ? rows[rows.length - 1] : null;
}
