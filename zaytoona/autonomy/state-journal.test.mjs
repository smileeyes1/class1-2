import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { appendEvent, readJournal, recoverLatest } from './state-journal.mjs';

test('journal: append/read survives restart', async () => {
  const dir=await mkdtemp(join(tmpdir(),'zaytoona-journal-')); const p=join(dir,'journal.ndjson');
  try { process.env.ZAYTOONA_JOURNAL=p; await appendEvent({type:'START',missionId:'m1'}); const a=await readJournal(p); assert.equal(a.length,1); assert.equal((await recoverLatest(p)).missionId,'m1'); }
  finally { await rm(dir,{recursive:true,force:true}); }
});

test('journal: malformed tail is detected', async () => {
  const dir=await mkdtemp(join(tmpdir(),'zaytoona-journal-')); const p=join(dir,'journal.ndjson');
  try { await writeFile(p,'{"type":"OK"}\nBROKEN\n'); await assert.rejects(()=>readJournal(p)); }
  finally { await rm(dir,{recursive:true,force:true}); }
});
