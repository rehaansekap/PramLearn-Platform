import {
  TrophyOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  EditOutlined,
} from "@ant-design/icons";

export const getStatusIcon = (status) => {
  switch (status.status) {
    case "graded":
      return <TrophyOutlined style={{ color: "#52c41a" }} />;
    case "submitted":
      return <CheckCircleOutlined style={{ color: "#1890ff" }} />;
    case "overdue":
      return <ExclamationCircleOutlined style={{ color: "#ff4d4f" }} />;
    default:
      return <EditOutlined style={{ color: "#faad14" }} />;
  }
};

export const getStatusColor = (status) => {
  switch (status.status) {
    case "graded":
      return "success";
    case "submitted":
      return "processing";
    case "overdue":
      return "error";
    case "available":
      return "warning";
    default:
      return "default";
  }
};

export const getButtonText = (status, assignment) => {
  switch (status.status) {
    case "available":
      return "Mulai Tugas";
    case "submitted":
      return "Lihat Pengumpulan";
    case "graded":
      return "Lihat Nilai & Umpan Balik";
    case "overdue":
      return assignment.allow_late_submission
        ? "Kirim Terlambat"
        : "Waktu Habis";
    default:
      return "Lihat Tugas";
  }
};

export const getAssignmentSlug = (assignment) => {
  return (
    assignment.slug ||
    assignment.title
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
  );
};
