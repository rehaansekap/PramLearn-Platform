import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Layout, Spin, Alert } from "antd";
import QuizSidebar from "./QuizSidebar";
import QuizQuestionCard from "./QuizQuestionCard";
import QuizSubmitModal from "./QuizSubmitModal";
import useStudentQuizAttempt from "../../hooks/useStudentQuizAttempt";

const { Content, Sider } = Layout;

const QuizTakingInterface = () => {
  const { quizSlug } = useParams();
  const navigate = useNavigate();
  const [siderCollapsed, setSiderCollapsed] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  const {
    quiz,
    attempt,
    answers,
    currentQuestionIndex,
    flaggedQuestions,
    loading,
    error,
    timeRemaining,
    setCurrentQuestionIndex,
    setAnswer,
    toggleQuestionFlag,
    submitQuiz,
    autoSave,
  } = useStudentQuizAttempt(quizSlug);

  useEffect(() => {
    if (!loading && quiz && quiz.is_active === false) {
      message.warning("Quiz ini tidak aktif.");
      navigate("/student/assessments", { replace: true });
    }
    // Jika ada expired flag, tambahkan pengecekan di sini juga
  }, [quiz, loading, navigate]);

  // Auto-save jawaban setiap 5 detik
  useEffect(() => {
    if (!attempt?.id) return;
    const interval = setInterval(autoSave, 5000);
    return () => clearInterval(interval);
  }, [attempt?.id, autoSave]);

  // Auto-submit jika waktu habis
  useEffect(() => {
    if (timeRemaining <= 0 && !attempt?.submitted_at) {
      handleAutoSubmit();
    }
    // eslint-disable-next-line
  }, [timeRemaining, attempt?.submitted_at]);

  const handleAutoSubmit = async () => {
    try {
      await submitQuiz();
      navigate(`/student/quiz/${quizSlug}/results`);
    } catch (error) {
      // Error sudah dihandle di hook
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

  // Loading
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
        <Spin size="large" tip="Memuat kuis..." />
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <Alert
        message="Gagal memuat kuis"
        description={error.message}
        type="error"
        showIcon
        style={{ margin: 16 }}
        action={
          <button
            className="ant-btn"
            onClick={() => navigate("/student/assessments")}
          >
            Kembali ke Daftar Kuis
          </button>
        }
      />
    );
  }

  // Tidak ditemukan
  if (!quiz || !attempt) {
    return (
      <Alert
        message="Kuis tidak ditemukan"
        type="warning"
        showIcon
        style={{ margin: 16 }}
      />
    );
  }

  // Sudah submit
  if (attempt.submitted_at) {
    return (
      <Alert
        message="Kuis sudah diselesaikan"
        description="Anda sudah menyelesaikan kuis ini sebelumnya."
        type="info"
        showIcon
        style={{ margin: 16 }}
        action={
          <button
            className="ant-btn"
            onClick={() => navigate(`/student/quiz/${quizSlug}/results`)}
          >
            Lihat Hasil
          </button>
        }
      />
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];

  return (
    <>
      <Helmet>
        <title>Pengerjaan Quiz | PramLearn</title>
      </Helmet>
      <Layout style={{ minHeight: "100vh" }}>
        {/* Sidebar Navigasi Soal */}
        <Sider
          collapsible
          collapsed={siderCollapsed}
          onCollapse={setSiderCollapsed}
          width={280}
          style={{
            background: "#fff",
            boxShadow: "2px 0 8px rgba(0,0,0,0.1)",
          }}
          breakpoint="lg"
          collapsedWidth={0}
        >
          <QuizSidebar
            questions={quiz.questions}
            answers={answers}
            flaggedQuestions={flaggedQuestions}
            currentQuestionIndex={currentQuestionIndex}
            onQuestionSelect={setCurrentQuestionIndex}
            onToggleFlag={toggleQuestionFlag}
            collapsed={siderCollapsed}
          />
        </Sider>

        {/* Modal Submit */}
        <QuizSubmitModal
          visible={showSubmitModal}
          onOk={async () => {
            setShowSubmitModal(false);
            await submitQuiz();
            navigate(`/student/quiz/${quizSlug}/results`);
          }}
          onCancel={() => setShowSubmitModal(false)}
          answeredCount={Object.keys(answers).length}
          totalQuestions={quiz.questions.length}
        />

        {/* Main Content */}
        <Layout>
          <Content style={{ padding: 0 }}>
            <QuizQuestionCard
              quiz={quiz}
              currentQuestion={currentQuestion}
              currentQuestionIndex={currentQuestionIndex}
              answers={answers}
              flaggedQuestions={flaggedQuestions}
              timeRemaining={timeRemaining}
              onAnswerChange={setAnswer}
              onFlagToggle={toggleQuestionFlag}
              onPrev={() => handleQuestionNavigation("prev")}
              onNext={() => handleQuestionNavigation("next")}
              onSubmit={() => setShowSubmitModal(true)}
            />
          </Content>
        </Layout>
      </Layout>
    </>
  );
};

export default QuizTakingInterface;
