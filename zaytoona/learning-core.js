/* ZAYTOONA Ω — Adaptive Learning Core v1.0 */
'use strict';
(function(global){
  const VERSION='1.0';
  const KEY='zaytoona.learning.v1';
  const STATES={NEW:'لم تبدأ',LEARN:'قيد التعلم',DEVELOPING:'قيد التطور',MASTERED:'متقنة',SUPPORT:'تحتاج دعمًا'};
  const STAGES=['diagnose','teach','practice','check','feedback','remediate','enrich','mastery'];
  const now=()=>new Date().toISOString();
  const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,Number(n)||0));
  function read(){try{return JSON.parse(localStorage.getItem(KEY)||'{"students":{}}')}catch{return{students:{}}}}
  function write(x){localStorage.setItem(KEY,JSON.stringify(x));return x}
  function student(db,id){db.students[id]??={competencies:{},updatedAt:now()};return db.students[id]}
  function record(db,sid,cid){const s=student(db,sid);s.competencies[cid]??={state:STATES.NEW,score:0,attempts:0,streak:0,evidence:[],stage:'diagnose'};return s.competencies[cid]}
  function status(score,attempts){if(score>=.8&&attempts>=2)return STATES.MASTERED;if(score>0)return STATES.DEVELOPING;return STATES.SUPPORT}
  function evidenceType(subject){if(subject==='math')return ['اختيار إجابة','ترتيب خطوات','تمثيل بصري','حل مسألة'];if(subject==='arabic')return ['تمييز صوت/حرف','اختيار كلمة','قراءة','فهم'];if(subject==='islamic')return ['اختيار موقف صحيح','ترتيب سلوك','تطبيق قيمة','تعبير شفهي'];return ['اختيار','تصنيف','مطابقة','تطبيق']}
  function plan(c,context={}){const score=clamp(c?.score);const state=c?.state||STATES.NEW;const stage=state===STATES.NEW?'diagnose':state===STATES.SUPPORT?'remediate':state===STATES.DEVELOPING?'practice':'enrich';return{stage,target:context.outcome||context.competency||'',duration:context.duration||15,sequence:stage==='diagnose'?['diagnose','teach','practice','check']:stage==='remediate'?['remediate','practice','check']:stage==='enrich'?['enrich','check']:['practice','check'],evidenceTypes:evidenceType(context.subject),score}}
  function submit({studentId='default',competencyId,score,evidence={},stage='check'}={}){if(!competencyId)throw new Error('MISSING_COMPETENCY');const db=read(),c=record(db,studentId,competencyId),s=clamp(score);const previous=c.score||0;c.score=Math.round((Math.max(previous,s)*.65+s*.35)*100)/100;c.attempts++;c.streak=s>=.8?c.streak+1:0;c.stage=stage;c.state=status(c.score,c.attempts);c.evidence.push({stage,score:s,type:evidence.type||'performance',value:evidence.value??null,at:now()});c.evidence=c.evidence.slice(-20);student(db,studentId).updatedAt=now();write(db);return{...c,next:nextAction(c)}}
  function nextAction(c){switch(c?.state){case STATES.MASTERED:return{kind:'enrichment',label:'نشاط إثرائي وتطبيق جديد'};case STATES.DEVELOPING:return{kind:'practice',label:'ممارسة موجهة ثم إعادة التقويم'};case STATES.SUPPORT:return{kind:'remediation',label:'تعلم علاجي مبسط ثم إعادة التقويم'};default:return{kind:'diagnosis',label:'ابدأ التشخيص'}}}
  function get({studentId='default',competencyId}={}){const db=read();return competencyId?record(db,studentId,competencyId):student(db,studentId)}
  function portfolio({studentId='default',records=[]}={}){const db=read(),s=student(db,studentId);let mastered=0,developing=0,support=0,started=0;for(const r of records){const c=s.competencies[r.id];if(!c)continue;started++;if(c.state===STATES.MASTERED)mastered++;else if(c.state===STATES.DEVELOPING)developing++;else if(c.state===STATES.SUPPORT)support++}return{total:records.length,started,mastered,developing,support,notStarted:Math.max(0,records.length-started),rate:records.length?mastered/records.length:0}}
  function annualCoverage(records,studentId='default'){const db=read(),s=student(db,studentId);const by={};for(const r of records){const g=String(r.grade||'غير محدد'),sub=String(r.subjectKey||r.subject||'غير محدد'),k=g+'||'+sub;(by[k]??={grade:g,subject:sub,total:0,mastered:0,started:0});by[k].total++;const c=s.competencies[r.id];if(c){by[k].started++;if(c.state===STATES.MASTERED)by[k].mastered++}}return Object.values(by).map(x=>({...x,rate:x.total?x.mastered/x.total:0}))}
  function validateTask(task){const errors=[];if(!task?.competencyId)errors.push('MISSING_COMPETENCY');if(!task?.prompt)errors.push('MISSING_PROMPT');if(!Array.isArray(task?.choices)||task.choices.length<2)errors.push('INSUFFICIENT_CHOICES');if(task.correctIndex<0||task.correctIndex>=task.choices.length)errors.push('INVALID_CORRECT_INDEX');return{ok:!errors.length,errors}}
  const api={version:VERSION,states:STATES,stages:STAGES,plan,submit,get,portfolio,annualCoverage,validateTask,nextAction,evidenceType};
  global.ZLearningCore=api;
})(window);
