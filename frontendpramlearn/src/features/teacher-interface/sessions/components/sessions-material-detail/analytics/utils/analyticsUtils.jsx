export const getGradeColor = (grade) => {
  if (grade >= 85) return "#52c41a";
  if (grade >= 70) return "#faad14";
  return "#ff4d4f";
};

export const getProgressColor = (progress) => {
  if (progress >= 80) return "#52c41a";
  if (progress >= 60) return "#faad14";
  return "#ff4d4f";
};

export const getMotivationColor = (level) => {
  switch (level?.toLowerCase()) {
    case "high":
      return "#52c41a";
    case "medium":
      return "#faad14";
    case "low":
      return "#ff4d4f";
    default:
      return "#d9d9d9";
  }
};

export const getMotivationText = (level) => {
  switch (level?.toLowerCase()) {
    case "high":
      return "Tinggi";
    case "medium":
      return "Sedang";
    case "low":
      return "Rendah";
    default:
      return "Belum Terukur";
  }
};

export const calculateAnalytics = (students = []) => {
  const totalStudents = students.length;
  const activeStudents = students.filter((s) => s.is_online).length;
  const completedStudents = students.filter(
    (s) => (s.completion_percentage || 0) >= 100
  ).length;
  const excellentStudents = students.filter(
    (s) => (s.average_grade || 0) >= 85
  ).length;

  const averageCompletion =
    totalStudents > 0
      ? students.reduce((sum, s) => sum + (s.completion_percentage || 0), 0) /
        totalStudents
      : 0;

  const averageGrade =
    totalStudents > 0
      ? students.reduce((sum, s) => sum + (s.average_grade || 0), 0) /
        totalStudents
      : 0;

  const motivationDistribution = {
    high: students.filter((s) => s.motivation_level?.toLowerCase() === "high")
      .length,
    medium: students.filter(
      (s) => s.motivation_level?.toLowerCase() === "medium"
    ).length,
    low: students.filter((s) => s.motivation_level?.toLowerCase() === "low")
      .length,
  };

  return {
    totalStudents,
    activeStudents,
    completedStudents,
    excellentStudents,
    averageCompletion,
    averageGrade,
    motivationDistribution,
  };
};

export const getTopPerformers = (students = []) => {
  return students
    .sort((a, b) => (b.average_grade || 0) - (a.average_grade || 0))
    .slice(0, 5);
};

export const getRecentActivities = (students = []) => {
  return students
    .filter((student) => student.last_activity)
    .sort(
      (a, b) =>
        new Date(b.last_activity).getTime() -
        new Date(a.last_activity).getTime()
    )
    .slice(0, 8);
};
