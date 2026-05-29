const TeacherTools = {

    currentLesson: null,

    selectLesson: function (lesson) {
        this.currentLesson = lesson;

        const plan = Generator.lessonPlan(lesson);
        const sheet = Generator.worksheet(lesson);
        const test = Generator.test(lesson);

        UI.showOutput(
            plan + "\n\n----------------\n\n" +
            sheet + "\n\n----------------\n\n" +
            test
        );
    }
};
