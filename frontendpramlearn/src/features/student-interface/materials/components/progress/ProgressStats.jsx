import React from "react";
import { Typography } from "antd";
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  FireOutlined,
  TrophyOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

const ProgressStats = ({
  progress,
  progressPercent,
  formatTime,
  isMobile = false,
}) => {
  const statsStyle = isMobile
    ? {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 16,
        marginBottom: 24,
      }
    : {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 16,
        marginBottom: 16,
      };

  const cardStyle = {
    padding: "16px",
    borderRadius: 16,
    textAlign: "center",
    position: "relative",
    overflow: "hidden",
    border: "1px solid",
    transition: "all 0.3s ease",
  };

  if (isMobile) {
    return (
      <div style={statsStyle}>
        {/* Time Card */}
        <div
          style={{
            ...cardStyle,
            background: "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)",
            borderColor: "#90caf9",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: -10,
              right: -10,
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: "rgba(25, 118, 210, 0.1)",
            }}
          />
          <div style={{ position: "relative", zIndex: 1 }}>
            <div
              style={{
                background: "#1976d2",
                borderRadius: "50%",
                width: 40,
                height: 40,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 12px",
              }}
            >
              <ClockCircleOutlined style={{ color: "white", fontSize: 18 }} />
            </div>
            <div style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>
              Waktu Belajar
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#1976d2" }}>
              {formatTime(progress.time_spent || 0)}
            </div>
          </div>
        </div>

        {/* Status Card */}
        <div
          style={{
            ...cardStyle,
            background:
              progressPercent >= 80
                ? "linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)"
                : progressPercent >= 50
                ? "linear-gradient(135deg, #fff3e0 0%, #ffcc02 100%)"
                : "linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)",
            borderColor:
              progressPercent >= 80
                ? "#ce93d8"
                : progressPercent >= 50
                ? "#ffb74d"
                : "#ef9a9a",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: -10,
              right: -10,
              width: 40,
              height: 40,
              borderRadius: "50%",
              background:
                progressPercent >= 80
                  ? "rgba(123, 31, 162, 0.1)"
                  : progressPercent >= 50
                  ? "rgba(245, 124, 0, 0.1)"
                  : "rgba(244, 67, 54, 0.1)",
            }}
          />
          <div style={{ position: "relative", zIndex: 1 }}>
            <div
              style={{
                background:
                  progressPercent >= 80
                    ? "#7b1fa2"
                    : progressPercent >= 50
                    ? "#f57c00"
                    : "#f44336",
                borderRadius: "50%",
                width: 40,
                height: 40,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 12px",
              }}
            >
              {progressPercent >= 80 ? (
                <TrophyOutlined style={{ color: "white", fontSize: 18 }} />
              ) : progressPercent >= 50 ? (
                <FireOutlined style={{ color: "white", fontSize: 18 }} />
              ) : (
                <CheckCircleOutlined style={{ color: "white", fontSize: 18 }} />
              )}
            </div>
            <div style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>
              Status Pembelajaran
            </div>
            <div
              style={{
                fontSize: 16,
                fontWeight: 700,
                color:
                  progressPercent >= 80
                    ? "#7b1fa2"
                    : progressPercent >= 50
                    ? "#f57c00"
                    : "#f44336",
              }}
            >
              {progressPercent >= 100
                ? "Selesai!"
                : progressPercent >= 80
                ? "Hampir Selesai"
                : progressPercent >= 50
                ? "Sedang Belajar"
                : "Baru Dimulai"}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={statsStyle}>
      <div
        style={{
          ...cardStyle,
          background: "linear-gradient(135deg, #e8f5e8 0%, #c8e6c8 100%)",
          borderColor: "#81c784",
          flex: 1,
        }}
      >
        <Space size={8}>
          <ClockCircleOutlined style={{ color: "#388e3c", fontSize: 16 }} />
          <Text style={{ fontSize: 14, fontWeight: 500, color: "#388e3c" }}>
            {formatTime(progress.time_spent || 0)}
          </Text>
        </Space>
      </div>

      <div
        style={{
          ...cardStyle,
          background:
            progressPercent >= 80
              ? "linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)"
              : "linear-gradient(135deg, #fff8e1 0%, #ffecb3 100%)",
          borderColor: progressPercent >= 80 ? "#ce93d8" : "#ffb74d",
          flex: 1,
        }}
      >
        <Space size={8}>
          <CheckCircleOutlined
            style={{
              color: progressPercent >= 80 ? "#7b1fa2" : "#f57c00",
              fontSize: 16,
            }}
          />
          <Text style={{ fontSize: 14, fontWeight: 500, color: "#333" }}>
            {progressPercent >= 100 ? "Pembelajaran Selesai" : "Sedang Belajar"}
          </Text>
        </Space>
      </div>
    </div>
  );
};

export default ProgressStats;
