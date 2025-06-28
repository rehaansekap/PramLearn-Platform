import React from "react";
import { Card, Progress, Row, Col, Typography, Space, Statistic } from "antd";
import {
  EyeOutlined,
  HeartOutlined,
  RocketOutlined,
  SmileOutlined,
  TrophyOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const ARCSDimensionScores = ({ dimensionScores, isMobile }) => {
  const getDimensionIcon = (dimension) => {
    const icons = {
      attention: <EyeOutlined />,
      relevance: <HeartOutlined />,
      confidence: <RocketOutlined />,
      satisfaction: <SmileOutlined />,
    };
    return icons[dimension] || <EyeOutlined />;
  };

  const getDimensionColor = (dimension) => {
    const colors = {
      attention: "#ff7875",
      relevance: "#73d13d",
      confidence: "#40a9ff",
      satisfaction: "#b37feb",
    };
    return colors[dimension] || "#1890ff";
  };

  const getDimensionName = (dimension) => {
    const names = {
      attention: "Attention",
      relevance: "Relevance",
      confidence: "Confidence",
      satisfaction: "Satisfaction",
    };
    return names[dimension] || dimension;
  };

  const getDimensionFullName = (dimension) => {
    const names = {
      attention: isMobile ? "Attention" : "Attention (Perhatian)",
      relevance: isMobile ? "Relevance" : "Relevance (Relevansi)",
      confidence: isMobile ? "Confidence" : "Confidence (Kepercayaan)",
      satisfaction: isMobile ? "Satisfaction" : "Satisfaction (Kepuasan)",
    };
    return names[dimension] || dimension;
  };

  const getDimensionDescription = (dimension) => {
    const descriptions = {
      attention: isMobile
        ? "Fokus dalam pembelajaran"
        : "Kemampuan menarik dan mempertahankan fokus dalam pembelajaran",
      relevance: isMobile
        ? "Kesesuaian dengan kebutuhan"
        : "Kesesuaian materi dengan kebutuhan dan tujuan belajar siswa",
      confidence: isMobile
        ? "Kepercayaan diri belajar"
        : "Tingkat kepercayaan diri dalam menguasai materi pembelajaran",
      satisfaction: isMobile
        ? "Kepuasan hasil belajar"
        : "Kepuasan terhadap proses dan hasil pembelajaran yang dicapai",
    };
    return descriptions[dimension] || "";
  };

  const getScoreCategory = (score) => {
    if (score >= 4.5)
      return { text: "Excellent", color: "#52c41a", emoji: "🌟" };
    if (score >= 4.0)
      return {
        text: isMobile ? "Sangat Baik" : "Sangat Baik",
        color: "#73d13d",
        emoji: "🎯",
      };
    if (score >= 3.5) return { text: "Baik", color: "#1890ff", emoji: "👍" };
    if (score >= 3.0) return { text: "Cukup", color: "#faad14", emoji: "📈" };
    if (score >= 2.0)
      return {
        text: isMobile ? "Perlu Perbaikan" : "Perlu Perbaikan",
        color: "#fa8c16",
        emoji: "🔧",
      };
    return {
      text: isMobile ? "Perlu Perhatian" : "Membutuhkan Perhatian",
      color: "#ff4d4f",
      emoji: "⚡",
    };
  };

  const getScorePercentage = (score) => (score / 5) * 100;

  // Sort dimensions by score for better visualization
  const sortedDimensions = Object.entries(dimensionScores).sort(
    (a, b) => b[1] - a[1]
  );

  return (
    <Card
      style={{
        marginBottom: 24,
        borderRadius: isMobile ? 16 : 20,
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        border: "1px solid #f0f0f0",
      }}
      bodyStyle={{ padding: isMobile ? "20px 16px" : "32px" }}
    >
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: isMobile ? 24 : 32 }}>
        <Space direction="vertical" size="small">
          <TrophyOutlined
            style={{
              fontSize: isMobile ? 24 : 32,
              color: "#1890ff",
            }}
          />
          <Title
            level={isMobile ? 4 : 3}
            style={{
              margin: 0,
              color: "#1890ff",
              fontSize: isMobile ? 18 : undefined,
            }}
          >
            Skor per Dimensi ARCS
          </Title>
          <Text
            style={{
              color: "#666",
              fontSize: isMobile ? 14 : 16,
              textAlign: "center",
              display: "block",
              lineHeight: 1.4,
            }}
          >
            {isMobile
              ? "Analisis motivasi pembelajaran"
              : "Analisis mendalam terhadap setiap aspek motivasi pembelajaran"}
          </Text>
        </Space>
      </div>

      {/* Dimension Cards Grid */}
      <Row gutter={[isMobile ? 12 : 24, isMobile ? 16 : 24]}>
        {sortedDimensions.map(([dimension, score], index) => {
          const category = getScoreCategory(score);
          const percentage = getScorePercentage(score);
          const color = getDimensionColor(dimension);

          return (
            <Col xs={12} sm={12} lg={6} key={dimension}>
              <Card
                style={{
                  borderRadius: isMobile ? 12 : 16,
                  border: `2px solid ${color}20`,
                  background: `linear-gradient(135deg, ${color}08, #fff)`,
                  height: "100%",
                  position: "relative",
                  overflow: "hidden",
                  transition: "all 0.3s ease",
                }}
                bodyStyle={{
                  padding: isMobile ? "16px 12px" : "24px 20px",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
                hoverable
              >
                {/* Ranking Badge */}
                <div
                  style={{
                    position: "absolute",
                    top: isMobile ? 8 : 12,
                    right: isMobile ? 8 : 12,
                    width: isMobile ? 20 : 28,
                    height: isMobile ? 20 : 28,
                    borderRadius: "50%",
                    background: color,
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: isMobile ? 10 : 12,
                    fontWeight: 700,
                  }}
                >
                  {index + 1}
                </div>

                {/* Icon and Title */}
                <div
                  style={{
                    textAlign: "center",
                    marginBottom: isMobile ? 12 : 20,
                  }}
                >
                  <div
                    style={{
                      width: isMobile ? 40 : 64,
                      height: isMobile ? 40 : 64,
                      borderRadius: "50%",
                      background: `linear-gradient(135deg, ${color}, ${color}CC)`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: `0 auto ${isMobile ? 8 : 16}px`,
                      boxShadow: `0 ${isMobile ? 4 : 8}px ${
                        isMobile ? 12 : 24
                      }px ${color}30`,
                    }}
                  >
                    {React.cloneElement(getDimensionIcon(dimension), {
                      style: {
                        fontSize: isMobile ? 16 : 28,
                        color: "white",
                      },
                    })}
                  </div>
                  <Title
                    level={5}
                    style={{
                      margin: 0,
                      marginBottom: 2,
                      color: "#333",
                      fontSize: isMobile ? 12 : 14,
                      lineHeight: 1.2,
                    }}
                  >
                    {getDimensionName(dimension)}
                  </Title>
                  <Text
                    style={{
                      fontSize: isMobile ? 9 : 11,
                      color: "#999",
                      display: "block",
                      lineHeight: 1.2,
                      height: isMobile ? 24 : 32,
                      overflow: "hidden",
                    }}
                  >
                    {getDimensionDescription(dimension)}
                  </Text>
                </div>

                {/* Score Display */}
                <div
                  style={{
                    textAlign: "center",
                    marginBottom: isMobile ? 12 : 20,
                  }}
                >
                  <div
                    style={{
                      fontSize: isMobile ? 24 : 36,
                      fontWeight: 800,
                      color: color,
                      lineHeight: 1,
                      marginBottom: 2,
                    }}
                  >
                    {score.toFixed(1)}
                  </div>
                  <Text
                    style={{
                      fontSize: isMobile ? 10 : 14,
                      color: "#666",
                    }}
                  >
                    dari 5.0
                  </Text>
                </div>

                {/* Progress Bar */}
                <div style={{ marginBottom: isMobile ? 8 : 16 }}>
                  <Progress
                    percent={percentage}
                    strokeColor={{
                      "0%": color,
                      "100%": `${color}CC`,
                    }}
                    strokeWidth={isMobile ? 6 : 8}
                    showInfo={false}
                    trailColor={`${color}20`}
                  />
                  <div style={{ textAlign: "center", marginTop: 4 }}>
                    <Text
                      style={{
                        fontSize: isMobile ? 9 : 11,
                        color: "#999",
                      }}
                    >
                      {percentage.toFixed(0)}% dari maksimal
                    </Text>
                  </div>
                </div>

                {/* Category Badge */}
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: isMobile ? 3 : 6,
                      background: `${category.color}15`,
                      color: category.color,
                      padding: isMobile ? "3px 8px" : "6px 12px",
                      borderRadius: isMobile ? 12 : 20,
                      fontSize: isMobile ? 9 : 12,
                      fontWeight: 600,
                      border: `1px solid ${category.color}30`,
                    }}
                  >
                    <span style={{ fontSize: isMobile ? 10 : 12 }}>
                      {category.emoji}
                    </span>
                    <span>{category.text}</span>
                  </div>
                </div>
              </Card>
            </Col>
          );
        })}
      </Row>

      {/* Summary Statistics */}
      <div
        style={{
          marginTop: isMobile ? 20 : 32,
          padding: isMobile ? "16px" : "24px",
          background: "linear-gradient(135deg, #f0f2f5 0%, #e6f7ff 100%)",
          borderRadius: isMobile ? 12 : 16,
          border: "1px solid #e6f7ff",
        }}
      >
        <Row gutter={[isMobile ? 12 : 24, 16]} align="middle">
          <Col xs={24} md={12}>
            <Space direction="vertical" size="small">
              <Text
                style={{
                  fontSize: isMobile ? 12 : 14,
                  color: "#666",
                  fontWeight: 500,
                }}
              >
                📊 Ringkasan Evaluasi
              </Text>
              <Title
                level={isMobile ? 5 : 4}
                style={{
                  margin: 0,
                  color: "#1890ff",
                  fontSize: isMobile ? 14 : undefined,
                }}
              >
                Profil Motivasi ARCS Anda
              </Title>
              <Text
                style={{
                  color: "#666",
                  fontSize: isMobile ? 11 : 13,
                  lineHeight: 1.5,
                }}
              >
                {isMobile
                  ? "Analisis 4 dimensi ARCS"
                  : "Berdasarkan analisis 4 dimensi utama dalam model motivasi ARCS"}
              </Text>
            </Space>
          </Col>
          <Col xs={24} md={12}>
            <Row gutter={isMobile ? 8 : 16}>
              <Col span={12}>
                <Statistic
                  title={
                    <span style={{ fontSize: isMobile ? 10 : 14 }}>
                      {isMobile ? "Tertinggi" : "Dimensi Tertinggi"}
                    </span>
                  }
                  value={getDimensionName(sortedDimensions[0][0])}
                  valueStyle={{
                    color: getDimensionColor(sortedDimensions[0][0]),
                    fontSize: isMobile ? 11 : 14,
                    fontWeight: 600,
                  }}
                  suffix={`(${sortedDimensions[0][1].toFixed(1)})`}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title={
                    <span style={{ fontSize: isMobile ? 10 : 14 }}>
                      {isMobile ? "Pengembangan" : "Area Pengembangan"}
                    </span>
                  }
                  value={getDimensionName(sortedDimensions[3][0])}
                  valueStyle={{
                    color: getDimensionColor(sortedDimensions[3][0]),
                    fontSize: isMobile ? 11 : 14,
                    fontWeight: 600,
                  }}
                  suffix={`(${sortedDimensions[3][1].toFixed(1)})`}
                />
              </Col>
            </Row>
          </Col>
        </Row>
      </div>
    </Card>
  );
};

export default ARCSDimensionScores;
