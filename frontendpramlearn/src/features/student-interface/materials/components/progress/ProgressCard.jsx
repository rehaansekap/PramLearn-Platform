import React from "react";
import { Card, Button, Space, Progress, Typography } from "antd";
import {
  TrophyOutlined,
  DownOutlined,
  UpOutlined,
  FireOutlined,
  ClockCircleOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import ProgressStats from "./ProgressStats";
import ProgressChecklist from "./ProgressChecklist";

const { Text } = Typography;

const ProgressCard = ({
  progress,
  progressPercent,
  getProgressColor,
  getProgressText,
  formatTime,
  material,
  isActivityCompleted,
  expanded,
  setExpanded,
  onClose,
}) => {
  return (
    <Card
      size="small"
      style={{
        position: "fixed",
        bottom: 104,
        right: 24,
        width: 380,
        zIndex: 999,
        boxShadow:
          "0 20px 40px rgba(17, 65, 139, 0.15), 0 8px 16px rgba(0, 0, 0, 0.1)",
        borderRadius: 20,
        border: "1px solid rgba(255, 255, 255, 0.2)",
        background: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(20px)",
        overflow: "hidden",
        animation: "slideUpFadeIn 0.3s ease-out",
      }}
      bodyStyle={{ padding: 0 }}
    >
      {/* Header dengan Gradient */}
      <div
        style={{
          background:
            "linear-gradient(135deg, #001529 0%, #3a3f5c 60%, #43cea2 100%)",
          padding: "20px 24px 16px",
          color: "white",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background Pattern */}
        <div
          style={{
            position: "absolute",
            top: -20,
            right: -20,
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: "rgba(255, 255, 255, 0.1)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -30,
            left: -30,
            width: 100,
            height: 100,
            borderRadius: "50%",
            background: "rgba(255, 255, 255, 0.05)",
          }}
        />

        <div
          style={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <Space size={12}>
            <div
              style={{
                background: "rgba(255, 255, 255, 0.2)",
                borderRadius: "50%",
                width: 40,
                height: 40,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <TrophyOutlined style={{ color: "#fff", fontSize: 18 }} />
            </div>
            <div>
              <Text strong style={{ fontSize: 16, color: "#fff" }}>
                Progress Pembelajaran
              </Text>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginTop: 4,
                }}
              >
                <FireOutlined style={{ color: "#ffd700", fontSize: 12 }} />
                <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.9)" }}>
                  {getProgressText(progressPercent)}
                </Text>
              </div>
            </div>
          </Space>

          {/* HANYA TOMBOL EXPAND, HAPUS TOMBOL CLOSE */}
          <Button
            type="text"
            size="small"
            icon={expanded ? <UpOutlined /> : <DownOutlined />}
            onClick={() => setExpanded((v) => !v)}
            style={{
              color: "#fff",
              fontSize: 14,
              height: 32,
              width: 32,
              borderRadius: "50%",
              background: "rgba(255, 255, 255, 0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          />
        </div>

        {/* Circular Progress */}
        <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
          <div style={{ position: "relative", display: "inline-block" }}>
            <Progress
              type="circle"
              percent={progressPercent}
              strokeColor={{
                "0%": "#ffd700",
                "50%": "#ff8c00",
                "100%": "#ff6347",
              }}
              trailColor="rgba(255, 255, 255, 0.3)"
              strokeWidth={8}
              size={80}
              showInfo={false}
            />
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                textAlign: "center",
              }}
            >
              <Text style={{ color: "#fff", fontSize: 18, fontWeight: 700 }}>
                {progressPercent}%
              </Text>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area - SISA KODE SAMA */}
      <div style={{ padding: "20px 24px" }}>
        {/* Quick Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 16,
            marginBottom: expanded ? 20 : 0,
          }}
        >
          <div
            style={{
              background: "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)",
              padding: "12px 16px",
              borderRadius: 12,
              textAlign: "center",
              border: "1px solid #90caf9",
            }}
          >
            <ClockCircleOutlined
              style={{ color: "#1976d2", fontSize: 16, marginBottom: 4 }}
            />
            <div style={{ fontSize: 12, color: "#666", marginBottom: 2 }}>
              Waktu Belajar
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#1976d2" }}>
              {formatTime(progress.time_spent || 0)}
            </div>
          </div>

          <div
            style={{
              background:
                progressPercent >= 80
                  ? "linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)"
                  : "linear-gradient(135deg, #fff3e0 0%, #ffcc02 100%)",
              padding: "12px 16px",
              borderRadius: 12,
              textAlign: "center",
              border: `1px solid ${
                progressPercent >= 80 ? "#ce93d8" : "#ffb74d"
              }`,
            }}
          >
            <TrophyOutlined
              style={{
                color: progressPercent >= 80 ? "#7b1fa2" : "#f57c00",
                fontSize: 16,
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
                color: progressPercent >= 80 ? "#7b1fa2" : "#f57c00",
              }}
            >
              {progressPercent >= 100 ? "Selesai!" : "Aktif"}
            </div>
          </div>
        </div>

        {/* Expanded Checklist */}
        {expanded && (
          <div
            style={{
              background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
              borderRadius: 16,
              padding: 16,
              border: "1px solid #dee2e6",
              maxHeight: 200,
              overflowY: "auto",
            }}
          >
            <Text
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "#495057",
                marginBottom: 12,
                display: "block",
              }}
            >
              📋 Daftar Aktivitas Pembelajaran
            </Text>
            <ProgressChecklist
              material={material}
              isActivityCompleted={isActivityCompleted}
            />
          </div>
        )}
      </div>

      {/* TAMBAH CSS ANIMATION */}
      <style jsx>{`
        @keyframes slideUpFadeIn {
          0% {
            transform: translateY(20px);
            opacity: 0;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </Card>
  );
};

export default ProgressCard;
