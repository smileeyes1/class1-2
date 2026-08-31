/* ZAYTOONA Ω — Annual Mastery System v1.0
 * General-purpose: grades 1–4, all competency domains.
 * Source: Kefayat catalog. No subject is hard-coded.
 */
'use strict';
const ZAnnual={
  schemaVersion:1,
  states:['لم تبدأ','قيد التعلم','قيد التطور','متقنة','تحتاج دعمًا'],
  normalize(r={}){return{ id:String(r.id??''), grade:String(r.grade??''), subject:String(r.subject??r.material??''), domain:String(r.domain??r.area??''), competency:String(r.competency??r.text??r.learningOutcome??r.standard??''), outcome:String(r.learningOutcome??r.outcome??r.standard??''), raw:r};},
  group(records){const g={};for(const x of records.map(this.normalize)){const k=`${x.grade}||${x.subject}`;(g[k]??=[]).push(x)}return g},
  annualPlan(records,{weeks=36,bufferWeeks=4}={}){const groups=this.group(records);const plan=[];for(const [key,items] of Object.entries(groups)){const [grade,subject]=key.split('||');const usable=Math.max(1,weeks-bufferWeeks);const per=Math.max(1,Math.ceil(items.length/usable));for(let i=0;i<items.length;i+=per){const chunk=items.slice(i,i+per);plan.push({grade,subject,sequence:plan.filter(p=>p.grade===grade&&p.subject===subject).length+1,weeks:[Math.min(weeks,Math.floor(i/per)+1),Math.min(weeks,Math.floor(i/per)+2)],competencies:chunk.map(x=>x.id),outcomes:chunk.map(x=>x.outcome||x.competency)})}}return{weeks,bufferWeeks,plans:plan}},
  evidence(score){const s=Number(score)||0;return s>=.8?'متقنة':s>0?'قيد التطور':'تحتاج دعمًا'},
  nextAction(state){return state==='متقنة'?'إثراء وتطبيق':state==='قيد التطور'?'ممارسة موجهة وإعادة تقويم':state==='تحتاج دعمًا'?'تعلم علاجي مبسط وإعادة بناء المتطلب':'بدء التعلم'},
  dashboard(records,progress={}){let mastered=0,active=0,support=0;for(const r of records){const s=progress[r.id]?.state||'لم تبدأ';if(s==='متقنة')mastered++;else if(s==='قيد التطور'||s==='قيد التعلم')active++;else if(s==='تحتاج دعمًا')support++}return{total:records.length,mastered,active,support,notStarted:Math.max(0,records.length-mastered-active-support),masteryRate:records.length?mastered/records.length:0}},
  validate(records){const errors=[];const seen=new Set();for(const r of records){if(!r.id)errors.push('MISSING_ID');if(seen.has(r.id))errors.push(`DUPLICATE_ID:${r.id}`);seen.add(r.id);if(!r.grade)errors.push(`MISSING_GRADE:${r.id}`);if(!r.subject)errors.push(`MISSING_SUBJECT:${r.id}`);if(!r.competency&&!r.outcome)errors.push(`MISSING_COMPETENCY:${r.id}`)}return{ok:errors.length===0,errors:[...new Set(errors)]}}
};
if(typeof module!=='undefined')module.exports=ZAnnual;
if(typeof window!=='undefined')window.ZAnnual=ZAnnual;
