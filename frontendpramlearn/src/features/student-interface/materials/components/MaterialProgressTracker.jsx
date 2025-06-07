import React, { useEffect, useRef } from "react";
import { Progress, Card, Typography } from "antd"; // Hapus Statistic yang tidak dipakai
import { ClockCircleOutlined, CheckCircleOutlined } from "@ant-design/icons";

const { Text } = Typography;

const MaterialProgressTracker = ({
  progress,
  updateProgress,
  isActive = true,
}) => {
  const timeRef = useRef(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!isActive || !updateProgress) return;

    intervalRef.current = setInterval(() => {
      timeRef.current += 1;
      updateProgress((prev) => ({
        ...prev,
        time_spent: (prev.time_spent || 0) + 1,
      }));
    }, 1000); // 1000 ms = 1 detik

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, updateProgress]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    }
    return `${minutes}m ${secs}s`;
  };

  const getProgressColor = (percent) => {
    if (percent >= 80) return "#52c41a";
    if (percent >= 60) return "#faad14";
    return "#ff4d4f";
  };

  return (
    <Card
      size="small"
      style={{
        position: "fixed",
        bottom: 20,
        right: 20,
        width: 280,
        zIndex: 1000,
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        borderRadius: 8,
      }}
      bodyStyle={{ padding: 12 }}
    >
      <div style={{ marginBottom: 8 }}>
        <Text strong style={{ fontSize: 14, color: "#11418b" }}>
          Progress Pembelajaran
        </Text>
      </div>

      <Progress
        percent={Math.round(progress.completion_percentage || 0)}
        strokeColor={getProgressColor(progress.completion_percentage || 0)}
        size="small"
        showInfo={true}
        style={{ marginBottom: 8 }}
      />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <ClockCircleOutlined style={{ color: "#666", fontSize: 12 }} />
          <Text style={{ fontSize: 12, color: "#666" }}>
            {formatTime(progress.time_spent || 0)}
          </Text>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <CheckCircleOutlined
            style={{
              color:
                (progress.completion_percentage || 0) >= 80
                  ? "#52c41a"
                  : "#d9d9d9",
              fontSize: 12,
            }}
          />
          <Text style={{ fontSize: 12, fontWeight: 500 }}>
            {(progress.completion_percentage || 0) >= 100
              ? "Selesai"
              : "Progress"}
          </Text>
        </div>
      </div>
    </Card>
  );
};

export default MaterialProgressTracker;
