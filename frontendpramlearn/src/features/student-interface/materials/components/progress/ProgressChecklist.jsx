import React from "react";
import {
  CheckCircleTwoTone,
  ClockCircleTwoTone,
  FileTextOutlined,
  YoutubeOutlined,
} from "@ant-design/icons";
import { List, Typography, Space, Progress } from "antd";

const { Text } = Typography;

const ProgressChecklist = ({ material, isActivityCompleted }) => {
  if (!material) return null;

  // Daftar aktivitas PDF
  const pdfItems = (material.pdf_files || []).map((pdf, idx) => ({
    key: `pdf_opened_${idx}`,
    label: pdf.name || `PDF ${idx + 1}`,
    type: "pdf",
    completed: isActivityCompleted("pdf_opened", idx),
  }));

  // Daftar aktivitas Video
  const videoItems = (material.youtube_videos || [])
    .filter((v) => v.url)
    .map((video, idx) => ({
      key: `video_played_${idx}`,
      label: video.title || `Video ${idx + 1}`,
      type: "video",
      completed: isActivityCompleted("video_played", idx),
    }));

  const items = [...pdfItems, ...videoItems];
  const completedCount = items.filter((item) => item.completed).length;
  const completionRate =
    items.length > 0 ? (completedCount / items.length) * 100 : 0;

  if (items.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "20px 0", color: "#999" }}>
        <Text style={{ fontSize: 14 }}>Tidak ada aktivitas yang tersedia</Text>
      </div>
    );
  }

  return (
    <div>
      {/* Progress Summary */}
      <div
        style={{
          background: "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)",
          padding: "12px 16px",
          borderRadius: 12,
          marginBottom: 16,
          border: "1px solid #90caf9",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <Text style={{ fontSize: 13, fontWeight: 600, color: "#1565c0" }}>
            Aktivitas Selesai
          </Text>
          <Text style={{ fontSize: 13, fontWeight: 600, color: "#1565c0" }}>
            {completedCount}/{items.length}
          </Text>
        </div>
        <Progress
          percent={completionRate}
          strokeColor={{
            "0%": "#42a5f5",
            "100%": "#1976d2",
          }}
          trailColor="#e3f2fd"
          strokeWidth={6}
          showInfo={false}
        />
      </div>

      {/* Activity List */}
      <List
        size="small"
        dataSource={items}
        renderItem={(item, index) => (
          <List.Item
            style={{
              padding: "8px 0",
              border: "none",
              borderBottom:
                index < items.length - 1 ? "1px solid #f0f0f0" : "none",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                width: "100%",
                padding: "8px 12px",
                borderRadius: 8,
                background: item.completed
                  ? "linear-gradient(135deg, #f1f8e9 0%, #dcedc8 100%)"
                  : "linear-gradient(135deg, #fff8e1 0%, #ffecb3 100%)",
                border: `1px solid ${item.completed ? "#c8e6c9" : "#ffe0b2"}`,
                transition: "all 0.2s ease",
              }}
            >
              {/* Status Icon */}
              <div style={{ flexShrink: 0 }}>
                {item.completed ? (
                  <CheckCircleTwoTone
                    twoToneColor="#4caf50"
                    style={{ fontSize: 16 }}
                  />
                ) : (
                  <ClockCircleTwoTone
                    twoToneColor="#ff9800"
                    style={{ fontSize: 16 }}
                  />
                )}
              </div>

              {/* Type Icon */}
              <div style={{ flexShrink: 0 }}>
                {item.type === "pdf" ? (
                  <div
                    style={{
                      background: "#1976d2",
                      color: "white",
                      borderRadius: "50%",
                      width: 24,
                      height: 24,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <FileTextOutlined style={{ fontSize: 12 }} />
                  </div>
                ) : (
                  <div
                    style={{
                      background: "#d32f2f",
                      color: "white",
                      borderRadius: "50%",
                      width: 24,
                      height: 24,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <YoutubeOutlined style={{ fontSize: 12 }} />
                  </div>
                )}
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: item.completed ? "#2e7d32" : "#ef6c00",
                    textDecoration: item.completed ? "line-through" : "none",
                    opacity: item.completed ? 0.8 : 1,
                  }}
                >
                  {item.label}
                </Text>
              </div>

              {/* Status Badge */}
              <div style={{ flexShrink: 0 }}>
                <div
                  style={{
                    background: item.completed ? "#4caf50" : "#ff9800",
                    color: "white",
                    fontSize: 10,
                    fontWeight: 600,
                    padding: "2px 8px",
                    borderRadius: 12,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  {item.completed ? "✓" : "○"}
                </div>
              </div>
            </div>
          </List.Item>
        )}
      />
    </div>
  );
};

export default ProgressChecklist;
