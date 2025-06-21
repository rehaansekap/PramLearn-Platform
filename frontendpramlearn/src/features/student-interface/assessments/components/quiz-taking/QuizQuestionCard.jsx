import React from "react";
import { Card, Button, Radio, Typography, Space, Progress } from "antd";
import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  FlagOutlined,
  SendOutlined,
} from "@ant-design/icons";
import QuizTimer from "../QuizTimer";

const { Title, Text } = Typography;

const QuizQuestionCard = ({
  quiz,
  currentQuestion,
  currentQuestionIndex,
  answers,
  flaggedQuestions,
  timeRemaining,
  onAnswerChange,
  onFlagToggle,
  onPrev,
  onNext,
  onSubmit,
}) => {
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

  return (
    <div>
      {/* Header dengan timer */}
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
        <QuizTimer timeRemaining={timeRemaining} />
      </div>

      <Card
        style={{
          maxWidth: 800,
          margin: "24px auto",
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

        {/* Soal */}
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
                flaggedQuestions.has(currentQuestion.id) ? "primary" : "default"
              }
              icon={<FlagOutlined />}
              size="small"
              onClick={() => onFlagToggle(currentQuestion.id)}
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
              {flaggedQuestions.has(currentQuestion.id) ? "Ditandai" : "Tandai"}
            </Button>
          </div>

          {/* Pilihan Jawaban */}
          <Radio.Group
            value={answers[currentQuestion.id]}
            onChange={(e) => onAnswerChange(currentQuestion.id, e.target.value)}
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

        {/* Navigasi */}
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
            onClick={onPrev}
            disabled={currentQuestionIndex === 0}
            size="large"
          >
            Sebelumnya
          </Button>

          <Space>
            <Text type="secondary">
              {Object.keys(answers).length} dari {quiz.questions.length} soal
              terjawab
            </Text>
          </Space>

          {currentQuestionIndex === quiz.questions.length - 1 ? (
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={onSubmit}
              size="large"
              style={{
                backgroundColor: "#52c41a",
                borderColor: "#52c41a",
              }}
            >
              Submit Kuis
            </Button>
          ) : (
            <Button
              type="primary"
              icon={<ArrowRightOutlined />}
              onClick={onNext}
              size="large"
            >
              Selanjutnya
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};

export default QuizQuestionCard;
