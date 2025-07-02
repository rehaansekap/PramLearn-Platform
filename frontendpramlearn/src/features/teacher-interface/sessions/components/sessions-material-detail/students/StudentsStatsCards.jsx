import React from "react";
import { Row, Col, Card, Statistic } from "antd";
import {
  UserOutlined,
  CheckCircleOutlined,
  TrophyOutlined,
  StarOutlined,
  WifiOutlined,
} from "@ant-design/icons";

const StudentsStatsCards = ({
  students = [],
  onlineCount = 0,
  isMobile = false,
}) => {
  const calculateStats = () => {
    const excellent = students.filter(
      (s) => (s.average_grade || 0) >= 85
    ).length;
    const needsAttention = students.filter(
      (s) => (s.completion_percentage || 0) < 50
    ).length;
    const avgProgress =
      students.length > 0
        ? students.reduce((sum, s) => sum + (s.completion_percentage || 0), 0) /
          students.length
        : 0;

    return { excellent, needsAttention, avgProgress };
  };

  const stats = calculateStats();

  const statsData = [
    {
      title: "Total Siswa",
      value: students.length,
      icon: <UserOutlined />,
      color: "#667eea",
      bgGradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      bgLight: "#f8faff",
    },
    {
      title: "Siswa Online",
      value: onlineCount,
      subtitle: `dari ${students.length} siswa`,
      icon: <WifiOutlined />,
      color: "#52c41a",
      bgGradient: "linear-gradient(135deg, #52c41a 0%, #73d13d 100%)",
      bgLight: "#f6ffed",
    },
    {
      title: "Performa Excellent",
      value: stats.excellent,
      subtitle: "≥ 85 rata-rata",
      icon: <TrophyOutlined />,
      color: "#faad14",
      bgGradient: "linear-gradient(135deg, #faad14 0%, #ffc53d 100%)",
      bgLight: "#fffbe6",
    },
    {
      title: "Perlu Perhatian",
      value: stats.needsAttention,
      subtitle: "< 50% progress",
      icon: <StarOutlined />,
      color: "#ff4d4f",
      bgGradient: "linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%)",
      bgLight: "#fff2f0",
    },
  ];

  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
      {statsData.map((stat, index) => (
        <Col xs={12} sm={12} md={6} lg={6} key={index}>
          <Card
            style={{
              borderRadius: 16,
              border: "none",
              background: stat.bgLight,
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              overflow: "hidden",
              position: "relative",
              height: "100%",
            }}
            bodyStyle={{
              padding: isMobile ? "16px" : "20px",
              textAlign: "center",
              position: "relative",
              zIndex: 1,
            }}
            hoverable
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow = `0 8px 24px ${stat.color}20`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
            }}
          >
            {/* Background Pattern */}
            <div
              style={{
                position: "absolute",
                top: -20,
                right: -20,
                width: 80,
                height: 80,
                borderRadius: "50%",
                background: stat.bgGradient,
                opacity: 0.1,
              }}
            />

            {/* Icon */}
            <div
              style={{
                background: stat.bgGradient,
                width: isMobile ? 50 : 60,
                height: isMobile ? 50 : 60,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto",
                marginBottom: 16,
                boxShadow: `0 4px 12px ${stat.color}30`,
              }}
            >
              {React.cloneElement(stat.icon, {
                style: {
                  fontSize: isMobile ? 20 : 24,
                  color: "white",
                },
              })}
            </div>

            {/* Statistics */}
            <Statistic
              title={stat.title}
              value={stat.value}
              valueStyle={{
                color: stat.color,
                fontSize: isMobile ? 22 : 28,
                fontWeight: 700,
                lineHeight: 1,
                marginBottom: 4,
              }}
              titleStyle={{
                color: "#666",
                fontSize: isMobile ? 12 : 14,
                fontWeight: 600,
                marginBottom: 8,
              }}
            />

            {/* Subtitle */}
            {stat.subtitle && (
              <div
                style={{
                  fontSize: isMobile ? 10 : 12,
                  color: "#999",
                  marginTop: 4,
                  fontWeight: 500,
                }}
              >
                {stat.subtitle}
              </div>
            )}

            {/* Progress Bar for Average */}
            {index === 1 && students.length > 0 && (
              <div style={{ marginTop: 12 }}>
                <div
                  style={{
                    width: "100%",
                    height: 4,
                    background: "#f0f0f0",
                    borderRadius: 2,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${(onlineCount / students.length) * 100}%`,
                      height: "100%",
                      background: stat.bgGradient,
                      borderRadius: 2,
                      transition: "width 0.3s ease",
                    }}
                  />
                </div>
                <div
                  style={{
                    fontSize: 10,
                    color: stat.color,
                    marginTop: 4,
                    fontWeight: 600,
                  }}
                >
                  {Math.round((onlineCount / students.length) * 100)}% Online
                </div>
              </div>
            )}
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default StudentsStatsCards;
