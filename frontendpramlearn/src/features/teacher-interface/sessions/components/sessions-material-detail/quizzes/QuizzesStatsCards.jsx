import React from "react";
import { Row, Col, Card, Statistic } from "antd";
import {
  QuestionCircleOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  TrophyOutlined,
  PlayCircleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";

const QuizzesStatsCards = ({ statistics = {}, isMobile = false }) => {
  const statsData = [
    {
      title: "Total Quiz",
      value: statistics.total_quizzes || 0,
      icon: <QuestionCircleOutlined />,
      color: "#667eea",
      bgGradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      bgLight: "#f8faff",
    },
    {
      title: "Total Kelompok",
      value: statistics.total_groups || 0,
      subtitle: "terdaftar",
      icon: <TeamOutlined />,
      color: "#52c41a",
      bgGradient: "linear-gradient(135deg, #52c41a 0%, #73d13d 100%)",
      bgLight: "#f6ffed",
    },
    {
      title: "Quiz Ditugaskan",
      value: statistics.total_assigned_groups || 0,
      subtitle: "kelompok aktif",
      icon: <PlayCircleOutlined />,
      color: "#faad14",
      bgGradient: "linear-gradient(135deg, #faad14 0%, #ffc53d 100%)",
      bgLight: "#fffbe6",
    },
    {
      title: "Completion Rate",
      value: `${statistics.overall_completion_rate || 0}%`,
      subtitle: "rata-rata selesai",
      icon: <CheckCircleOutlined />,
      color: "#722ed1",
      bgGradient: "linear-gradient(135deg, #722ed1 0%, #9254de 100%)",
      bgLight: "#f9f0ff",
    },
    {
      title: "Avg Score",
      value: `${statistics.average_score || 0}%`,
      subtitle: "rata-rata nilai",
      icon: <TrophyOutlined />,
      color: "#f5222d",
      bgGradient: "linear-gradient(135deg, #f5222d 0%, #ff7875 100%)",
      bgLight: "#fff2f0",
    },
    {
      title: "Active Now",
      value: statistics.active_now || 0,
      subtitle: "sedang dikerjakan",
      icon: <ClockCircleOutlined />,
      color: "#13c2c2",
      bgGradient: "linear-gradient(135deg, #13c2c2 0%, #36cfc9 100%)",
      bgLight: "#e6fffb",
    },
  ];

  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
      {statsData.map((stat, index) => (
        <Col xs={12} sm={8} lg={4} key={index}>
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
                fontSize: isMobile ? 20 : 24,
                fontWeight: 700,
                lineHeight: 1,
                marginBottom: 4,
              }}
              titleStyle={{
                color: "#666",
                fontSize: isMobile ? 11 : 12,
                fontWeight: 600,
                marginBottom: 8,
              }}
            />

            {/* Subtitle */}
            {stat.subtitle && (
              <div
                style={{
                  fontSize: isMobile ? 12 : 12,
                  color: "#999",
                  marginTop: 4,
                  fontWeight: 500,
                }}
              >
                {stat.subtitle}
              </div>
            )}
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default QuizzesStatsCards;
