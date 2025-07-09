import React from "react";
import { Card, Button, Space, Tag, Typography } from "antd";
import {
  FullscreenOutlined,
  FileTextOutlined,
  FilePdfOutlined,
} from "@ant-design/icons";

const { Text, Title } = Typography;

const PDFCard = ({ file, index, progress, onPdfOpen }) => {
  return (
    <Card
      hoverable
      style={{
        borderRadius: 16,
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        height: "100%",
        transition: "all 0.3s ease",
        position: "relative",
      }}
      bodyStyle={{ padding: "20px" }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow =
          "0 8px 24px rgba(220, 53, 69, 0.15)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
      }}
    >
      {/* Header dengan gradient PDF */}
      <div
        style={{
          background:
            "linear-gradient(135deg, #001529 0%, #3a3f5c 60%, #43cea2 100%)",
          padding: "16px",
          margin: "-20px -20px 16px -20px",
          color: "white",
          borderRadius: "16px 16px 0 0",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -5,
            right: -5,
            width: 30,
            height: 30,
            borderRadius: "50%",
            background: "rgba(255, 255, 255, 0.1)",
          }}
        />

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "start",
          }}
        >
          <div style={{ flex: 1 }}>
            <FilePdfOutlined style={{ fontSize: 24, marginBottom: 8 }} />
            <Title
              level={5}
              style={{
                color: "white",
                margin: 0,
                fontSize: 16,
                fontWeight: 600,
              }}
            >
              {file.original_filename ||
                file.file_name ||
                file.file?.split("/").pop() ||
                `Dokumen PDF ${index + 1}`}
            </Title>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ marginBottom: 16 }}>
        <Space direction="vertical" size="small" style={{ width: "100%" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              justifyContent: "center",
            }}
          >
            <FileTextOutlined style={{ color: "#666", fontSize: 12 }} />
            <Text style={{ fontSize: 12, color: "#666" }}>
              Ukuran:{" "}
              {file.file_size
                ? `${(file.file_size / 1024 / 1024).toFixed(2)} MB`
                : "Tidak diketahui"}
            </Text>
          </div>

          {progress.last_position === index && (
            <Tag
              color="green"
              style={{
                fontSize: 11,
                padding: "2px 8px",
                alignSelf: "center",
              }}
            >
              📍 Terakhir dibuka
            </Tag>
          )}
        </Space>
      </div>

      {/* Action Button */}
      <Button
        type="primary"
        block
        icon={<FullscreenOutlined />}
        onClick={() => onPdfOpen(file.file, index)}
        style={{
          borderRadius: 8,
          height: 40,
          fontWeight: 600,
          background:
            "linear-gradient(135deg, #001529 0%, #3a3f5c 60%, #43cea2 100%)",
          border: "none",
          fontSize: 14,
        }}
      >
        Buka PDF
      </Button>
    </Card>
  );
};

export default PDFCard;