import {
  CheckCircleOutlined,
  PlayCircleOutlined,
  ClockCircleOutlined,
  TrophyOutlined,
} from "@ant-design/icons";

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

export const getButtonAction = (quiz, status, navigate) => {
  if (status.status === "completed") {
    return {
      text: "Lihat Hasil",
      type: "default",
      icon: <TrophyOutlined />,
      onClick: () =>
        navigate(
          quiz.is_group_quiz
            ? `/student/group-quiz/${quiz.slug}/results`
            : `/student/quiz/${quiz.slug}/results`,
          { replace: true }
        ),
      style: {
        background:
          "linear-gradient(135deg, #ffec3d 0%, #faad14 50%, #ff8c00 100%)",
        borderColor: "transparent",
        color: "#fff",
        fontWeight: 600,
        boxShadow: "0 4px 12px rgba(255, 173, 20, 0.4)",
        textShadow: "0 1px 2px rgba(0,0,0,0.2)",
      },
    };
  }

  if (status.status === "in_progress") {
    return {
      text: "Lanjutkan Quiz",
      type: "primary",
      icon: <PlayCircleOutlined />,
      onClick: () =>
        navigate(
          quiz.is_group_quiz
            ? `/student/group-quiz/${quiz.slug}`
            : `/student/quiz/${quiz.slug}`,
          { replace: true }
        ),
      style: {
        background:
          "linear-gradient(135deg, #001529 0%, #3a3f5c 60%, #43cea2 100%)",
      },
    };
  }

  return {
    text: "Mulai Quiz",
    type: "primary",
    icon: <PlayCircleOutlined />,
    onClick: () =>
      navigate(
        quiz.is_group_quiz
          ? `/student/group-quiz/${quiz.slug}`
          : `/student/quiz/${quiz.slug}`,
        { replace: true }
      ),
  };
};
