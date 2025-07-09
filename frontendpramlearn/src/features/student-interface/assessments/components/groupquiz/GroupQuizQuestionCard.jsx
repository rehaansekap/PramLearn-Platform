import React from "react";
import { Card, Button, Typography, Space, Radio, Tooltip, Grid } from "antd";
import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  SendOutlined,
  QuestionCircleOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";

const { Text } = Typography;
const { useBreakpoint } = Grid;

const GroupQuizQuestionCard = ({
  quiz,
  currentQuestion,
  currentQuestionIndex,
  answers,
  currentAnswer,
  answeredCount,
  onAnswerChange,
  onPrev,
  onNext,
  onSubmit,
}) => {
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  // Helper untuk status soal
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
    <Card
      style={{
        borderRadius: 16,
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        overflow: "hidden",
        border: "1px solid #e8e8e8",
      }}
      bodyStyle={{ padding: 0 }}
    >
      {/* Header Soal */}
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
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
            flexWrap: "wrap",
            gap: 8,
          }}
        >
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
            <QuestionCircleOutlined style={{ color: "white", fontSize: 16 }} />
            <Text
              strong
              style={{
                color: "white",
                fontSize: 15,
                fontWeight: 600,
              }}
            >
              Soal {currentQuestionIndex + 1} dari {quiz.questions.length}
            </Text>
          </div>
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
                maxWidth: "100%",
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
                <CheckCircleOutlined style={{ color: "white", fontSize: 12 }} />
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

      {/* Pilihan Jawaban */}
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
          onChange={(e) => onAnswerChange(currentQuestion.id, e.target.value)}
          style={{ width: "100%" }}
        >
          <Space direction="vertical" style={{ width: "100%" }} size={16}>
            {["A", "B", "C", "D"].map((option) => {
              const isSelected = currentAnswer?.selected_choice === option;
              return (
                <div
                  key={option}
                  style={{
                    paddingLeft: isMobile ? 12 : 50,
                    border: `3px solid ${isSelected ? "#001529" : "#e5e7eb"}`,
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
                        padding: isMobile ? "16px 20px" : "20px 24px",
                        marginLeft: isMobile ? 0 : 8,
                        display: "flex",
                        alignItems: isMobile ? "center" : "flex-start",
                        gap: isMobile ? 12 : 16,
                        minHeight: isMobile ? 60 : 70,
                      }}
                    >
                      <div
                        style={{
                          background: isSelected
                            ? "linear-gradient(135deg, #001529 0%, #3a3f5c 100%)"
                            : "#6b7280",
                          color: "white",
                          borderRadius: 12,
                          width: isMobile ? 36 : 44,
                          height: isMobile ? 36 : 44,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 700,
                          fontSize: isMobile ? 16 : 18,
                          flexShrink: 0,
                          transition: "all 0.3s ease",
                          boxShadow: isSelected
                            ? "0 4px 12px rgba(0, 21, 41, 0.3)"
                            : "0 2px 6px rgba(107, 114, 128, 0.3)",
                        }}
                      >
                        {option}
                      </div>
                      <div style={{ flex: 1, paddingTop: isMobile ? 0 : 2 }}>
                        <Text
                          style={{
                            fontSize: isMobile ? 13 : 14,
                            lineHeight: 1.5,
                            textAlign: "left",
                            padding: isMobile ? "4px 0" : "8px 0",
                            color: isSelected ? "#1f2937" : "#374151",
                            fontWeight: isSelected ? 600 : 400,
                            wordBreak: "break-word",
                            display: "block",
                          }}
                        >
                          {currentQuestion?.[`choice_${option.toLowerCase()}`]}
                        </Text>
                      </div>
                      {isSelected && (
                        <div
                          style={{
                            position: "absolute",
                            top: isMobile ? 12 : 16,
                            right: isMobile ? 12 : 16,
                            background: "#52c41a",
                            borderRadius: "50%",
                            width: isMobile ? 24 : 28,
                            height: isMobile ? 24 : 28,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: "0 2px 8px rgba(82, 196, 26, 0.3)",
                          }}
                        >
                          <CheckCircleOutlined
                            style={{
                              color: "white",
                              fontSize: isMobile ? 14 : 16,
                            }}
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

        {/* Navigasi Soal */}
        <div
          style={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            justifyContent: isMobile ? "center" : "space-between",
            alignItems: "center",
            marginTop: 40,
            paddingTop: 28,
            borderTop: "2px solid #f3f4f6",
            gap: isMobile ? 12 : 16,
          }}
        >
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={onPrev}
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
              order: isMobile ? 1 : 0,
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
              width: isMobile ? "100%" : "auto",
              order: isMobile ? 2 : 0,
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
              Progress Kuis
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
              onClick={onSubmit}
              size="large"
              style={{
                background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                borderColor: "transparent",
                borderRadius: 12,
                fontWeight: 700,
                height: 50,
                padding: "0 28px",
                fontSize: 15,
                boxShadow: "0 4px 16px rgba(34, 197, 94, 0.3)",
                width: isMobile ? "100%" : "auto",
                order: isMobile ? 3 : 0,
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
                order: isMobile ? 3 : 0,
              }}
            >
              Selanjutnya
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default GroupQuizQuestionCard;
