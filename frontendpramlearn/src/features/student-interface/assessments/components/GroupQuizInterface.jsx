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
  Avatar,
  Badge,
  Tooltip,
  Tag,
} from "antd";
import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  SendOutlined,
  UserOutlined,
  TeamOutlined,
  WifiOutlined,
  DisconnectOutlined,
} from "@ant-design/icons";
import QuizTimer from "./QuizTimer";
import useGroupQuizCollaboration from "../hooks/useGroupQuizCollaboration";
import useStudentGroup from "../../group/hooks/useStudentGroup";
import { useContext } from "react";
import { AuthContext } from "../../../../context/AuthContext";

const { Content, Sider } = Layout;
const { Title, Text } = Typography;

const GroupQuizInterface = () => {
  const { user, token } = useContext(AuthContext);
  const { quizSlug } = useParams();
  const navigate = useNavigate();
  const [siderCollapsed, setSiderCollapsed] = useState(false);
  const [submitModalVisible, setSubmitModalVisible] = useState(false);

  // Add the useStudentGroup hook
  const { groupData } = useStudentGroup();

  const {
    quiz,
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
    connectWebSocket, // Pastikan ini ada di hook
  } = useGroupQuizCollaboration(quizSlug);

  useEffect(() => {
    // Pastikan user sudah login dan connectWebSocket tersedia sebelum connect WebSocket
    if (quiz && groupData?.groupInfo && user && token && connectWebSocket) {
      console.log("Connecting to WebSocket...", {
        quizId: quiz.id,
        groupId: groupData.groupInfo.id,
      });
      connectWebSocket(quiz.id, groupData.groupInfo.id);
    }
  }, [quiz, groupData?.groupInfo, connectWebSocket, user, token]);

  // Jika user belum login, tampilkan pesan
  if (!user || !token) {
    return (
      <Alert
        message="Silakan login terlebih dahulu"
        description="Anda perlu login untuk mengakses quiz kolaborasi."
        type="warning"
        showIcon
      />
    );
  }

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

  const handleSubmitQuiz = () => {
    setSubmitModalVisible(true);
  };

  const handleSubmitConfirm = async () => {
    setSubmitModalVisible(false);
    try {
      await submitQuiz();
      message.success("Quiz berhasil disubmit!");
      navigate(`/student/quiz/${quizSlug}/results`);
    } catch (error) {
      message.error("Gagal submit quiz");
    }
  };

  const handleAutoSubmit = async () => {
    try {
      await submitQuiz();
      message.success("Quiz berhasil disubmit!");
      navigate(`/student/quiz/${quizSlug}/results`);
    } catch (error) {
      message.error("Gagal submit quiz");
    }
  };

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
        <Spin size="large" tip="Memuat quiz kelompok..." />
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

  if (!quiz) {
    return (
      <Alert
        message="Quiz tidak ditemukan"
        type="warning"
        showIcon
        style={{ margin: 16 }}
      />
    );
  }

  if (isSubmitted) {
    return (
      <Alert
        message="Quiz sudah diselesaikan"
        description="Kelompok Anda sudah menyelesaikan quiz ini sebelumnya."
        type="info"
        showIcon
        style={{ margin: 16 }}
        action={
          <Button onClick={() => navigate(`/student/quiz/${quizSlug}/results`)}>
            Lihat Hasil
          </Button>
        }
      />
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;
  const currentAnswer = answers[currentQuestion?.id];
  const answeredCount = Object.keys(answers).length;

  return (
    <Layout style={{ minHeight: "100vh", background: "#f0f2f5" }}>
      {/* Group Members Sidebar */}
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
        <div style={{ padding: 16, height: "100%", overflow: "auto" }}>
          <Title level={5} style={{ marginBottom: 16, textAlign: "center" }}>
            <TeamOutlined /> Anggota Kelompok
          </Title>

          {/* Connection Status */}
          <div style={{ marginBottom: 16, textAlign: "center" }}>
            <Tag
              color={wsConnected ? "green" : "red"}
              icon={wsConnected ? <WifiOutlined /> : <DisconnectOutlined />}
            >
              {wsConnected ? "Terhubung" : "Terputus"}
            </Tag>
          </div>

          {/* Group Members List */}
          <Space direction="vertical" style={{ width: "100%" }} size="small">
            {groupMembers.map((member) => (
              <Card
                key={member.id}
                size="small"
                style={{
                  background: member.is_current_user ? "#e6f7ff" : "#fafafa",
                  border: member.is_current_user
                    ? "2px solid #1890ff"
                    : "1px solid #d9d9d9",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Badge
                    status={
                      onlineMembers.has(member.id) ? "success" : "default"
                    }
                    dot
                  >
                    <Avatar size="small" icon={<UserOutlined />} />
                  </Badge>
                  <div style={{ flex: 1 }}>
                    <Text strong={member.is_current_user}>
                      {member.full_name}
                    </Text>
                    {member.is_current_user && (
                      <Tag color="blue" size="small" style={{ marginLeft: 4 }}>
                        Anda
                      </Tag>
                    )}
                    <br />
                    <Text type="secondary" style={{ fontSize: 11 }}>
                      {onlineMembers.has(member.id) ? "Online" : "Offline"}
                    </Text>
                  </div>
                </div>
              </Card>
            ))}
          </Space>

          {/* Quiz Progress */}
          <div
            style={{
              marginTop: 24,
              padding: 16,
              background: "#f6f6f6",
              borderRadius: 8,
            }}
          >
            <Text strong style={{ display: "block", marginBottom: 8 }}>
              Progress Quiz
            </Text>
            <Progress
              percent={progress}
              strokeColor="#1890ff"
              style={{ marginBottom: 8 }}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {answeredCount} dari {quiz.questions.length} soal terjawab
            </Text>
          </div>
        </div>
      </Sider>

      {/* Submit Confirmation Modal */}
      <Modal
        open={submitModalVisible}
        onOk={handleSubmitConfirm}
        onCancel={() => setSubmitModalVisible(false)}
        okText="Ya, Submit"
        cancelText="Batal"
        title="Submit Quiz Kelompok"
      >
        <p>Apakah Anda yakin ingin submit quiz untuk kelompok?</p>
        <p>
          <strong>Soal terjawab:</strong> {answeredCount} dari{" "}
          {quiz.questions.length}
        </p>
        {answeredCount < quiz.questions.length && (
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
            <Space>
              <Text type="secondary">
                Soal {currentQuestionIndex + 1} dari {quiz.questions.length}
              </Text>
              <Text type="secondary">•</Text>
              <Text type="secondary">Kelompok: {quiz.group?.name}</Text>
            </Space>
          </div>
          {timeRemaining !== null && (
            <QuizTimer
              timeRemaining={timeRemaining}
              onTimeUp={handleAutoSubmit}
            />
          )}
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
              <div style={{ marginBottom: 16 }}>
                <Title level={5}>{currentQuestion?.text}</Title>

                {/* Show who answered this question */}
                {currentAnswer && (
                  <div style={{ marginTop: 8 }}>
                    <Tag color="blue" size="small">
                      Dijawab oleh: {currentAnswer.student_name}(
                      {currentAnswer.selected_choice})
                    </Tag>
                  </div>
                )}
              </div>

              {/* Answer Options */}
              <Radio.Group
                value={currentAnswer?.selected_choice}
                onChange={(e) =>
                  handleAnswerChange(currentQuestion.id, e.target.value)
                }
                style={{ width: "100%" }}
              >
                <Space direction="vertical" style={{ width: "100%" }}>
                  <Radio value="A" style={{ fontSize: 16, padding: "12px 0" }}>
                    A. {currentQuestion?.choice_a}
                  </Radio>
                  <Radio value="B" style={{ fontSize: 16, padding: "12px 0" }}>
                    B. {currentQuestion?.choice_b}
                  </Radio>
                  <Radio value="C" style={{ fontSize: 16, padding: "12px 0" }}>
                    C. {currentQuestion?.choice_c}
                  </Radio>
                  <Radio value="D" style={{ fontSize: 16, padding: "12px 0" }}>
                    D. {currentQuestion?.choice_d}
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
                  {answeredCount} dari {quiz.questions.length} soal terjawab
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

export default GroupQuizInterface;
