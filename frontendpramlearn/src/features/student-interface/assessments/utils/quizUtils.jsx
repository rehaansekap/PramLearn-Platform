import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  PlayCircleOutlined,
} from "@ant-design/icons";

dayjs.extend(duration);

export const getQuizStatus = (quiz) => {
  if (quiz.quiz_type === "group" || quiz.is_group_quiz) {
    if (quiz.is_completed) {
      return {
        status: "completed",
        color: "success",
        text: "Selesai",
        icon: <CheckCircleOutlined />,
      };
    }
    return {
      status: "available",
      color: "default",
      text: "Tersedia",
      icon: <PlayCircleOutlined />,
    };
  }

  if (quiz.student_attempt?.submitted_at) {
    return {
      status: "completed",
      color: "success",
      text: "Selesai",
      icon: <CheckCircleOutlined />,
    };
  }
  if (quiz.student_attempt?.start_time) {
    return {
      status: "in_progress",
      color: "processing",
      text: "Sedang Dikerjakan",
      icon: <ClockCircleOutlined />,
    };
  }
  return {
    status: "available",
    color: "default",
    text: "Tersedia",
    icon: <PlayCircleOutlined />,
  };
};

export const getTimeRemaining = (endTime, currentTime) => {
  if (!endTime) return null;
  const end = dayjs(endTime);
  if (currentTime.isAfter(end)) return "EXPIRED";

  const diff = end.diff(currentTime);
  const duration = dayjs.duration(diff);
  const hours = String(Math.floor(duration.asHours())).padStart(2, "0");
  const minutes = String(duration.minutes()).padStart(2, "0");
  const seconds = String(duration.seconds()).padStart(2, "0");

  return `${hours}:${minutes}:${seconds}`;
};

export const getTimeColor = (endTime, currentTime) => {
  if (!endTime) return "default";
  const end = dayjs(endTime);
  const diff = end.diff(currentTime);
  const totalMinutes = Math.floor(diff / (1000 * 60));

  if (totalMinutes <= 30) return "#ff4d4f";
  if (totalMinutes <= 60) return "#fa8c16";
  if (totalMinutes <= 180) return "#faad14";
  return "#52c41a";
};

export const getSubjectName = (quiz) => {
  return (
    quiz.subject_name ||
    quiz.subject?.name ||
    quiz.material?.subject?.name ||
    quiz.material_subject_name ||
    quiz.class_subject_name ||
    quiz.course_name ||
    quiz.course?.name ||
    (quiz.is_group_quiz && "Mata Pelajaran") ||
    "Mata Pelajaran"
  );
};

export const getMaterialName = (quiz) => {
  return (
    quiz.material_name ||
    quiz.material_title ||
    quiz.material?.title ||
    quiz.material?.name ||
    quiz.chapter_name ||
    quiz.lesson_name ||
    (quiz.is_group_quiz && quiz.title.includes("Quiz")
      ? quiz.title.replace("Quiz", "Materi")
      : null)
  );
};
