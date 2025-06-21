import React from "react";
import { Row, Col, Card } from "antd";

const QuizResultsSummaryStats = ({ summary, questions }) => {
  const statsCards = [
    {
      title: "Benar",
      value: summary.correct_answers || 0,
      color: "#52c41a",
      bgColor: "#f6ffed",
      borderColor: "#b7eb8f",
      icon: "✅",
    },
    {
      title: "Salah",
      value: summary.incorrect_answers || 0,
      color: "#ff4d4f",
      bgColor: "#fff2f0",
      borderColor: "#ffccc7",
      icon: "❌",
    },
    {
      title: "Tidak Dijawab",
      value: summary.unanswered || 0,
      color: "#faad14",
      bgColor: "#fffbe6",
      borderColor: "#ffe58f",
      icon: "⏭️",
    },
    {
      title: "Total Soal",
      value: questions.length || 0,
      color: "#1890ff",
      bgColor: "#f6faff",
      borderColor: "#91d5ff",
      icon: "📝",
    },
  ];

  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
      {statsCards.map((stat, index) => (
        <Col xs={12} sm={6} key={index}>
          <Card
            size="small"
            style={{
              textAlign: "center",
              borderRadius: 12,
              background: stat.bgColor,
              border: `2px solid ${stat.borderColor}`,
              transition: "all 0.3s ease",
              height: "100%",
            }}
            bodyStyle={{ padding: "16px 12px" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = `0 6px 16px ${stat.color}30`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
            }}
          >
            <div style={{ marginBottom: 8, fontSize: 20 }}>{stat.icon}</div>
            <div
              style={{
                color: stat.color,
                fontSize: 24,
                fontWeight: "bold",
                marginBottom: 4,
                lineHeight: 1,
              }}
            >
              {stat.value}
            </div>
            <div
              style={{
                fontSize: 12,
                color: "#666",
                fontWeight: 500,
              }}
            >
              {stat.title}
            </div>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default QuizResultsSummaryStats;
