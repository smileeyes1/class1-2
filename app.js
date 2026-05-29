const App = {

  data: null,

  async init() {
    const res = await fetch('./curriculum-offline.json');
    this.data = await res.json();

    UI.loadGrades(this.data);
  },

  getGrade(){ return document.getElementById("grade").value; },
  getUnit(){ return document.getElementById("unit").value; },
  getLesson(){ return document.getElementById("lesson").value; },

  generate(){
    const html = Generator.build(
      this.data,
      this.getGrade(),
      this.getUnit(),
      this.getLesson()
    );

    document.getElementById("output").innerHTML = html;
  }
};

window.onload = () => App.init();
