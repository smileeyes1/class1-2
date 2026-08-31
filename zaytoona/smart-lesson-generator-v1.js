/* ZAYTOONA Ω — SMART LESSON GENERATOR v1.0
 * Deterministic, offline, competency-first lesson synthesis.
 */
(function(global){'use strict';
 const CATALOG='./zaytoona/kefayat/catalog.json', STORE='zaytoona.lessons.v1';
 const AR=['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];
 const ar=n=>String(n??'').replace(/\d/g,d=>AR[+d]);
 const esc=s=>String(s??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
 const subjects={arabic:'اللغة العربية',math:'الرياضيات',islamic:'التربية الإسلامية',nurturing:'التنشئة',science:'العلوم'};
 let records=[];
 const loadStore=()=>{try{return JSON.parse(localStorage.getItem(STORE)||'{}')}catch{return{}}};
 const saveStore=x=>localStorage.setItem(STORE,JSON.stringify(x));
 const norm=(x,i)=>({id:x.id||`KF-${i+1}`,grade:Number(x.grade||0),subject:x.source||x.subject||'',domain:x['المجال']||x.domain||'',main:x['الكفايات الرئيسة']||'',sub:x['الكفايات الفرعية']||'',standard:x['المعايير']||x.standard||'',outcome:x.learningOutcome||x.outcome||x['ناتج التعلم']||'',mastery:x.mastery||x['يتقن']||'',developing:x.developing||x['يطور']||'',attempting:x.attempting||x['يحاول']||''});
 async function load(){try{const r=await fetch(CATALOG,{cache:'no-store'});if(!r.ok)throw Error('catalog');const j=await r.json();records=(j.records||[]).map(norm);mount()}catch{records=[];mount()}}
 function find(id){return records.find(r=>r.id===id)}
 function build(r){
   const subject=subjects[r.subject]||r.subject||'المادة';
   const concept=r.outcome||r.standard||r.sub||r.main||'المفهوم المستهدف';
   const evidence=r.mastery||`يُظهر الطالب أداءً يمكن ملاحظته في ${concept}`;
   return {id:`lesson-${r.id}`,competencyId:r.id,grade:r.grade,subject,domain:r.domain,title:`درس: ${concept}`,duration:45,goal:`أن يحقق الطالب: ${concept}`,stages:[
    {id:'diagnose',title:'تشخيص',teacher:'ابدأ بسؤال أو موقف قصير يكشف المعرفة السابقة.',student:'أفكر وأجيب.',evidence:'إجابة أولية.'},
    {id:'learn',title:'تعلّم',teacher:'اعرض المفهوم من المحسوس إلى المصور ثم الرمز عند ملاءمته.',student:'ألاحظ وأشرح.',evidence:'شرح أو تمثيل صحيح.'},
    {id:'practice',title:'ممارسة',teacher:'نفّذ نشاطًا موجّهًا ثم خفف الدعم تدريجيًا.',student:'أطبق مع زميل أو بمفردي.',evidence:'أداء صحيح.'},
    {id:'verify',title:'تحقق',teacher:'استخدم مهمة قصيرة تقيس نفس الهدف دون تغيير المعيار.',student:'أحل أو أنفذ المهمة.',evidence},
    {id:'mastery',title:'قرار الإتقان',teacher:'سجّل متقنة عند تحقق دليل الإتقان، وإلا انتقل للعلاج.',student:'أثبت ما تعلمت.',evidence},
    {id:'support',title:'علاج/إثراء',teacher:'قدّم إعادة تمثيل أو تدريبًا أبسط عند التعثر، وإثراءً عند الإتقان.',student:'أعيد المحاولة أو أتحدى نفسي.',evidence:'إعادة تحقق.'}
   ],assessment:{criterion:evidence,decision:'إتقان إذا تحقق الأداء المستهدف بصورة مستقلة؛ وإلا علاج ثم إعادة التحقق.'},values:['الصدق والأمانة','التعاون','المسؤولية','احترام الآخرين'],safety:'نشاط آمن ومحترم ومناسب للعمر.'};
 }
 function save(lesson){const x=loadStore();x[lesson.id]=lesson;x[lesson.id].updatedAt=new Date().toISOString();saveStore(x);return lesson}
 function render(){if(document.getElementById('smart-lesson-generator'))return;const box=document.createElement('section');box.id='smart-lesson-generator';box.dir='rtl';box.innerHTML=`<style>#smart-lesson-generator{margin:18px 0;padding:18px;border:1px solid #d9e5df;border-radius:22px;background:#fff;font-family:system-ui,Arial;color:#17392e;box-shadow:0 5px 20px #17221e08}#smart-lesson-generator .slg-controls{display:flex;gap:8px;flex-wrap:wrap;margin:12px 0}#smart-lesson-generator select,#smart-lesson-generator button{font:inherit;border:1px solid #d9e5df;border-radius:11px;padding:10px 12px;background:#fff}#smart-lesson-generator button{cursor:pointer;font-weight:800}#smart-lesson-generator .primary{background:#176b4f;color:#fff;border:0}.slg-card{padding:15px;margin-top:12px;border:1px solid #e2ebe6;border-radius:16px}.slg-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.slg-stage{padding:11px;background:#f5faf7;border-radius:12px}.slg-stage b{display:block;margin-bottom:5px}@media(max-width:700px){.slg-grid{grid-template-columns:1fr}}</style><h2>Ω مولّد الدرس الذكي</h2><p>حوّل الكفاية إلى دورة درس قابلة للتنفيذ والتقويم.</p><div class="slg-controls"><select id="slg-grade"><option value="0">كل الصفوف</option>${[1,2,3,4].map(g=>`<option value="${g}">الصف ${ar(g)}</option>`).join('')}</select><select id="slg-subject"><option value="">كل المواد</option>${Object.entries(subjects).map(([k,v])=>`<option value="${k}">${v}</option>`).join('')}</select><select id="slg-competency"></select><button class="primary" id="slg-generate">▶ أنشئ الدرس</button></div><div id="slg-output"></div>`;document.body.appendChild(box);
 const grade=box.querySelector('#slg-grade'),sub=box.querySelector('#slg-subject'),sel=box.querySelector('#slg-competency'),out=box.querySelector('#slg-output');
 function options(){const g=+grade.value,s=sub.value;const a=records.filter(r=>(!g||r.grade===g)&&(!s||r.subject===s));sel.innerHTML=a.slice(0,300).map(r=>`<option value="${esc(r.id)}">${esc(r.sub||r.main||r.outcome||r.standard||r.id)}</option>`).join('');if(!a.length)sel.innerHTML='<option value="">لا توجد كفايات محملة</option>'}
 grade.onchange=options;sub.onchange=options;options();
 box.querySelector('#slg-generate').onclick=()=>{const r=find(sel.value);if(!r){out.innerHTML='<div class="slg-card">تعذر العثور على الكفاية.</div>';return}const l=save(build(r));out.innerHTML=`<div class="slg-card"><small>${esc(l.subject)} · الصف ${ar(l.grade)} · ${esc(l.domain)}</small><h3>${esc(l.title)}</h3><p><b>الهدف:</b> ${esc(l.goal)}</p><div class="slg-grid">${l.stages.map(s=>`<div class="slg-stage"><b>${esc(s.title)}</b><span>${esc(s.teacher)}</span><br><small>${esc(s.evidence)}</small></div>`).join('')}</div><p><b>معيار الإتقان:</b> ${esc(l.assessment.criterion)}</p><button id="slg-master">✓ تسجيل إتقان</button> <button id="slg-reset">↻ إعادة الدورة</button></div>`;out.querySelector('#slg-master').onclick=()=>{const x=loadStore();x[l.id]={...l,status:'متقنة',masteredAt:new Date().toISOString()};saveStore(x);out.querySelector('#slg-master').textContent='✓ تم تسجيل الإتقان'};out.querySelector('#slg-reset').onclick=()=>{const x=loadStore();delete x[l.id];saveStore(x);out.querySelector('#slg-master').textContent='✓ تسجيل إتقان'}};
 }
 global.ZaytoonaSmartLesson={load,build,find,getSaved:loadStore};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',load);else load();
})(window);
