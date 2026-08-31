import { readFile } from 'node:fs/promises';
const fail=[]; const report={schema:'kefayat-regression-v1',checks:[]};
const c=JSON.parse(await readFile('zaytoona/kefayat/catalog.json','utf8'));
const rows=c.records||[];
const seen=new Map(), dup=[];
for(const r of rows){const k=`${r.grade}|${r.source}|${r.competency||r['الكفاية الفرعية']||r.standard||r.raw}`;if(seen.has(k))dup.push({key:k,first:seen.get(k),duplicate:r.id});else seen.set(k,r.id)}
report.checks.push({name:'unique-semantic-records',pass:dup.length===0,count:dup.length,duplicates:dup.slice(0,50)});if(dup.length)fail.push('DUPLICATES');
const expected=['arabic','math','islamic','nurturing']; const matrix={};
for(const g of [1,2,3,4])for(const s of expected){const n=rows.filter(r=>Number(r.grade)===g&&r.source===s).length;matrix[`G${g}|${s}`]=n;if(!n)fail.push(`MISSING:${g}:${s}`)}
report.checks.push({name:'grade-subject-coverage',pass:fail.filter(x=>x.startsWith('MISSING:')).length===0,matrix});
const required=['id','grade','source','raw'];let missing=0;for(const r of rows)for(const k of required)if(r[k]===undefined||r[k]==='')missing++;report.checks.push({name:'provenance-integrity',pass:missing===0,missing});if(missing)fail.push('PROVENANCE');
const subjectValues=[...new Set(rows.map(r=>r.source))];report.checks.push({name:'subjects',pass:expected.every(x=>subjectValues.includes(x)),found:subjectValues});
const gradeValues=[...new Set(rows.map(r=>Number(r.grade)))].sort((a,b)=>a-b);report.checks.push({name:'grades',pass:JSON.stringify(gradeValues)===JSON.stringify([1,2,3,4]),found:gradeValues});
const c2=JSON.parse(await readFile('zaytoona/kefayat/catalog.json','utf8'));report.checks.push({name:'catalog-self-consistency',pass:c2.recordCount===c2.records.length&&c2.records.length===rows.length});if(c2.recordCount!==rows.length)fail.push('COUNT');
const out={status:fail.length?'NO-GO':'PASS',failures:fail,report};console.log(JSON.stringify(out,null,2));if(fail.length)process.exit(1);
