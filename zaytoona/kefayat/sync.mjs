const SOURCES = [
  ['arabic','GEM_KB_ARABIC_GRADES_1-4.md'],
  ['math','GEM_KB_MATH_GRADES_1-4.md'],
  ['islamic_education','GEM_KB_ISLAMIC_EDUCATION_GRADES_1-4.md'],
  ['islamic','GEM_KB_ISLAMIC_GRADES_1-4.md'],
  ['nurturing','GEM_KB_NURTURING_GRADES_1-4.md'],
];
const BASE = 'https://raw.githubusercontent.com/smileeyes1/kefayat/main/';
const fs = await import('node:fs/promises');
const path = await import('node:path');
function gradeFrom(line){ const m=line.match(/#{2,3}\s*الصف\s*(\d+)/); return m ? Number(m[1]) : null; }
function parse(text, subject){
  let grade=null, table=0, rows=[];
  for(const raw of text.split(/\r?\n/)){
    const line=raw.trim(); const g=gradeFrom(line);
    if(g!==null){grade=g; continue;}
    if(/^\[TABLE\s*\d+\]/i.test(line)){table++; continue;}
    if(!line.includes('|') || line.startsWith('#')) continue;
    const cols=line.split('|').map(x=>x.trim());
    if(cols.length<9) continue;
    if(/المجال.*كفايات|domain.*compet/i.test(cols.slice(0,5).join(' '))) continue;
    rows.push({id:`${subject}:${grade||0}:${table}:${rows.length+1}`,subject,grade,table,sourceFile:SOURCES.find(x=>x[0]===subject)?.[1]||'',domain:cols[0]||'',practice:cols[1]||'',subcompetency:cols[2]||'',standard:cols[3]||'',learningOutcome:cols[4]||'',mastery:cols[5]||'',developing:cols[6]||'',attempting:cols[7]||'',attempting2:cols[8]||'',values:cols[9]||'',sourceColumns:cols});
  }
  return rows;
}
const all=[]; const sourceMeta=[];
for(const [subject,file] of SOURCES){
  const res=await fetch(BASE+file); if(!res.ok) throw new Error(`${file}: HTTP ${res.status}`);
  const text=await res.text(); const rows=parse(text,subject);
  sourceMeta.push({subject,file,url:BASE+file,bytes:text.length,records:rows.length}); all.push(...rows);
}
const catalog={schemaVersion:'1.0.0',generatedAt:new Date().toISOString(),source:{repository:'smileeyes1/kefayat',branch:'main',baseUrl:BASE,authority:'external-reference; preserve source text'},subjects:SOURCES.map(x=>x[0]),sourceMeta,recordCount:all.length,records:all};
const outDir=path.resolve(process.argv[2]||'zaytoona/kefayat');
await fs.mkdir(outDir,{recursive:true});
await fs.writeFile(path.join(outDir,'catalog.json'),JSON.stringify(catalog,null,2),'utf8');
await fs.writeFile(path.join(outDir,'catalog.min.json'),JSON.stringify(catalog),'utf8');
console.log(`Generated ${all.length} competency records from ${SOURCES.length} source files.`);
