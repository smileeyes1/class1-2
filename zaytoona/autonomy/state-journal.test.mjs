import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { appendEvent, readJournal, recoverLatest } from './state-journal.mjs';

test('journal: append/read survives restart', async () => {
  const dir=await mkdtemp(join(tmpdir(),'zaytoona-journal-')); const p=join(dir,'journal.ndjson');
  const previous=process.env.ZAYTOONA_JOURNAL;
  try { process.env.ZAYTOONA_JOURNAL=p; await appendEvent({type:'START',missionId:'m1'}); const a=await readJournal(); assert.equal(a.length,1); assert.equal((await recoverLatest()).missionId,'m1'); }
  finally { if(previous===undefined) delete process.env.ZAYTOONA_JOURNAL; else process.env.ZAYTOONA_JOURNAL=previous; await rm(dir,{recursive:true,force:true}); }
});

test('journal: storage path is resolved for every operation', async () => {
  const dir=await mkdtemp(join(tmpdir(),'zaytoona-journal-')); const p1=join(dir,'one.ndjson'); const p2=join(dir,'two.ndjson');
  const previous=process.env.ZAYTOONA_JOURNAL;
  try {
    process.env.ZAYTOONA_JOURNAL=p1; await appendEvent({type:'ONE'});
    process.env.ZAYTOONA_JOURNAL=p2; await appendEvent({type:'TWO'});
    assert.equal((await readJournal()).at(-1).type,'TWO');
    assert.equal((await readJournal(p1)).at(-1).type,'ONE');
    assert.equal((await recoverLatest(p2)).type,'TWO');
  } finally { if(previous===undefined) delete process.env.ZAYTOONA_JOURNAL; else process.env.ZAYTOONA_JOURNAL=previous; await rm(dir,{recursive:true,force:true}); }
});

test('journal: malformed tail is detected', async () => {
  const dir=await mkdtemp(join(tmpdir(),'zaytoona-journal-')); const p=join(dir,'journal.ndjson');
  try { await writeFile(p,'{"type":"OK"}\nBROKEN\n'); await assert.rejects(()=>readJournal(p)); }
  finally { await rm(dir,{recursive:true,force:true}); }
});
