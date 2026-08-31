/* ZAYTOONA Ω COMMAND v1.0 — user-facing mission control. */
(function(global){'use strict';
 const S=()=>global.ZaytoonaOmegaState,F=()=>global.ZaytoonaOmegaFactory;
 const jobs=[
  {id:'source',title:'فحص مصادر الكفايات',run:async()=>{const r=await fetch('./curriculum-offline.json',{cache:'no-store'});if(!r.ok)throw Error('مصدر الكفايات غير متاح');const data=await r.json();S().evidence({type:'source',status:'pass',count:Object.keys(data||{}).length});return 'source-loaded'}},
  {id:'structure',title:'فحص بنية زيتونة',dependsOn:['source'],run:async()=>{if(!document.querySelector('#teacher')||!document.querySelector('#student'))throw Error('واجهات التعلم الأساسية غير موجودة');return 'structure-ok'}},
  {id:'interaction',title:'فحص التفاعل بالنقر',dependsOn:['structure'],run:async()=>{const buttons=[...document.querySelectorAll('button')];if(!buttons.length)throw Error('لا توجد عناصر تفاعل');return `buttons:${buttons.length}`}},
  {id:'persistence',title:'فحص الاستمرارية',dependsOn:['structure'],run:async()=>{const marker='zaytoona:omega:selftest';localStorage.setItem(marker,'ok');if(localStorage.getItem(marker)!=='ok')throw Error('التخزين المحلي فشل');localStorage.removeItem(marker);return 'persistence-ok'}},
  {id:'math',title:'فحص الرياضيات العربية',dependsOn:['source'],run:async()=>{const bad=/\b[0-9]+\b/.test(document.body.innerText);if(bad)throw Error('تم العثور على أرقام غربية في واجهة المستخدم');return 'arabic-numerals-ok'}}
 ];
 async function start(mission='تشغيل دورة زيتونة الذاتية'){const s=S();s.setMission(mission);s.event('mission.started',{mission});const result=await F().execute(jobs,{mission});s.setStatus(result.ok?'go':'blocked');s.setPhase(result.ok?'release-ready':'recovery');s.checkpoint(result.ok?'GO':'BLOCKED',result);return result}
 function resume(){const st=S().get();return st.status==='running'?start(st.mission||'استئناف المهمة'):start(st.mission||'استئناف آخر مهمة')}
 global.ZaytoonaOmegaCommand={start,resume,state:()=>S().get()};
})(window);