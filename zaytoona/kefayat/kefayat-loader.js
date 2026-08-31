/* زيتونة Ω — كفايةت competency bridge. Source: smileeyes1/kefayat. */
(function(){
  const BASE='https://raw.githubusercontent.com/smileeyes1/kefayat/main/';
  const SOURCES=[
    ['arabic','GEM_KB_ARABIC_GRADES_1-4.md','العربية'],
    ['math','GEM_KB_MATH_GRADES_1-4.md','الرياضيات'],
    ['islamic_education','GEM_KB_ISLAMIC_EDUCATION_GRADES_1-4.md','التربية الإسلامية'],
    ['islamic','GEM_KB_ISLAMIC_GRADES_1-4.md','الإسلاميات'],
    ['nurturing','GEM_KB_NURTURING_GRADES_1-4.md','الرعاية والنماء']
  ];
  const DB='zaytoona-kefayat', STORE='catalog', KEY='latest';
  const gradeFrom=s=>{const m=s.match(/#{2,3}\s*الصف\s*(\d+)/);return m?+m[1]:null};
  function parse(text,subject,label,file){let grade=null,table=0,rows=[];for(const raw of text.split(/\r?\n/)){const line=raw.trim();const g=gradeFrom(line);if(g!==null){grade=g;continue}if(/^\[TABLE\s*\d+\]/i.test(line)){table++;continue}if(!line.includes('|')||line.startsWith('#'))continue;const c=line.split('|').map(x=>x.trim());if(c.length<9)continue;if(/المجال.*كفايات|domain.*compet/i.test(c.slice(0,5).join(' ')))continue;rows.push({id:`${subject}:${grade||0}:${table}:${rows.length+1}`,subject,subjectLabel:label,grade,table,sourceFile:file,domain:c[0]||'',practice:c[1]||'',subcompetency:c[2]||'',standard:c[3]||'',learningOutcome:c[4]||'',mastery:c[5]||'',developing:c[6]||'',attempting:c[7]||'',attempting2:c[8]||'',values:c[9]||'',sourceColumns:c});}return rows}
  function db(){return new Promise((res,rej)=>{const r=indexedDB.open(DB,1);r.onupgradeneeded=()=>r.result.createObjectStore(STORE);r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)})}
  async function getCached(){try{const d=await db();return await new Promise((res,rej)=>{const t=d.transaction(STORE,'readonly');const q=t.objectStore(STORE).get(KEY);q.onsuccess=()=>res(q.result||null);q.onerror=()=>rej(q.error)})}catch{return null}}
  async function setCached(c){try{const d=await db();await new Promise((res,rej)=>{const t=d.transaction(STORE,'readwrite');t.objectStore(STORE).put(c,KEY);t.oncomplete=res;t.onerror=()=>rej(t.error)})}catch{try{localStorage.setItem('zaytoona.kefayat.catalog',JSON.stringify(c))}catch{}}}
  async function localStatic(){try{const r=await fetch('./zaytoona/kefayat/catalog.json',{cache:'no-store'});if(r.ok){const c=await r.json();if(c&&Array.isArray(c.records)&&c.recordCount>0)return c}}catch{}return null}
  async function remote(){const meta=[],records=[];for(const [subject,file,label] of SOURCES){const r=await fetch(BASE+file,{cache:'no-store'});if(!r.ok)throw new Error(file+' HTTP '+r.status);const text=await r.text();const rows=parse(text,subject,label,file);meta.push({subject,file,url:BASE+file,bytes:text.length,records:rows.length});records.push(...rows)}return{schemaVersion:'1.0.0',generatedAt:new Date().toISOString(),source:{repository:'smileeyes1/kefayat',branch:'main',baseUrl:BASE},subjects:SOURCES.map(x=>x[0]),sourceMeta:meta,recordCount:records.length,records}}
  let memory=null;
  async function load(force){if(memory&&!force)return memory;if(!force){const s=await localStatic();if(s){memory=s;await setCached(s);return s}const c=await getCached();if(c){memory=c;return c}}const c=await remote();memory=c;await setCached(c);return c}
  function find(c,o){o=o||{};const q=(o.query||'').trim().toLowerCase();return c.records.filter(r=>(o.subject?r.subject===o.subject:true)&&(o.grade?r.grade===+o.grade:true)&&(!q||[r.domain,r.practice,r.subcompetency,r.standard,r.learningOutcome,r.values].join(' ').toLowerCase().includes(q)))}
  window.Kefayat={load,find,sourceCount:SOURCES.length,sourceFiles:SOURCES.map(x=>x[1])};
})();
