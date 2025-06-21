import React from "react";
import { Button, Row, Col, Typography, Space, Progress } from "antd";
import {
  ArrowLeftOutlined,
  BookOutlined,
  ClockCircleOutlined,
  PlayCircleOutlined,
  TrophyOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const MaterialHeader = ({ material, progress, subjectData }) => {
  const isMobile = window.innerWidth <= 768;

  const getProgressColor = (percent) => {
    if (percent >= 80) return "#52c41a";
    if (percent >= 60) return "#faad14";
    return "#ff4d4f";
  };

  return (
    <div
      style={{
        background:
          "linear-gradient(135deg, #001529 0%, #3a3f5c 60%, #43cea2 100%)",
        borderRadius: 16,
        padding: "32px 24px",
        marginBottom: 32,
        color: "white",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background Decorations */}
      <div
        style={{
          position: "absolute",
          top: -20,
          right: -20,
          width: 100,
          height: 100,
          borderRadius: "50%",
          background: "rgba(255, 255, 255, 0.1)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -30,
          left: -30,
          width: 120,
          height: 120,
          borderRadius: "50%",
          background: "rgba(255, 255, 255, 0.05)",
        }}
      />

      <Row align="middle" style={{ position: "relative", zIndex: 1 }}>
        <Col xs={24} md={18}>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => window.history.back()}
            style={{
              background: "rgba(255, 255, 255, 0.15)",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              color: "white",
              borderRadius: 8,
              marginBottom: 16,
            }}
          >
            Kembali
          </Button>

          <Title
            level={2}
            style={{ color: "white", margin: 0, marginBottom: 8 }}
          >
            {material.title}
          </Title>

          <Space
            size={16}
            wrap
            style={{
              marginBottom: 16,
              alignItems: isMobile ? "center" : "flex-start",
              justifyContent: isMobile ? "center" : "flex-start",
            }}
          >
            {subjectData && (
              <Space size={8}>
                <BookOutlined />
                <Text
                  style={{ color: "rgba(255,255,255,0.9)", fontWeight: 500 }}
                >
                  Mata Pelajaran: <strong>{subjectData.name}</strong>
                </Text>
              </Space>
            )}
            <Space size={8}>
              <ClockCircleOutlined />
              <Text style={{ color: "rgba(255,255,255,0.9)" }}>
                Waktu belajar: {Math.floor((progress.time_spent || 0) / 60)}{" "}
                menit
              </Text>
            </Space>
          </Space>

          {/* Progress Section */}
          <div style={{ marginBottom: 16 }}>
            <Space size={8} style={{ marginBottom: 8 }}>
              <TrophyOutlined />
              <Text
                style={{
                  color: "rgba(255,255,255,0.9)",
                  fontSize: 14,
                  fontWeight: 500,
                  marginRight: isMobile ? 0 : 8,
                }}
              >
                Progress Pembelajaran
              </Text>
            </Space>
            <Progress
              percent={Math.round(progress.completion_percentage || 0)}
              strokeColor={getProgressColor(
                progress.completion_percentage || 0
              )}
              trailColor="rgba(255, 255, 255, 0.2)"
              showInfo={true}
              style={{ maxWidth: 400 }}
              format={(percent) => (
                <span
                  style={{
                    color: "white",
                    fontWeight: 500,
                    fontSize: 14,
                    textShadow: "0 1px 2px rgba(0,0,0,0.3)",
                  }}
                >
                  {percent}%
                </span>
              )}
            />
          </div>
        </Col>
        <Col xs={24} md={6} style={{ textAlign: "center" }}>
          <div
            style={{
              background: "rgba(255, 255, 255, 0.15)",
              borderRadius: 12,
              padding: 16,
              backdropFilter: "blur(10px)",
            }}
          >
            <PlayCircleOutlined style={{ fontSize: 32, marginBottom: 8 }} />
            <div style={{ fontSize: 14, opacity: 0.9 }}>
              Pembelajaran Interaktif
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default MaterialHeader;
