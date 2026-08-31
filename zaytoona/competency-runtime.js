/* ZAYTOONA Ω — Generic competency catalog runtime */
(function (global) {
  'use strict';
  const LOCAL = './zaytoona/kefayat/catalog.min.json';
  const CACHE = 'zaytoona.kefayat.catalog.v1';
  const memory = { data: null };
  async function readLocal() {
    const res = await fetch(LOCAL, { cache: 'no-store' });
    if (!res.ok) throw new Error('CATALOG_HTTP_' + res.status);
    const data = await res.json();
    if (!data || !Array.isArray(data.records)) throw new Error('CATALOG_INVALID');
    return data;
  }
  function cached() {
    try { return JSON.parse(localStorage.getItem(CACHE) || 'null'); } catch { return null; }
  }
  function store(data) {
    try { localStorage.setItem(CACHE, JSON.stringify(data)); } catch {}
    memory.data = data;
    return data;
  }
  const api = {
    status: 'لم تتم المزامنة',
    async init() {
      const old = cached();
      if (old && Array.isArray(old.records)) { memory.data = old; this.status = 'نسخة محلية'; this.render(); }
      try { store(await readLocal()); this.status = 'كتالوج محلي موثوق البنية'; }
      catch { this.status = memory.data ? 'تعمل من النسخة المحلية' : 'الكتالوج غير منشور بعد'; }
      this.render();
      return memory.data;
    },
    records() { return memory.data?.records || []; },
    forContext({ grade = null, subject = '', domain = '', query = '' } = {}) {
      const q = String(query).trim().toLowerCase(), s = String(subject).trim().toLowerCase(), d = String(domain).trim().toLowerCase();
      return this.records().filter(r => (grade == null || Number(r.grade) === Number(grade)) && (!s || String(r.subject || '').toLowerCase() === s) && (!d || String(r.domain || '').toLowerCase() === d) && (!q || JSON.stringify(r).toLowerCase().includes(q)));
    },
    render() {
      const host = document.querySelector('#teacherOut'); if (!host) return;
      let box = document.querySelector('#kefayatContext');
      if (!box) { box = document.createElement('article'); box.id = 'kefayatContext'; box.className = 'card'; host.appendChild(box); }
      const all = this.records();
      box.innerHTML = '<h2>كفايات زيتونة</h2><p><b>الحالة:</b> ' + this.status + '</p><p><b>إجمالي الكفايات:</b> ' + all.length + '</p>' + (all.length ? '<p class="muted">الكفايات هي العمود الفقري لمسارات التعلم والتقويم والإتقان.</p>' : '<p class="muted">سيظهر الكتالوج تلقائيًا بعد المزامنة.</p>');
    }
  };
  global.Kefayat = api;
  global.addEventListener('DOMContentLoaded', () => api.init());
})(window);
