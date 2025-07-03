import React from "react";
import { Card, Result, Progress, Tag, Typography } from "antd";
import { TrophyOutlined } from "@ant-design/icons";

const { Text } = Typography;

const GroupQuizScoreCard = ({ results }) => {
  const getScoreColor = (score) => {
    if (score >= 80) return "#52c41a";
    if (score >= 60) return "#faad14";
    return "#ff4d4f";
  };

  const getGradeText = (score) => {
    if (score >= 90) return "A";
    if (score >= 80) return "B";
    if (score >= 70) return "C";
    if (score >= 60) return "D";
    return "E";
  };

  return (
    <Card
      style={{
        borderRadius: 16,
        background: `linear-gradient(135deg, ${getScoreColor(
          results.score
        )}10, #ffffff)`,
        border: `3px solid ${getScoreColor(results.score)}`,
        boxShadow: `0 8px 24px ${getScoreColor(results.score)}20`,
        textAlign: "center",
      }}
    >
      <Result
        icon={
          <div
            style={{
              background: `linear-gradient(135deg, ${getScoreColor(
                results.score
              )} 0%, ${getScoreColor(results.score)}80 100%)`,
              borderRadius: "50%",
              width: 120,
              height: 120,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
              boxShadow: `0 8px 24px ${getScoreColor(results.score)}30`,
            }}
          >
            <TrophyOutlined style={{ color: "white", fontSize: 48 }} />
          </div>
        }
        title={
          <div style={{ marginBottom: 16 }}>
            <div
              style={{
                fontSize: 36,
                fontWeight: 700,
                color: getScoreColor(results.score),
                marginBottom: 8,
              }}
            >
              {results.score.toFixed(1)}
            </div>
            <Tag
              style={{
                fontSize: 18,
                padding: "8px 16px",
                fontWeight: 700,
                borderRadius: 12,
                background: getScoreColor(results.score),
                color: "white",
                border: "none",
              }}
            >
              Grade: {getGradeText(results.score.toFixed(1))}
            </Tag>
          </div>
        }
        subTitle={
          <div style={{ marginTop: 16 }}>
            <Text
              style={{
                fontSize: 16,
                color: "#666",
                display: "block",
                marginBottom: 12,
              }}
            >
              {results.correct_answers} dari {results.total_questions} soal
              benar
            </Text>
            <Progress
              percent={results.score.toFixed(1)}
              strokeColor={getScoreColor(results.score.toFixed(1))}
              style={{
                maxWidth: 300,
                margin: "0 auto",
              }}
              strokeWidth={8}
            />
          </div>
        }
      />
    </Card>
  );
};

export default GroupQuizScoreCard;
