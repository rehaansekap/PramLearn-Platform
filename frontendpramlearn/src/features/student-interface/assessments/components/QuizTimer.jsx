import React, { useState, useEffect } from "react";
import { Typography, Progress, Space } from "antd";
import { ClockCircleOutlined, WarningOutlined } from "@ant-design/icons";

const { Text } = Typography;

const QuizTimer = ({ timeRemaining, onTimeUp }) => {
  const [warningShown, setWarningShown] = useState(false);

  useEffect(() => {
    // Show warning when 5 minutes remaining
    if (timeRemaining <= 300 && timeRemaining > 0 && !warningShown) {
      setWarningShown(true);
    }

    // Auto submit when time runs out
    if (timeRemaining <= 0) {
      onTimeUp?.();
    }
  }, [timeRemaining, warningShown, onTimeUp]);

  const formatTime = (seconds) => {
    if (seconds <= 0) return "00:00:00";

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getTimerColor = () => {
    if (timeRemaining <= 300) return "#ff4d4f"; // Red - 5 minutes or less
    if (timeRemaining <= 900) return "#faad14"; // Orange - 15 minutes or less
    return "#52c41a"; // Green - more than 15 minutes
  };

  const getProgressPercent = () => {
    // Assuming initial time was passed as a prop or calculate based on quiz duration
    // For now, we'll use a simple calculation based on remaining time
    const totalTime = 3600; // 1 hour default
    return Math.max(0, (timeRemaining / totalTime) * 100);
  };

  return (
    <div
      style={{
        background: timeRemaining <= 300 ? "#fff2f0" : "#f6ffed",
        border: `2px solid ${getTimerColor()}`,
        borderRadius: 12,
        padding: "12px 16px",
        minWidth: 200,
        textAlign: "center",
      }}
    >
      <Space direction="vertical" size="small" style={{ width: "100%" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          {timeRemaining <= 300 ? (
            <WarningOutlined style={{ color: "#ff4d4f", fontSize: 16 }} />
          ) : (
            <ClockCircleOutlined
              style={{ color: getTimerColor(), fontSize: 16 }}
            />
          )}
          <Text
            style={{
              fontSize: 18,
              fontWeight: "bold",
              color: getTimerColor(),
              fontFamily: "monospace",
            }}
          >
            {formatTime(timeRemaining)}
          </Text>
        </div>

        <Progress
          percent={getProgressPercent()}
          strokeColor={getTimerColor()}
          trailColor="#f0f0f0"
          size="small"
          showInfo={false}
          style={{ margin: 0 }}
        />

        <Text
          type="secondary"
          style={{
            fontSize: 12,
            color: timeRemaining <= 300 ? "#ff4d4f" : "#666",
          }}
        >
          {timeRemaining <= 300 ? "Waktu hampir habis!" : "Waktu tersisa"}
        </Text>
      </Space>
    </div>
  );
};

export default QuizTimer;
