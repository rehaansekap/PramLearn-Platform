import React, { useState, useEffect } from "react";
import {
  Card,
  Button,
  List,
  Typography,
  message,
  Row,
  Col,
  Tag,
  Space,
  Empty,
} from "antd";
import {
  FullscreenOutlined,
  FileTextOutlined,
  FilePdfOutlined,
  DownloadOutlined,
} from "@ant-design/icons";

const { Text, Title } = Typography;

const StudentPDFViewer = ({
  pdfFiles,
  progress,
  onProgressUpdate,
  onActivity,
}) => {
  const [currentPdf, setCurrentPdf] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handlePdfOpen = async (pdfUrl, index) => {
    // Record aktivitas buka PDF
    if (onActivity) {
      await onActivity("pdf_opened", { position: index });
    }

    // Update last position
    if (onProgressUpdate) {
      onProgressUpdate({
        ...progress,
        last_position: index,
      });
    }

    // Open PDF in new tab with full URL
    const fullUrl = pdfUrl.startsWith("http")
      ? pdfUrl
      : `${window.location.origin}${pdfUrl}`;
    window.open(fullUrl, "_blank");
  };

  if (!pdfFiles || pdfFiles.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "60px 24px" }}>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <div>
              <Text style={{ fontSize: 16, color: "#666" }}>
                Tidak ada file PDF tersedia
              </Text>
              <div style={{ marginTop: 12 }}>
                <Text type="secondary" style={{ fontSize: 14 }}>
                  File PDF akan tersedia setelah ditambahkan oleh guru
                </Text>
              </div>
            </div>
          }
        />
      </div>
    );
  }

  return (
    <div>
      {/* Header Section */}
      <div style={{ marginBottom: 24, textAlign: "center" }}>
        <FilePdfOutlined
          style={{
            fontSize: 32,
            color: "#11418b",
            marginBottom: 12,
          }}
        />
        <Title
          level={4}
          style={{
            margin: 0,
            marginBottom: 8,
            color: "#11418b",
            fontSize: "20px",
            fontWeight: 700,
          }}
        >
          Dokumen PDF Pembelajaran
        </Title>
        <Text type="secondary" style={{ fontSize: "14px", color: "#666" }}>
          Akses dokumen dan materi pembelajaran dalam format PDF
        </Text>
      </div>

      {/* PDF Cards Grid */}
      <Row gutter={[16, 16]}>
        {pdfFiles.map((file, index) => (
          <Col xs={24} sm={12} lg={8} key={file.id || index}>
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
                    "linear-gradient(135deg, #dc3545 0%, #fd7e14 100%)",
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
                    <FilePdfOutlined
                      style={{ fontSize: 24, marginBottom: 8 }}
                    />
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
                        `PDF File ${index + 1}`}
                    </Title>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div style={{ marginBottom: 16 }}>
                {/* File Info */}
                <Space
                  direction="vertical"
                  size="small"
                  style={{ width: "100%" }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      justifyContent: "center", // Center the content
                    }}
                  >
                    <FileTextOutlined style={{ color: "#666", fontSize: 12 }} />
                    <Text style={{ fontSize: 12, color: "#666" }}>
                      Ukuran:{" "}
                      {file.file_size
                        ? `${(file.file_size / 1024 / 1024).toFixed(2)} MB`
                        : "Unknown"}
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

              {/* Action Buttons */}
              <Space
                direction="vertical"
                size="small"
                style={{ width: "100%" }}
              >
                <Button
                  type="primary"
                  block
                  icon={<FullscreenOutlined />}
                  onClick={() => handlePdfOpen(file.file, index)}
                  style={{
                    borderRadius: 8,
                    height: 40,
                    fontWeight: 600,
                    background:
                      "linear-gradient(135deg, #dc3545 0%, #fd7e14 100%)",
                    border: "none",
                    fontSize: 14,
                  }}
                >
                  Buka PDF
                </Button>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default StudentPDFViewer;
