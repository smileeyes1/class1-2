import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

export async function loadState(path) {
  try { return JSON.parse(await readFile(path,'utf8')); }
  catch (e) { if (e.code !== 'ENOENT') throw e; return {version:1, missions:[], jobs:[], events:[], updatedAt:null}; }
}

export async function saveState(path, state) {
  await mkdir(dirname(path), {recursive:true});
  const tmp = `${path}.tmp-${process.pid}`;
  const next = {...state, updatedAt:new Date().toISOString()};
  await writeFile(tmp, JSON.stringify(next,null,2)+'\n','utf8');
  await rename(tmp,path);
  return next;
}
