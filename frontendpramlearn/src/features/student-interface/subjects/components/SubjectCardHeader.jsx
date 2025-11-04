import React from "react";
import { Progress, Typography, Space } from "antd";
import { UserOutlined } from "@ant-design/icons";

const { Text, Title } = Typography;

const SubjectCardHeader = ({ subject }) => {
  const calculateProgress = () => {
    if (subject.progress !== undefined && subject.progress !== null) {
      return subject.progress;
    }

    // Fallback: hitung dari materials jika ada
    if (subject.materials && subject.materials.length > 0) {
      const totalProgress = subject.materials.reduce(
        (sum, material) => sum + (material.progress || 0),
        0
      );
      return Math.round(totalProgress / subject.materials.length);
    }

    return 0;
  };

  const progressValue = calculateProgress();

  return (
    <div
      style={{
        background:
          "linear-gradient(135deg, #001529 0%, #3a3f5c 60%, #43cea2 100%)",
        padding: "20px 24px 16px",
        color: "white",
        position: "relative",
      }}
    >
      {/* Dekorasi lingkaran */}
      <div
        style={{
          position: "absolute",
          top: -10,
          right: -10,
          width: 40,
          height: 40,
          borderRadius: "50%",
          background: "rgba(255, 255, 255, 0.1)",
        }}
      />

      {/* Judul Subject */}
      <Title
        level={4}
        style={{
          color: "white",
          margin: 0,
          marginBottom: 8,
          fontSize: 16,
          fontWeight: 600,
        }}
      >
        {subject.name}
      </Title>

      {/* Info Guru */}
      <Space size={8} style={{ marginBottom: 12 }}>
        <UserOutlined style={{ fontSize: 12 }} />
        <Text style={{ color: "rgba(255,255,255,0.9)", fontSize: 13 }}>
          {subject.teacher_name || "Belum ada guru"}
        </Text>
      </Space>

      {/* Progress Bar */}
      <div style={{ marginBottom: 8 }}>
        <Progress
          percent={progressValue}
          strokeColor="rgba(255,255,255,0.9)"
          trailColor="rgba(255,255,255,0.2)"
          size="small"
          showInfo={false}
        />
      </div>

      {/* Progress Text */}
      <Text
        style={{
          color: "rgba(255,255,255,0.8)",
          fontSize: 12,
          fontWeight: 500,
        }}
      >
        {progressValue.toFixed(1)}% Selesai
      </Text>
    </div>
  );
};

export default SubjectCardHeader;
