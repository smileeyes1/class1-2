import { appendFile, mkdir, readFile } from 'node:fs/promises';
import { dirname } from 'node:path';

const DEFAULT_JOURNAL = './.zaytoona/state.journal.ndjson';
const journalPath = () => process.env.ZAYTOONA_JOURNAL || DEFAULT_JOURNAL;
const safe = x => JSON.stringify(x);

export async function appendEvent(event, path = journalPath()) {
  const target = path || journalPath();
  await mkdir(dirname(target), { recursive: true });
  const record = { schema: 'zaytoona-state-journal-v1', seq: Date.now(), at: new Date().toISOString(), ...event };
  await appendFile(target, safe(record) + '\n', 'utf8');
  return record;
}

export async function readJournal(path = journalPath()) {
  const target = path || journalPath();
  try {
    const text = await readFile(target, 'utf8');
    return text.split('\n').filter(Boolean).map(x => JSON.parse(x));
  } catch (e) {
    if (e.code === 'ENOENT') return [];
    throw e;
  }
}

export async function recoverLatest(path = journalPath()) {
  const rows = await readJournal(path || journalPath());
  return rows.length ? rows[rows.length - 1] : null;
}
