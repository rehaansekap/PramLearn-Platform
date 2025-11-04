import React from "react";
import { Button, Typography, Space, Badge, Divider } from "antd";
import {
  CheckCircleOutlined,
  QuestionCircleOutlined,
  FlagOutlined,
  MenuOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const QuizNavigation = ({
  questions,
  answers,
  flaggedQuestions,
  currentQuestionIndex,
  onQuestionSelect,
  onToggleFlag,
  collapsed,
}) => {
  if (collapsed) {
    return (
      <div style={{ padding: 16, textAlign: "center" }}>
        <MenuOutlined style={{ fontSize: 24, color: "#666" }} />
      </div>
    );
  }

  const getQuestionStatus = (question, index) => {
    const isAnswered = answers[question.id] !== undefined;
    const isFlagged = flaggedQuestions.has(question.id);
    const isCurrent = index === currentQuestionIndex;

    if (isCurrent) {
      return {
        type: "primary",
        style: { backgroundColor: "#1890ff", borderColor: "#1890ff" },
        icon: null,
      };
    }

    if (isAnswered && isFlagged) {
      return {
        type: "default",
        style: {
          backgroundColor: "#fff2e8",
          borderColor: "#faad14",
          color: "#faad14",
        },
        icon: <FlagOutlined style={{ fontSize: 12 }} />,
      };
    }

    if (isAnswered) {
      return {
        type: "default",
        style: {
          backgroundColor: "#f6ffed",
          borderColor: "#52c41a",
          color: "#52c41a",
        },
        icon: <CheckCircleOutlined style={{ fontSize: 12 }} />,
      };
    }

    if (isFlagged) {
      return {
        type: "default",
        style: {
          backgroundColor: "#fff2e8",
          borderColor: "#faad14",
          color: "#faad14",
        },
        icon: <FlagOutlined style={{ fontSize: 12 }} />,
      };
    }

    return {
      type: "default",
      style: { backgroundColor: "#fafafa", borderColor: "#d9d9d9" },
      icon: <QuestionCircleOutlined style={{ fontSize: 12, color: "#999" }} />,
    };
  };

  const answeredCount = Object.keys(answers).length;
  const flaggedCount = flaggedQuestions.size;

  return (
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
              count={flaggedCount}
              style={{ backgroundColor: "#faad14" }}
            />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Text type="secondary">Total:</Text>
            <Badge
              count={questions.length}
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
        {questions.map((question, index) => {
          const status = getQuestionStatus(question, index);
          return (
            <Button
              key={question.id}
              {...status}
              size="small"
              onClick={() => onQuestionSelect(index)}
              style={{
                ...status.style,
                width: "100%",
                height: 40,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                fontWeight: index === currentQuestionIndex ? "bold" : "normal",
              }}
            >
              <div style={{ position: "relative" }}>
                {index + 1}
                {status.icon && (
                  <div
                    style={{
                      position: "absolute",
                      top: -8,
                      right: -8,
                      fontSize: 10,
                    }}
                  >
                    {status.icon}
                  </div>
                )}
              </div>
            </Button>
          );
        })}
      </div>

      <Divider />

      {/* Legend */}
      <div>
        <Text
          strong
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

      {/* Current Question Flag Toggle */}
      {questions[currentQuestionIndex] && (
        <>
          <Divider />
          <Button
            type={
              flaggedQuestions.has(questions[currentQuestionIndex].id)
                ? "primary"
                : "default"
            }
            icon={<FlagOutlined />}
            onClick={() => onToggleFlag(questions[currentQuestionIndex].id)}
            block
            style={{
              backgroundColor: flaggedQuestions.has(
                questions[currentQuestionIndex].id
              )
                ? "#faad14"
                : undefined,
              borderColor: flaggedQuestions.has(
                questions[currentQuestionIndex].id
              )
                ? "#faad14"
                : undefined,
            }}
          >
            {flaggedQuestions.has(questions[currentQuestionIndex].id)
              ? "Hapus Tanda"
              : "Tandai Soal"}
          </Button>
        </>
      )}
    </div>
  );
};

export default QuizNavigation;
