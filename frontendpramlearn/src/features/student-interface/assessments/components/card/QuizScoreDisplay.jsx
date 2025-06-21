import React from "react";
import { Typography, Progress } from "antd";
import { TrophyOutlined } from "@ant-design/icons";

const { Text } = Typography;

const QuizScoreDisplay = ({ quiz }) => {
  const score = quiz.student_attempt?.score || quiz.score || 0;

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #f6ffed 0%, #e6fffb 100%)",
        border: "1px solid #b7eb8f",
        borderRadius: 12,
        padding: "16px",
        marginBottom: 16,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
          marginBottom: 8,
        }}
      >
        <div
          style={{
            background: "#52c41a",
            borderRadius: "50%",
            width: 32,
            height: 32,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <TrophyOutlined style={{ color: "white", fontSize: 16 }} />
        </div>
        <div>
          <Text strong style={{ fontSize: 15, color: "#52c41a" }}>
            Kuis Selesai
          </Text>
          <div
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: "#52c41a",
            }}
          >
            {score.toFixed(1)}/100
          </div>
        </div>
      </div>
      <Progress
        percent={score}
        strokeColor={{
          "0%": "#52c41a",
          "100%": "#389e0d",
        }}
        showInfo={false}
        strokeWidth={8}
      />
    </div>
  );
};

export default QuizScoreDisplay;
