import React, { useState } from "react";
import {
  Card,
  List,
  Button,
  Tag,
  Typography,
  Space,
  Avatar,
  Progress,
  Badge,
  Empty,
  Skeleton,
  Alert,
} from "antd";
import {
  PlayCircleOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  TrophyOutlined,
  TeamOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import useStudentQuizzes from "./hooks/useStudentQuizzes";

dayjs.extend(relativeTime);

const { Title, Text } = Typography;

const StudentQuizList = () => {
  const navigate = useNavigate();
  const { availableQuizzes, loading, error } = useStudentQuizzes();
  const [actionLoading, setActionLoading] = useState({});

  const handleStartQuiz = async (quiz) => {
    setActionLoading((prev) => ({ ...prev, [quiz.id]: true }));
    try {
      // Navigate ke quiz interface using slug
      navigate(`/student/quiz/${quiz.slug}`); // Changed from quiz.id to quiz.slug
    } catch (error) {
      console.error("Error starting quiz:", error);
    } finally {
      setActionLoading((prev) => ({ ...prev, [quiz.id]: false }));
    }
  };

  const getQuizStatus = (quiz) => {
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
        onClick: () => navigate(`/student/quiz/${quiz.slug}/results`), // Changed from quiz.id to quiz.slug
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

  if (!availableQuizzes || availableQuizzes.length === 0) {
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
        dataSource={availableQuizzes}
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
                  bodyStyle={{ padding: 20 }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: 16,
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <Title level={4} style={{ margin: 0, marginBottom: 8 }}>
                        {quiz.title}
                      </Title>
                      <Text type="secondary" style={{ display: "block" }}>
                        {quiz.content}
                      </Text>
                    </div>
                    <Avatar
                      size="large"
                      style={{
                        backgroundColor:
                          status.color === "success" ? "#52c41a" : "#1890ff",
                        marginLeft: 16,
                      }}
                      icon={status.icon}
                    />
                  </div>

                  {/* Quiz Info */}
                  <Space
                    direction="vertical"
                    style={{ width: "100%", marginBottom: 16 }}
                  >
                    <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                      <Tag icon={<QuestionCircleOutlined />} color="blue">
                        {quiz.questions?.length || 0} Soal
                      </Tag>
                      <Tag icon={<TeamOutlined />} color="green">
                        Kelompok: {quiz.group_name}
                      </Tag>
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

                    {quiz.student_attempt?.score !== undefined && (
                      <div>
                        <Text strong>
                          Skor: {quiz.student_attempt.score.toFixed(1)}/100
                        </Text>
                        <Progress
                          percent={quiz.student_attempt.score}
                          status={
                            quiz.student_attempt.score >= 70
                              ? "success"
                              : "exception"
                          }
                          strokeColor={
                            quiz.student_attempt.score >= 70
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
                    }}
                  >
                    {buttonAction.text}
                  </Button>

                  {quiz.student_attempt?.submitted_at && (
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
                      {dayjs(quiz.student_attempt.submitted_at).format(
                        "DD MMM YYYY, HH:mm"
                      )}
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
