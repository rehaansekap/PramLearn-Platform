import React from "react";
import { Row, Col, Card, Statistic, Progress } from "antd";
import {
  FileTextOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  BarChartOutlined,
  EyeOutlined,
  TrophyOutlined,
} from "@ant-design/icons";

const ARCSStatsCards = ({ summaryStats = {}, isMobile = false }) => {
  const {
    totalQuestionnaires = 0,
    activeQuestionnaires = 0,
    totalResponses = 0,
    completedResponses = 0,
    avgAttention = 0,
    avgRelevance = 0,
    avgConfidence = 0,
    avgSatisfaction = 0,
  } = summaryStats;

  const completionRate =
    totalResponses > 0 ? (completedResponses / totalResponses) * 100 : 0;

  const overallARCS =
    (avgAttention + avgRelevance + avgConfidence + avgSatisfaction) / 4;

  const statsData = [
    {
      title: "Total Kuesioner",
      value: totalQuestionnaires,
      icon: <FileTextOutlined />,
      color: "#667eea",
      bgGradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      bgLight: "#f8faff",
      subtitle: `${activeQuestionnaires} aktif`,
    },
    {
      title: "Total Respons",
      value: totalResponses,
      icon: <TeamOutlined />,
      color: "#52c41a",
      bgGradient: "linear-gradient(135deg, #52c41a 0%, #73d13d 100%)",
      bgLight: "#f6ffed",
      subtitle: "siswa berpartisipasi",
    },
    {
      title: "Completion Rate",
      value: `${Math.round(completionRate)}%`,
      icon: <CheckCircleOutlined />,
      color: "#1890ff",
      bgGradient: "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",
      bgLight: "#f0f9ff",
      subtitle: `${completedResponses} selesai`,
      hasProgress: true,
      progressValue: completionRate,
    },
    {
      title: "Skor ARCS Rata-rata",
      value: overallARCS.toFixed(1),
      icon: <TrophyOutlined />,
      color: "#faad14",
      bgGradient: "linear-gradient(135deg, #faad14 0%, #ffc53d 100%)",
      bgLight: "#fffbe6",
      subtitle: "dari skala 5.0",
    },
    {
      title: "Attention",
      value: avgAttention.toFixed(1),
      icon: <EyeOutlined />,
      color: "#722ed1",
      bgGradient: "linear-gradient(135deg, #722ed1 0%, #9254de 100%)",
      bgLight: "#f9f0ff",
      subtitle: "rata-rata",
    },
    {
      title: "Relevance",
      value: avgRelevance.toFixed(1),
      icon: <BarChartOutlined />,
      color: "#13c2c2",
      bgGradient: "linear-gradient(135deg, #13c2c2 0%, #36cfc9 100%)",
      bgLight: "#e6fffb",
      subtitle: "rata-rata",
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
                  fontSize: isMobile ? 9 : 11,
                  color: "#999",
                  marginTop: 4,
                  fontWeight: 500,
                }}
              >
                {stat.subtitle}
              </div>
            )}

            {/* Progress for completion rate */}
            {stat.hasProgress && (
              <div style={{ marginTop: 12 }}>
                <Progress
                  percent={stat.progressValue}
                  size="small"
                  strokeColor={stat.color}
                  showInfo={false}
                  strokeWidth={6}
                />
              </div>
            )}
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default ARCSStatsCards;
