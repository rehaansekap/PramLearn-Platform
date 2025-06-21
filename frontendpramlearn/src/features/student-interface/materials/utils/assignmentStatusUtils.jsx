import {
  TrophyOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  EditOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

export const getAssignmentStatus = (assignment) => {
  const now = dayjs();
  const dueDate = dayjs(assignment.due_date);
  const isOverdue = assignment.due_date && now.isAfter(dueDate);

  if (assignment.grade !== null && assignment.grade !== undefined) {
    return {
      status: "graded",
      text: "Dinilai",
      icon: <TrophyOutlined />,
      color: "success",
    };
  }

  if (assignment.is_submitted || assignment.submitted_at) {
    return {
      status: "submitted",
      text: "Sudah Submit",
      icon: <CheckCircleOutlined />,
      color: "processing",
    };
  }

  if (isOverdue) {
    return {
      status: "overdue",
      text: "Terlambat",
      icon: <ExclamationCircleOutlined />,
      color: "error",
    };
  }

  return {
    status: "available",
    text: "Tersedia",
    icon: <EditOutlined />,
    color: "warning",
  };
};

export const getButtonText = (status, timeRemaining, assignment) => {
  if (
    timeRemaining.expired &&
    status.status !== "submitted" &&
    status.status !== "graded"
  ) {
    return "Waktu Habis";
  }

  switch (status.status) {
    case "available":
      return "Mulai Assignment";
    case "submitted":
      return "Lihat Submission";
    case "graded":
      return "Lihat Nilai & Feedback";
    case "overdue":
      return assignment.allow_late_submission
        ? "Submit Terlambat"
        : "Waktu Habis";
    default:
      return "Lihat Assignment";
  }
};

export const getButtonStyle = (status, timeRemaining) => {
  const isDisabled =
    timeRemaining.expired &&
    status.status !== "submitted" &&
    status.status !== "graded";

  const gradedStyle = {
    background:
      "linear-gradient(135deg, #ffec3d 0%, #faad14 50%, #ff8c00 100%)",
    border: "none",
    color: "white",
    boxShadow: "0 4px 12px rgba(255, 173, 20, 0.4)",
  };

  const disabledStyle = {
    background: "#f5f5f5",
    border: "1px solid #d9d9d9",
    color: "#999",
    boxShadow: "none",
  };

  const activeStyle = {
    background:
      "linear-gradient(135deg, #001529 0%, #3a3f5c 60%, #43cea2 100%)",
    border: "none",
    color: "white",
    boxShadow: "0 4px 12px rgba(0, 21, 41, 0.2)",
  };

  if (isDisabled) return disabledStyle;
  if (status.status === "graded") return gradedStyle;
  return activeStyle;
};
