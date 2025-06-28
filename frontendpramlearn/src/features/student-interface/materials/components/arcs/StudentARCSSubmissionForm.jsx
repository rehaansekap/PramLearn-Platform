import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Card,
  Button,
  Typography,
  Space,
  Progress,
  Radio,
  Slider,
  Input,
  Alert,
  Steps,
  Modal,
  message,
  Layout,
  Row,
  Col,
} from "antd";
import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  CheckOutlined,
  SendOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import useStudentARCSSubmission from "../../hooks/useStudentARCSSubmission";

dayjs.extend(duration);

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Sider, Content } = Layout;

const ARCSSubmissionForm = () => {
  const { materialSlug, arcsSlug } = useParams();
  const navigate = useNavigate();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitModalVisible, setSubmitModalVisible] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [siderCollapsed, setSiderCollapsed] = useState(
    window.innerWidth <= 768
  );

  const { questionnaire, loading, error, submitting, submitARCS } =
    useStudentARCSSubmission(materialSlug, arcsSlug);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setSiderCollapsed(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Timer for duration limit
  useEffect(() => {
    if (questionnaire?.duration_minutes) {
      const endTime = dayjs().add(questionnaire.duration_minutes, "minutes");

      const timer = setInterval(() => {
        const now = dayjs();
        const remaining = endTime.diff(now);

        if (remaining <= 0) {
          setTimeRemaining(0);
          handleAutoSubmit();
          clearInterval(timer);
        } else {
          setTimeRemaining(remaining);
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [questionnaire?.duration_minutes]);

  const handleAutoSubmit = async () => {
    message.warning("Waktu habis! Kuesioner akan disubmit otomatis.");
    await handleSubmit();
  };

  const handleAnswerChange = (
    questionId,
    value,
    answerType = "likert_value"
  ) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        question_id: questionId,
        [answerType]: value,
      },
    }));
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questionnaire.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const goToQuestion = (index) => {
    if (index >= 0 && index < questionnaire.questions.length) {
      setCurrentQuestionIndex(index);
    }
  };

  const handleSubmit = async () => {
    try {
      const answersArray = Object.values(answers);
      const result = await submitARCS(answersArray);

      if (result.success) {
        message.success("Kuesioner ARCS berhasil diselesaikan!");
        navigate(`/student/materials/${materialSlug}/${arcsSlug}/results`);
      } else {
        message.error(result.error || "Gagal mengirim kuesioner");
      }
    } catch (error) {
      message.error("Terjadi kesalahan saat mengirim kuesioner");
    }
    setSubmitModalVisible(false);
  };

  const isAllQuestionsAnswered = () => {
    if (!questionnaire) return false;
    return questionnaire.questions.every((q) => answers[q.id]);
  };

  const getProgress = () => {
    if (!questionnaire) return 0;
    const answeredCount = Object.keys(answers).length;
    return (answeredCount / questionnaire.questions.length) * 100;
  };

  const getDimensionColor = (dimension) => {
    const colors = {
      attention: "#ff7875",
      relevance: "#73d13d",
      confidence: "#40a9ff",
      satisfaction: "#b37feb",
    };
    return colors[dimension] || "#11418b";
  };

  const getDimensionName = (dimension) => {
    const names = {
      attention: "Perhatian (Attention)",
      relevance: "Relevansi (Relevance)",
      confidence: "Percaya Diri (Confidence)",
      satisfaction: "Kepuasan (Satisfaction)",
    };
    return names[dimension] || dimension;
  };

  const renderLikertScale = (question) => {
    const currentAnswer = answers[question.id];
    const marks = {};

    for (let i = question.scale_min; i <= question.scale_max; i++) {
      marks[i] = {
        label: i.toString(),
        style: { fontSize: "12px" },
      };
    }

    return (
      <div style={{ padding: "20px 0" }}>
        <Slider
          min={question.scale_min}
          max={question.scale_max}
          marks={marks}
          step={1}
          value={currentAnswer?.likert_value || question.scale_min}
          onChange={(value) =>
            handleAnswerChange(question.id, value, "likert_value")
          }
          tooltip={{
            open: true,
            placement: "top",
          }}
        />
        {question.scale_labels && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 12,
              fontSize: "12px",
              color: "#666",
            }}
          >
            <span>{question.scale_labels.min}</span>
            <span>{question.scale_labels.max}</span>
          </div>
        )}
      </div>
    );
  };

  const renderMultipleChoice = (question) => {
    const currentAnswer = answers[question.id];

    return (
      <Radio.Group
        value={currentAnswer?.choice_value}
        onChange={(e) =>
          handleAnswerChange(question.id, e.target.value, "choice_value")
        }
        style={{ width: "100%" }}
      >
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          {question.choices.map((choice, index) => (
            <Radio
              key={index}
              value={choice}
              style={{
                padding: "12px",
                border: "1px solid #d9d9d9",
                borderRadius: "8px",
                width: "100%",
              }}
            >
              {choice}
            </Radio>
          ))}
        </Space>
      </Radio.Group>
    );
  };

  const renderTextAnswer = (question) => {
    const currentAnswer = answers[question.id];

    return (
      <TextArea
        rows={4}
        value={currentAnswer?.text_value || ""}
        onChange={(e) =>
          handleAnswerChange(question.id, e.target.value, "text_value")
        }
        placeholder="Tuliskan jawaban Anda..."
      />
    );
  };

  const renderQuestionContent = (question) => {
    if (!question) return null;

    if (question.question_type.startsWith("likert")) {
      return renderLikertScale(question);
    } else if (question.question_type === "multiple_choice") {
      return renderMultipleChoice(question);
    } else if (question.question_type === "text") {
      return renderTextAnswer(question);
    } else {
      return <div>Tipe pertanyaan tidak dikenal: {question.question_type}</div>;
    }
  };

  const formatTimeRemaining = (milliseconds) => {
    if (!milliseconds) return "";

    const dur = dayjs.duration(milliseconds);
    const hours = dur.hours();
    const minutes = dur.minutes();
    const seconds = dur.seconds();

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <Space direction="vertical" align="center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
          <Text>Memuat kuesioner ARCS...</Text>
        </Space>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: 800, margin: "0 auto", padding: 24 }}>
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          action={
            <Button
              onClick={() => navigate(`/student/materials/${materialSlug}`)}
            >
              Kembali ke Material
            </Button>
          }
        />
      </div>
    );
  }

  if (
    !questionnaire ||
    !questionnaire.questions ||
    questionnaire.questions.length === 0
  ) {
    return (
      <div style={{ maxWidth: 800, margin: "0 auto", padding: 24 }}>
        <Alert
          message="Kuesioner tidak ditemukan"
          description="Kuesioner ARCS tidak tersedia atau sudah dihapus."
          type="warning"
          showIcon
          action={
            <Button
              onClick={() => navigate(`/student/materials/${materialSlug}`)}
            >
              Kembali ke Material
            </Button>
          }
        />
      </div>
    );
  }

  const currentQuestion = questionnaire.questions[currentQuestionIndex];
  const progress = getProgress();
  const currentAnswer = answers[currentQuestion?.id];

  return (
    <Layout style={{ minHeight: "100vh", background: "#f0f2f5" }}>
      {/* Sidebar Navigation */}
      <Sider
        collapsible
        collapsed={siderCollapsed}
        onCollapse={setSiderCollapsed}
        width={280}
        style={{
          background: "#fff",
          boxShadow: "2px 0 8px rgba(0,0,0,0.1)",
        }}
      >
        <div style={{ padding: "16px" }}>
          <Title level={5} style={{ margin: 0, color: "#11418b" }}>
            Navigasi Soal
          </Title>

          {/* Progress */}
          <div style={{ marginTop: 16, marginBottom: 24 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Progress: {Math.round(progress)}%
            </Text>
            <Progress
              percent={Math.round(progress)}
              size="small"
              strokeColor="#11418b"
            />
          </div>

          {/* Timer */}
          {timeRemaining !== null && (
            <Alert
              message={
                <Space>
                  <ClockCircleOutlined />
                  <span>Waktu Tersisa</span>
                </Space>
              }
              description={
                <Text
                  strong
                  style={{
                    color: timeRemaining < 300000 ? "#ff4d4f" : "#1890ff",
                  }}
                >
                  {formatTimeRemaining(timeRemaining)}
                </Text>
              }
              type={timeRemaining < 300000 ? "error" : "info"}
              size="small"
              style={{ marginBottom: 16 }}
            />
          )}

          {/* Question Steps */}
          <Steps
            direction="vertical"
            size="small"
            current={currentQuestionIndex}
            onChange={goToQuestion}
            items={questionnaire.questions.map((q, index) => ({
              title: `Soal ${index + 1}`,
              description: getDimensionName(q.dimension),
              status: answers[q.id]
                ? "finish"
                : index === currentQuestionIndex
                ? "process"
                : "wait",
            }))}
          />
        </div>
      </Sider>

      {/* Main Content */}
      <Layout>
        <Content style={{ padding: "24px" }}>
          <div style={{ maxWidth: 800, margin: "0 auto" }}>
            {/* Header */}
            <Card style={{ marginBottom: 24 }}>
              <Row align="middle" justify="space-between">
                <Col>
                  <Button
                    icon={<ArrowLeftOutlined />}
                    onClick={() =>
                      navigate(`/student/materials/${materialSlug}`)
                    }
                  >
                    Kembali ke Material
                  </Button>
                </Col>
                <Col>
                  <Space direction="vertical" align="center" size="small">
                    <Title level={4} style={{ margin: 0 }}>
                      {questionnaire.title}
                    </Title>
                    <Text type="secondary">
                      Soal {currentQuestionIndex + 1} dari{" "}
                      {questionnaire.questions.length}
                    </Text>
                  </Space>
                </Col>
                <Col>
                  <div style={{ textAlign: "right" }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {questionnaire.material_title}
                    </Text>
                  </div>
                </Col>
              </Row>
            </Card>

            {/* Question Card */}
            <Card>
              <div style={{ marginBottom: 24 }}>
                <div
                  style={{
                    padding: "12px 16px",
                    background: getDimensionColor(currentQuestion.dimension),
                    color: "white",
                    borderRadius: "8px",
                    marginBottom: 16,
                  }}
                >
                  <Text
                    style={{
                      color: "white",
                      fontSize: "14px",
                      fontWeight: 600,
                    }}
                  >
                    {getDimensionName(currentQuestion.dimension)}
                  </Text>
                </div>

                <Title level={4} style={{ lineHeight: 1.5 }}>
                  {currentQuestion.text}
                </Title>
              </div>

              {/* Answer Input */}
              <div style={{ marginBottom: 32 }}>
                {renderQuestionContent(currentQuestion)}
              </div>

              {/* Navigation */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Button
                  disabled={currentQuestionIndex === 0}
                  onClick={previousQuestion}
                  icon={<ArrowLeftOutlined />}
                >
                  Sebelumnya
                </Button>

                <Space>
                  <Text type="secondary">
                    {currentQuestionIndex + 1} /{" "}
                    {questionnaire.questions.length}
                  </Text>
                </Space>

                {currentQuestionIndex < questionnaire.questions.length - 1 ? (
                  <Button
                    type="primary"
                    onClick={nextQuestion}
                    disabled={!currentAnswer}
                  >
                    Selanjutnya
                    <ArrowRightOutlined />
                  </Button>
                ) : (
                  <Button
                    type="primary"
                    onClick={() => setSubmitModalVisible(true)}
                    disabled={!isAllQuestionsAnswered()}
                    icon={<SendOutlined />}
                  >
                    Selesai
                  </Button>
                )}
              </div>
            </Card>
          </div>
        </Content>
      </Layout>

      {/* Submit Confirmation Modal */}
      <Modal
        title="Konfirmasi Pengiriman"
        open={submitModalVisible}
        onCancel={() => setSubmitModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setSubmitModalVisible(false)}>
            Batal
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={submitting}
            onClick={handleSubmit}
          >
            Ya, Kirim Kuesioner
          </Button>,
        ]}
      >
        <div>
          <Paragraph>
            Apakah Anda yakin ingin mengirim kuesioner ini? Setelah dikirim,
            Anda tidak dapat mengubah jawaban.
          </Paragraph>

          <div
            style={{
              background: "#f5f5f5",
              padding: 16,
              borderRadius: 8,
            }}
          >
            <Space direction="vertical" size="small">
              <Text strong>Ringkasan:</Text>
              <Text>• Total pertanyaan: {questionnaire.questions.length}</Text>
              <Text>• Pertanyaan terjawab: {Object.keys(answers).length}</Text>
              <Text>• Progress: {Math.round(progress)}%</Text>
            </Space>
          </div>
        </div>
      </Modal>
    </Layout>
  );
};

export default ARCSSubmissionForm;
