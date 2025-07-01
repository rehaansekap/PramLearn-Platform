import React from "react";
import { Typography, Space } from "antd";
import { FileOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const ContentHeader = ({ isMobile = false }) => {
  return (
    <div
      style={{
        textAlign: "center",
        marginBottom: isMobile ? 24 : 32,
        padding: isMobile ? "16px" : "24px",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        borderRadius: 16,
        color: "white",
        boxShadow: "0 8px 32px rgba(102, 126, 234, 0.2)",
      }}
    >
      <div
        style={{
          background: "rgba(255, 255, 255, 0.1)",
          width: isMobile ? 60 : 80,
          height: isMobile ? 60 : 80,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto",
          marginBottom: isMobile ? 12 : 16,
          backdropFilter: "blur(10px)",
        }}
      >
        <FileOutlined
          style={{
            fontSize: isMobile ? 24 : 32,
            color: "white",
          }}
        />
      </div>
      <Title
        level={isMobile ? 4 : 3}
        style={{
          color: "white",
          margin: 0,
          marginBottom: isMobile ? 8 : 12,
          fontWeight: 700,
        }}
      >
        Konten Pembelajaran
      </Title>
      <Text
        style={{
          fontSize: isMobile ? 13 : 16,
          color: "rgba(255, 255, 255, 0.9)",
          fontWeight: 400,
        }}
      >
        Kelola dan lihat semua konten dalam materi ini
      </Text>
    </div>
  );
};

export default ContentHeader;
