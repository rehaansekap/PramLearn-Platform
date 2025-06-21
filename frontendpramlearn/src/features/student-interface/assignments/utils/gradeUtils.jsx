export const getGradeColor = (grade) => {
  if (grade >= 90) return "#52c41a"; // Green
  if (grade >= 80) return "#1890ff"; // Blue
  if (grade >= 70) return "#faad14"; // Orange
  if (grade >= 60) return "#fa8c16"; // Dark Orange
  return "#ff4d4f"; // Red
};

export const getGradeText = (grade) => {
  if (grade >= 90) return "A - Excellent";
  if (grade >= 80) return "B - Good";
  if (grade >= 70) return "C - Fair";
  if (grade >= 60) return "D - Pass";
  return "E - Needs Improvement";
};
