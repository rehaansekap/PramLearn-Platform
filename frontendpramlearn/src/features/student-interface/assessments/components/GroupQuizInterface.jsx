import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Layout,
  Card,
  Button,
  Typography,
  Space,
  Alert,
  Modal,
  Radio,
  Tag,
  Progress,
  Avatar,
  Badge,
  Tooltip,
  Row,
  Col,
  Breadcrumb,
  Grid,
  message,
  Spin,
} from "antd";
import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  SendOutlined,
  TeamOutlined,
  UserOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  QuestionCircleOutlined,
  WifiOutlined,
  DisconnectOutlined,
  HomeOutlined,
  FileTextOutlined,
  TrophyOutlined,
  PlayCircleOutlined,
  FlagOutlined,
} from "@ant-design/icons";
import { AuthContext } from "../../../../context/AuthContext";
import useGroupQuizCollaboration from "../hooks/useGroupQuizCollaboration";
import QuizTimer from "./QuizTimer";
import { useOnlineStatus } from "../../../../context/OnlineStatusContext";

const { Content } = Layout;
const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

const GroupQuizInterface = () => {
  const { isUserOnline, userStatuses } = useOnlineStatus();
  const { quizSlug } = useParams();
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const screens = useBreakpoint();
  const isMobile = !screens.md;

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
      console.log("🔗 Connecting to WebSocket...", {
        quizId: quiz.id,
        groupId: groupId,
      });
      connectWebSocket(quiz.id, groupId);
    }
  }, [quiz, groupId, user, token, connectWebSocket]);

  // Jika user belum login
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
    } catch (error) {
      message.error("Gagal submit quiz");
    }
  };

  const handleAutoSubmit = async () => {
    try {
      await submitQuiz();
      message.success("Quiz berhasil disubmit!");
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
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "24px 16px",
        }}
      >
        <Alert
          message="Gagal memuat quiz"
          description={error.message}
          type="error"
          showIcon
          action={
            <Button onClick={() => navigate("/student/assessments")}>
              Kembali ke Daftar Quiz
            </Button>
          }
        />
      </div>
    );
  }

  if (!quiz) {
    return (
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "24px 16px",
        }}
      >
        <Alert message="Quiz tidak ditemukan" type="warning" showIcon />
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "24px 16px",
        }}
      >
        <Alert
          message="Quiz sudah diselesaikan"
          description="Kelompok Anda sudah menyelesaikan quiz ini sebelumnya."
          type="info"
          showIcon
          action={
            <Button
              onClick={() =>
                navigate(`/student/group-quiz/${quizSlug}/results`)
              }
            >
              Lihat Hasil
            </Button>
          }
        />
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;
  const currentAnswer = answers[currentQuestion?.id];
  const answeredCount = Object.keys(answers).length;

  // Helper functions untuk question grid
  const getQuestionStatus = (questionIndex) => {
    const question = quiz.questions[questionIndex];
    const isAnswered = answers[question.id] !== undefined;
    const isCurrent = questionIndex === currentQuestionIndex;

    if (isCurrent) {
      return {
        color: "#1890ff",
        background: "#1890ff",
        textColor: "white",
        icon: null,
      };
    }

    if (isAnswered) {
      return {
        color: "#52c41a",
        background: "#f6ffed",
        textColor: "#52c41a",
        icon: <CheckCircleOutlined style={{ fontSize: 10 }} />,
      };
    }

    return {
      color: "#d9d9d9",
      background: "#fafafa",
      textColor: "#666",
      icon: <QuestionCircleOutlined style={{ fontSize: 10, color: "#999" }} />,
    };
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
      {/* Breadcrumb */}
      <Breadcrumb
        style={{ marginBottom: 24 }}
        items={[
          {
            href: "/student",
            title: (
              <Space>
                <HomeOutlined />
                <span>Dashboard</span>
              </Space>
            ),
          },
          {
            href: "/student/assessments",
            title: (
              <Space>
                <FileTextOutlined />
                <span>Assessments</span>
              </Space>
            ),
          },
          {
            title: (
              <Space>
                <TeamOutlined />
                <span>Group Quiz</span>
              </Space>
            ),
          },
        ]}
      />

      {/* Header Section */}
      <div
        style={{
          background:
            "linear-gradient(135deg, #001529 0%, #3a3f5c 60%, #43cea2 100%)", // Sama dengan StudentLayout
          borderRadius: 16,
          padding: "24px",
          marginBottom: 24,
          color: "white",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -20,
            right: -20,
            width: 100,
            height: 100,
            borderRadius: "50%",
            background: "rgba(255, 255, 255, 0.1)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -30,
            left: -30,
            width: 120,
            height: 120,
            borderRadius: "50%",
            background: "rgba(255, 255, 255, 0.05)",
          }}
        />

        <Row align="middle" style={{ position: "relative", zIndex: 1 }}>
          <Col xs={24} md={16}>
            <Space direction="vertical" size="small">
              <Tag
                icon={<TeamOutlined />}
                color="rgba(255, 255, 255, 0.2)"
                style={{
                  color: "white",
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                  background: "rgba(255, 255, 255, 0.15)",
                }}
              >
                Quiz Kelompok
              </Tag>
              <Title level={2} style={{ color: "white", margin: 0 }}>
                {quiz.title}
              </Title>
              <Space>
                <Text style={{ color: "rgba(255, 255, 255, 0.9)" }}>
                  Soal {currentQuestionIndex + 1} dari {quiz.questions.length}
                </Text>
                <Text style={{ color: "rgba(255, 255, 255, 0.7)" }}>•</Text>
                <Text style={{ color: "rgba(255, 255, 255, 0.9)" }}>
                  Kelompok: {quiz.group?.name}
                </Text>
              </Space>
            </Space>
          </Col>
          <Col
            xs={24}
            md={8}
            style={{
              textAlign: isMobile ? "left" : "right",
              marginTop: isMobile ? 16 : 0,
            }}
          >
            {timeRemaining !== null && (
              <div
                style={{
                  background: "rgba(255, 255, 255, 0.15)",
                  borderRadius: 12,
                  padding: 16,
                  backdropFilter: "blur(10px)",
                  display: "inline-block",
                }}
              >
                <QuizTimer
                  timeRemaining={timeRemaining}
                  onTimeUp={handleAutoSubmit}
                  style={{ color: "white" }}
                />
              </div>
            )}
          </Col>
        </Row>
      </div>

      {/* Main Content - Two Panel Layout */}
      <Row gutter={[24, 24]}>
        {/* Left Panel - Group Info & Progress */}
        <Col xs={24} lg={8}>
          <Space direction="vertical" size={16} style={{ width: "100%" }}>
            {/* Connection Status */}
            <Card
              size="small"
              style={{
                borderRadius: 12,
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
            >
              <div style={{ textAlign: "center" }}>
                <Space>
                  {wsConnected ? (
                    <WifiOutlined style={{ color: "#52c41a", fontSize: 16 }} />
                  ) : (
                    <DisconnectOutlined
                      style={{ color: "#ff4d4f", fontSize: 16 }}
                    />
                  )}
                  <Text
                    strong
                    style={{ color: wsConnected ? "#52c41a" : "#ff4d4f" }}
                  >
                    {wsConnected ? "Terhubung Real-time" : "Koneksi Terputus"}
                  </Text>
                </Space>
              </div>
            </Card>

            {/* Group Members */}
            <Card
              title={
                <Space>
                  <TeamOutlined style={{ color: "#722ed1" }} />
                  <span>Anggota Kelompok</span>
                </Space>
              }
              size="small"
              style={{
                borderRadius: 12,
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
            >
              <Space
                direction="vertical"
                style={{ width: "100%" }}
                size="small"
              >
                {groupMembers.map((member) => (
                  <div
                    key={member.id}
                    style={{
                      display: "flex",
                      // alignItems: "left",
                      gap: 12,
                      padding: "8px 12px",
                      borderRadius: 8,
                      background: member.is_current_user
                        ? "#f0f8ff"
                        : "#fafafa",
                      border: member.is_current_user
                        ? "2px solid #1890ff"
                        : "1px solid #f0f0f0",
                    }}
                  >
                    <Badge
                      status={isUserOnline(member) ? "success" : "default"}
                      //add green border if online
                      style={{
                        border: isUserOnline(member.is_current_user)
                          ? "2px solid #52c41a"
                          : "none",
                      }}
                      dot
                    >
                      <Avatar size="small" icon={<UserOutlined />} />
                    </Badge>
                    <div style={{ flex: 1 }}>
                      <Text strong={member.is_current_user}>
                        {member.full_name ||
                          `${member.first_name} ${member.last_name}` ||
                          member.username}
                      </Text>
                      {member.is_current_user && (
                        <Tag
                          color="blue"
                          size="small"
                          style={{ marginLeft: 4 }}
                        >
                          Anda
                        </Tag>
                      )}
                      <br />
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        {isUserOnline(member) ? "Online" : "Offline"}
                      </Text>
                    </div>
                  </div>
                ))}
              </Space>
            </Card>

            {/* Quiz Progress */}
            <Card
              title={
                <Space>
                  <TrophyOutlined style={{ color: "#faad14" }} />
                  <span>Progress Quiz</span>
                </Space>
              }
              size="small"
              style={{
                borderRadius: 12,
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
            >
              <Space direction="vertical" style={{ width: "100%" }}>
                <div style={{ textAlign: "center", marginBottom: 12 }}>
                  <Text strong style={{ fontSize: 16 }}>
                    {answeredCount} / {quiz.questions.length}
                  </Text>
                  <br />
                  <Text type="secondary">Soal Terjawab</Text>
                </div>
                <Progress
                  percent={progress}
                  strokeColor={{
                    "0%": "#722ed1",
                    "100%": "#9254de",
                  }}
                  style={{ marginBottom: 8 }}
                />
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Progress: {progress.toFixed(1)}%
                  </Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {quiz.questions.length - answeredCount} tersisa
                  </Text>
                </div>
              </Space>
            </Card>
          </Space>
        </Col>

        {/* Right Panel - Question Navigation & Content */}
        <Col xs={24} lg={16}>
          <Space direction="vertical" size={16} style={{ width: "100%" }}>
            {/* Question Grid Navigation */}
            <Card
              title={
                <Space>
                  <FileTextOutlined style={{ color: "#1890ff" }} />
                  <span>Navigasi Soal</span>
                </Space>
              }
              size="default"
              style={{
                borderRadius: 12,
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                marginBottom: 16,
              }}
            >
              {/* Perbaiki grid agar responsif */}
              <div
                style={{
                  // berada di tengah antara kanan dan kiri ketika mobile
                  margin: "0 auto",
                  width: "100%",
                  maxWidth: 1200,
                  padding: isMobile ? "0 16px" : "0 24px",
                  display: "grid",
                  gridTemplateColumns: isMobile
                    ? "repeat(5, 1fr)"
                    : "repeat(8, 1fr)",
                  gap: 8,
                  marginBottom: 32,
                  overflowX: isMobile ? "auto" : "unset",
                  paddingBottom: isMobile ? 8 : 0,
                  minHeight: 44,
                }}
              >
                {quiz.questions.map((question, index) => {
                  const status = getQuestionStatus(index);
                  return (
                    <Tooltip
                      key={question.id}
                      title={`Soal ${index + 1}${
                        answers[question.id]
                          ? " - Sudah dijawab"
                          : " - Belum dijawab"
                      }`}
                    >
                      <Button
                        onClick={() => setCurrentQuestionIndex(index)}
                        style={{
                          width: "100%",
                          minWidth: 45,
                          height: 45,
                          marginTop: 2,
                          borderRadius: 8,
                          fontSize: 14,
                          fontWeight:
                            index === currentQuestionIndex ? "bold" : "normal",
                          background: status.background,
                          borderColor: status.color,
                          color: status.textColor,
                          position: "relative",
                          padding: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {index + 1}
                        {status.icon && (
                          <div
                            style={{
                              position: "absolute",
                              top: -4,
                              right: -4,
                              fontSize: 8,
                            }}
                          >
                            {status.icon}
                          </div>
                        )}
                      </Button>
                    </Tooltip>
                  );
                })}
              </div>

              {/* Legend */}
              <div
                style={{
                  marginTop: 8,
                  display: "flex",
                  justifyContent: "center",
                  gap: 12,
                  flexWrap: "wrap",
                  fontSize: 12,
                  marginBottom: 0,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <div
                    style={{
                      width: 12,
                      height: 12,
                      backgroundColor: "#1890ff",
                      borderRadius: 2,
                    }}
                  />
                  <span>Aktif</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <div
                    style={{
                      width: 12,
                      height: 12,
                      backgroundColor: "#f6ffed",
                      border: "1px solid #52c41a",
                      borderRadius: 2,
                    }}
                  />
                  <span>Terjawab</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <div
                    style={{
                      width: 12,
                      height: 12,
                      backgroundColor: "#fafafa",
                      border: "1px solid #d9d9d9",
                      borderRadius: 2,
                    }}
                  />
                  <span>Belum dijawab</span>
                </div>
              </div>
            </Card>
            {/* Current Question */}
            <Card
              style={{
                borderRadius: 16,
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                overflow: "hidden",
                border: "1px solid #e8e8e8",
              }}
              bodyStyle={{ padding: 0 }}
            >
              {/* Question Header - Lebih clean dan kontras */}
              <div
                style={{
                  background: "#ffffff",
                  padding: "24px 28px",
                  borderBottom: "3px solid #f0f0f0",
                  position: "relative",
                }}
              >
                {/* Header Row */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: isMobile ? "center" : "space-between", // Center untuk mobile
                    alignItems: "center",
                    marginBottom: 20,
                    flexDirection: isMobile ? "column" : "row", // Stack vertical di mobile
                    flexWrap: "wrap",
                    gap: isMobile ? 12 : 8, // Gap lebih besar di mobile
                  }}
                >
                  {/* Question Number Badge */}
                  <div
                    style={{
                      background:
                        "linear-gradient(135deg, #001529 0%, #3a3f5c 60%, #43cea2 100%)",
                      borderRadius: 12,
                      padding: "8px 16px",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      boxShadow: "0 2px 8px rgba(0, 21, 41, 0.2)",
                    }}
                  >
                    <QuestionCircleOutlined
                      style={{ color: "white", fontSize: 16 }}
                    />
                    <Text
                      strong
                      style={{
                        color: "white",
                        fontSize: 15,
                        fontWeight: 600,
                      }}
                    >
                      Soal {currentQuestionIndex + 1} dari{" "}
                      {quiz.questions.length}
                    </Text>
                  </div>

                  {/* Answer Status */}
                  {currentAnswer && (
                    <div
                      style={{
                        background: "#f6ffed",
                        border: "2px solid #b7eb8f",
                        borderRadius: 12,
                        padding: "8px 16px",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        maxWidth: isMobile ? "100%" : "auto",
                      }}
                    >
                      <div
                        style={{
                          background: "#52c41a",
                          borderRadius: "50%",
                          width: 20,
                          height: 20,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <CheckCircleOutlined
                          style={{ color: "white", fontSize: 12 }}
                        />
                      </div>
                      <div>
                        <Text
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: "#389e0d",
                          }}
                        >
                          Dijawab oleh: {currentAnswer.student_name}
                        </Text>
                        <div
                          style={{
                            background: "#52c41a",
                            color: "white",
                            padding: "2px 8px",
                            borderRadius: 6,
                            fontSize: 12,
                            fontWeight: 600,
                            display: "inline-block",
                            marginLeft: 8,
                          }}
                        >
                          {currentAnswer.selected_choice}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Question Text Container */}
                <div
                  style={{
                    background: "#fafbfc",
                    border: "2px solid #e8f4fd",
                    borderRadius: 12,
                    padding: "20px 24px",
                    marginTop: 8,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 12,
                      marginBottom: 8,
                    }}
                  >
                    <div
                      style={{
                        background: "#1890ff",
                        color: "white",
                        borderRadius: "50%",
                        width: 28,
                        height: 28,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 14,
                        fontWeight: 600,
                        flexShrink: 0,
                      }}
                    >
                      ?
                    </div>
                    <Text
                      style={{
                        fontSize: 15,
                        lineHeight: 1.6,
                        color: "#2c3e50",
                        fontWeight: 500,
                        margin: 0,
                        wordBreak: "break-word",
                        flex: 1,
                      }}
                    >
                      {currentQuestion?.text}
                    </Text>
                  </div>
                </div>
              </div>

              {/* Answer Options Section */}
              <div style={{ padding: "28px" }}>
                <div style={{ marginBottom: 20 }}>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: 600,
                      color: "#1f2937",
                      display: "block",
                      marginBottom: 16,
                    }}
                  >
                    Pilih salah satu jawaban yang benar:
                  </Text>
                </div>

                <Radio.Group
                  value={currentAnswer?.selected_choice}
                  onChange={(e) =>
                    handleAnswerChange(currentQuestion.id, e.target.value)
                  }
                  style={{ width: "100%" }}
                >
                  <Space
                    direction="vertical"
                    style={{ width: "100%" }}
                    size={16}
                  >
                    {["A", "B", "C", "D"].map((option) => {
                      const isSelected =
                        currentAnswer?.selected_choice === option;
                      return (
                        <div
                          key={option}
                          style={{
                            paddingLeft: 50,
                            border: `3px solid ${
                              isSelected ? "#001529" : "#e5e7eb"
                            }`,
                            borderRadius: 16,
                            background: isSelected
                              ? "linear-gradient(135deg, rgba(0, 21, 41, 0.08) 0%, rgba(67, 206, 162, 0.08) 100%)"
                              : "#ffffff",
                            transition: "all 0.3s ease",
                            cursor: "pointer",
                            position: "relative",
                            overflow: "hidden",
                            boxShadow: isSelected
                              ? "0 4px 20px rgba(0, 21, 41, 0.15)"
                              : "0 2px 8px rgba(0,0,0,0.06)",
                          }}
                          onMouseEnter={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.borderColor = "#9ca3af";
                              e.currentTarget.style.background = "#f9fafb";
                              e.currentTarget.style.transform =
                                "translateY(-2px)";
                              e.currentTarget.style.boxShadow =
                                "0 4px 12px rgba(0,0,0,0.1)";
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.borderColor = "#e5e7eb";
                              e.currentTarget.style.background = "#ffffff";
                              e.currentTarget.style.transform = "translateY(0)";
                              e.currentTarget.style.boxShadow =
                                "0 2px 8px rgba(0,0,0,0.06)";
                            }
                          }}
                        >
                          <Radio
                            value={option}
                            style={{
                              width: "100%",
                              margin: 0,
                              padding: 0,
                            }}
                          >
                            <div
                              style={{
                                padding: "20px 24px",
                                marginLeft: 8,
                                display: "flex",
                                alignItems: "flex-start",
                                gap: 16,
                                minHeight: 70,
                              }}
                            >
                              {/* Option Letter */}
                              <div
                                style={{
                                  background: isSelected
                                    ? "linear-gradient(135deg, #001529 0%, #3a3f5c 100%)"
                                    : "#6b7280",
                                  color: "white",
                                  borderRadius: 12,
                                  width: 44,
                                  height: 44,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontWeight: 700,
                                  fontSize: 18,
                                  flexShrink: 0,
                                  transition: "all 0.3s ease",
                                  boxShadow: isSelected
                                    ? "0 4px 12px rgba(0, 21, 41, 0.3)"
                                    : "0 2px 6px rgba(107, 114, 128, 0.3)",
                                }}
                              >
                                {option}
                              </div>

                              {/* Option Text */}
                              <div style={{ flex: 1, paddingTop: 2 }}>
                                <Text
                                  style={{
                                    fontSize: 14,
                                    lineHeight: 1.6,
                                    // Buat di tengah diantara atas dan bawah
                                    textAlign: "left",
                                    padding: "8px 0",
                                    color: isSelected ? "#1f2937" : "#374151",
                                    fontWeight: isSelected ? 600 : 400,
                                    wordBreak: "break-word",
                                    display: "block",
                                  }}
                                >
                                  {
                                    currentQuestion?.[
                                      `choice_${option.toLowerCase()}`
                                    ]
                                  }
                                </Text>
                              </div>

                              {/* Selected Indicator */}
                              {isSelected && (
                                <div
                                  style={{
                                    position: "absolute",
                                    top: 16,
                                    right: 16,
                                    background: "#52c41a",
                                    borderRadius: "50%",
                                    width: 28,
                                    height: 28,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    boxShadow:
                                      "0 2px 8px rgba(82, 196, 26, 0.3)",
                                  }}
                                >
                                  <CheckCircleOutlined
                                    style={{ color: "white", fontSize: 16 }}
                                  />
                                </div>
                              )}
                            </div>
                          </Radio>
                        </div>
                      );
                    })}
                  </Space>
                </Radio.Group>

                {/* Navigation Controls */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: isMobile ? "column" : "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: 40,
                    paddingTop: 28,
                    borderTop: "2px solid #f3f4f6",
                    gap: isMobile ? 16 : 0,
                  }}
                >
                  <Button
                    icon={<ArrowLeftOutlined />}
                    onClick={() => handleQuestionNavigation("prev")}
                    disabled={currentQuestionIndex === 0}
                    size="large"
                    style={{
                      borderRadius: 12,
                      fontWeight: 600,
                      height: 50,
                      padding: "0 28px",
                      fontSize: 15,
                      border: "2px solid #e5e7eb",
                      color: "#6b7280",
                      width: isMobile ? "100%" : "auto",
                      order: isMobile ? 2 : 1,
                    }}
                  >
                    Sebelumnya
                  </Button>

                  <div
                    style={{
                      textAlign: "center",
                      background: "#f8fafc",
                      padding: "12px 20px",
                      borderRadius: 12,
                      border: "1px solid #e2e8f0",
                      order: isMobile ? 1 : 2,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 13,
                        color: "#64748b",
                        display: "block",
                        marginBottom: 4,
                        fontWeight: 500,
                      }}
                    >
                      Progress Quiz
                    </Text>
                    <Text
                      strong
                      style={{
                        fontSize: 16,
                        color: "#1e293b",
                        fontWeight: 700,
                      }}
                    >
                      {answeredCount} dari {quiz.questions.length} soal terjawab
                    </Text>
                  </div>

                  {currentQuestionIndex === quiz.questions.length - 1 ? (
                    <Button
                      type="primary"
                      icon={<SendOutlined />}
                      onClick={handleSubmitQuiz}
                      size="large"
                      style={{
                        background:
                          "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                        borderColor: "transparent",
                        borderRadius: 12,
                        fontWeight: 700,
                        height: 50,
                        padding: "0 28px",
                        fontSize: 15,
                        boxShadow: "0 4px 16px rgba(34, 197, 94, 0.3)",
                        width: isMobile ? "100%" : "auto",
                        order: isMobile ? 3 : 3,
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
                      style={{
                        background:
                          "linear-gradient(135deg, #001529 0%, #3a3f5c 60%, #43cea2 100%)",
                        borderColor: "transparent",
                        borderRadius: 12,
                        fontWeight: 700,
                        height: 50,
                        padding: "0 28px",
                        fontSize: 15,
                        boxShadow: "0 4px 16px rgba(0, 21, 41, 0.3)",
                        width: isMobile ? "100%" : "auto",
                        order: isMobile ? 3 : 3,
                      }}
                    >
                      Selanjutnya
                    </Button>
                  )}
                </div>
              </div>
            </Card>{" "}
          </Space>
        </Col>
      </Row>

      {/* Submit Confirmation Modal */}
      <Modal
        open={submitModalVisible}
        onOk={handleSubmitConfirm}
        onCancel={() => setSubmitModalVisible(false)}
        okText="Ya, Submit"
        cancelText="Batal"
        title={
          <Space>
            <SendOutlined style={{ color: "#722ed1" }} />
            <span>Submit Quiz Kelompok</span>
          </Space>
        }
        centered
        width={500}
      >
        <Space direction="vertical" style={{ width: "100%" }}>
          <Text
            style={{
              // make it center with justify center
              textAlign: "center",
              alignItems: "center",
              display: "flex",
              justifyContent: "center",
              color: "#1f2937",
            }}
          >
            Apakah Anda yakin ingin submit quiz untuk kelompok?
          </Text>
          <div
            style={{
              background: "#f6f6f6",
              padding: "12px 16px",
              borderRadius: 8,
              marginTop: 12,
            }}
          >
            <Text strong>Progress Saat Ini:</Text>
            <br />
            <Text>
              Soal terjawab: {answeredCount} dari {quiz.questions.length}
            </Text>
            <br />
            <Progress
              percent={progress}
              size="small"
              strokeColor="#722ed1"
              style={{ marginTop: 8 }}
            />
          </div>
          {answeredCount < quiz.questions.length && (
            <Alert
              message="Masih ada soal yang belum dijawab"
              type="warning"
              showIcon
              style={{ marginTop: 12 }}
            />
          )}
        </Space>
      </Modal>
    </div>
  );
};

export default GroupQuizInterface;
