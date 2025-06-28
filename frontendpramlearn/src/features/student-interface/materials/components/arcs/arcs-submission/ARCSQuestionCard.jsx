import React from "react";
import {
  Card,
  Typography,
  Radio,
  Input,
  Button,
  Space,
  Divider,
  Tag,
} from "antd";
import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  SendOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { TextArea } = Input;

const ARCSQuestionCard = ({
  currentQuestion,
  currentQuestionIndex,
  totalQuestions,
  answers,
  questionnaire,
  onAnswerChange,
  onPrev,
  onNext,
  onSubmit,
  isMobile,
}) => {
  const currentAnswer = answers[currentQuestion?.id];

  const getDimensionColor = (dimension) => {
    const colors = {
      attention: "#ff4d4f",
      relevance: "#52c41a",
      confidence: "#1890ff",
      satisfaction: "#fa8c16",
    };
    return colors[dimension] || "#11418b";
  };

  const getDimensionName = (dimension) => {
    const names = {
      attention: "Attention (Perhatian)",
      relevance: "Relevance (Relevansi)",
      confidence: "Confidence (Kepercayaan)",
      satisfaction: "Satisfaction (Kepuasan)",
    };
    return names[dimension] || dimension;
  };

  const generateLikertOptions = () => {
    const scaleMin = currentQuestion.scale_min || 1;
    const scaleMax = currentQuestion.scale_max || 5;
    const scaleLabels = currentQuestion.scale_labels || {
      min: "Sangat Tidak Setuju",
      max: "Sangat Setuju",
    };

    const options = [];
    for (let i = scaleMin; i <= scaleMax; i++) {
      let label = "";
      if (i === scaleMin) {
        label = scaleLabels.min;
      } else if (i === scaleMax) {
        label = scaleLabels.max;
      } else if (i === Math.ceil((scaleMin + scaleMax) / 2)) {
        label = "Netral";
      } else if (i < Math.ceil((scaleMin + scaleMax) / 2)) {
        label = i === scaleMin + 1 ? "Tidak Setuju" : `Level ${i}`;
      } else {
        label = i === scaleMax - 1 ? "Setuju" : `Level ${i}`;
      }

      options.push({ value: i, label });
    }
    return options;
  };

  const renderLikertScale = () => {
    const options = generateLikertOptions();

    return (
      <div style={{ marginTop: 24 }}>
        <Text
          style={{
            fontSize: 15,
            fontWeight: 600,
            color: "#333",
            display: "block",
            marginBottom: 20,
          }}
        >
          Pilih tingkat persetujuan Anda:
        </Text>

        <Radio.Group
          value={currentAnswer?.likert_value}
          onChange={(e) =>
            onAnswerChange(currentQuestion.id, e.target.value, "likert_value")
          }
          style={{ width: "100%" }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile
                ? "1fr"
                : `repeat(${options.length}, 1fr)`,
              gap: 12,
            }}
          >
            {options.map((option) => (
              <Card
                key={option.value}
                size="small"
                hoverable
                style={{
                  borderRadius: 12,
                  border:
                    currentAnswer?.likert_value === option.value
                      ? `2px solid ${getDimensionColor(
                          currentQuestion.dimension
                        )}`
                      : "1px solid #f0f0f0",
                  backgroundColor:
                    currentAnswer?.likert_value === option.value
                      ? `${getDimensionColor(currentQuestion.dimension)}10`
                      : "white",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  transform:
                    currentAnswer?.likert_value === option.value
                      ? "translateY(-2px)"
                      : "none",
                  boxShadow:
                    currentAnswer?.likert_value === option.value
                      ? `0 4px 12px ${getDimensionColor(
                          currentQuestion.dimension
                        )}30`
                      : "0 2px 6px rgba(0,0,0,0.08)",
                }}
                bodyStyle={{
                  padding: isMobile ? "16px 12px" : "20px 16px",
                  textAlign: "center",
                }}
                onClick={() =>
                  onAnswerChange(
                    currentQuestion.id,
                    option.value,
                    "likert_value"
                  )
                }
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    backgroundColor:
                      currentAnswer?.likert_value === option.value
                        ? getDimensionColor(currentQuestion.dimension)
                        : "#f5f5f5",
                    color:
                      currentAnswer?.likert_value === option.value
                        ? "white"
                        : "#666",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 12px",
                    fontWeight: 700,
                    fontSize: 14,
                    transition: "all 0.3s ease",
                  }}
                >
                  {option.value}
                </div>

                <Text
                  style={{
                    fontSize: isMobile ? 12 : 13,
                    fontWeight:
                      currentAnswer?.likert_value === option.value ? 600 : 400,
                    color:
                      currentAnswer?.likert_value === option.value
                        ? getDimensionColor(currentQuestion.dimension)
                        : "#666",
                    textAlign: "center",
                    display: "block",
                    lineHeight: 1.4,
                  }}
                >
                  {option.label}
                </Text>
              </Card>
            ))}
          </div>
        </Radio.Group>
      </div>
    );
  };

  const renderMultipleChoice = () => (
    <div style={{ marginTop: 24 }}>
      <Text
        style={{
          fontSize: 15,
          fontWeight: 600,
          color: "#333",
          display: "block",
          marginBottom: 20,
        }}
      >
        Pilih salah satu jawaban:
      </Text>
      <Radio.Group
        value={currentAnswer?.multiple_choice_answer}
        onChange={(e) =>
          onAnswerChange(
            currentQuestion.id,
            e.target.value,
            "multiple_choice_answer"
          )
        }
        style={{ width: "100%" }}
      >
        <Space direction="vertical" style={{ width: "100%" }} size={12}>
          {currentQuestion.choices?.map((choice, index) => (
            <Card
              key={index}
              size="small"
              hoverable
              style={{
                borderRadius: 12,
                border:
                  currentAnswer?.multiple_choice_answer === choice
                    ? `2px solid ${getDimensionColor(
                        currentQuestion.dimension
                      )}`
                    : "1px solid #f0f0f0",
                backgroundColor:
                  currentAnswer?.multiple_choice_answer === choice
                    ? `${getDimensionColor(currentQuestion.dimension)}10`
                    : "white",
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
              bodyStyle={{ padding: "16px 20px" }}
              onClick={() =>
                onAnswerChange(
                  currentQuestion.id,
                  choice,
                  "multiple_choice_answer"
                )
              }
            >
              <Radio value={choice} style={{ width: "100%" }}>
                <Text style={{ marginLeft: 12, fontSize: 14 }}>{choice}</Text>
              </Radio>
            </Card>
          )) || []}
        </Space>
      </Radio.Group>
    </div>
  );

  const renderTextAnswer = () => (
    <div style={{ marginTop: 24 }}>
      <Text
        style={{
          fontSize: 15,
          fontWeight: 600,
          color: "#333",
          display: "block",
          marginBottom: 20,
        }}
      >
        Berikan jawaban Anda:
      </Text>
      <TextArea
        value={currentAnswer?.text_answer || ""}
        onChange={(e) =>
          onAnswerChange(currentQuestion.id, e.target.value, "text_answer")
        }
        placeholder="Tuliskan jawaban Anda di sini..."
        rows={6}
        style={{
          borderRadius: 12,
          border: `1px solid ${getDimensionColor(currentQuestion.dimension)}40`,
          fontSize: 14,
        }}
        maxLength={1000}
        showCount
      />
    </div>
  );

  const renderQuestionContent = () => {
    switch (currentQuestion?.question_type) {
      case "likert_5":
      case "likert":
        return renderLikertScale();
      case "multiple_choice":
        return renderMultipleChoice();
      case "text":
        return renderTextAnswer();
      default:
        return renderLikertScale();
    }
  };

  if (!currentQuestion) {
    return (
      <Card
        style={{
          textAlign: "center",
          padding: "60px 20px",
          borderRadius: 16,
          border: "1px solid #f0f0f0",
        }}
      >
        <QuestionCircleOutlined
          style={{ fontSize: 48, color: "#d9d9d9", marginBottom: 16 }}
        />
        <Text style={{ fontSize: 16, color: "#666" }}>
          Pertanyaan tidak ditemukan
        </Text>
      </Card>
    );
  }

  return (
    <Card
      style={{
        borderRadius: 16,
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        border: "1px solid #f0f0f0",
        // minHeight: "600px",
      }}
      bodyStyle={{ padding: isMobile ? "24px 20px" : "32px" }}
    >
      {/* Question Header */}
      <div style={{ marginBottom: 32 }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            marginBottom: 20,
            flexDirection: isMobile ? "column" : "row",
            gap: 16,
          }}
        >
          <div
            style={{
              width: 50,
              height: 50,
              borderRadius: 12,
              background: `linear-gradient(135deg, ${getDimensionColor(
                currentQuestion.dimension
              )}, ${getDimensionColor(currentQuestion.dimension)}CC)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Text style={{ color: "white", fontWeight: 700, fontSize: 18 }}>
              {currentQuestionIndex + 1}
            </Text>
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ marginBottom: 8 }}>
              <Tag
                color={getDimensionColor(currentQuestion.dimension)}
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  padding: "4px 12px",
                  borderRadius: 20,
                }}
              >
                {getDimensionName(currentQuestion.dimension)}
              </Tag>
            </div>

            <Text
              style={{
                fontSize: 13,
                color: "#999",
                display: "block",
                marginBottom: 4,
              }}
            >
              Pertanyaan {currentQuestionIndex + 1} dari {totalQuestions}
            </Text>

            {currentQuestion.is_required && (
              <Text style={{ fontSize: 12, color: "#ff4d4f" }}>
                * Wajib dijawab
              </Text>
            )}
          </div>
        </div>

        <Card
          size="small"
          style={{
            backgroundColor: `${getDimensionColor(
              currentQuestion.dimension
            )}05`,
            border: `1px solid ${getDimensionColor(
              currentQuestion.dimension
            )}20`,
            borderRadius: 12,
          }}
          bodyStyle={{ padding: "20px" }}
        >
          <Text
            style={{
              fontSize: isMobile ? 16 : 17,
              lineHeight: 1.6,
              color: "#333",
              fontWeight: 500,
            }}
          >
            {currentQuestion.text}
          </Text>
        </Card>
      </div>

      {/* Question Content */}
      <div style={{ marginBottom: 40 }}>{renderQuestionContent()}</div>

      <Divider style={{ margin: "32px 0" }} />

      {/* Navigation Buttons */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: isMobile ? "wrap" : "nowrap",
          gap: 16,
        }}
      >
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={onPrev}
          disabled={currentQuestionIndex === 0}
          size="large"
          style={{
            borderRadius: 12,
            height: 48,
            minWidth: isMobile ? "100%" : 140,
            order: isMobile ? 3 : 1,
            fontWeight: 500,
          }}
        >
          Sebelumnya
        </Button>

        <div
          style={{
            order: isMobile ? 1 : 2,
            width: isMobile ? "100%" : "auto",
            textAlign: "center",
          }}
        >
          <Text type="secondary" style={{ fontSize: 14 }}>
            {Object.keys(answers).length} dari {totalQuestions} pertanyaan
            terjawab
          </Text>
        </div>

        {currentQuestionIndex === totalQuestions - 1 ? (
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={onSubmit}
            size="large"
            disabled={Object.keys(answers).length < totalQuestions}
            style={{
              borderRadius: 12,
              height: 48,
              minWidth: isMobile ? "100%" : 160,
              background: getDimensionColor(currentQuestion.dimension),
              borderColor: getDimensionColor(currentQuestion.dimension),
              fontWeight: 600,
              order: isMobile ? 4 : 3,
              boxShadow: `0 4px 12px ${getDimensionColor(
                currentQuestion.dimension
              )}40`,
            }}
          >
            Submit Kuesioner
          </Button>
        ) : (
          <Button
            type="primary"
            icon={<ArrowRightOutlined />}
            onClick={onNext}
            size="large"
            style={{
              borderRadius: 12,
              height: 48,
              minWidth: isMobile ? "100%" : 140,
              background: getDimensionColor(currentQuestion.dimension),
              borderColor: getDimensionColor(currentQuestion.dimension),
              order: isMobile ? 4 : 3,
              fontWeight: 500,
            }}
          >
            Selanjutnya
          </Button>
        )}
      </div>
    </Card>
  );
};

export default ARCSQuestionCard;
