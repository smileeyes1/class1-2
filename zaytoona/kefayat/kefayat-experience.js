/* ZAYTOONA Ω — Kefayat Experience Layer
   General competency browser for Grades 1–4.
   Sources are preserved as source-of-truth documents in smileeyes1/kefayat.
*/
'use strict';
(()=>{
const SOURCES=[
 {key:'arabic',name:'اللغة العربية',file:'GEM_KB_ARABIC_GRADES_1-4.md'},
 {key:'math',name:'الرياضيات',file:'GEM_KB_MATH_GRADES_1-4.md'},
 {key:'islamic',name:'التربية الإسلامية',file:'GEM_KB_ISLAMIC_GRADES_1-4.md'},
 {key:'islamic-education',name:'التربية الإسلامية والقيم',file:'GEM_KB_ISLAMIC_EDUCATION_GRADES_1-4.md'},
 {key:'nurturing',name:'التنشئة والعلوم الوطنية والحياتية',file:'GEM_KB_NURTURING_GRADES_1-4.md'}
];
const RAW='https://raw.githubusercontent.com/smileeyes1/kefayat/main/';
const AR=['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];
const ar=n=>String(n??'').replace(/\d/g,d=>AR[+d]);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const STORE='zaytoona.mastery.v3';
let all=[];
let state={subject:'all',grade:'all',query:'',selected:null};
function loadMastery(){try{return JSON.parse(localStorage.getItem(STORE)||'{}')}catch{return{}}}
function saveMastery(id,score){const d=loadMastery();d[id]={score,attempts:(d[id]?.attempts||0)+1,state:score>=.8?'متقنة':score>0?'قيد التطور':'تحتاج دعمًا',updatedAt:new Date().toISOString()};localStorage.setItem(STORE,JSON.stringify(d));return d[id]}
function parseMarkdown(text,source){
 const rows=[];let grade='';
 const lines=text.split(/\r?\n/);
 for(const line of lines){
  const h=line.match(/^##\s+الصف\s*([1-4])/); if(h){grade=h[1];continue}
  if(!line.includes('|')||/^\s*\|?\s*-+/.test(line))continue;
  const cells=line.split('|').map(x=>x.trim()).filter(Boolean);
  if(cells.length<4)continue;
  const joined=cells.join(' ');
  if(/المجال.*كفايات|كفاية فرعية.*معيار|الكفاية الفرعية.*المعيار|\[TABLE/i.test(joined))continue;
  let competency='',domain='',sub='',standard='',outcome='',mastery='',developing='',trying='';
  if(cells.length>=8){[domain,competency,sub,standard,outcome,mastery,developing,trying]=cells.slice(0,8)}
  else if(cells.length>=7){[domain,competency,sub,standard,mastery,developing,trying]=cells.slice(0,7);outcome=standard}
  else if(cells.length>=6){[domain,competency,sub,standard,mastery,developing]=cells.slice(0,6);outcome=standard}
  else {competency=cells[0];standard=cells[1];outcome=cells[2];mastery=cells[3]||'';developing=cells[4]||'';trying=cells[5]||''}
  if(!competency&&sub)competency=sub;
  if(!competency&&outcome)competency=outcome;
  if(!competency||competency.length<2)continue;
  if(/^(المجال|الكفاية|المعيار|نتاج|يتقن|يطور|يحاول|القيم)$/i.test(competency))continue;
  const id=`${source.key}-${grade}-${rows.length+1}`;
  rows.push({id,source:source.name,sourceKey:source.key,grade,domain,competency,sub,standard,outcome,mastery,developing,trying});
 }
 return rows;
}
async function fetchSources(){
 const results=await Promise.all(SOURCES.map(async s=>{try{const r=await fetch(RAW+s.file,{cache:'no-store'});if(!r.ok)throw Error();return parseMarkdown(await r.text(),s)}catch{return []}}));
 all=results.flat();
 return all;
}
function styles(){if(document.getElementById('kefayat-experience-style'))return;const s=document.createElement('style');s.id='kefayat-experience-style';s.textContent=`
.kx{max-width:1280px;margin:auto}.kx *{box-sizing:border-box}.kx .hero{background:linear-gradient(135deg,#174f3d,#2f8a6d);color:#fff;border-radius:28px;padding:26px;margin-bottom:14px}.kx .hero h1{margin:5px 0;font-size:clamp(1.8rem,5vw,3rem)}.kx .hero p{margin:0;opacity:.9}.kx .toolbar{display:grid;grid-template-columns:1fr;gap:10px;margin:12px 0}.kx .chips{display:flex;gap:7px;overflow:auto;padding:3px}.kx .chip{border:1px solid #dce7e1;background:#fff;border-radius:999px;padding:9px 13px;white-space:nowrap;font-weight:800;cursor:pointer}.kx .chip.active{background:#e9f4ef;border-color:#a9d0bc;color:#14553f}.kx .search{width:100%;border:1px solid #cddbd4;border-radius:13px;padding:12px 14px;font-size:1rem}.kx .stats{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:12px 0}.kx .stat,.kx .card{background:#fff;border:1px solid #dce7e1;border-radius:19px;padding:16px}.kx .stat b{display:block;color:#64736d;font-size:.85rem}.kx .stat strong{font-size:1.7rem}.kx .list{display:grid;gap:9px}.kx .item{width:100%;border:1px solid #dce7e1;background:#fff;border-radius:17px;padding:15px;text-align:right;cursor:pointer}.kx .item:hover{border-color:#70aa91}.kx .item h3{margin:0 0 4px;font-size:1.03rem}.kx .meta{color:#64736d;font-size:.82rem}.kx .pill{display:inline-block;background:#eef4f1;border-radius:999px;padding:4px 8px;margin-top:7px;font-size:.76rem}.kx .detail h2{margin-top:5px}.kx .levels{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:14px 0}.kx .level{background:#f7faf8;border:1px solid #dce7e1;border-radius:15px;padding:13px}.kx .level b{display:block;margin-bottom:5px}.kx .actions{display:flex;gap:8px;flex-wrap:wrap}.kx .btn{border:0;border-radius:12px;padding:10px 14px;font-weight:900;cursor:pointer}.kx .btn.primary{background:#1d6b52;color:#fff}.kx .btn.secondary{background:#eef4f1;color:#175640}.kx .notice{background:#edf8f0;border-radius:13px;padding:11px;margin:10px 0}.kx .empty{text-align:center;padding:35px;color:#64736d}.kx .back{border:0;background:none;color:#175640;font-weight:900;cursor:pointer;padding:0}.kx .loading{text-align:center;padding:35px}.kx .error{background:#fff2f2;color:#8b3030;border:1px solid #e6bcbc;border-radius:14px;padding:15px}@media(max-width:800px){.kx .stats{grid-template-columns:1fr 1fr}.kx .levels{grid-template-columns:1fr}.kx .hero{padding:21px}}`;
document.head.appendChild(s)}
function render(){styles();const root=document.querySelector('main.container');root.innerHTML=`<div class="kx"><section class="hero"><small>زيتونة Ω · منظومة التعلم الموجه بالكفايات</small><h1>الكفايات التي ينبغي للطالب إتقانها</h1><p>الصفوف من الأول إلى الرابع، عبر المواد التعليمية، مع متابعة حالة الإتقان لكل كفاية.</p></section><div id="kxapp"></div></div>`;draw()}
function draw(){const p=document.getElementById('kxapp');if(state.selected){detail(p,state.selected);return}const filtered=all.filter(x=>(state.subject==='all'||x.sourceKey===state.subject)&&(state.grade==='all'||x.grade===state.grade)&&(!state.query||`${x.competency} ${x.sub} ${x.standard} ${x.outcome} ${x.domain}`.toLowerCase().includes(state.query.toLowerCase())));const m=loadMastery();const mastered=filtered.filter(x=>m[x.id]?.state==='متقنة').length;const developing=filtered.filter(x=>m[x.id]?.state==='قيد التطور').length;p.innerHTML=`<section class="card"><div class="toolbar"><div class="chips"><button class="chip ${state.subject==='all'?'active':''}" data-sub="all">كل المواد</button>${SOURCES.map(s=>`<button class="chip ${state.subject===s.key?'active':''}" data-sub="${s.key}">${s.name}</button>`).join('')}</div><div class="chips"><button class="chip ${state.grade==='all'?'active':''}" data-grade="all">كل الصفوف</button>${[1,2,3,4].map(g=>`<button class="chip ${state.grade===String(g)?'active':''}" data-grade="${g}">الصف ${ar(g)}</button>`).join('')}</div><input id="kxq" class="search" value="${esc(state.query)}" placeholder="ابحث عن الكفاية أو المجال…"></div></section><div class="stats"><div class="stat"><b>المعروض</b><strong>${ar(filtered.length)}</strong></div><div class="stat"><b>متقنة</b><strong>${ar(mastered)}</strong></div><div class="stat"><b>قيد التطور</b><strong>${ar(developing)}</strong></div><div class="stat"><b>تحتاج دعمًا</b><strong>${ar(Math.max(0,filtered.length-mastered-developing))}</strong></div></div><section class="card"><div class="list">${filtered.slice(0,200).map(x=>{const mm=m[x.id]||{state:'لم تبدأ'};return`<button class="item" data-id="${esc(x.id)}"><h3>${esc(x.competency)}</h3><div class="meta">${esc(x.source)} · الصف ${ar(x.grade)}${x.domain?' · '+esc(x.domain):''}</div><span class="pill">${esc(mm.state)}</span></button>`}).join('')||'<div class="empty">لا توجد نتائج مطابقة.</div>'}</div>${filtered.length>200?`<div class="notice">يعرض زيتونة أول ${ar(200)} نتيجة في هذه الشاشة. استخدم الصف والمادة والبحث للوصول إلى المطلوب.</div>`:''}</section>`;
p.querySelectorAll('[data-sub]').forEach(b=>b.onclick=()=>{state.subject=b.dataset.sub;state.selected=null;draw()});p.querySelectorAll('[data-grade]').forEach(b=>b.onclick=()=>{state.grade=b.dataset.grade;state.selected=null;draw()});p.querySelector('#kxq').oninput=e=>{state.query=e.target.value;draw()};p.querySelectorAll('[data-id]').forEach(b=>b.onclick=()=>{state.selected=b.dataset.id;draw()})}
function detail(p,id){const x=all.find(a=>a.id===id);if(!x){state.selected=null;return draw()}const m=loadMastery()[id]||{state:'لم تبدأ',score:0,attempts:0};p.innerHTML=`<section class="card detail"><button class="back" id="kxback">← العودة إلى الكفايات</button><div class="meta">${esc(x.source)} · الصف ${ar(x.grade)}${x.domain?' · '+esc(x.domain):''}</div><h2>${esc(x.competency)}</h2>${x.sub?`<p><b>الكفاية الفرعية:</b> ${esc(x.sub)}</p>`:''}${x.standard?`<p><b>المعيار:</b> ${esc(x.standard)}</p>`:''}${x.outcome?`<p><b>نتاج التعلم:</b> ${esc(x.outcome)}</p>`:''}<div class="levels"><div class="level"><b>يتقن</b><span>${esc(x.mastery||'أداء مستقل ودقيق')}</span></div><div class="level"><b>يطور</b><span>${esc(x.developing||'أداء مع توجيه')}</span></div><div class="level"><b>يحاول</b><span>${esc(x.trying||'يحتاج إلى دعم')}</span></div></div><div class="notice"><b>حالة الطالب:</b> ${esc(m.state)} · المحاولات ${ar(m.attempts||0)} · الدرجة ${ar(Math.round((m.score||0)*100))}٪</div><div class="actions"><button class="btn primary" data-score="1">سجّل إتقان الكفاية</button><button class="btn secondary" data-score=".5">قيد التطور</button><button class="btn secondary" data-score="0">يحتاج دعمًا</button></div></section>`;p.querySelector('#kxback').onclick=()=>{state.selected=null;draw()};p.querySelectorAll('[data-score]').forEach(b=>b.onclick=()=>{saveMastery(id,Number(b.dataset.score));detail(p,id)})}
async function start(){render();const p=document.getElementById('kxapp');p.innerHTML='<div class="card loading">جاري تحميل كفايات الصفوف ١–٤ من مستودع كفايةت…</div>';await fetchSources();draw()}
window.addEventListener('load',()=>setTimeout(start,120));
})();
