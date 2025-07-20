import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Layout, Alert, Spin, message, Grid } from "antd";
import { AuthContext } from "../../../../../context/AuthContext";
import { useOnlineStatus } from "../../../../../context/OnlineStatusContext";
import useGroupQuizCollaboration from "../../hooks/useGroupQuizCollaboration";
import GroupQuizHeader from "./GroupQuizHeader";
import GroupQuizSidebar from "./GroupQuizSidebar";
import GroupQuizQuestionCard from "./GroupQuizQuestionCard";
import GroupQuizSubmitModal from "./GroupQuizSubmitModal";
import GroupQuizNavigation from "./GroupQuizNavigation";
import GroupQuizChatManager from "./chat/GroupQuizChatManager";

const { Content, Sider } = Layout;
const { useBreakpoint } = Grid;

const GroupQuizInterface = () => {
  const { isUserOnline } = useOnlineStatus();
  const { quizSlug } = useParams();
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const [submitModalVisible, setSubmitModalVisible] = useState(false);
  const [siderCollapsed, setSiderCollapsed] = useState(isMobile);

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

  // Auto collapse sidebar on mobile
  useEffect(() => {
    setSiderCollapsed(isMobile);
  }, [isMobile]);

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
        minHeight: "100vh",
        background: "#fff",
        position: "relative", // ← TAMBAHKAN INI untuk floating button
      }}
    >
      <Helmet>
        <title>Pengerjaan Quiz Kelompok | PramLearn</title>
      </Helmet>

      <div
        style={{
          maxWidth: isMobile ? "100%" : 1400,
          margin: "0 auto",
          padding: isMobile ? "16px 8px" : "24px 16px",
        }}
      >
        <GroupQuizHeader
          quiz={quiz}
          currentQuestionIndex={currentQuestionIndex}
          timeRemaining={timeRemaining}
          onTimeUp={handleAutoSubmit}
        />

        {isMobile ? (
          // Mobile Layout - Stack vertically
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Mobile Navigation - Collapsible */}
            <div
              style={{
                background: "#fff",
                borderRadius: 12,
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                overflow: "hidden",
              }}
            >
              <GroupQuizNavigation
                questions={quiz.questions}
                answers={answers}
                currentQuestionIndex={currentQuestionIndex}
                onQuestionSelect={setCurrentQuestionIndex}
                collapsed={false}
                isMobile={true}
              />
            </div>

            {/* Mobile Question Card */}
            <div>
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

            {/* Mobile Group Sidebar */}
            <div style={{ marginBottom: 100 }}>
              {" "}
              {/* ← TAMBAH MARGIN BOTTOM untuk floating button */}
              <GroupQuizSidebar
                wsConnected={wsConnected}
                groupMembers={groupMembers}
                isUserOnline={isUserOnline}
                answeredCount={answeredCount}
                totalQuestions={quiz.questions.length}
                progress={progress}
                isMobile={true}
              />
            </div>
          </div>
        ) : (
          // Desktop Layout - Original layout
          <Layout style={{ background: "transparent" }}>
            {/* Sidebar Navigasi Soal */}
            <Sider
              collapsible
              collapsed={siderCollapsed}
              onCollapse={setSiderCollapsed}
              width={300}
              style={{
                background: "#fff",
                boxShadow: "2px 0 8px rgba(0,0,0,0.1)",
                borderRadius: 12,
                overflow: "hidden",
                marginRight: 16,
                height: "100%",
                paddingTop: 16,
                paddingBottom: 16,
              }}
              breakpoint="lg"
              collapsedWidth={0}
            >
              <GroupQuizNavigation
                questions={quiz.questions}
                answers={answers}
                currentQuestionIndex={currentQuestionIndex}
                onQuestionSelect={setCurrentQuestionIndex}
                collapsed={siderCollapsed}
                isMobile={false}
              />
            </Sider>

            {/* Main Content Area */}
            <Layout style={{ background: "transparent" }}>
              <Content style={{ padding: 0 }}>
                <div
                  style={{
                    display: "flex",
                    gap: 16,
                    alignItems: "flex-start",
                  }}
                >
                  {/* Question Card - Area Utama */}
                  <div style={{ flex: 1 }}>
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

                  {/* Sidebar Kelompok - Area Kanan */}
                  <div style={{ width: 320, flexShrink: 0 }}>
                    <GroupQuizSidebar
                      wsConnected={wsConnected}
                      groupMembers={groupMembers}
                      isUserOnline={isUserOnline}
                      answeredCount={answeredCount}
                      totalQuestions={quiz.questions.length}
                      progress={progress}
                      isMobile={false}
                    />
                  </div>
                </div>
              </Content>
            </Layout>
          </Layout>
        )}

        <GroupQuizSubmitModal
          visible={submitModalVisible}
          onOk={handleSubmitConfirm}
          onCancel={() => setSubmitModalVisible(false)}
          answeredCount={answeredCount}
          totalQuestions={quiz.questions.length}
          progress={progress}
        />
      </div>

      {/* ← TAMBAHKAN CHAT MANAGER DI SINI */}
      {quiz?.material?.slug && (
        <GroupQuizChatManager materialSlug={quiz.material.slug} />
      )}
    </div>
  );
};

export default GroupQuizInterface;
