import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  List,
  Card,
  Button,
  Typography,
  Space,
  Tag,
  Badge,
  Alert,
  Skeleton,
  Empty,
  Progress,
} from "antd";
import {
  PlayCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  TrophyOutlined,
  QuestionCircleOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import useStudentQuizzes from "./hooks/useStudentQuizzes";
import useStudentGroupQuizzes from "./hooks/useStudentGroupQuizzes"; // Import new hook

dayjs.extend(relativeTime);

const { Title, Text } = Typography;

const StudentQuizList = () => {
  const navigate = useNavigate();

  // Individual quizzes (existing)
  const {
    availableQuizzes: individualQuizzes,
    loading: individualLoading,
    error: individualError,
  } = useStudentQuizzes();

  // Group quizzes (new)
  const {
    groupQuizzes,
    loading: groupLoading,
    error: groupError,
  } = useStudentGroupQuizzes();

  const [actionLoading, setActionLoading] = useState({});

  // Combine both types of quizzes
  const allQuizzes = [
    ...(individualQuizzes || []).map((quiz) => ({
      ...quiz,
      quiz_type: "individual",
    })),
    ...(groupQuizzes || []).map((quiz) => ({ ...quiz, quiz_type: "group" })),
  ];

  const loading = individualLoading || groupLoading;
  const error = individualError || groupError;

  const handleStartQuiz = async (quiz) => {
    setActionLoading((prev) => ({ ...prev, [quiz.id]: true }));
    try {
      if (quiz.quiz_type === "group" || quiz.is_group_quiz) {
        // Navigate to group quiz interface
        navigate(`/student/group-quiz/${quiz.slug}`);
      } else {
        // Navigate to individual quiz interface
        navigate(`/student/quiz/${quiz.slug}`);
      }
    } catch (error) {
      console.error("Error starting quiz:", error);
    } finally {
      setActionLoading((prev) => ({ ...prev, [quiz.id]: false }));
    }
  };

  const getQuizStatus = (quiz) => {
    // For group quizzes
    if (quiz.quiz_type === "group") {
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

    // For individual quizzes (existing logic)
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

  const getTimeRemaining = (endTime) => {
    if (!endTime) return null;
    const now = dayjs();
    const end = dayjs(endTime);
    if (now.isAfter(end)) return "Expired";
    return end.fromNow();
  };

  const getButtonAction = (quiz) => {
    const status = getQuizStatus(quiz);

    if (status.status === "completed") {
      return {
        text: "Lihat Hasil",
        type: "default",
        icon: <TrophyOutlined />,
        onClick: () => {
          if (quiz.quiz_type === "group" || quiz.is_group_quiz) {
            navigate(`/student/group-quiz/${quiz.slug}/results`);
          } else {
            navigate(`/student/quiz/${quiz.slug}/results`);
          }
        },
      };
    }

    if (status.status === "in_progress") {
      return {
        text: "Lanjutkan",
        type: "primary",
        icon: <PlayCircleOutlined />,
        onClick: () => handleStartQuiz(quiz),
      };
    }

    return {
      text: "Mulai Quiz",
      type: "primary",
      icon: <PlayCircleOutlined />,
      onClick: () => handleStartQuiz(quiz),
    };
  };

  if (loading) {
    return (
      <div style={{ maxWidth: 800, margin: "0 auto", padding: 16 }}>
        <Skeleton active paragraph={{ rows: 6 }} />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Gagal memuat quiz"
        description={error.message}
        type="error"
        showIcon
        style={{ margin: 16 }}
      />
    );
  }

  if (!allQuizzes || allQuizzes.length === 0) {
    return (
      <div style={{ maxWidth: 800, margin: "0 auto", padding: 16 }}>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Tidak ada quiz yang tersedia"
        />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: 16 }}>
      <Title level={3} style={{ textAlign: "center", marginBottom: 24 }}>
        📝 Quiz Tersedia
      </Title>

      <List
        grid={{ gutter: 16, xs: 1, sm: 1, md: 1, lg: 1, xl: 1 }}
        dataSource={allQuizzes}
        renderItem={(quiz) => {
          const status = getQuizStatus(quiz);
          const buttonAction = getButtonAction(quiz);
          const timeRemaining = getTimeRemaining(quiz.end_time);

          return (
            <List.Item>
              <Badge.Ribbon
                text={status.text}
                color={status.color}
                placement="start"
              >
                <Card
                  hoverable
                  style={{
                    borderRadius: 12,
                    border: `2px solid ${
                      status.status === "available" ? "#1890ff" : "#d9d9d9"
                    }`,
                  }}
                >
                  <Space direction="vertical" style={{ width: "100%" }}>
                    {/* Quiz Title */}
                    <Title level={4} style={{ margin: 0, color: "#11418b" }}>
                      {quiz.title}
                    </Title>

                    {/* Quiz Type & Info */}
                    <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                      <Tag icon={<QuestionCircleOutlined />} color="blue">
                        {quiz.questions || 0} Soal
                      </Tag>

                      {/* Quiz Type Tag */}
                      {quiz.quiz_type === "group" || quiz.is_group_quiz ? (
                        <Tag icon={<TeamOutlined />} color="purple">
                          Quiz Kelompok: {quiz.group_name}
                        </Tag>
                      ) : (
                        <Tag color="green">Quiz Individual</Tag>
                      )}

                      {timeRemaining && (
                        <Tag
                          icon={<ClockCircleOutlined />}
                          color={timeRemaining === "Expired" ? "red" : "orange"}
                        >
                          {timeRemaining === "Expired"
                            ? "Waktu Habis"
                            : `Berakhir ${timeRemaining}`}
                        </Tag>
                      )}
                    </div>

                    {/* Score Display */}
                    {((quiz.quiz_type === "group" &&
                      quiz.score !== undefined) ||
                      (quiz.quiz_type !== "group" &&
                        quiz.student_attempt?.score !== undefined)) && (
                      <div>
                        <Text strong>
                          Skor:{" "}
                          {quiz.quiz_type === "group"
                            ? quiz.score?.toFixed(1) || "N/A"
                            : quiz.student_attempt?.score?.toFixed(1) || "N/A"}
                          /100
                        </Text>
                        <Progress
                          percent={
                            quiz.quiz_type === "group"
                              ? quiz.score
                              : quiz.student_attempt?.score
                          }
                          status={
                            (quiz.quiz_type === "group"
                              ? quiz.score
                              : quiz.student_attempt?.score) >= 70
                              ? "success"
                              : "exception"
                          }
                          strokeColor={
                            (quiz.quiz_type === "group"
                              ? quiz.score
                              : quiz.student_attempt?.score) >= 70
                              ? "#52c41a"
                              : "#ff4d4f"
                          }
                          style={{ marginTop: 4 }}
                        />
                      </div>
                    )}
                  </Space>

                  {/* Action Button */}
                  <Button
                    {...buttonAction}
                    size="large"
                    block
                    loading={actionLoading[quiz.id]}
                    disabled={
                      timeRemaining === "Expired" &&
                      status.status === "available"
                    }
                    style={{
                      height: 45,
                      fontSize: 16,
                      fontWeight: 600,
                      borderRadius: 8,
                      marginTop: 16,
                    }}
                  >
                    {buttonAction.text}
                  </Button>

                  {/* Completion Info */}
                  {((quiz.quiz_type === "group" && quiz.completed_at) ||
                    (quiz.quiz_type !== "group" &&
                      quiz.student_attempt?.submitted_at)) && (
                    <Text
                      type="secondary"
                      style={{
                        display: "block",
                        textAlign: "center",
                        marginTop: 8,
                        fontSize: 12,
                      }}
                    >
                      Diselesaikan:{" "}
                      {dayjs(
                        quiz.quiz_type === "group"
                          ? quiz.completed_at
                          : quiz.student_attempt.submitted_at
                      ).format("DD MMM YYYY, HH:mm")}
                    </Text>
                  )}
                </Card>
              </Badge.Ribbon>
            </List.Item>
          );
        }}
      />
    </div>
  );
};

export default StudentQuizList;
