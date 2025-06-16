import React, { useEffect, useRef, useState } from "react";
import { Progress, Card, Typography, Button, Space, Badge, Drawer } from "antd";
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  DownOutlined,
  UpOutlined,
  TrophyOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import ProgressChecklist from "./ProgressChecklist";

const { Text } = Typography;

const MaterialProgressTracker = ({
  progress,
  updateProgress,
  isActive = true,
  material,
  isActivityCompleted,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const timeRef = useRef(0);
  const intervalRef = useRef(null);

  // Responsive handler
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!isActive || !updateProgress) return;

    intervalRef.current = setInterval(() => {
      timeRef.current += 1;
      updateProgress((prev) => ({
        ...prev,
        time_spent: (prev.time_spent || 0) + 1,
      }));
    }, 1000);

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

  const getProgressText = (percent) => {
    if (percent >= 100) return "Selesai!";
    if (percent >= 80) return "Hampir Selesai";
    if (percent >= 60) return "Progres Baik";
    if (percent >= 30) return "Sedang Belajar";
    return "Mulai Belajar";
  };

  const progressPercent = Math.round(progress.completion_percentage || 0);

  // Mobile: Floating Action Button
  if (isMobile) {
    return (
      <>
        {/* Floating Progress Button */}
        <div
          style={{
            position: "fixed",
            bottom: 20,
            right: 20,
            zIndex: 1000,
          }}
        >
          <Badge
            count={`${progressPercent}%`}
            style={{
              backgroundColor: getProgressColor(progressPercent),
              fontSize: 10,
              padding: "0 6px",
              height: 18,
              lineHeight: "18px",
              borderRadius: 9,
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            }}
            offset={[-8, 8]}
          >
            <Button
              type="primary"
              shape="circle"
              size="large"
              icon={<TrophyOutlined />}
              onClick={() => setMobileDrawerOpen(true)}
              style={{
                width: 56,
                height: 56,
                fontSize: 20,
                background:
                  "linear-gradient(135deg, #001529 0%, #3a3f5c 60%, #43cea2 100%)", // Sama dengan StudentLayout untuk quiz
                border: "none",
                boxShadow: "0 4px 12px rgba(17, 65, 139, 0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            />
          </Badge>
        </div>

        {/* Mobile Drawer - DENGAN TOMBOL CLOSE */}
        <Drawer
          title={
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <TrophyOutlined style={{ color: "#fff", fontSize: 18 }} />
                <span style={{ color: "#fff", fontWeight: 600 }}>
                  Progress Pembelajaran
                </span>
              </div>
              {/* Tombol Close Manual */}
              <Button
                type="text"
                icon={<CloseOutlined />}
                onClick={() => setMobileDrawerOpen(false)}
                style={{
                  color: "#fff",
                  padding: 0,
                  width: 32,
                  height: 32,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 6,
                }}
                size="large"
              />
            </div>
          }
          placement="bottom"
          height="60vh"
          open={mobileDrawerOpen}
          onClose={() => setMobileDrawerOpen(false)}
          closable={false} // Disable default close button karena kita pakai custom
          headerStyle={{
            background: "#f8f9fa",
            borderBottom: "1px solid #e8e8e8",
            padding: "16px 24px",
          }}
          bodyStyle={{
            padding: "20px",
            background: "#fff",
          }}
        >
          {/* Progress Section */}
          <div style={{ marginBottom: 20 }}>
            <Progress
              percent={progressPercent}
              strokeColor={{
                "0%": getProgressColor(progressPercent),
                "100%": getProgressColor(progressPercent),
              }}
              trailColor="#f0f0f0"
              strokeWidth={10}
              showInfo={false}
              style={{ marginBottom: 12 }}
            />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: 600, color: "#11418b" }}>
                {progressPercent}% - {getProgressText(progressPercent)}
              </Text>
              <Text style={{ fontSize: 14, color: "#666" }}>
                {progressPercent}/100
              </Text>
            </div>
          </div>

          {/* Stats Cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
              marginBottom: 20,
            }}
          >
            <div
              style={{
                background: "#f0f7ff",
                padding: "12px 16px",
                borderRadius: 12,
                border: "1px solid #e6f3ff",
                textAlign: "center",
              }}
            >
              <ClockCircleOutlined
                style={{ color: "#1890ff", fontSize: 18, marginBottom: 4 }}
              />
              <div style={{ fontSize: 12, color: "#666", marginBottom: 2 }}>
                Waktu Belajar
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#1890ff" }}>
                {formatTime(progress.time_spent || 0)}
              </div>
            </div>

            <div
              style={{
                background: progressPercent >= 80 ? "#f6ffed" : "#fafafa",
                padding: "12px 16px",
                borderRadius: 12,
                border: `1px solid ${
                  progressPercent >= 80 ? "#d9f7be" : "#e8e8e8"
                }`,
                textAlign: "center",
              }}
            >
              <CheckCircleOutlined
                style={{
                  color: progressPercent >= 80 ? "#52c41a" : "#d9d9d9",
                  fontSize: 18,
                  marginBottom: 4,
                }}
              />
              <div style={{ fontSize: 12, color: "#666", marginBottom: 2 }}>
                Status
              </div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: progressPercent >= 80 ? "#52c41a" : "#666",
                }}
              >
                {progressPercent >= 100 ? "Completed" : "In Progress"}
              </div>
            </div>
          </div>

          {/* Checklist Section */}
          <div
            style={{
              background: "#fafafa",
              borderRadius: 12,
              padding: 16,
              border: "1px solid #e8e8e8",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: 600, color: "#333" }}>
                Checklist Aktivitas
              </Text>
              <Button
                type="text"
                size="small"
                icon={expanded ? <UpOutlined /> : <DownOutlined />}
                onClick={() => setExpanded((v) => !v)}
                style={{ color: "#11418b", fontSize: 12 }}
              >
                {expanded ? "Sembunyikan" : "Lihat Detail"}
              </Button>
            </div>

            {expanded && (
              <div style={{ maxHeight: 180, overflowY: "auto" }}>
                <ProgressChecklist
                  material={material}
                  isActivityCompleted={isActivityCompleted}
                />
              </div>
            )}
          </div>
        </Drawer>
      </>
    );
  }

  // Desktop: Fixed Card (Original Design)
  return (
    <Card
      size="small"
      style={{
        position: "fixed",
        bottom: 20,
        right: 20,
        width: 350,
        zIndex: 1000,
        boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
        borderRadius: 16,
        border: "1px solid #e8e8e8",
      }}
      bodyStyle={{ padding: 16 }}
    >
      <div
        style={{
          marginBottom: 12,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Space>
          <TrophyOutlined style={{ color: "#11418b", fontSize: 16 }} />
          <Text strong style={{ fontSize: 15, color: "#11418b" }}>
            Progress Pembelajaran
          </Text>
        </Space>
        <Button
          type="text"
          size="small"
          icon={expanded ? <UpOutlined /> : <DownOutlined />}
          onClick={() => setExpanded((v) => !v)}
          style={{
            color: "#11418b",
            fontSize: 12,
            height: 24,
            minWidth: 24,
          }}
        />
      </div>

      {/* Progress Bar with Enhanced Styling */}
      <div style={{ marginBottom: 12 }}>
        <Progress
          percent={progressPercent}
          strokeColor={{
            "0%": getProgressColor(progressPercent),
            "100%": getProgressColor(progressPercent),
          }}
          trailColor="#f0f0f0"
          strokeWidth={8}
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
          <Text style={{ fontSize: 13, fontWeight: 500, color: "#11418b" }}>
            {progressPercent}% - {getProgressText(progressPercent)}
          </Text>
          <Text style={{ fontSize: 12, color: "#666" }}>
            {progressPercent}/100
          </Text>
        </div>
      </div>

      {/* Checklist Progress */}
      {expanded && (
        <div style={{ marginBottom: 12, maxHeight: 200, overflowY: "auto" }}>
          <ProgressChecklist
            material={material}
            isActivityCompleted={isActivityCompleted}
          />
        </div>
      )}

      {/* Stats Section */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "#f8f9fa",
          padding: "8px 12px",
          borderRadius: 8,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <ClockCircleOutlined style={{ color: "#666", fontSize: 14 }} />
          <Text style={{ fontSize: 13, color: "#666" }}>
            {formatTime(progress.time_spent || 0)}
          </Text>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <CheckCircleOutlined
            style={{
              color: progressPercent >= 80 ? "#52c41a" : "#d9d9d9",
              fontSize: 14,
            }}
          />
          <Text style={{ fontSize: 13, fontWeight: 500, color: "#333" }}>
            {progressPercent >= 100 ? "Completed" : "In Progress"}
          </Text>
        </div>
      </div>
    </Card>
  );
};

export default MaterialProgressTracker;
