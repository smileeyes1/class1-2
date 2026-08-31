const SOURCES = [
  ['arabic','GEM_KB_ARABIC_GRADES_1-4.md','competency'],
  ['math','GEM_KB_MATH_GRADES_1-4.md','competency'],
  ['islamic_education','GEM_KB_ISLAMIC_EDUCATION_GRADES_1-4.md','index'],
  ['islamic','GEM_KB_ISLAMIC_GRADES_1-4.md','competency'],
  ['nurturing','GEM_KB_NURTURING_GRADES_1-4.md','competency'],
];
const BASE = 'https://raw.githubusercontent.com/smileeyes1/kefayat/main/';
const fs = await import('node:fs/promises');
const path = await import('node:path');
const crypto = await import('node:crypto');
const AR = '٠١٢٣٤٥٦٧٨٩';
function westernDigits(value){ return String(value).replace(/[٠-٩]/g, d => String(AR.indexOf(d))); }
function gradeFrom(line){ const m=line.match(/#{2,3}\s*الصف\s*([0-9٠-٩]+)/); return m ? Number(westernDigits(m[1])) : null; }
function isSeparator(cols){ return cols.length > 0 && cols.every(c => /^:?-{2,}:?$/.test(c)); }
function headerKind(cols){
  const head=cols.slice(0,Math.min(cols.length,10)).join(' ');
  if(/المجال/.test(head) && /كفايات|compet/i.test(head)) return 'schema';
  if(/يتقن/.test(head) && /يطور/.test(head) && /يحاول/.test(head)) return 'levels';
  if(/domain/i.test(head) && /compet/i.test(head)) return 'schema';
  return null;
}
function schemaFrom(cols){
  const find=(patterns)=>{for(let i=0;i<cols.length;i++)if(patterns.some(p=>p.test(cols[i])))return i;return -1};
  return {
    domain:find([/^المجال( المعرفي)?$/, /^domain$/i]),
    practice:find([/كفايات الممارسة الرئيسة/, /الكفايات الرئيسة/, /practice/i]),
    subcompetency:find([/الكفايات الفرعية/, /subcompetency/i]),
    standard:find([/المعايير التفصيلية/, /^المعايير$/, /standard/i]),
    learningOutcome:find([/نتاجات التعلم/, /المؤشرات/, /learning.?outcome/i]),
    mastery:find([/^يتقن$/, /mastery/i]),
    developing:find([/^يطور$/, /develop/i]),
    attempting:find([/^يحاول$/, /attempt/i]),
    values:find([/^القيم$/, /values?/i])
  };
}
function fallbackSchema(cols){
  if(cols.length>=10)return {domain:0,practice:1,subcompetency:2,standard:3,learningOutcome:4,mastery:5,developing:6,attempting:7,values:9};
  if(cols.length===9)return {domain:0,practice:1,subcompetency:2,standard:3,learningOutcome:4,mastery:5,developing:6,attempting:7,values:8};
  if(cols.length>=7)return {domain:0,practice:1,subcompetency:2,standard:3,learningOutcome:-1,mastery:4,developing:5,attempting:6,values:-1};
  return null;
}
function value(cols,i){ return i>=0&&i<cols.length ? cols[i]||'' : ''; }
function parse(text, subject){
  let grade=null, table=0, rows=[], schema=null;
  for(const raw of text.split(/\r?\n/)){
    const line=raw.trim(); const g=gradeFrom(line);
    if(g!==null){ grade=g; schema=null; continue; }
    if(/^\[TABLE\s*\d+\]/i.test(line)){ table++; schema=null; continue; }
    if(!line.includes('|') || line.startsWith('#')) continue;
    const cols=line.split('|').map(x=>x.trim());
    if(isSeparator(cols)) continue;
    const kind=headerKind(cols);
    if(kind==='schema'){ const detected=schemaFrom(cols); if(detected.domain>=0&&detected.subcompetency>=0) schema={...schema,...detected}; continue; }
    if(kind==='levels'){ const detected=schemaFrom(cols); schema={...schema,...detected}; continue; }
    if(!schema) schema=fallbackSchema(cols);
    if(!schema || !grade || !table) continue;
    const core=[value(cols,schema.domain),value(cols,schema.practice),value(cols,schema.subcompetency),value(cols,schema.standard),value(cols,schema.learningOutcome)];
    if(core.filter(Boolean).length<3) continue;
    rows.push({id:`${subject}:${grade}:${table}:${rows.length+1}`,subject,grade,table,sourceFile:SOURCES.find(x=>x[0]===subject)?.[1]||'',domain:core[0],practice:core[1],subcompetency:core[2],standard:core[3],learningOutcome:core[4],mastery:value(cols,schema.mastery),developing:value(cols,schema.developing),attempting:value(cols,schema.attempting),attempting2:'',values:value(cols,schema.values),sourceColumns:cols});
  }
  return rows;
}
const all=[]; const sourceMeta=[]; const sourceDocuments=[];
for(const [subject,file,kind] of SOURCES){
  const res=await fetch(BASE+file); if(!res.ok) throw new Error(`${file}: HTTP ${res.status}`);
  const text=await res.text(); const hash=crypto.createHash('sha256').update(text,'utf8').digest('hex');
  if(kind==='index') sourceDocuments.push({subject,file,url:BASE+file,bytes:text.length,sha256:hash,text});
  const rows=kind==='competency'?parse(text,subject):[];
  sourceMeta.push({subject,file,kind,url:BASE+file,bytes:text.length,sha256:hash,records:rows.length});
  all.push(...rows);
}
const grades=[...new Set(all.map(r=>r.grade).filter(Boolean))].sort((a,b)=>a-b);
const catalog={schemaVersion:'1.3.0',generatedAt:new Date().toISOString(),source:{repository:'smileeyes1/kefayat',branch:'main',baseUrl:BASE,authority:'external-reference; preserve source text'},subjects:SOURCES.map(x=>x[0]),grades,sourceMeta,sourceDocuments,recordCount:all.length,records:all};
const outDir=path.resolve(process.argv[2]||'zaytoona/kefayat');
await fs.mkdir(outDir,{recursive:true});
await fs.writeFile(path.join(outDir,'catalog.json'),JSON.stringify(catalog,null,2),'utf8');
await fs.writeFile(path.join(outDir,'catalog.min.json'),JSON.stringify(catalog),'utf8');
console.log(`Generated ${all.length} competency records from ${SOURCES.filter(x=>x[2]==='competency').length} competency sources plus ${sourceDocuments.length} preserved source indexes across grades ${grades.join(', ')}.`);
