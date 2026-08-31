/* ZAYTOONA Ω COMMAND v1.3 — production learning orchestration */
(function(global){'use strict';
 const S=()=>global.ZaytoonaOmegaState,F=()=>global.ZaytoonaOmegaFactory;
 const jobs=[
  {id:'source',title:'فحص كتالوج الكفايات',run:async()=>{const r=await fetch('./zaytoona/kefayat/catalog.json',{cache:'no-store'});if(!r.ok)throw Error('كتالوج الكفايات غير متاح');const data=await r.json();if(!data.recordCount||!Array.isArray(data.records)||data.records.length!==data.recordCount)throw Error('كتالوج الكفايات فارغ أو غير صالح');S().evidence({type:'kefayat-catalog',status:'pass',count:data.recordCount,sources:data.sources||[]});return`catalog:${data.recordCount}`}},
  {id:'structure',title:'فحص بنية زيتونة',dependsOn:['source'],run:async()=>{if(!document.querySelector('main#app')||!global.ZaytoonaAnnualLearning||!global.ZaytoonaSmartLesson||!global.ZaytoonaAssessment)throw Error('طبقة التعلم السنوي أو مولد الدرس أو التقييم غير موصولة');return'structure-learning-stack-ok'}},
  {id:'annual',title:'فحص محرك التعلم السنوي',dependsOn:['structure'],run:async()=>{await global.ZaytoonaAnnualLearning.load();const plan=global.ZaytoonaAnnualLearning.plan();if(!Array.isArray(plan))throw Error('الخطة السنوية غير صالحة');return`annual-plan:${plan.length}`}},
  {id:'lesson',title:'فحص مولّد الدرس',dependsOn:['source','structure'],run:async()=>{await global.ZaytoonaSmartLesson.load();const saved=global.ZaytoonaSmartLesson.getSaved();if(!saved||typeof saved!=='object')throw Error('مخزن الدروس غير صالح');return'lesson-generator-ok'}},
  {id:'assessment',title:'فحص محرّك التقييم',dependsOn:['lesson'],run:async()=>{const r=global.ZaytoonaAssessment.assess({competencyId:'__integration_probe__'},1);if(!r.mastered||r.competencyId!=='__integration_probe__')throw Error('محرّك التقييم لا يعيد قرار الإتقان الصحيح');return'assessment-ok'}},
  {id:'interaction',title:'فحص التفاعل بالنقر',dependsOn:['structure'],run:async()=>{const buttons=[...document.querySelectorAll('button')];if(buttons.length<3)throw Error('عدد عناصر التفاعل أقل من الحد الأدنى');return`buttons:${buttons.length}`}},
  {id:'persistence',title:'فحص الاستمرارية',dependsOn:['structure'],run:async()=>{const marker='zaytoona:omega:selftest';localStorage.setItem(marker,'ok');if(localStorage.getItem(marker)!=='ok')throw Error('التخزين المحلي فشل');localStorage.removeItem(marker);return'persistence-ok'}},
  {id:'math',title:'فحص الأعداد العربية',dependsOn:['source'],run:async()=>{const text=document.body.innerText||'';if(/\b[0-9]+\b/.test(text))throw Error('تم العثور على أرقام غربية في واجهة المستخدم');return'arabic-numerals-ok'}}
 ];
 async function executeMission(mission,resume){const s=S();if(resume)s.resumeMission();else s.setMission(mission);s.event(resume?'mission.resumed':'mission.started',{mission:s.get().mission,runId:s.get().runId});const result=await F().execute(jobs,{mission:s.get().mission,runId:s.get().runId,resume:!!resume});s.setStatus(result.ok?'go':'blocked');s.setPhase(result.ok?'release-ready':'recovery');s.checkpoint(result.ok?'GO':'BLOCKED',result);return result}
 async function start(mission='تشغيل زيتونة Ω'){return executeMission(mission,false)}
 async function resume(){const st=S().get();return st.mission?executeMission(st.mission,true):start('استئناف آخر مهمة')}
 global.ZaytoonaOmegaCommand={start,resume,state:()=>S().get(),jobs};
})(window);