// ProgressChecklist.jsx
import React from "react";
import {
  CheckCircleTwoTone,
  CloseCircleTwoTone,
  FileTextOutlined,
  YoutubeOutlined,
} from "@ant-design/icons";
import { List, Typography, Space } from "antd";

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

  if (items.length === 0) return null;

  return (
    <div style={{ marginBottom: 12 }}>
      <List
        size="small"
        dataSource={items}
        renderItem={(item) => (
          <List.Item>
            <Space>
              {item.completed ? (
                <CheckCircleTwoTone twoToneColor="#52c41a" />
              ) : (
                <CloseCircleTwoTone twoToneColor="#faad14" />
              )}
              {item.type === "pdf" ? (
                <FileTextOutlined style={{ color: "#1890ff" }} />
              ) : (
                <YoutubeOutlined style={{ color: "#ff4d4f" }} />
              )}
              <Text
                style={{
                  textDecoration: item.completed ? "line-through" : "none",
                  color: item.completed ? "#52c41a" : "#333",
                }}
              >
                {item.label}
              </Text>
            </Space>
          </List.Item>
        )}
      />
    </div>
  );
};

export default ProgressChecklist;
