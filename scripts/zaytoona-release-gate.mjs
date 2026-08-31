import { readFile, access } from 'node:fs/promises';

const fail=[];
const must=['index.html','zaytoona/learning-core-v3.js','zaytoona/autonomous-assurance-v1.js','zaytoona/kefayat/catalog.json'];
for(const f of must){try{await access(f)}catch{fail.push(`MISSING:${f}`)}}

try{
  const c=JSON.parse(await readFile('zaytoona/kefayat/catalog.json','utf8'));
  if(!c.recordCount||c.recordCount!==c.records?.length) fail.push('CATALOG_COUNT_INVALID');
  const grades=[...new Set((c.records||[]).map(r=>Number(r.grade)))].sort((a,b)=>a-b);
  for(const g of [1,2,3,4]) if(!grades.includes(g)) fail.push(`GRADE_MISSING:${g}`);
  if(!(c.sources||[]).length) fail.push('NO_SOURCE_PROVENANCE');
  if(!c.source?.repository||c.source.repository!=='smileeyes1/kefayat') fail.push('SOURCE_REPOSITORY_INVALID');
}catch(e){fail.push(`CATALOG_READ_ERROR:${e.message}`)}

const html=await readFile('index.html','utf8').catch(()=>''), core=await readFile('zaytoona/learning-core-v3.js','utf8').catch(()=>''), assurance=await readFile('zaytoona/autonomous-assurance-v1.js','utf8').catch(()=>'' );
for(const [name,text,need] of [
 ['HTML_RTL',html,'dir="rtl"'],
 ['CORE_CATALOG',core,"zaytoona/kefayat/catalog.json"],
 ['CORE_PERSISTENCE',core,'localStorage'],
 ['CORE_CLICK',core,'button'],
 ['ASSURANCE',assurance,'NO_FORCED_TEXT']
]) if(!text.includes(need)) fail.push(`${name}_MISSING`);

if(fail.length){console.error(JSON.stringify({status:'NO-GO',failures:fail},null,2));process.exit(1)}
console.log(JSON.stringify({status:'GO',checks:['files','catalog','grades-1-4','provenance','rtl','catalog-binding','persistence','click-first','assurance']},null,2));
