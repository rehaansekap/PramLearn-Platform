import React, { useEffect, useRef } from "react";
import { Progress, Card, Statistic, Typography } from "antd";
import { ClockCircleOutlined, CheckCircleOutlined } from "@ant-design/icons";

const { Text } = Typography;

const MaterialProgressTracker = ({
  progress,
  onProgressUpdate,
  isActive = true,
}) => {
  const timeRef = useRef(0);
  const intervalRef = useRef(null);

  // Auto-save progress every 10 seconds
  useEffect(() => {
    if (!isActive || !onProgressUpdate) return;

    intervalRef.current = setInterval(() => {
      timeRef.current += 10;
      onProgressUpdate({
        time_spent: (progress.time_spent || 0) + 10,
        completion_percentage: progress.completion_percentage || 0,
        last_position: progress.last_position || 0,
      });
    }, 10000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, onProgressUpdate, progress.time_spent]);

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
        percent={progress.completion_percentage || 0}
        strokeColor={getProgressColor(progress.completion_percentage || 0)}
        size="small"
        showInfo={false}
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
                progress.completion_percentage >= 80 ? "#52c41a" : "#d9d9d9",
              fontSize: 12,
            }}
          />
          <Text style={{ fontSize: 12, fontWeight: 500 }}>
            {Math.round(progress.completion_percentage || 0)}%
          </Text>
        </div>
      </div>
    </Card>
  );
};

export default MaterialProgressTracker;
