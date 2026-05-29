const Generator = {

  build(data, grade, unitIndex, lessonIndex){

    const unit = data.grades.find(x=>x.grade==grade).units[unitIndex];
    const lesson = unit.lessons[lessonIndex];

    return `
      <h2>${lesson}</h2>

      <hr>

      <h3>📘 التحضير</h3>
      <p>شرح تدريسي مبسط وفق المنهاج الفلسطيني.</p>

      <h3>🧠 اختبار قصير</h3>
      <p>سؤال: وضّح مفهوم ${lesson}</p>

      <h3>📄 ورقة عمل</h3>
      <p>تمارين تطبيقية على الدرس.</p>
    `;
  }
};
