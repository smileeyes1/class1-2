const App = {
    data: null,

    load: function () {
        const grade = document.getElementById("gradeSelect").value;
        this.data = curriculumData;

        const gradeData = this.data.grades.find(g => g.grade == grade);

        UI.renderLessons(gradeData);
    }
};
