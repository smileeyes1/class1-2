/* ZAYTOONA Ω — AUTONOMOUS ASSURANCE & DELIVERY CONTROLLER v1.0 */
'use strict';
(()=>{
  const KEY='zaytoona.assurance.v1';
  const state=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch{return{}}};
  const save=x=>localStorage.setItem(KEY,JSON.stringify(x));
  const now=()=>new Date().toISOString();
  const ensure=()=>{const s=state();if(!s.version)s.version='1.0';if(!s.checks)s.checks=[];if(!s.lastRun)s.lastRun=null;if(!s.status)s.status='READY';save(s);return s};
  function check(name,ok,detail){const s=ensure();s.checks.push({name,ok,detail,at:now()});s.lastRun=now();s.status=s.checks.slice(-6).every(x=>x.ok)?'GO':'NO-GO';save(s);return ok}
  function run(){
    const results=[];
    results.push(check('APP_SHELL',!!document.querySelector('main'),'واجهة التطبيق موجودة'));
    results.push(check('RTL',document.documentElement.dir==='rtl'||!!document.querySelector('[dir="rtl"]'),'اتجاه العربية RTL'));
    results.push(check('CLICK_FIRST',document.querySelectorAll('button').length>0,'التفاعل الأساسي بالأزرار'));
    results.push(check('NO_FORCED_TEXT',![...document.querySelectorAll('input')].some(x=>x.required),'لا توجد كتابة إجبارية في المسار الأساسي'));
    results.push(check('LOCAL_PERSISTENCE',typeof localStorage!=='undefined','التخزين المحلي متاح'));
    results.push(check('LEARNING_CORE',!!window.ZAYTOONA,'النواة التعليمية محملة'));
    const s=ensure();
    window.ZAYTOONA_ASSURANCE={status:s.status,checks:s.checks.slice(-20),run};
    return s;
  }
  window.addEventListener('load',()=>setTimeout(run,0));
})();
