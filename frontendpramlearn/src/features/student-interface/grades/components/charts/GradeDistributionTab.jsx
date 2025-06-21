import React from "react";
import { Card, Typography, Row, Col, Progress } from "antd";

const { Title } = Typography;

const GradeDistributionTab = ({ grades }) => {
  const distributionData = [
    {
      grade: "A (90-100)",
      count: grades.filter((g) => g.grade >= 90).length,
      color: "#52c41a",
      emoji: "🏆",
    },
    {
      grade: "B (80-89)",
      count: grades.filter((g) => g.grade >= 80 && g.grade < 90).length,
      color: "#1890ff",
      emoji: "🥇",
    },
    {
      grade: "C (70-79)",
      count: grades.filter((g) => g.grade >= 70 && g.grade < 80).length,
      color: "#faad14",
      emoji: "🥈",
    },
    {
      grade: "D (60-69)",
      count: grades.filter((g) => g.grade >= 60 && g.grade < 70).length,
      color: "#fa8c16",
      emoji: "🥉",
    },
    {
      grade: "E (<60)",
      count: grades.filter((g) => g.grade < 60).length,
      color: "#ff4d4f",
      emoji: "📚",
    },
  ];

  return (
    <div style={{ padding: "0 24px 24px" }}>
      <Title level={4} style={{ marginBottom: 24, color: "#11418b" }}>
        🎯 Distribusi Nilai Berdasarkan Grade
      </Title>

      <Row gutter={[16, 16]} style={{ justifyContent: "center", alignItems: "center", display: "flex" }}>
        {distributionData.map((item, index) => (
          <Col xs={24} sm={12} md={8} lg={4} key={index}>
            <Card
              size="small"
              style={{
                textAlign: "center",
                borderRadius: 12,
                border: `2px solid ${item.color}20`,
                background: `${item.color}05`,
                transition: "all 0.3s ease",
              }}
              hoverable
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = `0 6px 16px ${item.color}30`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
              }}
            >
              <div style={{ fontSize: 24, marginBottom: 8 }}>{item.emoji}</div>
              <div
                style={{
                  color: item.color,
                  fontSize: 24,
                  fontWeight: "bold",
                  marginBottom: 8,
                }}
              >
                {item.count}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "#666",
                  marginBottom: 12,
                  fontWeight: 500,
                }}
              >
                {item.grade}
              </div>
              <Progress
                percent={(item.count / grades.length) * 100}
                strokeColor={item.color}
                showInfo={false}
                strokeWidth={6}
              />
              <div style={{ fontSize: 11, color: "#999", marginTop: 8 }}>
                {((item.count / grades.length) * 100).toFixed(1)}%
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default GradeDistributionTab;
