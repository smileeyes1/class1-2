import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { appendEvent, readJournal, recoverLatest } from './state-journal.mjs';

test('Crash: restart recovers latest committed mission state', async()=>{const d=await mkdtemp(join(tmpdir(),'zj-'));try{const p=join(d,'j.ndjson');process.env.ZAYTOONA_JOURNAL=p;await appendEvent({type:'START',missionId:'m1',stage:'build'});await appendEvent({type:'CHECKPOINT',missionId:'m1',stage:'test'});assert.equal((await recoverLatest(p)).stage,'test')}finally{await rm(d,{recursive:true,force:true})}});
test('Offline: existing journal remains readable without network', async()=>{const d=await mkdtemp(join(tmpdir(),'zj-'));try{const p=join(d,'j.ndjson');await writeFile(p,JSON.stringify({schema:'zaytoona-state-journal-v1',seq:1,type:'CHECKPOINT',missionId:'offline',stage:'validate'})+'\n');const rows=await readJournal(p);assert.equal(rows[0].missionId,'offline')}finally{await rm(d,{recursive:true,force:true})}});
test('Recovery: malformed tail is rejected, never silently accepted', async()=>{const d=await mkdtemp(join(tmpdir(),'zj-'));try{const p=join(d,'j.ndjson');await writeFile(p,'{"type":"CHECKPOINT","missionId":"m2"}\nBROKEN\n');await assert.rejects(()=>readJournal(p))}finally{await rm(d,{recursive:true,force:true})}});
test('Resume: empty journal returns null and does not invent state', async()=>{const d=await mkdtemp(join(tmpdir(),'zj-'));try{const p=join(d,'j.ndjson');assert.equal(await recoverLatest(p),null)}finally{await rm(d,{recursive:true,force:true})}});
