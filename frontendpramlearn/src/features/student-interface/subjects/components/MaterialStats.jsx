import React from "react";
import { Typography, Tag, Space } from "antd";
import { FileTextOutlined } from "@ant-design/icons";

const { Text } = Typography;

const MaterialStats = ({ subject }) => {
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

  const getProgressTag = (progress) => {
    if (progress >= 80) return { color: "green", text: "Sangat Baik" };
    if (progress >= 50) return { color: "orange", text: "Baik" };
    return { color: "red", text: "Perlu Fokus" };
  };

  const progressTag = getProgressTag(progressValue);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 16,
      }}
    >
      <Space size={4}>
        <FileTextOutlined style={{ color: "#1890ff", fontSize: 14 }} />
        <Text style={{ fontSize: 13, color: "#666" }}>
          {subject.material_count || subject.materials?.length || 0} Materi
        </Text>
      </Space>
      <Tag
        color={progressTag.color}
        style={{ fontSize: 11, padding: "2px 8px" }}
      >
        {progressTag.text}
      </Tag>
    </div>
  );
};

export default MaterialStats;
