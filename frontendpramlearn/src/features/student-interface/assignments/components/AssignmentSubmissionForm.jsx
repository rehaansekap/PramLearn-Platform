import React, { useState, useEffect, useContext } from "react";
import {
  Layout,
  Card,
  Typography,
  Button,
  Radio,
  Input,
  Space,
  Progress,
  Tag,
  Alert,
  Modal,
  message,
  Row,
  Col,
  Divider,
  Upload,
  List,
  Badge,
  Spin,
} from "antd";
import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  SendOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  SaveOutlined,
  CheckCircleOutlined,
  QuestionCircleOutlined,
  FlagOutlined,
  UploadOutlined,
  DeleteOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/id";
import { AuthContext } from "../../../../context/AuthContext";
import api from "../../../../api";

dayjs.extend(relativeTime);
dayjs.locale("id");

const { Title, Text } = Typography;
const { Content, Sider } = Layout;
const { TextArea } = Input;

const AssignmentSubmissionForm = ({
  assignment,
  questions,
  answers,
  uploadedFiles,
  submitting,
  draftSaving,
  isDraftDirty,
  onAnswerChange,
  onFileChange,
  onFileRemove,
  onSaveDraft,
  onSubmit,
  onBack,
  getTimeRemaining,
  updateAnswer,
  currentSubmission,
}) => {
  const { user, token } = useContext(AuthContext);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [flaggedQuestions, setFlaggedQuestions] = useState(new Set());
  const [siderCollapsed, setSiderCollapsed] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const [currentTime, setCurrentTime] = useState(dayjs());
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [answersState, setAnswers] = useState(answers || {});
  const [uploadedFilesState, setUploadedFiles] = useState(uploadedFiles || []);

  // Real-time timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(dayjs());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Mobile detection
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Auto-save answers to database
  useEffect(() => {
    if (!assignment?.id || !user?.id) return;

    const autoSaveTimer = setTimeout(() => {
      autoSaveAnswer();
    }, 2000); // Auto-save setiap 2 detik setelah perubahan

    return () => clearTimeout(autoSaveTimer);
  }, [answers, assignment?.id, user?.id]);

  const autoSaveAnswer = async () => {
    if (!assignment?.id || !answers || Object.keys(answers).length === 0)
      return;

    try {
      setAutoSaving(true);

      // Save setiap jawaban ke database
      for (const [questionId, answer] of Object.entries(answers)) {
        await api.post(`/assignment-answers/`, {
          assignment: assignment.id,
          question: questionId,
          selected_choice: answer.selected_choice || null,
          essay_answer: answer.essay_answer || null,
          // Hapus field student - backend akan menggunakan request.user
        });
      }

      console.log("✅ Auto-saved answers to database");
    } catch (error) {
      console.error("❌ Error auto-saving answers:", error);
    } finally {
      setAutoSaving(false);
    }
  };

  const loadExistingAnswers = async () => {
    if (!assignment?.id || !user?.id) return;

    try {
      // PERBAIKAN: Gunakan endpoint yang benar untuk mengambil answers
      const response = await api.get(
        `/assignment-answers/?assignment=${assignment.id}&student=${user.id}`
      );
      console.log("📋 Raw answers response:", response.data);

      const existingAnswers = {};

      // Process answers data
      if (Array.isArray(response.data)) {
        response.data.forEach((answer) => {
          if (answer.question) {
            existingAnswers[answer.question] = {
              selected_choice: answer.selected_choice,
              essay_answer: answer.answer_text || answer.essay_answer, // Backend uses answer_text
            };
          }
        });
      }

      // PERBAIKAN: Update state answers through props instead of local state
      if (Object.keys(existingAnswers).length > 0) {
        // Set answers melalui prop onAnswerChange untuk setiap jawaban yang ada
        Object.entries(existingAnswers).forEach(([questionId, answer]) => {
          onAnswerChange(parseInt(questionId), answer);
        });
      }

      console.log("✅ Loaded existing answers:", existingAnswers);
    } catch (error) {
      console.error("❌ Error loading existing answers:", error);
      // Jika endpoint tidak ada, coba endpoint alternatif
      try {
        const alternativeResponse = await api.get(
          `/student/assignment/${assignment.id}/answers/`
        );
        console.log("📋 Alternative response:", alternativeResponse.data);

        if (
          alternativeResponse.data &&
          Array.isArray(alternativeResponse.data)
        ) {
          const existingAnswers = {};
          alternativeResponse.data.forEach((answer) => {
            if (answer.question) {
              existingAnswers[answer.question] = {
                selected_choice: answer.selected_choice,
                essay_answer: answer.answer_text || answer.essay_answer,
              };
            }
          });

          Object.entries(existingAnswers).forEach(([questionId, answer]) => {
            onAnswerChange(parseInt(questionId), answer);
          });

          console.log(
            "✅ Loaded answers from alternative endpoint:",
            existingAnswers
          );
        }
      } catch (altError) {
        console.error("❌ Alternative endpoint also failed:", altError);
      }
    }
  };

  // Update useEffect dependency juga
  useEffect(() => {
    if (assignment?.id && user?.id) {
      loadExistingAnswers();
    }
  }, [assignment?.id, user?.id]);

  const safeQuestions = Array.isArray(questions) ? questions : [];
  const safeAnswers = answers || {};
  const timeRemaining = assignment
    ? getTimeRemaining(assignment.due_date)
    : { expired: false, text: "", color: "" };
  const isOverdue = timeRemaining?.expired || false;

  // Group questions by type
  const multipleChoiceQuestions = safeQuestions.filter(
    (q) =>
      q.question_type === "multiple_choice" ||
      (q.choice_a && q.choice_a.trim() !== "")
  );
  const essayQuestions = safeQuestions.filter(
    (q) =>
      q.question_type === "essay" || !q.choice_a || q.choice_a.trim() === ""
  );

  const allQuestions = [...multipleChoiceQuestions, ...essayQuestions];
  const currentQuestion = allQuestions[currentQuestionIndex];
  const answeredCount = Object.keys(safeAnswers).length;
  const progress =
    allQuestions.length > 0 ? (answeredCount / allQuestions.length) * 100 : 0;

  const handleAnswerChange = async (questionId, value) => {
    const answerData =
      typeof value === "string" ? { selected_choice: value } : value;

    onAnswerChange(questionId, answerData);

    // Immediate save to database
    try {
      await api.post(`/assignment-answers/`, {
        assignment: assignment.id,
        question: questionId,
        selected_choice: answerData.selected_choice || null,
        essay_answer: answerData.essay_answer || null,
        // Hapus field student - backend akan menggunakan request.user
      });
      console.log(`✅ Saved answer for question ${questionId}`);
    } catch (error) {
      console.error(
        `❌ Error saving answer for question ${questionId}:`,
        error
      );
    }
  };

  const handleQuestionNavigation = (direction) => {
    const newIndex =
      direction === "next"
        ? Math.min(currentQuestionIndex + 1, allQuestions.length - 1)
        : Math.max(currentQuestionIndex - 1, 0);
    setCurrentQuestionIndex(newIndex);
  };

  const toggleQuestionFlag = (questionId) => {
    setFlaggedQuestions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const handleBackToList = () => {
    setCurrentView("list");
  };

  const getQuestionStatus = (questionIndex) => {
    const question = allQuestions[questionIndex];
    const isAnswered = safeAnswers[question.id] !== undefined;
    const isCurrent = questionIndex === currentQuestionIndex;
    const isFlagged = flaggedQuestions.has(question.id);

    if (isCurrent) {
      return {
        color: "#1890ff",
        background: "#1890ff",
        textColor: "white",
      };
    }

    if (isAnswered) {
      return {
        color: "#52c41a",
        background: "#f6ffed",
        textColor: "#52c41a",
        border: "1px solid #b7eb8f",
      };
    }

    if (isFlagged) {
      return {
        color: "#faad14",
        background: "#fff2e8",
        textColor: "#faad14",
        border: "1px solid #ffd591",
      };
    }

    return {
      color: "#d9d9d9",
      background: "#fafafa",
      textColor: "#666",
      border: "1px solid #d9d9d9",
    };
  };

  const handleSubmit = async () => {
    if (answeredCount === 0) {
      message.warning("Anda belum menjawab soal apapun!");
      return;
    }

    setShowSubmitModal(true);
  };

  const handleSubmitConfirm = async () => {
    setShowSubmitModal(false);
    const success = await onSubmit(assignment.id, {
      answers: safeAnswers,
      uploaded_files: uploadedFiles,
    });

    if (success) {
      message.success("Assignment berhasil disubmit!");
    }
  };

  if (!assignment) {
    return (
      <div style={{ textAlign: "center", padding: "60px 0" }}>
        <Spin size="large" tip="Memuat assignment..." />
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "60px 0" }}>
        <Alert
          message="Belum ada soal"
          description="Assignment ini belum memiliki soal. Silakan hubungi guru Anda."
          type="info"
          showIcon
          style={{ borderRadius: 12, maxWidth: 500, margin: "0 auto" }}
        />
        <Button
          style={{ marginTop: 24 }}
          onClick={onBack}
          icon={<ArrowLeftOutlined />}
        >
          Kembali ke Daftar Assignment
        </Button>
      </div>
    );
  }

  return (
    <Layout style={{ minHeight: "100vh", background: "#f0f2f5" }}>
      {/* Assignment Navigation Sidebar */}
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
            Navigasi Soal
          </Title>

          {/* Statistics */}
          <div style={{ marginBottom: 16 }}>
            <Space direction="vertical" style={{ width: "100%" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Text type="secondary">Terjawab:</Text>
                <Badge
                  count={answeredCount}
                  style={{ backgroundColor: "#52c41a" }}
                />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Text type="secondary">Ditandai:</Text>
                <Badge
                  count={flaggedQuestions.size}
                  style={{ backgroundColor: "#faad14" }}
                />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Text type="secondary">Total:</Text>
                <Badge
                  count={allQuestions.length}
                  style={{ backgroundColor: "#1890ff" }}
                />
              </div>
            </Space>
          </div>

          <Divider />

          {/* Question Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 8,
              marginBottom: 16,
            }}
          >
            {allQuestions.map((question, index) => {
              const status = getQuestionStatus(index);
              return (
                <Button
                  key={question.id}
                  size="small"
                  onClick={() => setCurrentQuestionIndex(index)}
                  style={{
                    height: 40,
                    background: status.background,
                    borderColor: status.color,
                    color: status.textColor,
                    fontWeight:
                      index === currentQuestionIndex ? "bold" : "normal",
                    border: status.border || `1px solid ${status.color}`,
                  }}
                >
                  {index + 1}
                </Button>
              );
            })}
          </div>

          {/* Legend */}
          <div style={{ marginBottom: 16 }}>
            <Text
              type="secondary"
              style={{ fontSize: 12, marginBottom: 8, display: "block" }}
            >
              Keterangan:
            </Text>
            <Space direction="vertical" size="small" style={{ width: "100%" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div
                  style={{
                    width: 16,
                    height: 16,
                    backgroundColor: "#1890ff",
                    borderRadius: 4,
                  }}
                />
                <Text style={{ fontSize: 11 }}>Soal aktif</Text>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div
                  style={{
                    width: 16,
                    height: 16,
                    backgroundColor: "#f6ffed",
                    border: "1px solid #52c41a",
                    borderRadius: 4,
                  }}
                />
                <Text style={{ fontSize: 11 }}>Sudah dijawab</Text>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div
                  style={{
                    width: 16,
                    height: 16,
                    backgroundColor: "#fff2e8",
                    border: "1px solid #faad14",
                    borderRadius: 4,
                  }}
                />
                <Text style={{ fontSize: 11 }}>Ditandai</Text>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div
                  style={{
                    width: 16,
                    height: 16,
                    backgroundColor: "#fafafa",
                    border: "1px solid #d9d9d9",
                    borderRadius: 4,
                  }}
                />
                <Text style={{ fontSize: 11 }}>Belum dijawab</Text>
              </div>
            </Space>
          </div>

          <Divider />

          {/* Current Question Flag Toggle */}
          {currentQuestion && (
            <Button
              type={
                flaggedQuestions.has(currentQuestion.id) ? "primary" : "default"
              }
              icon={<FlagOutlined />}
              onClick={() => toggleQuestionFlag(currentQuestion.id)}
              block
              style={{
                backgroundColor: flaggedQuestions.has(currentQuestion.id)
                  ? "#faad14"
                  : undefined,
                borderColor: flaggedQuestions.has(currentQuestion.id)
                  ? "#faad14"
                  : undefined,
              }}
            >
              {flaggedQuestions.has(currentQuestion.id)
                ? "Hapus Tanda"
                : "Tandai Soal"}
            </Button>
          )}
        </div>
      </Sider>

      <Layout>
        {/* Header */}
        <div
          style={{
            background:
              "linear-gradient(135deg, #001529 0%, #3a3f5c 60%, #43cea2 100%)",
            padding: isMobile ? "16px" : "20px 24px",
            color: "white",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <Row gutter={16} align="middle">
            <Col xs={24} md={16}>
              <Space direction="vertical" size={4}>
                <Title
                  level={isMobile ? 5 : 4}
                  style={{ color: "white", margin: 0 }}
                >
                  📝 {assignment.title}
                </Title>
                <Space>
                  <Text style={{ color: "rgba(255, 255, 255, 0.9)" }}>
                    Soal {currentQuestionIndex + 1} dari {allQuestions.length}
                  </Text>
                  <Text style={{ color: "rgba(255, 255, 255, 0.7)" }}>•</Text>
                  <Text style={{ color: "rgba(255, 255, 255, 0.9)" }}>
                    <UserOutlined /> Individual Assignment
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
              {!isOverdue && timeRemaining && (
                <div
                  style={{
                    background: "rgba(255, 255, 255, 0.15)",
                    borderRadius: 12,
                    padding: "12px 16px",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                  }}
                >
                  <Space
                    direction="vertical"
                    size={4}
                    style={{ textAlign: "center" }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        justifyContent: "center",
                      }}
                    >
                      <ClockCircleOutlined style={{ fontSize: 16 }} />
                      <Text
                        style={{
                          color: "white",
                          fontSize: 12,
                          fontWeight: 600,
                        }}
                      >
                        Deadline
                      </Text>
                    </div>
                    <Text
                      style={{ color: "white", fontSize: 16, fontWeight: 700 }}
                    >
                      {timeRemaining.text}
                    </Text>
                    <Text
                      style={{
                        color: "rgba(255, 255, 255, 0.8)",
                        fontSize: 11,
                      }}
                    >
                      {dayjs(assignment.due_date).format("DD MMM YYYY, HH:mm")}
                    </Text>
                  </Space>
                </div>
              )}
            </Col>
          </Row>
        </div>

        {/* Progress Bar */}
        <div
          style={{
            background: "#fff",
            padding: "12px 24px",
            borderBottom: "1px solid #f0f0f0",
          }}
        >
          <Row gutter={16} align="middle">
            <Col xs={24} sm={16}>
              <Progress
                percent={progress}
                strokeColor={{
                  "0%": "#001529",
                  "100%": "#43cea2",
                }}
                style={{ marginBottom: 0 }}
              />
            </Col>
            <Col
              xs={24}
              sm={8}
              style={{ textAlign: isMobile ? "left" : "right" }}
            >
              <Space>
                {autoSaving && (
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    <SaveOutlined spin /> Menyimpan...
                  </Text>
                )}
                <Text style={{ fontSize: 14, fontWeight: 600 }}>
                  {answeredCount} dari {allQuestions.length} soal
                </Text>
              </Space>
            </Col>
          </Row>
        </div>

        <Content style={{ padding: isMobile ? 16 : 24 }}>
          <Space direction="vertical" size={16} style={{ width: "100%" }}>
            {/* Back Button */}
            <Button
              icon={<ArrowLeftOutlined />}
              onBack={handleBackToList}
              style={{ marginBottom: 8 }}
            >
              Kembali ke Daftar Assignment
            </Button>

            {/* Current Question Card */}
            {currentQuestion && (
              <Card
                style={{
                  borderRadius: 16,
                  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                  overflow: "hidden",
                  border: "1px solid #e8e8e8",
                }}
                bodyStyle={{ padding: 0 }}
              >
                {/* Question Header */}
                <div
                  style={{
                    background: "#ffffff",
                    padding: "24px 28px",
                    borderBottom: "3px solid #f0f0f0",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: isMobile ? "center" : "space-between",
                      alignItems: "center",
                      marginBottom: 20,
                      flexDirection: isMobile ? "column" : "row",
                      flexWrap: "wrap",
                      gap: isMobile ? 12 : 8,
                    }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 12 }}
                    >
                      <div
                        style={{
                          background:
                            "linear-gradient(135deg, #1890ff 0%, #69c0ff 100%)",
                          borderRadius: "50%",
                          width: 40,
                          height: 40,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          boxShadow: "0 4px 12px rgba(24, 144, 255, 0.3)",
                        }}
                      >
                        <Text
                          style={{
                            color: "white",
                            fontSize: 16,
                            fontWeight: 700,
                          }}
                        >
                          {currentQuestionIndex + 1}
                        </Text>
                      </div>
                      <div>
                        <Text
                          style={{
                            fontSize: 14,
                            color: "#1890ff",
                            fontWeight: 600,
                            display: "block",
                          }}
                        >
                          Soal {currentQuestionIndex + 1}
                        </Text>
                        <Text style={{ fontSize: 12, color: "#8c8c8c" }}>
                          {multipleChoiceQuestions.some(
                            (q) => q.id === currentQuestion.id
                          )
                            ? "Pilihan Ganda"
                            : "Essay"}
                        </Text>
                      </div>
                    </div>

                    <Space size={8}>
                      {flaggedQuestions.has(currentQuestion.id) && (
                        <Tag color="orange" icon={<FlagOutlined />}>
                          Ditandai
                        </Tag>
                      )}
                      {safeAnswers[currentQuestion.id] && (
                        <Tag color="green" icon={<CheckCircleOutlined />}>
                          Terjawab
                        </Tag>
                      )}
                    </Space>
                  </div>

                  {/* Question Text */}
                  <div
                    style={{
                      background: "#f8fafc",
                      padding: "20px 24px",
                      borderRadius: 12,
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <Title
                      level={5}
                      style={{
                        margin: 0,
                        fontSize: 16,
                        lineHeight: 1.5,
                        color: "#2c3e50",
                      }}
                    >
                      {currentQuestion.text}
                    </Title>
                  </div>
                </div>

                {/* Answer Section */}
                <div style={{ padding: "24px 28px" }}>
                  {multipleChoiceQuestions.some(
                    (q) => q.id === currentQuestion.id
                  ) ? (
                    // Multiple Choice Question
                    <div>
                      <Text
                        style={{
                          fontSize: 14,
                          color: "#64748b",
                          marginBottom: 16,
                          display: "block",
                          fontWeight: 500,
                        }}
                      >
                        Pilih salah satu jawaban yang benar:
                      </Text>

                      <Radio.Group
                        value={safeAnswers[currentQuestion.id]?.selected_choice}
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
                              safeAnswers[currentQuestion.id]
                                ?.selected_choice === option;
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
                                    ? "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)"
                                    : "#ffffff",
                                  padding: "16px 20px",
                                  cursor: "pointer",
                                  transition:
                                    "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                  position: "relative",
                                  boxShadow: isSelected
                                    ? "0 8px 25px rgba(0, 21, 41, 0.15)"
                                    : "0 2px 8px rgba(0, 0, 0, 0.04)",
                                }}
                                onClick={() =>
                                  handleAnswerChange(currentQuestion.id, option)
                                }
                              >
                                <Radio
                                  value={option}
                                  style={{
                                    position: "absolute",
                                    left: 16,
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    fontSize: 16,
                                  }}
                                />
                                <div
                                  style={{
                                    fontSize: 15,
                                    lineHeight: 1.6,
                                    color: isSelected ? "#001529" : "#374151",
                                    fontWeight: isSelected ? 600 : 400,
                                  }}
                                >
                                  <strong style={{ marginRight: 8 }}>
                                    {option}.
                                  </strong>
                                  {
                                    currentQuestion[
                                      `choice_${option.toLowerCase()}`
                                    ]
                                  }
                                </div>
                              </div>
                            );
                          })}
                        </Space>
                      </Radio.Group>
                    </div>
                  ) : (
                    // Essay Question
                    <div>
                      <Text
                        style={{
                          fontSize: 14,
                          color: "#64748b",
                          marginBottom: 16,
                          display: "block",
                          fontWeight: 500,
                        }}
                      >
                        Tuliskan jawaban Anda:
                      </Text>

                      <TextArea
                        value={
                          safeAnswers[currentQuestion.id]?.essay_answer || ""
                        }
                        onChange={(e) =>
                          handleAnswerChange(currentQuestion.id, {
                            essay_answer: e.target.value,
                          })
                        }
                        placeholder="Ketik jawaban essay Anda di sini..."
                        rows={8}
                        style={{
                          fontSize: 14,
                          lineHeight: 1.6,
                          borderRadius: 12,
                          border: "2px solid #e5e7eb",
                          padding: "16px 20px",
                        }}
                      />
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Navigation */}
            <Card style={{ borderRadius: 12 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 16,
                }}
              >
                <Button
                  icon={<ArrowLeftOutlined />}
                  onClick={() => handleQuestionNavigation("prev")}
                  disabled={currentQuestionIndex === 0}
                  size="large"
                  style={{
                    borderRadius: 10,
                    fontWeight: 600,
                    minWidth: isMobile ? "100%" : "auto",
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
                    Progress Assignment
                  </Text>
                  <Text
                    strong
                    style={{
                      fontSize: 16,
                      color: "#1e293b",
                      fontWeight: 700,
                    }}
                  >
                    {answeredCount} dari {allQuestions.length} soal terjawab
                  </Text>
                </div>

                {currentQuestionIndex === allQuestions.length - 1 ? (
                  <Button
                    type="primary"
                    icon={<SendOutlined />}
                    onClick={handleSubmit}
                    disabled={isOverdue}
                    size="large"
                    style={{
                      background: isOverdue
                        ? "#d9d9d9"
                        : "linear-gradient(135deg, #52c41a 0%, #73d13d 100%)",
                      borderColor: "transparent",
                      borderRadius: 12,
                      fontWeight: 700,
                      height: 50,
                      padding: "0 28px",
                      fontSize: 15,
                      boxShadow: isOverdue
                        ? "none"
                        : "0 4px 16px rgba(82, 196, 26, 0.3)",
                      minWidth: isMobile ? "100%" : "auto",
                      order: isMobile ? 3 : 3,
                    }}
                  >
                    {isOverdue ? "Waktu Habis" : "Submit Assignment"}
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
                      minWidth: isMobile ? "100%" : "auto",
                      order: isMobile ? 3 : 3,
                    }}
                  >
                    Selanjutnya
                  </Button>
                )}
              </div>
            </Card>
          </Space>
        </Content>
      </Layout>

      {/* Submit Confirmation Modal */}
      <Modal
        open={showSubmitModal}
        onOk={handleSubmitConfirm}
        onCancel={() => setShowSubmitModal(false)}
        okText="Ya, Submit"
        cancelText="Batal"
        title={
          <Space>
            <SendOutlined style={{ color: "#1890ff" }} />
            <span>Submit Assignment</span>
          </Space>
        }
        centered
        width={500}
      >
        <Space direction="vertical" style={{ width: "100%" }}>
          <Text>Apakah Anda yakin ingin submit assignment ini?</Text>
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
              Soal terjawab: {answeredCount} dari {allQuestions.length}
            </Text>
            <br />
            <Progress
              percent={progress}
              size="small"
              strokeColor="#1890ff"
              style={{ marginTop: 8 }}
            />
          </div>
          {answeredCount < allQuestions.length && (
            <Alert
              message="Masih ada soal yang belum dijawab"
              type="warning"
              showIcon
              style={{ marginTop: 12 }}
            />
          )}
        </Space>
      </Modal>
    </Layout>
  );
};

export default AssignmentSubmissionForm;
