/* ZAYTOONA Ω — Generic Competency Engine v1.0
 * Domain-agnostic browser layer. Competencies are the learning spine;
 * subject/topic-specific logic remains outside this engine.
 */
(function (global) {
  'use strict';
  const KEY = 'zaytoona.competency.mastery.v1';
  const STATES = Object.freeze({ NOT_STARTED:'NOT_STARTED', DEVELOPING:'DEVELOPING', MASTERED:'MASTERED' });

  function clean(v){ return String(v ?? '').trim(); }
  function normalizeRecord(r, i){
    const text = clean(r.competency || r['الكفايات الفرعية المستقلة بنيوياً'] || r.learningOutcome || r.standard || r.domain);
    return {
      id: clean(r.id) || `K-${i+1}`,
      grade: r.grade == null ? null : Number(r.grade),
      subject: clean(r.subject || r.material || r.المادة),
      domain: clean(r.domain || r.area || r['المجال']),
      competency: text,
      outcome: clean(r.learningOutcome || r.outcome || r.standard || r['ناتج التعلم']),
      source: clean(r.source || r.sourceFile || 'kefayat'),
      raw: r
    };
  }
  function catalog(records){ return (Array.isArray(records)?records:[]).map(normalizeRecord).filter(r=>r.competency||r.outcome); }
  function matches(r, q){
    const needle = clean(q).toLocaleLowerCase();
    if(!needle) return true;
    return [r.id,r.subject,r.domain,r.competency,r.outcome].join(' ').toLocaleLowerCase().includes(needle);
  }
  function filter(records,{grade=null,subject='',domain='',query=''}={}){
    return catalog(records).filter(r =>
      (grade==null || r.grade===Number(grade)) &&
      (!subject || r.subject.toLocaleLowerCase()===clean(subject).toLocaleLowerCase()) &&
      (!domain || r.domain.toLocaleLowerCase()===clean(domain).toLocaleLowerCase()) &&
      matches(r,query)
    );
  }
  function load(){ try{return JSON.parse(localStorage.getItem(KEY)||'{}');}catch{return {}; } }
  function save(data){ localStorage.setItem(KEY,JSON.stringify(data)); return data; }
  function mastery(id){ return load()[clean(id)] || {state:STATES.NOT_STARTED,score:0,attempts:0,updatedAt:null}; }
  function record(id, score, criterion=0.8){
    const data=load(), key=clean(id), s=Math.max(0,Math.min(1,Number(score)||0));
    const prev=data[key]||{attempts:0};
    data[key]={state:s>=criterion?STATES.MASTERED:s>0?STATES.DEVELOPING:STATES.NOT_STARTED,score:s,attempts:(prev.attempts||0)+1,updatedAt:new Date().toISOString()};
    return save(data)[key];
  }
  function plan(records, context={}){
    const list=filter(records,context);
    return list.map(r=>({...r, mastery:mastery(r.id)}));
  }
  function summary(records, context={}){
    const items=plan(records,context), total=items.length;
    const mastered=items.filter(x=>x.mastery.state===STATES.MASTERED).length;
    const developing=items.filter(x=>x.mastery.state===STATES.DEVELOPING).length;
    return {total,mastered,developing,notStarted:Math.max(0,total-mastered-developing),rate:total?Number((mastered/total).toFixed(3)):0};
  }
  function escapeHtml(s){return clean(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  function render(host, records, context={}){
    if(!host)return;
    const items=plan(records,context), sum=summary(records,context);
    host.innerHTML=`<article class="card" id="competencyEngineCard"><h2>محرك الكفايات والإتقان</h2><p><b>النطاق:</b> ${escapeHtml(context.subject||'عام')} · <b>الصف:</b> ${context.grade==null?'كل الصفوف':escapeHtml(context.grade)}</p><p><b>الكفايات المطابقة:</b> ${sum.total} · <b>المتقنة:</b> ${sum.mastered} · <b>قيد التطور:</b> ${sum.developing}</p>${items.length?`<ol>${items.slice(0,30).map(x=>`<li><b>${escapeHtml(x.id)}</b> — ${escapeHtml(x.competency||x.outcome)} <span class="pill">${x.mastery.state}</span></li>`).join('')}</ol>`:'<p class="muted">لا توجد كفايات مطابقة للسياق الحالي.</p>'}<p class="small muted">المحرك عام ولا يفترض مادة أو موضوعًا بعينه؛ الربط التفصيلي يُبنى فوق الكفاية نفسها.</p></article>`;
  }
  global.ZaytoonaCompetency = Object.freeze({STATES,catalog,filter,mastery,record,plan,summary,render});
})(window);
