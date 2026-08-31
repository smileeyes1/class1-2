import fs from 'node:fs/promises';
import path from 'node:path';

export class StateStore {
  constructor(file) { this.file = file; }
  async load() {
    try { return JSON.parse(await fs.readFile(this.file, 'utf8')); }
    catch (e) { if (e.code !== 'ENOENT') throw e; return {version:1, goals:[], jobs:[], events:[], checkpoints:[]}; }
  }
  async save(state) {
    await fs.mkdir(path.dirname(this.file), {recursive:true});
    const tmp = `${this.file}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(state, null, 2), 'utf8');
    await fs.rename(tmp, this.file);
  }
}
