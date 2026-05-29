const UI = {

    renderLessons: function (gradeData) {
        const container = document.getElementById("lessons");
        container.innerHTML = "";

        gradeData.units.forEach(unit => {
            const div = document.createElement("div");
            div.className = "card";

            let html = `<h4>${unit.unit}</h4>`;

            unit.lessons.forEach(lesson => {
                html += `
                <button onclick="TeacherTools.selectLesson('${lesson}')">
                    ${lesson}
                </button>`;
            });

            div.innerHTML = html;
            container.appendChild(div);
        });
    },

    showOutput: function (text) {
        document.getElementById("output").innerHTML =
            `<pre>${text}</pre>`;
    }
};
