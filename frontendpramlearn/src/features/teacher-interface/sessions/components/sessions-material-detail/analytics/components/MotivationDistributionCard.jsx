import React from "react";
import { Card, Row, Col, Progress, Space, Typography } from "antd";
import { FireOutlined } from "@ant-design/icons";

const { Text } = Typography;

const MotivationDistributionCard = ({ analytics, isMobile }) => {
  const cardStyle = {
    borderRadius: 16,
    height: "100%",
    boxShadow: "0 4px 20px rgba(255, 77, 79, 0.12)",
    border: "1px solid #fff2f0",
    background: "linear-gradient(135deg, #ffffff 0%, #fff2f0 100%)",
  };

  const headerStyle = {
    background: "linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%)",
    borderRadius: "16px 16px 0 0",
    color: "white",
    border: "none",
  };

  const motivationItems = [
    {
      key: "high",
      value: analytics.motivationDistribution.high,
      label: "Tinggi",
      color: "#52c41a",
      icon: "🔥",
      gradient: "linear-gradient(135deg, #52c41a 0%, #73d13d 100%)",
    },
    {
      key: "medium",
      value: analytics.motivationDistribution.medium,
      label: "Sedang",
      color: "#faad14",
      icon: "⚡",
      gradient: "linear-gradient(135deg, #faad14 0%, #ffc53d 100%)",
    },
    {
      key: "low",
      value: analytics.motivationDistribution.low,
      label: "Rendah",
      color: "#ff4d4f",
      icon: "💧",
      gradient: "linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%)",
    },
  ];

  return (
    <Card
      title={
        <Space style={{ color: "white" }}>
          <FireOutlined style={{ fontSize: isMobile ? 16 : 18 }} />
          <span style={{ fontSize: isMobile ? 14 : 16, fontWeight: 600 }}>
            🎯 Distribusi Motivasi
          </span>
        </Space>
      }
      style={cardStyle}
      headStyle={headerStyle}
      bodyStyle={{ padding: isMobile ? "16px" : "24px" }}
    >
      <Row gutter={[8, 16]}>
        {motivationItems.map((item) => {
          const percentage =
            analytics.totalStudents > 0
              ? (item.value / analytics.totalStudents) * 100
              : 0;

          return (
            <Col xs={24} sm={8} key={item.key}>
              <div
                style={{
                  textAlign: "center",
                  padding: isMobile ? "16px 8px" : "20px 12px",
                  background: "rgba(255, 255, 255, 0.9)",
                  borderRadius: 12,
                  border: `2px solid ${item.color}20`,
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
                  transition: "all 0.3s ease",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow =
                    "0 6px 20px rgba(0, 0, 0, 0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 2px 8px rgba(0, 0, 0, 0.04)";
                }}
              >
                <div style={{ marginBottom: 12 }}>
                  <span style={{ fontSize: isMobile ? 20 : 24 }}>
                    {item.icon}
                  </span>
                </div>

                <div
                  style={{
                    fontSize: isMobile ? 28 : 36,
                    fontWeight: 700,
                    background: item.gradient,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    lineHeight: 1,
                    marginBottom: 8,
                  }}
                >
                  {item.value}
                </div>

                <Text
                  style={{
                    fontSize: isMobile ? 11 : 12,
                    color: "#666",
                    fontWeight: 500,
                    display: "block",
                    marginBottom: 12,
                  }}
                >
                  {item.label}
                </Text>

                <div style={{ position: "relative" }}>
                  <Progress
                    percent={percentage}
                    size="small"
                    strokeColor={item.gradient}
                    showInfo={false}
                    strokeWidth={6}
                    style={{ marginBottom: 4 }}
                  />
                  <Text
                    style={{
                      fontSize: 10,
                      color: item.color,
                      fontWeight: 600,
                    }}
                  >
                    {percentage.toFixed(1)}%
                  </Text>
                </div>

                <div
                  style={{
                    marginTop: 8,
                    padding: "4px 8px",
                    background: `${item.color}10`,
                    borderRadius: 6,
                    border: `1px solid ${item.color}20`,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 10,
                      color: item.color,
                      fontWeight: 500,
                    }}
                  >
                    {item.value} dari {analytics.totalStudents} siswa
                  </Text>
                </div>
              </div>
            </Col>
          );
        })}
      </Row>

      {/* Summary */}
      <div
        style={{
          marginTop: 20,
          padding: isMobile ? "12px" : "16px",
          background: "linear-gradient(135deg, #f0f9ff 0%, #e6f7ff 100%)",
          borderRadius: 8,
          border: "1px solid #bae7ff",
        }}
      >
        <Text
          style={{
            fontSize: isMobile ? 11 : 12,
            color: "#0958d9",
            fontWeight: 500,
            display: "block",
            textAlign: "center",
          }}
        >
          💡 Tingkat motivasi berdasarkan analisis ARCS dan aktivitas belajar
        </Text>
      </div>
    </Card>
  );
};

export default MotivationDistributionCard;
