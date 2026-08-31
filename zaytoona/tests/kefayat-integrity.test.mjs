import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const file = path.resolve('zaytoona/kefayat/catalog.json');
const catalog = JSON.parse(fs.readFileSync(file, 'utf8'));

const requiredSubjects = ['arabic','math','islamic_education','islamic','nurturing'];

test('Kefayat catalog contains all configured source domains', () => {
  assert.equal(catalog.source.repository, 'smileeyes1/kefayat');
  assert.equal(catalog.source.branch, 'main');
  assert.deepEqual(catalog.subjects, requiredSubjects);
  assert.equal(catalog.sourceMeta.length, requiredSubjects.length);
});

test('Kefayat catalog is non-empty and covers grades 1-4', () => {
  assert.ok(catalog.recordCount > 0);
  for (const grade of [1,2,3,4]) assert.ok(catalog.records.some(r => r.grade === grade), `missing grade ${grade}`);
});

test('Kefayat competency records have stable identity and core fields', () => {
  const ids = new Set();
  for (const r of catalog.records) {
    assert.ok(r.id && !ids.has(r.id), `duplicate or empty id: ${r.id}`);
    ids.add(r.id);
    assert.ok(requiredSubjects.includes(r.subject), `unknown subject: ${r.subject}`);
    assert.ok([1,2,3,4].includes(r.grade), `invalid grade: ${r.grade}`);
    assert.ok(r.subcompetency || r.standard || r.learningOutcome, `record without competency content: ${r.id}`);
    assert.ok(!r.sourceColumns?.every(c => /^:?-{2,}:?$/.test(c)), `separator row leaked into catalog: ${r.id}`);
  }
  assert.equal(ids.size, catalog.recordCount);
});

test('source metadata reports records for every source', () => {
  for (const meta of catalog.sourceMeta) {
    assert.ok(meta.bytes > 0, `empty source: ${meta.file}`);
    assert.ok(meta.sha256?.length === 64, `missing source hash: ${meta.file}`);
    assert.ok(meta.records > 0, `no records extracted: ${meta.file}`);
  }
});
