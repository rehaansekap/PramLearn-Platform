import React from "react";
import { Card, Result, Progress, Space, Tag, Typography } from "antd";
import { TrophyOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const QuizResultsOverview = ({ results }) => {
  const getScoreColor = (score) => {
    if (score >= 80) return "#52c41a";
    if (score >= 60) return "#faad14";
    return "#ff4d4f";
  };

  const getScoreStatus = (score) => {
    if (score >= 80) return "success";
    if (score >= 60) return "normal";
    return "exception";
  };

  const getGradeText = (score) => {
    if (score >= 90) return "A";
    if (score >= 80) return "B";
    if (score >= 70) return "C";
    if (score >= 60) return "D";
    return "E";
  };

  const getPerformanceMessage = (score) => {
    if (score >= 90) return "Luar biasa! Hasil yang sangat memuaskan! 🌟";
    if (score >= 80)
      return "Bagus sekali! Anda telah memahami materi dengan baik! 👏";
    if (score >= 70)
      return "Cukup baik! Ada beberapa area yang bisa diperbaiki 📚";
    if (score >= 60)
      return "Perlu lebih banyak latihan untuk menguasai materi 💪";
    return "Jangan menyerah! Mari belajar lebih giat lagi! 📖";
  };

  return (
    <Card
      style={{
        marginBottom: 24,
        borderRadius: 16,
        background: `linear-gradient(135deg, ${getScoreColor(
          results.score
        )}15, #fff)`,
        border: `2px solid ${getScoreColor(results.score)}`,
        boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
      }}
      bodyStyle={{ padding: "32px" }}
    >
      <Result
        icon={
          <div style={{ position: "relative" }}>
            <TrophyOutlined
              style={{
                color: getScoreColor(results.score),
                fontSize: 80,
                filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.1))",
              }}
            />
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                background: "white",
                borderRadius: "50%",
                width: 40,
                height: 40,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 20,
                fontWeight: "bold",
                color: getScoreColor(results.score),
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
            >
              {getGradeText(results.score)}
            </div>
          </div>
        }
        title={
          <Space
            direction="vertical"
            size="small"
            style={{ textAlign: "center" }}
          >
            <Title
              level={1}
              style={{
                margin: 0,
                color: getScoreColor(results.score),
                fontSize: 48,
                fontWeight: 700,
              }}
            >
              {results.score.toFixed(1)}
            </Title>
            <Tag
              color={getScoreColor(results.score)}
              style={{
                fontSize: 18,
                padding: "8px 16px",
                fontWeight: "bold",
                borderRadius: 20,
                border: "none",
              }}
            >
              Grade: {getGradeText(results.score)}
            </Tag>
          </Space>
        }
        subTitle={
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            <div style={{ textAlign: "center" }}>
              <Text style={{ fontSize: 18, fontWeight: 500 }}>
                {results.correct_answers} dari {results.total_questions} soal
                benar
              </Text>
            </div>

            <div style={{ maxWidth: 400, margin: "0 auto" }}>
              <Progress
                percent={results.score}
                strokeColor={{
                  "0%": getScoreColor(results.score),
                  "100%": getScoreColor(results.score),
                }}
                status={getScoreStatus(results.score)}
                strokeWidth={12}
                showInfo={false}
                style={{ marginBottom: 16 }}
              />
              <div
                style={{
                  background: `${getScoreColor(results.score)}10`,
                  padding: "16px",
                  borderRadius: 12,
                  border: `1px solid ${getScoreColor(results.score)}30`,
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    color: "#2c3e50",
                    fontWeight: 500,
                    textAlign: "center",
                    display: "block",
                  }}
                >
                  {getPerformanceMessage(results.score)}
                </Text>
              </div>
            </div>
          </Space>
        }
      />
    </Card>
  );
};

export default QuizResultsOverview;
