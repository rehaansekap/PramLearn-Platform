export const calculateOverallProgress = (subjects) => {
  if (!subjects || subjects.length === 0) return 0;

  const totalProgress = subjects.reduce(
    (sum, subject) => sum + (subject.progress || 0),
    0
  );
  return Math.round(totalProgress / subjects.length);
};

export const calculateLearningStreak = (attendanceRecords) => {
  if (!attendanceRecords || attendanceRecords.length === 0) return 0;

  // Sort by date (newest first)
  const sortedRecords = attendanceRecords.sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  let streak = 0;
  const today = new Date();

  for (const record of sortedRecords) {
    const recordDate = new Date(record.date);
    const daysDiff = Math.floor((today - recordDate) / (1000 * 60 * 60 * 24));

    if (daysDiff === streak && record.status === "present") {
      streak++;
    } else {
      break;
    }
  }

  return streak;
};

export const calculateAttendanceRate = (attendanceRecords) => {
  if (!attendanceRecords || attendanceRecords.length === 0) return 0;

  const presentCount = attendanceRecords.filter(
    (record) => record.status === "present" || record.status === "late"
  ).length;

  return Math.round((presentCount / attendanceRecords.length) * 100);
};

export const getWeeklyProgress = (dailyActivity) => {
  const weeklyData = {};

  dailyActivity.forEach((day) => {
    const weekStart = getWeekStart(new Date(day.date));
    const weekKey = weekStart.toISOString().split("T")[0];

    if (!weeklyData[weekKey]) {
      weeklyData[weekKey] = {
        materials_accessed: 0,
        time_spent: 0,
        attendance_count: 0,
      };
    }

    weeklyData[weekKey].materials_accessed += day.materials_accessed || 0;
    weeklyData[weekKey].time_spent += day.time_spent || 0;
    weeklyData[weekKey].attendance_count += day.attendance_count || 0;
  });

  return Object.entries(weeklyData).map(([week, data]) => ({
    week,
    ...data,
  }));
};

export const getMonthlyProgress = (dailyActivity) => {
  const monthlyData = {};

  dailyActivity.forEach((day) => {
    const date = new Date(day.date);
    const monthKey = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}`;

    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = {
        materials_accessed: 0,
        time_spent: 0,
        attendance_count: 0,
        days_active: 0,
      };
    }

    monthlyData[monthKey].materials_accessed += day.materials_accessed || 0;
    monthlyData[monthKey].time_spent += day.time_spent || 0;
    monthlyData[monthKey].attendance_count += day.attendance_count || 0;
    monthlyData[monthKey].days_active += 1;
  });

  return Object.entries(monthlyData).map(([month, data]) => ({
    month,
    ...data,
  }));
};

export const getPeakLearningHours = (behavior) => {
  if (!behavior || !behavior.peak_learning_hours) return [];

  return behavior.peak_learning_hours.map((hour) => ({
    hour: hour.hour,
    activity_count: hour.activity_count,
    time_spent: hour.time_spent,
  }));
};

const getWeekStart = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  return new Date(d.setDate(diff));
};

export const calculateGrowthRate = (currentPeriod, previousPeriod) => {
  if (!previousPeriod || previousPeriod === 0) return 0;

  return Math.round(((currentPeriod - previousPeriod) / previousPeriod) * 100);
};

export const getSubjectTimeDistribution = (subjects) => {
  const total = subjects.reduce(
    (sum, subject) => sum + (subject.time_spent || 0),
    0
  );

  if (total === 0) return [];

  return subjects.map((subject) => ({
    name: subject.name,
    time_spent: subject.time_spent || 0,
    percentage: Math.round(((subject.time_spent || 0) / total) * 100),
  }));
};
