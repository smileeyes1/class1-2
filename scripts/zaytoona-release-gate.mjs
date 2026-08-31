import { readFile, access } from 'node:fs/promises';
const fail=[];const must=['index.html','zaytoona/learning-core-v3.js','zaytoona/autonomous-assurance-v1.js','zaytoona/kefayat/catalog.json'];
for(const f of must){try{await access(f)}catch{fail.push(`MISSING:${f}`)}}
try{
 const c=JSON.parse(await readFile('zaytoona/kefayat/catalog.json','utf8'));const rows=c.records||[];
 if(!c.recordCount||c.recordCount!==rows.length)fail.push('CATALOG_COUNT_INVALID');
 const grades=[...new Set(rows.map(r=>Number(r.grade)))].sort((a,b)=>a-b);for(const g of [1,2,3,4])if(!grades.includes(g))fail.push(`GRADE_MISSING:${g}`);
 const subjects=['arabic','math','islamic','nurturing'];for(const g of [1,2,3,4])for(const s of subjects)if(!rows.some(r=>Number(r.grade)===g&&(r.subject===s||r.source?.subject===s)))fail.push(`COVERAGE_MISSING:${g}:${s}`);
 if(c.generatedFrom?.repository!=='smileeyes1/kk')fail.push('SOURCE_REPOSITORY_INVALID');
 if(!c.officialityPolicy||!c.officialityPolicy.includes('USER-PROVIDED'))fail.push('OFFICIALITY_POLICY_MISSING');
 if(rows.some(r=>!r.source?.repository||!r.source?.file||!r.provenance||!r.raw))fail.push('RECORD_PROVENANCE_INVALID');
}catch(e){fail.push(`CATALOG_READ_ERROR:${e.message}`)}
const html=await readFile('index.html','utf8').catch(()=>''),core=await readFile('zaytoona/learning-core-v3.js','utf8').catch(()=>''),assurance=await readFile('zaytoona/autonomous-assurance-v1.js','utf8').catch(()=>'' );
for(const [name,text,need] of [['HTML_RTL',html,'dir="rtl"'],['CORE_CATALOG',core,'zaytoona/kefayat/catalog.json'],['CORE_PERSISTENCE',core,'localStorage'],['CORE_CLICK',core,'button'],['ASSURANCE',assurance,'NO_FORCED_TEXT']])if(!text.includes(need))fail.push(`${name}_MISSING`);
if(fail.length){console.error(JSON.stringify({status:'NO-GO',failures:fail},null,2));process.exit(1)}
console.log(JSON.stringify({status:'GO',checks:['files','catalog','grades-1-4','16-grade-subject-cells','provenance','officiality-policy','rtl','catalog-binding','persistence','click-first','assurance']},null,2));
