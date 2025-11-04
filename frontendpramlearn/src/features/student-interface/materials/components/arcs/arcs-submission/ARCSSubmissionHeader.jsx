import React from "react";
import { Card, Typography, Space, Button, Tag, Progress, Row, Col } from "antd";
import {
  ArrowLeftOutlined,
  FormOutlined,
  ClockCircleOutlined,
  QuestionCircleOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";

dayjs.extend(duration);

const { Title, Text } = Typography;

const ARCSSubmissionHeader = ({
  questionnaire,
  timeRemaining,
  progress,
  answeredCount,
  totalQuestions,
  onBack,
  isMobile,
}) => {
  const getDimensionColor = (dimension) => {
    const colors = {
      attention: "#ff4d4f",
      relevance: "#52c41a",
      confidence: "#1890ff",
      satisfaction: "#fa8c16",
    };
    return colors[dimension] || "#11418b";
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

  const formatTimeRemaining = (seconds) => {
    if (!seconds || seconds <= 0) return "Waktu habis";

    const duration = dayjs.duration(seconds, "seconds");
    const hours = Math.floor(duration.asHours());
    const minutes = duration.minutes();
    const secs = duration.seconds();

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div style={{ marginBottom: 24 }}>
      {/* Back Button Row */}
      <div style={{ marginBottom: 16 }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={onBack}
          type="text"
          size="large"
          style={{
            fontWeight: 500,
            color: "#666",
          }}
        >
          Kembali
        </Button>
      </div>

      {/* Main Header Card */}
      <Card
        style={{
          borderRadius: 16,
          overflow: "hidden",
          boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
          border: "1px solid #f0f0f0",
        }}
        bodyStyle={{ padding: 0 }}
      >
        {/* Header Section */}
        <div
          style={{
            background:
              "linear-gradient(135deg, #001529 0%, #3a3f5c 60%, #43cea2 100%)",
            padding: isMobile ? "20px 16px" : "32px 24px",
            color: "white",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Background Pattern */}
          <div
            style={{
              position: "absolute",
              top: -50,
              right: -50,
              width: 200,
              height: 200,
              borderRadius: "50%",
              background: "rgba(255, 255, 255, 0.05)",
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
              background: "rgba(255, 255, 255, 0.03)",
            }}
          />

          <div style={{ position: "relative", zIndex: 1 }}>
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
              <div>
                <Space size="middle" style={{ marginBottom: 8 }}>
                  <FormOutlined style={{ fontSize: 24 }} />
                  <Text
                    style={{
                      color: "rgba(255, 255, 255, 0.8)",
                      fontSize: 14,
                      fontWeight: 500,
                    }}
                  >
                    KUESIONER ARCS
                  </Text>
                </Space>
                <Title
                  level={isMobile ? 4 : 2}
                  style={{
                    color: "white",
                    margin: 0,
                    fontWeight: 700,
                  }}
                >
                  {questionnaire.title}
                </Title>
              </div>

              {questionnaire.description && (
                <Text
                  style={{
                    color: "rgba(255, 255, 255, 0.9)",
                    fontSize: 15,
                    lineHeight: 1.6,
                    display: "block",
                  }}
                >
                  {questionnaire.description}
                </Text>
              )}
            </Space>
          </div>
        </div>

        {/* Stats Section */}
        <div style={{ padding: isMobile ? "20px 16px" : "24px" }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={6}>
              <div style={{ textAlign: "center" }}>
                <QuestionCircleOutlined
                  style={{
                    fontSize: 24,
                    color: "#1890ff",
                    marginBottom: 8,
                    display: "block",
                  }}
                />
                <Text
                  style={{ fontSize: 24, fontWeight: 700, color: "#1890ff" }}
                >
                  {totalQuestions}
                </Text>
                <div style={{ fontSize: 12, color: "#666" }}>
                  Total Pertanyaan
                </div>
              </div>
            </Col>

            <Col xs={24} sm={6}>
              <div style={{ textAlign: "center" }}>
                <CheckCircleOutlined
                  style={{
                    fontSize: 24,
                    color: "#52c41a",
                    marginBottom: 8,
                    display: "block",
                  }}
                />
                <Text
                  style={{ fontSize: 24, fontWeight: 700, color: "#52c41a" }}
                >
                  {answeredCount}
                </Text>
                <div style={{ fontSize: 12, color: "#666" }}>Sudah Dijawab</div>
              </div>
            </Col>

            <Col xs={24} sm={6}>
              <div style={{ textAlign: "center" }}>
                <ClockCircleOutlined
                  style={{
                    fontSize: 24,
                    color:
                      timeRemaining && timeRemaining <= 300
                        ? "#ff4d4f"
                        : "#fa8c16",
                    marginBottom: 8,
                    display: "block",
                  }}
                />
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    color:
                      timeRemaining && timeRemaining <= 300
                        ? "#ff4d4f"
                        : "#fa8c16",
                  }}
                >
                  {formatTimeRemaining(timeRemaining)}
                </Text>
                <div style={{ fontSize: 12, color: "#666" }}>Sisa Waktu</div>
              </div>
            </Col>

            <Col xs={24} sm={6}>
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    background: `conic-gradient(#1890ff ${
                      progress * 3.6
                    }deg, #f0f0f0 0deg)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 8px",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      background: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 12,
                      fontWeight: 700,
                      color: "#1890ff",
                    }}
                  >
                    {Math.round(progress)}%
                  </div>
                </div>
                <div style={{ fontSize: 12, color: "#666" }}>Progress</div>
              </div>
            </Col>
          </Row>
        </div>
      </Card>
    </div>
  );
};

export default ARCSSubmissionHeader;
