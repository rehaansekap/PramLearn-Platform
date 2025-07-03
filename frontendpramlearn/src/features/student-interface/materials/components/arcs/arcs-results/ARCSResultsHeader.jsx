import React from "react";
import {
  Card,
  Typography,
  Button,
  Space,
  Tag,
  Row,
  Col,
  Statistic,
} from "antd";
import {
  ArrowLeftOutlined,
  TrophyOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  BookOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Title, Text } = Typography;

const ARCSResultsHeader = ({ results, onBack, isMobile }) => {
  const getMotivationColor = (level) => {
    switch (level?.toLowerCase()) {
      case "high":
      case "tinggi":
        return "#52c41a";
      case "medium":
      case "sedang":
        return "#faad14";
      case "low":
      case "rendah":
        return "#ff4d4f";
      default:
        return "#1890ff";
    }
  };

  const getMotivationText = (level) => {
    switch (level?.toLowerCase()) {
      case "high":
        return "TINGGI";
      case "medium":
        return "SEDANG";
      case "low":
        return "RENDAH";
      default:
        return level?.toUpperCase() || "Belum Terukur";
    }
  };

  const getMotivationIcon = (level) => {
    switch (level?.toLowerCase()) {
      case "high":
      case "tinggi":
        return "🏆";
      case "medium":
      case "sedang":
        return "📈";
      case "low":
      case "rendah":
        return "💪";
      default:
        return "📊";
    }
  };

  const averageScore =
    Object.values(results.dimension_scores).reduce((a, b) => a + b, 0) / 4;

  return (
    <>
      {/* Back Button */}
      <div style={{ marginBottom: 16 }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={onBack}
          type="text"
          size={isMobile ? "middle" : "large"}
          style={{
            fontWeight: 500,
            color: "#666",
            fontSize: isMobile ? 14 : 16,
          }}
        >
          Kembali
        </Button>
      </div>

      {/* Main Header Card */}
      <Card
        style={{
          marginBottom: 24,
          borderRadius: isMobile ? 16 : 20,
          overflow: "hidden",
          boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
          border: "none",
        }}
        bodyStyle={{ padding: 0 }}
      >
        {/* Header Section with Gradient */}
        <div
          style={{
            background:
              "linear-gradient(135deg, #001529 0%, #3a3f5c 60%, #43cea2 100%)",
            padding: isMobile ? "24px 16px" : "48px 32px",
            color: "white",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Background Decorations - Hidden on mobile for cleaner look */}
          {!isMobile && (
            <>
              <div
                style={{
                  position: "absolute",
                  top: -50,
                  right: -50,
                  width: 200,
                  height: 200,
                  borderRadius: "50%",
                  background: "rgba(255, 255, 255, 0.1)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: -30,
                  left: -30,
                  width: 150,
                  height: 150,
                  borderRadius: "50%",
                  background: "rgba(255, 255, 255, 0.08)",
                }}
              />
            </>
          )}

          <div style={{ position: "relative", zIndex: 1 }}>
            <Row gutter={[isMobile ? 16 : 32, 24]} align="middle">
              {/* Left Content */}
              <Col xs={24} md={16}>
                <Space
                  direction="vertical"
                  size={isMobile ? "middle" : "large"}
                  style={{ width: "100%" }}
                >
                  <div>
                    <Space
                      size={isMobile ? "small" : "middle"}
                      style={{ marginBottom: isMobile ? 8 : 12 }}
                      wrap
                    >
                      <TrophyOutlined
                        style={{ fontSize: isMobile ? 20 : 28 }}
                      />
                      <Text
                        style={{
                          color: "rgba(255, 255, 255, 0.9)",
                          fontSize: isMobile ? 12 : 16,
                          fontWeight: 600,
                        }}
                      >
                        HASIL KUESIONER ARCS
                      </Text>
                    </Space>
                    <Title
                      level={isMobile ? 4 : 1}
                      style={{
                        color: "white",
                        margin: 0,
                        fontWeight: 800,
                        marginBottom: isMobile ? 4 : 8,
                        fontSize: isMobile ? 18 : undefined,
                        lineHeight: isMobile ? 1.3 : undefined,
                      }}
                    >
                      {results.questionnaire.title}
                    </Title>
                    <Text
                      style={{
                        color: "rgba(255, 255, 255, 0.85)",
                        fontSize: isMobile ? 14 : 16,
                        display: "block",
                        marginBottom: isMobile ? 12 : 16,
                        lineHeight: 1.4,
                      }}
                    >
                      Materi: {results.material.title}
                    </Text>
                  </div>

                  <Space wrap size={isMobile ? "small" : "middle"}>
                    <Tag
                      style={{
                        background: "rgba(255, 255, 255, 0.2)",
                        border: "1px solid rgba(255, 255, 255, 0.3)",
                        color: "white",
                        fontSize: isMobile ? 11 : 14,
                        padding: isMobile ? "4px 8px" : "6px 12px",
                        borderRadius: isMobile ? 16 : 20,
                      }}
                    >
                      <CalendarOutlined style={{ marginRight: 4 }} />
                      {dayjs(results.response.completed_at).format(
                        isMobile ? "DD MMM YY" : "DD MMM YYYY, HH:mm"
                      )}
                    </Tag>
                    <Tag
                      style={{
                        background: "rgba(255, 255, 255, 0.2)",
                        border: "1px solid rgba(255, 255, 255, 0.3)",
                        color: "white",
                        fontSize: isMobile ? 11 : 14,
                        padding: isMobile ? "4px 8px" : "6px 12px",
                        borderRadius: isMobile ? 16 : 20,
                      }}
                    >
                      <CheckCircleOutlined style={{ marginRight: 4 }} />
                      {results.response.answered_questions}/
                      {results.response.total_questions} Terjawab
                    </Tag>
                  </Space>
                </Space>
              </Col>

              {/* Right Content - Motivation Level */}
              <Col xs={24} md={8} style={{ textAlign: "center" }}>
                <div
                  style={{
                    background: "rgba(255, 255, 255, 0.15)",
                    borderRadius: isMobile ? 16 : 24,
                    padding: isMobile ? "20px 16px" : "32px 24px",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    marginTop: isMobile ? 16 : 0,
                  }}
                >
                  <div
                    style={{
                      fontSize: isMobile ? 32 : 48,
                      marginBottom: isMobile ? 8 : 12,
                    }}
                  >
                    {getMotivationIcon(results.motivation_level)}
                  </div>
                  <Title
                    level={isMobile ? 3 : 2}
                    style={{
                      color: "white",
                      margin: 0,
                      marginBottom: isMobile ? 4 : 8,
                      fontWeight: 700,
                      fontSize: isMobile ? 20 : undefined,
                    }}
                  >
                    {getMotivationText(results.motivation_level)}
                  </Title>
                  <Text
                    style={{
                      color: "rgba(255, 255, 255, 0.9)",
                      fontSize: isMobile ? 12 : 14,
                      display: "block",
                      marginBottom: isMobile ? 12 : 16,
                      lineHeight: 1.4,
                    }}
                  >
                    Tingkat Motivasi Belajar
                  </Text>
                  <div
                    style={{
                      fontSize: isMobile ? 20 : 24,
                      fontWeight: 700,
                      color: "white",
                    }}
                  >
                    {averageScore.toFixed(1)}/5.0
                  </div>
                  <Text
                    style={{
                      color: "rgba(255, 255, 255, 0.8)",
                      fontSize: isMobile ? 10 : 12,
                    }}
                  >
                    Skor Rata-rata
                  </Text>
                </div>
              </Col>
            </Row>
          </div>
        </div>

        {/* Stats Section */}
        <div
          style={{
            padding: isMobile ? "16px" : "32px",
            background: "#fafafa",
          }}
        >
          <Row gutter={[isMobile ? 8 : 24, 16]}>
            <Col xs={12} sm={6}>
              <Statistic
                title={
                  <span style={{ fontSize: isMobile ? 10 : 14 }}>
                    Total Pertanyaan
                  </span>
                }
                value={results.response.total_questions}
                prefix={
                  <BookOutlined
                    style={{
                      color: "#1890ff",
                      fontSize: isMobile ? 14 : 16,
                    }}
                  />
                }
                valueStyle={{
                  color: "#1890ff",
                  fontWeight: 700,
                  fontSize: isMobile ? 16 : 24,
                }}
              />
            </Col>
            <Col xs={12} sm={6}>
              <Statistic
                title={
                  <span style={{ fontSize: isMobile ? 10 : 14 }}>Terjawab</span>
                }
                value={results.response.answered_questions}
                prefix={
                  <CheckCircleOutlined
                    style={{
                      color: "#52c41a",
                      fontSize: isMobile ? 14 : 16,
                    }}
                  />
                }
                valueStyle={{
                  color: "#52c41a",
                  fontWeight: 700,
                  fontSize: isMobile ? 16 : 24,
                }}
              />
            </Col>
            <Col xs={12} sm={6}>
              <Statistic
                title={
                  <span style={{ fontSize: isMobile ? 10 : 14 }}>
                    Kelengkapan
                  </span>
                }
                value={Math.round(
                  (results.response.answered_questions /
                    results.response.total_questions) *
                    100
                )}
                suffix="%"
                prefix={
                  <ClockCircleOutlined
                    style={{
                      color: "#faad14",
                      fontSize: isMobile ? 14 : 16,
                    }}
                  />
                }
                valueStyle={{
                  color: "#faad14",
                  fontWeight: 700,
                  fontSize: isMobile ? 16 : 24,
                }}
              />
            </Col>
            <Col xs={12} sm={6}>
              <Statistic
                title={
                  <span style={{ fontSize: isMobile ? 10 : 14 }}>
                    Skor Rata-rata
                  </span>
                }
                value={averageScore.toFixed(1)}
                suffix="/5.0"
                prefix={
                  <TrophyOutlined
                    style={{
                      color: getMotivationColor(results.motivation_level),
                      fontSize: isMobile ? 14 : 16,
                    }}
                  />
                }
                valueStyle={{
                  color: getMotivationColor(results.motivation_level),
                  fontWeight: 700,
                  fontSize: isMobile ? 16 : 24,
                }}
              />
            </Col>
          </Row>
        </div>
      </Card>
    </>
  );
};

export default ARCSResultsHeader;
