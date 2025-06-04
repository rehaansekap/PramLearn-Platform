export const getProgressColor = (percentage) => {
  if (percentage >= 90) return "#52c41a"; // Green
  if (percentage >= 70) return "#faad14"; // Orange
  if (percentage >= 50) return "#1890ff"; // Blue
  return "#ff4d4f"; // Red
};

export const getAttendanceColor = (status) => {
  switch (status) {
    case "present":
      return "#52c41a";
    case "late":
      return "#faad14";
    case "excused":
      return "#1890ff";
    case "absent":
      return "#ff4d4f";
    default:
      return "#d9d9d9";
  }
};

export const formatTimeSpent = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

export const generateChartOptions = (title, type = "line") => {
  const baseOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: title,
      },
    },
  };

  if (type === "line") {
    return {
      ...baseOptions,
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
        },
      },
    };
  }

  if (type === "doughnut") {
    return {
      ...baseOptions,
      cutout: "60%",
    };
  }

  return baseOptions;
};

export const processSubjectProgress = (subjects) => {
  return subjects.map((subject) => ({
    name: subject.name,
    progress: subject.progress || 0,
    materials_completed: subject.materials_completed || 0,
    total_materials: subject.total_materials || 0,
    time_spent: subject.time_spent || 0,
    last_activity: subject.last_activity,
  }));
};

export const generateCalendarData = (attendanceRecords) => {
  const data = {};

  attendanceRecords.forEach((record) => {
    const date = record.date;
    data[date] = {
      status: record.status,
      count: 1,
    };
  });

  return data;
};
