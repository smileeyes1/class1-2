const TeacherTools = {

  state: {
    locked: false,
    lastOutput: null
  },

  // =========================
  // توليد تحضير ذكي
  // =========================
  generateLessonPlan(lesson) {
    return `
      <div class="card-item">
        <h3>📘 تحضير الدرس</h3>
        <p><b>الدرس:</b> ${lesson}</p>

        <h4>الأهداف</h4>
        <ul>
          <li>فهم مفهوم ${lesson}</li>
          <li>تنمية المهارات الأساسية</li>
        </ul>

        <h4>الوسائل</h4>
        <p>الكتاب المدرسي + وسائل محسوسة</p>

        <h4>سير الدرس</h4>
        <p>تمهيد → نشاط → تطبيق → تقويم</p>
      </div>
    `;
  },

  // =========================
  // ورقة عمل
  // =========================
  generateWorksheet(lesson) {
    return `
      <div class="card-item">
        <h3>📄 ورقة عمل</h3>
        <p>1) اشرح ${lesson}</p>
        <p>2) حل تمرين مرتبط بالدرس</p>
        <p>3) اختر الإجابة الصحيحة</p>
      </div>
    `;
  },

  // =========================
  // اختبار
  // =========================
  generateTest(lesson) {
    return `
      <div class="card-item">
        <h3>🧠 اختبار قصير</h3>
        <p>س1: ماذا تعرف عن ${lesson} ؟</p>
        <p>س2: أعط مثالاً</p>
      </div>
    `;
  },

  // =========================
  // خطة شاملة
  // =========================
  generateFullPack(lesson) {
    return `
      ${this.generateLessonPlan(lesson)}
      ${this.generateWorksheet(lesson)}
      ${this.generateTest(lesson)}
    `;
  },

  // =========================
  // حفظ الناتج
  // =========================
  save(output) {
    this.state.lastOutput = output;
  },

  // =========================
  // تعديل المحتوى
  // =========================
  edit(newText) {
    if (this.state.locked) return "🔒 المحتوى مقفل";

    this.state.lastOutput = newText;
    return newText;
  },

  // =========================
  // حذف المحتوى
  // =========================
  delete() {
    if (this.state.locked) return "🔒 لا يمكن الحذف";

    this.state.lastOutput = null;
    return "<p>🗑 تم حذف المحتوى</p>";
  },

  // =========================
  // قفل / فتح
  // =========================
  lock() {
    this.state.locked = true;
    return "🔒 تم القفل";
  },

  unlock() {
    this.state.locked = false;
    return "🔓 تم فتح التعديل";
  }
};
