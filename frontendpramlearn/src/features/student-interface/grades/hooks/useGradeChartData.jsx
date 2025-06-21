import { useMemo } from "react";

export const useGradeChartData = (grades, subjects, getGradeColor) => {
  return useMemo(() => {
    // Generate subjects dari grades jika subjects kosong
    const getSubjectsToUse = () => {
      if (subjects && subjects.length > 0) {
        return subjects;
      }

      const uniqueSubjects = [...new Set(grades.map((g) => g.subject_name))];
      return uniqueSubjects.map((name, index) => ({
        id: index + 1,
        name: name,
      }));
    };

    const subjectsToUse = getSubjectsToUse();

    // Calculate stats
    const quizGrades = grades.filter((g) => g.type === "quiz" && g.grade);
    const assignmentGrades = grades.filter(
      (g) => g.type === "assignment" && g.grade
    );

    const quizAvg =
      quizGrades.length > 0
        ? quizGrades.reduce((sum, g) => sum + g.grade, 0) / quizGrades.length
        : 0;

    const assignmentAvg =
      assignmentGrades.length > 0
        ? assignmentGrades.reduce((sum, g) => sum + g.grade, 0) /
          assignmentGrades.length
        : 0;

    const overallAvg =
      grades.length > 0
        ? grades.reduce((sum, g) => sum + (g.grade || 0), 0) / grades.length
        : 0;

    // Calculate trend
    const calculateTrend = () => {
      if (grades.length < 5) return { trend: "stable", percentage: 0 };

      const recent = grades.slice(0, Math.floor(grades.length / 2));
      const older = grades.slice(Math.floor(grades.length / 2));

      const recentAvg =
        recent.reduce((sum, g) => sum + (g.grade || 0), 0) / recent.length;
      const olderAvg =
        older.reduce((sum, g) => sum + (g.grade || 0), 0) / older.length;

      const difference = recentAvg - olderAvg;
      const percentage = Math.abs((difference / olderAvg) * 100);

      let trend = "stable";
      if (difference > 2) trend = "increasing";
      else if (difference < -2) trend = "decreasing";

      return { trend, percentage: percentage.toFixed(1) };
    };

    const trendData = calculateTrend();

    // Get subject performance
    const getSubjectPerformance = () => {
      return subjectsToUse
        .map((subject) => {
          const subjectGrades = grades.filter(
            (g) => g.subject_name === subject.name
          );
          const average =
            subjectGrades.length > 0
              ? subjectGrades.reduce((sum, g) => sum + (g.grade || 0), 0) /
                subjectGrades.length
              : 0;

          return {
            name: subject.name,
            average: average,
            count: subjectGrades.length,
            color: getGradeColor(average),
          };
        })
        .filter((s) => s.count > 0);
    };

    const subjectPerformance = getSubjectPerformance();

    return {
      subjectsToUse,
      quizGrades,
      assignmentGrades,
      quizAvg,
      assignmentAvg,
      overallAvg,
      trendData,
      subjectPerformance,
    };
  }, [grades, subjects, getGradeColor]);
};
