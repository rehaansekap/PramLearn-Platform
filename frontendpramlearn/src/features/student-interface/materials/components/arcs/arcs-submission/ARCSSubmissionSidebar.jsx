import React from "react";
import { Card, Typography, Button, Space, Progress, Tag, Divider } from "antd";
import {
  QuestionCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const ARCSSubmissionSidebar = ({
  allQuestions,
  currentQuestionIndex,
  setCurrentQuestionIndex,
  answers,
  progress,
  questionnaire,
}) => {
  const answeredCount = Object.keys(answers).length;

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
      attention: "Attention",
      relevance: "Relevance",
      confidence: "Confidence",
      satisfaction: "Satisfaction",
    };
    return names[dimension] || dimension;
  };

  // Group questions by dimension
  const questionsByDimension = allQuestions.reduce((acc, question, index) => {
    const dimension = question.dimension;
    if (!acc[dimension]) {
      acc[dimension] = [];
    }
    acc[dimension].push({ ...question, index });
    return acc;
  }, {});

  const getQuestionStatus = (questionIndex) => {
    const question = allQuestions[questionIndex];
    const isAnswered = answers[question?.id];
    const isCurrent = questionIndex === currentQuestionIndex;

    return { isAnswered, isCurrent };
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Progress Overview */}
      <Card
        size="small"
        style={{
          marginBottom: 16,
          borderRadius: 12,
          border: "1px solid #f0f0f0",
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ marginBottom: 12 }}>
            <Text
              style={{
                fontSize: 28,
                fontWeight: 700,
                color: "#1890ff",
                display: "block",
              }}
            >
              {answeredCount}/{allQuestions.length}
            </Text>
            <Text style={{ fontSize: 12, color: "#666" }}>
              Pertanyaan Terjawab
            </Text>
          </div>

          <Progress
            percent={progress}
            strokeColor="#1890ff"
            strokeWidth={8}
            showInfo={false}
            style={{ marginBottom: 8 }}
          />

          <Text style={{ fontSize: 12, color: "#666" }}>
            {Math.round(progress)}% Selesai
          </Text>
        </div>
      </Card>

      {/* Questions Grid by Dimension */}
      <Card
        size="small"
        style={{
          flex: 1,
          borderRadius: 12,
          border: "1px solid #f0f0f0",
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        }}
        title={
          <Text style={{ fontSize: 14, fontWeight: 600 }}>
            Navigasi Pertanyaan
          </Text>
        }
        bodyStyle={{
          padding: "16px",
          // maxHeight: "calc(100vh - 400px)",
          overflowY: "auto",
        }}
      >
        <Space direction="vertical" style={{ width: "100%" }} size="large">
          {Object.entries(questionsByDimension).map(
            ([dimension, questions]) => (
              <div key={dimension}>
                {/* Dimension Header */}
                <div style={{ marginBottom: 12 }}>
                  <Tag
                    color={getDimensionColor(dimension)}
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      padding: "2px 8px",
                      marginBottom: 8,
                    }}
                  >
                    {getDimensionName(dimension)}
                  </Tag>
                  <div style={{ fontSize: 10, color: "#999" }}>
                    {questions.length} pertanyaan
                  </div>
                </div>

                {/* Question Numbers Grid */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    gap: 8,
                  }}
                >
                  {questions.map((question) => {
                    const { isAnswered, isCurrent } = getQuestionStatus(
                      question.index
                    );

                    return (
                      <Button
                        key={question.id}
                        size="small"
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 8,
                          border: isCurrent
                            ? `2px solid ${getDimensionColor(dimension)}`
                            : isAnswered
                            ? `1px solid ${getDimensionColor(dimension)}`
                            : "1px solid #d9d9d9",
                          backgroundColor: isCurrent
                            ? getDimensionColor(dimension)
                            : isAnswered
                            ? `${getDimensionColor(dimension)}15`
                            : "white",
                          color: isCurrent
                            ? "white"
                            : isAnswered
                            ? getDimensionColor(dimension)
                            : "#999",
                          fontWeight: 600,
                          fontSize: 11,
                          padding: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          transition: "all 0.2s ease",
                        }}
                        onClick={() => setCurrentQuestionIndex(question.index)}
                      >
                        {question.index + 1}
                      </Button>
                    );
                  })}
                </div>
              </div>
            )
          )}
        </Space>

        <Divider style={{ margin: "16px 0" }} />

        {/* Legend */}
        <Space direction="vertical" size={8} style={{ width: "100%" }}>
          <Text style={{ fontSize: 11, fontWeight: 600, color: "#666" }}>
            Keterangan:
          </Text>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                width: 16,
                height: 16,
                borderRadius: 4,
                backgroundColor: "#1890ff",
              }}
            />
            <Text style={{ fontSize: 10, color: "#666" }}>
              Sedang dikerjakan
            </Text>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                width: 16,
                height: 16,
                borderRadius: 4,
                backgroundColor: "#52c41a15",
                border: "1px solid #52c41a",
              }}
            />
            <Text style={{ fontSize: 10, color: "#666" }}>Sudah dijawab</Text>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                width: 16,
                height: 16,
                borderRadius: 4,
                backgroundColor: "white",
                border: "1px solid #d9d9d9",
              }}
            />
            <Text style={{ fontSize: 10, color: "#666" }}>Belum dijawab</Text>
          </div>
        </Space>
      </Card>
    </div>
  );
};

export default ARCSSubmissionSidebar;
