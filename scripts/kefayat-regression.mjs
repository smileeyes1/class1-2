import { readFile } from 'node:fs/promises';
const fail=[];const warnings=[];const report={schema:'kefayat-regression-v3',checks:[]};
const c=JSON.parse(await readFile('zaytoona/kefayat/catalog.json','utf8'));const rows=c.records||[];
const sourceOf=r=>typeof r.source==='string'?r.source:r.subject||'';
const seen=new Map(),dup=[];for(const r of rows){const k=r.semanticKey||`${sourceOf(r)}|${r.grade}|${r.domain||''}|${r.competency||''}|${r.standard||''}|${r.indicator||''}|${r.value||''}|${r.mastery||''}|${r.developing||''}|${r.attempting||''}`;if(seen.has(k))dup.push({key:k,first:seen.get(k),duplicate:r.id});else seen.set(k,r.id)}
report.checks.push({name:'unique-source-records',pass:dup.length===0,count:dup.length,duplicates:dup.slice(0,50)});if(dup.length)fail.push('DUPLICATES');
const expected=['arabic','math','islamic','nurturing'];const matrix={};for(const g of [1,2,3,4])for(const s of expected){const n=rows.filter(r=>Number(r.grade)===g&&sourceOf(r)===s).length;matrix[`G${g}|${s}`]=n;if(!n)warnings.push(`SOURCE_GAP:${g}:${s}`)}
report.checks.push({name:'grade-subject-coverage',pass:Object.values(matrix).every(Boolean),matrix,warnings:warnings.filter(x=>x.startsWith('SOURCE_GAP:'))});if(Object.values(matrix).some(n=>!n))fail.push('COVERAGE');
const required=['id','grade','subject','raw','source'];let missing=0;for(const r of rows)for(const k of required)if(r[k]===undefined||r[k]===null||r[k]==='')missing++;report.checks.push({name:'provenance-integrity',pass:missing===0,missing});if(missing)fail.push('PROVENANCE');
const subjectValues=[...new Set(rows.map(sourceOf))];report.checks.push({name:'subjects',pass:expected.every(x=>subjectValues.includes(x)),found:subjectValues});if(!expected.every(x=>subjectValues.includes(x)))fail.push('SUBJECTS');
const gradeValues=[...new Set(rows.map(r=>Number(r.grade)))].sort((a,b)=>a-b);report.checks.push({name:'grades',pass:JSON.stringify(gradeValues)===JSON.stringify([1,2,3,4]),found:gradeValues});if(JSON.stringify(gradeValues)!==JSON.stringify([1,2,3,4]))fail.push('GRADES');
report.checks.push({name:'catalog-self-consistency',pass:c.recordCount===rows.length&&c.recordCount>0});if(c.recordCount!==rows.length||!rows.length)fail.push('COUNT');
const out={status:fail.length?'NO-GO':'PASS',failures:fail,warnings,report};console.log(JSON.stringify(out,null,2));if(fail.length)process.exit(1);
