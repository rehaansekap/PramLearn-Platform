import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout, Alert, Spin, message } from "antd";
import { AuthContext } from "../../../../../context/AuthContext";
import { useOnlineStatus } from "../../../../../context/OnlineStatusContext";
import useGroupQuizCollaboration from "../../hooks/useGroupQuizCollaboration";
import GroupQuizHeader from "./GroupQuizHeader";
import GroupQuizSidebar from "./GroupQuizSidebar";
import GroupQuizQuestionCard from "./GroupQuizQuestionCard";
import GroupQuizSubmitModal from "./GroupQuizSubmitModal";

const { Content } = Layout;

const GroupQuizInterface = () => {
  const { isUserOnline } = useOnlineStatus();
  const { quizSlug } = useParams();
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [submitModalVisible, setSubmitModalVisible] = useState(false);

  const {
    quiz,
    groupId,
    currentQuestionIndex,
    answers,
    loading,
    error,
    timeRemaining,
    groupMembers,
    onlineMembers,
    isSubmitted,
    wsConnected,
    setCurrentQuestionIndex,
    setAnswer,
    submitQuiz,
    connectWebSocket,
  } = useGroupQuizCollaboration(quizSlug);

  useEffect(() => {
    if (quiz && groupId && user && token && connectWebSocket) {
      connectWebSocket(quiz.id, groupId);
    }
  }, [quiz, groupId, user, token, connectWebSocket]);

  if (!user || !token) {
    return (
      <Alert
        message="Silakan login terlebih dahulu"
        description="Anda perlu login untuk mengakses kuis kelompok."
        type="warning"
        showIcon
      />
    );
  }

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <Spin size="large" tip="Memuat kuis kelompok..." />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 16px" }}>
        <Alert
          message="Gagal memuat kuis"
          description={error.message}
          type="error"
          showIcon
          action={
            <button
              className="ant-btn"
              onClick={() => navigate("/student/assessments")}
            >
              Kembali ke Daftar Kuis
            </button>
          }
        />
      </div>
    );
  }

  if (!quiz || !Array.isArray(quiz.questions) || quiz.questions.length === 0) {
    return (
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 16px" }}>
        <Alert
          message="Kuis tidak ditemukan atau tidak memiliki soal"
          type="warning"
          showIcon
        />
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 16px" }}>
        <Alert
          message="Kuis sudah diselesaikan"
          description="Kelompok Anda sudah menyelesaikan kuis ini sebelumnya."
          type="info"
          showIcon
          action={
            <button
              className="ant-btn"
              onClick={() =>
                navigate(`/student/group-quiz/${quizSlug}/results`)
              }
            >
              Lihat Hasil
            </button>
          }
        />
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;
  const currentAnswer = answers[currentQuestion?.id];
  const answeredCount = Object.keys(answers).length;

  // Submit handlers
  const handleSubmitQuiz = () => setSubmitModalVisible(true);
  const handleSubmitConfirm = async () => {
    setSubmitModalVisible(false);
    try {
      await submitQuiz();
      message.success("Kuis berhasil disubmit!");
    } catch (error) {
      message.error("Gagal submit kuis");
    }
  };
  const handleAutoSubmit = async () => {
    try {
      await submitQuiz();
      message.success("Kuis berhasil disubmit!");
    } catch (error) {
      message.error("Gagal submit kuis");
    }
  };

  // Navigasi soal
  const handleQuestionNavigation = (direction) => {
    const newIndex =
      direction === "next"
        ? Math.min(currentQuestionIndex + 1, quiz.questions.length - 1)
        : Math.max(currentQuestionIndex - 1, 0);
    setCurrentQuestionIndex(newIndex);
  };

  return (
    <div
      style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "24px 16px",
        minHeight: "calc(100vh - 64px)",
      }}
    >
      <GroupQuizHeader
        quiz={quiz}
        currentQuestionIndex={currentQuestionIndex}
        timeRemaining={timeRemaining}
        onTimeUp={handleAutoSubmit}
      />

      <div style={{ marginBottom: 24 }}>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            gap: 24,
            flexWrap: "wrap",
          }}
        >
          <div style={{ flex: 1, minWidth: 320, maxWidth: 400 }}>
            <GroupQuizSidebar
              wsConnected={wsConnected}
              groupMembers={groupMembers}
              isUserOnline={isUserOnline}
              answeredCount={answeredCount}
              totalQuestions={quiz.questions.length}
              progress={progress}
            />
          </div>
          <div style={{ flex: 2, minWidth: 320 }}>
            <GroupQuizQuestionCard
              quiz={quiz}
              currentQuestion={currentQuestion}
              currentQuestionIndex={currentQuestionIndex}
              answers={answers}
              currentAnswer={currentAnswer}
              answeredCount={answeredCount}
              onAnswerChange={setAnswer}
              onPrev={() => handleQuestionNavigation("prev")}
              onNext={() => handleQuestionNavigation("next")}
              onSubmit={handleSubmitQuiz}
            />
          </div>
        </div>
      </div>

      <GroupQuizSubmitModal
        visible={submitModalVisible}
        onOk={handleSubmitConfirm}
        onCancel={() => setSubmitModalVisible(false)}
        answeredCount={answeredCount}
        totalQuestions={quiz.questions.length}
        progress={progress}
      />
    </div>
  );
};

export default GroupQuizInterface;
