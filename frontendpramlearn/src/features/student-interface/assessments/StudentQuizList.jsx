import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, List, Space, Typography, Empty, Spin, Alert } from "antd";
import { BookOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";

import useStudentQuizzes from "./hooks/useStudentQuizzes";
import useStudentGroupQuizzes from "./hooks/useStudentGroupQuizzes";
import useQuizStatistics from "./hooks/useQuizStatistics";
import {
  getQuizStatus,
  getTimeRemaining,
  getTimeColor,
} from "./utils/quizUtils";

import QuizListHeader from "./components/header/QuizListHeader";
import QuizStatisticsCards from "./components/stats/QuizStatisticsCards";
import QuizCard from "./components/card/QuizCard";

dayjs.extend(duration);

const { Text } = Typography;

const StudentQuizList = () => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(dayjs());

  // Data fetching hooks
  const {
    availableQuizzes: individualQuizzes,
    loading: individualLoading,
    error: individualError,
  } = useStudentQuizzes();

  const {
    groupQuizzes,
    loading: groupLoading,
    error: groupError,
  } = useStudentGroupQuizzes();

  // Combine all quizzes
  const allQuizzes = [...(individualQuizzes || []), ...(groupQuizzes || [])];

  // Statistics hook
  const statistics = useQuizStatistics(allQuizzes, getQuizStatus);

  // Real-time timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(dayjs());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Quiz navigation
  const handleStartQuiz = (quiz) => {
    if (quiz.is_group_quiz && quiz.is_completed) {
      navigate(`/student/group-quiz/${quiz.slug}/results`);
    } else if (quiz.quiz_type === "group" || quiz.is_group_quiz) {
      navigate(`/student/group-quiz/${quiz.slug}`);
    } else {
      navigate(`/student/quiz/${quiz.slug}`);
    }
  };

  // Loading state
  if (individualLoading || groupLoading) {
    return (
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "24px 16px",
          minHeight: "calc(100vh - 64px)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "60vh",
          }}
        >
          <Spin size="large" tip="Memuat kuis..." />
        </div>
      </div>
    );
  }

  // Error state
  if (individualError || groupError) {
    return (
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "24px 16px",
          minHeight: "calc(100vh - 64px)",
        }}
      >
        <Alert
          message="Gagal memuat kuis"
          description={
            individualError?.message ||
            groupError?.message ||
            "Terjadi kesalahan saat mengambil data kuis."
          }
          type="error"
          showIcon
          style={{ borderRadius: 12 }}
        />
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "24px 16px",
        minHeight: "calc(100vh - 64px)",
      }}
    >
      {/* Header */}
      <QuizListHeader totalQuizzes={allQuizzes.length} />

      {/* Statistics Cards */}
      <QuizStatisticsCards statistics={statistics} />

      {/* Quiz List */}
      <Card
        title={
          <Space>
            <BookOutlined style={{ color: "#11418b" }} />
            <span>Daftar Kuis & Penilaian</span>
          </Space>
        }
        style={{
          borderRadius: 16,
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}
        styles={{
          header: {
            borderBottom: "1px solid #f0f0f0",
            background: "#fafafa",
          },
        }}
      >
        {allQuizzes.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 24px" }}>
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <div>
                  <Text style={{ fontSize: 16, color: "#666" }}>
                    Belum ada kuis tersedia
                  </Text>
                  <div style={{ marginTop: 12 }}>
                    <Text type="secondary" style={{ fontSize: 14 }}>
                      Kuis akan tersedia setelah ditambahkan oleh guru
                    </Text>
                  </div>
                </div>
              }
            />
          </div>
        ) : (
          <List
            grid={{
              gutter: 16,
              xs: 1,
              sm: 1,
              md: 1,
              lg: 2,
              xl: 2,
              xxl: 3,
            }}
            dataSource={allQuizzes}
            renderItem={(quiz) => {
              const status = getQuizStatus(quiz);
              const timeRemaining = getTimeRemaining(
                quiz.end_time,
                currentTime
              );
              const timeColor = getTimeColor(quiz.end_time, currentTime);

              return (
                <QuizCard
                  quiz={quiz}
                  status={status}
                  timeRemaining={timeRemaining}
                  timeColor={timeColor}
                  onStartQuiz={handleStartQuiz}
                />
              );
            }}
          />
        )}
      </Card>
    </div>
  );
};

export default StudentQuizList;
