const UI = {

  loadGrades(data){
    const g = document.getElementById("grade");
    g.innerHTML = "";

    data.grades.forEach(x=>{
      const o = document.createElement("option");
      o.value = x.grade;
      o.textContent = "الصف " + x.grade;
      g.appendChild(o);
    });

    g.onchange = ()=>this.loadUnits(data);
    this.loadUnits(data);
  },

  loadUnits(data){
    const grade = document.getElementById("grade").value;
    const u = document.getElementById("unit");

    u.innerHTML = "";

    const g = data.grades.find(x=>x.grade==grade);

    g.units.forEach((x,i)=>{
      const o = document.createElement("option");
      o.value = i;
      o.textContent = x.unit;
      u.appendChild(o);
    });

    u.onchange = ()=>this.loadLessons(data);
    this.loadLessons(data);
  },

  loadLessons(data){
    const grade = document.getElementById("grade").value;
    const unitIndex = document.getElementById("unit").value;

    const l = document.getElementById("lesson");
    l.innerHTML = "";

    const unit = data.grades.find(x=>x.grade==grade).units[unitIndex];

    unit.lessons.forEach((x,i)=>{
      const o = document.createElement("option");
      o.value = i;
      o.textContent = x;
      l.appendChild(o);
    });
  }
};
