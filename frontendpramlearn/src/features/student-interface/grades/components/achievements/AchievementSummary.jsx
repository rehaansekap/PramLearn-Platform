import React from "react";
import { Card, Row, Col } from "antd";
import {
  TrophyOutlined,
  ClockCircleOutlined,
  StarOutlined,
} from "@ant-design/icons";

const AchievementSummary = ({ earnedCount, inProgressCount, totalCount }) => {
  const summaryCards = [
    {
      title: "Prestasi Tercapai",
      value: earnedCount,
      icon: <TrophyOutlined style={{ fontSize: 32, marginBottom: 8 }} />,
      gradient: "linear-gradient(135deg, #52c41a 0%, #73d13d 100%)",
      color: "white",
    },
    {
      title: "Sedang Progress",
      value: inProgressCount,
      icon: <ClockCircleOutlined style={{ fontSize: 32, marginBottom: 8 }} />,
      gradient: "linear-gradient(135deg, #faad14 0%, #ffc53d 100%)",
      color: "white",
    },
    {
      title: "Total Prestasi",
      value: totalCount,
      icon: <StarOutlined style={{ fontSize: 32, marginBottom: 8 }} />,
      gradient: "linear-gradient(135deg, #722ed1 0%, #9254de 100%)",
      color: "white",
    },
  ];

  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
      {summaryCards.map((card, index) => (
        <Col xs={24} sm={8} key={index}>
          <Card
            style={{
              borderRadius: 16,
              textAlign: "center",
              background: card.gradient,
              color: card.color,
              border: "none",
              boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
              position: "relative",
              overflow: "hidden",
              transition: "all 0.3s ease",
            }}
            bodyStyle={{ padding: "24px 16px" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.18)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.12)";
            }}
          >
            {/* Decorative Elements */}
            <div
              style={{
                position: "absolute",
                top: -20,
                right: -20,
                width: 80,
                height: 80,
                borderRadius: "50%",
                background: "rgba(255, 255, 255, 0.1)",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: -30,
                left: -30,
                width: 100,
                height: 100,
                borderRadius: "50%",
                background: "rgba(255, 255, 255, 0.05)",
              }}
            />

            <div style={{ position: "relative", zIndex: 1 }}>
              {card.icon}
              <div
                style={{ fontSize: 28, fontWeight: "bold", marginBottom: 4 }}
              >
                {card.value}
              </div>
              <div style={{ fontSize: 14, opacity: 0.9, fontWeight: 500 }}>
                {card.title}
              </div>
            </div>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default AchievementSummary;
