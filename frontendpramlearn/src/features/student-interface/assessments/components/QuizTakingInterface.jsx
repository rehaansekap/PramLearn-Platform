import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Layout,
  Card,
  Button,
  Radio,
  Typography,
  Space,
  Progress,
  Modal,
  Alert,
  Spin,
  message,
} from "antd";
import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  FlagOutlined,
  SendOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import QuizTimer from "./QuizTimer";
import QuizNavigation from "./QuizNavigation";
import useStudentQuizAttempt from "../hooks/useStudentQuizAttempt";

const { Content, Sider } = Layout;
const { Title, Text } = Typography;
const { confirm } = Modal;

const QuizTakingInterface = () => {
  const { quizSlug } = useParams(); // Changed from quizId to quizSlug
  const navigate = useNavigate();
  const [siderCollapsed, setSiderCollapsed] = useState(false);
  const [submitModalVisible, setSubmitModalVisible] = useState(false);

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
  } = useStudentQuizAttempt(quizSlug); // Changed from quizId to quizSlug

  const [showManualModal, setShowManualModal] = useState(false);

  const handleSubmitQuiz = () => {
    setShowManualModal(true);
  };

  const handleManualOk = async () => {
    setShowManualModal(false);
    try {
      await submitQuiz();
      message.success("Quiz berhasil disubmit!");
      navigate(`/student/quiz/${quizSlug}/results`);
    } catch (error) {
      message.error("Gagal submit quiz");
    }
  };

  const handleManualCancel = () => {
    setShowManualModal(false);
  };

  // Auto-save answers setiap 5 detik
  useEffect(() => {
    if (!attempt?.id) return;

    const interval = setInterval(() => {
      autoSave();
    }, 5000);

    return () => clearInterval(interval);
  }, [attempt?.id, answers, autoSave]);

  // Handle auto-submit when time runs out
  useEffect(() => {
    if (timeRemaining <= 0 && !attempt?.submitted_at) {
      message.warning("Waktu habis! Quiz akan disubmit otomatis.");
      handleAutoSubmit();
    }
  }, [timeRemaining, attempt?.submitted_at]);

  const handleAutoSubmit = async () => {
    try {
      await submitQuiz();
      message.success("Quiz berhasil disubmit!");
      navigate(`/student/quiz/${quizSlug}/results`); // Changed from quizId to quizSlug
    } catch (error) {
      message.error("Gagal submit quiz");
    }
  };

  const handleAnswerChange = (questionId, selectedAnswer) => {
    setAnswer(questionId, selectedAnswer);
  };

  const handleQuestionNavigation = (direction) => {
    const newIndex =
      direction === "next"
        ? Math.min(currentQuestionIndex + 1, quiz.questions.length - 1)
        : Math.max(currentQuestionIndex - 1, 0);
    setCurrentQuestionIndex(newIndex);
  };

  // const handleSubmitQuiz = () => {
  //   console.log("Submit Quiz button clicked"); // Tambahkan log ini

  //   const answeredCount = Object.keys(answers).length;
  //   const totalQuestions = quiz.questions.length;

  //   confirm({
  //     title: "Submit Quiz",
  //     icon: <ExclamationCircleOutlined />,
  //     content: (
  //       <div>
  //         <p>Apakah Anda yakin ingin submit quiz?</p>
  //         <p>
  //           <strong>Soal terjawab:</strong> {answeredCount} dari{" "}
  //           {totalQuestions}
  //         </p>
  //         {answeredCount < totalQuestions && (
  //           <Alert
  //             message="Masih ada soal yang belum dijawab"
  //             type="warning"
  //             showIcon
  //             style={{ marginTop: 8 }}
  //           />
  //         )}
  //       </div>
  //     ),
  //     okText: "Ya, Submit",
  //     cancelText: "Batal",
  //     onOk: async () => {
  //       console.log("Modal OK clicked, submitting quiz..."); // Tambahkan log ini
  //       try {
  //         await submitQuiz();
  //         message.success("Quiz berhasil disubmit!");
  //         navigate(`/student/quiz/${quizSlug}/results`); // Changed from quizId to quizSlug
  //       } catch (error) {
  //         message.error("Gagal submit quiz");
  //       }
  //     },
  //   });
  // };

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
        <Spin size="large" tip="Memuat quiz..." />
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
        action={
          <Button onClick={() => navigate("/student/assessments")}>
            Kembali ke Daftar Quiz
          </Button>
        }
      />
    );
  }

  if (!quiz || !attempt) {
    return (
      <Alert
        message="Quiz tidak ditemukan"
        type="warning"
        showIcon
        style={{ margin: 16 }}
      />
    );
  }

  if (attempt.submitted_at) {
    return (
      <Alert
        message="Quiz sudah diselesaikan"
        description="Anda sudah menyelesaikan quiz ini sebelumnya."
        type="info"
        showIcon
        style={{ margin: 16 }}
        action={
          <Button onClick={() => navigate(`/student/quiz/${quizSlug}/results`)}>
            {" "}
            {/* Changed from quizId to quizSlug */}
            Lihat Hasil
          </Button>
        }
      />
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

  return (
    <Layout style={{ minHeight: "100vh", background: "#f0f2f5" }}>
      {/* Quiz Navigation Sidebar */}
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
        <QuizNavigation
          questions={quiz.questions}
          answers={answers}
          flaggedQuestions={flaggedQuestions}
          currentQuestionIndex={currentQuestionIndex}
          onQuestionSelect={setCurrentQuestionIndex}
          onToggleFlag={toggleQuestionFlag}
          collapsed={siderCollapsed}
        />
      </Sider>
      <Modal
        open={showManualModal}
        onOk={handleManualOk}
        onCancel={handleManualCancel}
        okText="Ya, Submit"
        cancelText="Batal"
        title="Submit Quiz"
      >
        <p>Apakah Anda yakin ingin submit quiz?</p>
        <p>
          <strong>Soal terjawab:</strong> {Object.keys(answers).length} dari{" "}
          {quiz.questions.length}
        </p>
        {Object.keys(answers).length < quiz.questions.length && (
          <Alert
            message="Masih ada soal yang belum dijawab"
            type="warning"
            showIcon
            style={{ marginTop: 8 }}
          />
        )}
      </Modal>

      {/* Main Content */}
      <Layout>
        {/* Timer Header */}
        <div
          style={{
            background: "#fff",
            padding: "16px 24px",
            borderBottom: "1px solid #f0f0f0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            position: "sticky",
            top: 0,
            zIndex: 100,
          }}
        >
          <div>
            <Title level={4} style={{ margin: 0 }}>
              {quiz.title}
            </Title>
            <Text type="secondary">
              Soal {currentQuestionIndex + 1} dari {quiz.questions.length}
            </Text>
          </div>
          <QuizTimer
            timeRemaining={timeRemaining}
            onTimeUp={handleAutoSubmit}
          />
        </div>

        <Content style={{ padding: 24 }}>
          <Card
            style={{
              maxWidth: 800,
              margin: "0 auto",
              borderRadius: 12,
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
          >
            {/* Progress Bar */}
            <Progress
              percent={progress}
              strokeColor="#1890ff"
              style={{ marginBottom: 24 }}
            />

            {/* Question */}
            <div style={{ marginBottom: 32 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 16,
                }}
              >
                <Title level={5} style={{ flex: 1 }}>
                  {currentQuestion.text}
                </Title>
                <Button
                  type={
                    flaggedQuestions.has(currentQuestion.id)
                      ? "primary"
                      : "default"
                  }
                  icon={<FlagOutlined />}
                  size="small"
                  onClick={() => toggleQuestionFlag(currentQuestion.id)}
                  style={{
                    marginLeft: 16,
                    backgroundColor: flaggedQuestions.has(currentQuestion.id)
                      ? "#faad14"
                      : undefined,
                    borderColor: flaggedQuestions.has(currentQuestion.id)
                      ? "#faad14"
                      : undefined,
                  }}
                >
                  {flaggedQuestions.has(currentQuestion.id)
                    ? "Ditandai"
                    : "Tandai"}
                </Button>
              </div>

              {/* Answer Options */}
              <Radio.Group
                value={answers[currentQuestion.id]}
                onChange={(e) =>
                  handleAnswerChange(currentQuestion.id, e.target.value)
                }
                style={{ width: "100%" }}
              >
                <Space direction="vertical" style={{ width: "100%" }}>
                  <Radio value="A" style={{ fontSize: 16, padding: "12px 0" }}>
                    A. {currentQuestion.choice_a}
                  </Radio>
                  <Radio value="B" style={{ fontSize: 16, padding: "12px 0" }}>
                    B. {currentQuestion.choice_b}
                  </Radio>
                  <Radio value="C" style={{ fontSize: 16, padding: "12px 0" }}>
                    C. {currentQuestion.choice_c}
                  </Radio>
                  <Radio value="D" style={{ fontSize: 16, padding: "12px 0" }}>
                    D. {currentQuestion.choice_d}
                  </Radio>
                </Space>
              </Radio.Group>
            </div>

            {/* Navigation Controls */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderTop: "1px solid #f0f0f0",
                paddingTop: 20,
              }}
            >
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => handleQuestionNavigation("prev")}
                disabled={currentQuestionIndex === 0}
                size="large"
              >
                Sebelumnya
              </Button>

              <Space>
                <Text type="secondary">
                  {Object.keys(answers).length} dari {quiz.questions.length}{" "}
                  soal terjawab
                </Text>
              </Space>

              {currentQuestionIndex === quiz.questions.length - 1 ? (
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  onClick={handleSubmitQuiz}
                  size="large"
                  style={{
                    backgroundColor: "#52c41a",
                    borderColor: "#52c41a",
                  }}
                >
                  Submit Quiz
                </Button>
              ) : (
                <Button
                  type="primary"
                  icon={<ArrowRightOutlined />}
                  onClick={() => handleQuestionNavigation("next")}
                  size="large"
                >
                  Selanjutnya
                </Button>
              )}
            </div>
          </Card>
        </Content>
      </Layout>
    </Layout>
  );
};

export default QuizTakingInterface;
