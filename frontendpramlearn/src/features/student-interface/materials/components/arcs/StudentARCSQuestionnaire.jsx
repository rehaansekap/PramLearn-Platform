import React, { useState } from "react";
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
} from "antd";
import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  CheckOutlined,
  SendOutlined,
} from "@ant-design/icons";
import useStudentARCS from "../../hooks/useStudentARCS";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const StudentARCSQuestionnaire = ({ questionnaire, materialSlug, onBack }) => {
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

  const {
    questionnaireDetail,
    currentQuestionIndex,
    answers,
    submitting,
    error,
    updateAnswer,
    nextQuestion,
    previousQuestion,
    goToQuestion,
    submitQuestionnaire,
    getCurrentQuestion,
    getAnswer,
    isAllQuestionsAnswered,
    getProgress,
    setError,
  } = useStudentARCS(materialSlug);

  const activeQuestionnaire = questionnaireDetail || questionnaire;
  const currentQuestion =
    getCurrentQuestion() ||
    activeQuestionnaire?.questions?.[currentQuestionIndex];
  const currentAnswer = currentQuestion ? getAnswer(currentQuestion.id) : null;
  const progress = getProgress();

  const handleAnswerChange = (value, answerType = "likert_value") => {
    if (currentQuestion) {
      updateAnswer(currentQuestion.id, value, answerType);
    }
  };

  const handleSubmit = async () => {
    try {
      const result = await submitQuestionnaire();
      if (result.success) {
        message.success("Kuesioner berhasil diselesaikan!");
        onBack(); // Kembali ke list
      } else {
        message.error(result.error || "Gagal mengirim kuesioner");
      }
    } catch (error) {
      message.error("Terjadi kesalahan saat mengirim kuesioner");
    }
    setShowSubmitConfirm(false);
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

  const renderLikertScale = () => {
    const marks = {};
    for (
      let i = currentQuestion.scale_min;
      i <= currentQuestion.scale_max;
      i++
    ) {
      marks[i] = {
        label: i.toString(),
        style: { fontSize: "12px" },
      };
    }

    return (
      <div style={{ padding: "20px 0" }}>
        <Slider
          min={currentQuestion.scale_min}
          max={currentQuestion.scale_max}
          marks={marks}
          step={1}
          value={currentAnswer?.likert_value || currentQuestion.scale_min}
          onChange={(value) => handleAnswerChange(value, "likert_value")}
          tooltip={{
            open: true,
            placement: "top",
          }}
        />
        {currentQuestion.scale_labels && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 12,
              fontSize: "12px",
              color: "#666",
            }}
          >
            <span>{currentQuestion.scale_labels.min}</span>
            <span>{currentQuestion.scale_labels.max}</span>
          </div>
        )}
      </div>
    );
  };

  const renderMultipleChoice = () => {
    return (
      <Radio.Group
        value={currentAnswer?.choice_value}
        onChange={(e) => handleAnswerChange(e.target.value, "choice_value")}
        style={{ width: "100%" }}
      >
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          {currentQuestion.choices.map((choice, index) => (
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

  const renderTextAnswer = () => {
    return (
      <TextArea
        rows={4}
        value={currentAnswer?.text_value || ""}
        onChange={(e) => handleAnswerChange(e.target.value, "text_value")}
        placeholder="Tuliskan jawaban Anda..."
      />
    );
  };

  const renderQuestionContent = () => {
    if (!currentQuestion) return null;

    if (currentQuestion.question_type.startsWith("likert")) {
      return renderLikertScale();
    } else if (currentQuestion.question_type === "multiple_choice") {
      return renderMultipleChoice();
    } else if (currentQuestion.question_type === "text") {
      return renderTextAnswer();
    } else {
      return (
        <div>
          Tipe pertanyaan tidak dikenal: {currentQuestion.question_type}
        </div>
      );
    }
  };

  if (
    !activeQuestionnaire ||
    !activeQuestionnaire.questions ||
    activeQuestionnaire.questions.length === 0
  ) {
    return (
      <div style={{ textAlign: "center", padding: "60px 0" }}>
        <Text>Memuat pertanyaan...</Text>
      </div>
    );
  }

  return (
    <div style={{ padding: "24px", maxWidth: "800px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={onBack}
          style={{ marginBottom: 16 }}
        >
          Kembali ke Daftar
        </Button>

        <Title level={3} style={{ margin: 0 }}>
          {activeQuestionnaire.title}
        </Title>
        <Text type="secondary">
          Pertanyaan {currentQuestionIndex + 1} dari{" "}
          {activeQuestionnaire.questions.length}
        </Text>
      </div>

      {/* Progress */}
      <Card size="small" style={{ marginBottom: 24 }}>
        <Progress
          percent={Math.round(progress)}
          status="active"
          strokeColor={getDimensionColor(currentQuestion?.dimension)}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 8,
            fontSize: "12px",
            color: "#666",
          }}
        >
          <span>Progress: {Math.round(progress)}%</span>
          <span>
            Dimensi:{" "}
            <strong
              style={{ color: getDimensionColor(currentQuestion?.dimension) }}
            >
              {getDimensionName(currentQuestion?.dimension)}
            </strong>
          </span>
        </div>
      </Card>

      {/* Question Steps */}
      <Card size="small" style={{ marginBottom: 24 }}>
        <Steps
          current={currentQuestionIndex}
          size="small"
          onChange={goToQuestion}
          items={activeQuestionnaire.questions.map((q, index) => ({
            title: `Q${index + 1}`,
            status: answers[q.id]
              ? "finish"
              : index === currentQuestionIndex
              ? "process"
              : "wait",
            icon: answers[q.id] ? <CheckOutlined /> : null,
          }))}
        />
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}

      {/* Question Card */}
      <Card>
        <div style={{ marginBottom: 24 }}>
          <div
            style={{
              padding: "12px 16px",
              background: getDimensionColor(currentQuestion?.dimension),
              color: "white",
              borderRadius: "8px",
              marginBottom: 16,
            }}
          >
            <Text style={{ color: "white", fontSize: "14px", fontWeight: 600 }}>
              {getDimensionName(currentQuestion?.dimension)}
            </Text>
          </div>

          <Title level={4} style={{ lineHeight: 1.5 }}>
            {currentQuestion?.text}
          </Title>
        </div>

        {/* Answer Input */}
        <div style={{ marginBottom: 32 }}>{renderQuestionContent()}</div>

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
              {activeQuestionnaire.questions.length}
            </Text>
          </Space>

          {currentQuestionIndex < activeQuestionnaire.questions.length - 1 ? (
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
              onClick={() => setShowSubmitConfirm(true)}
              disabled={!isAllQuestionsAnswered()}
              icon={<SendOutlined />}
            >
              Selesai
            </Button>
          )}
        </div>
      </Card>

      {/* Submit Confirmation Modal */}
      <Modal
        title="Konfirmasi Pengiriman"
        open={showSubmitConfirm}
        onCancel={() => setShowSubmitConfirm(false)}
        footer={[
          <Button key="cancel" onClick={() => setShowSubmitConfirm(false)}>
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
              <Text>
                • Total pertanyaan: {activeQuestionnaire.questions.length}
              </Text>
              <Text>• Pertanyaan terjawab: {Object.keys(answers).length}</Text>
              <Text>• Progress: {Math.round(progress)}%</Text>
            </Space>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default StudentARCSQuestionnaire;
