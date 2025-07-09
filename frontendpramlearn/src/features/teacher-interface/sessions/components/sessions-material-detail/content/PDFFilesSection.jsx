import React from "react";
import { Card, Typography, Space, Button, Empty, Row, Col, Tag } from "antd";
import { FileOutlined, EyeOutlined, DownloadOutlined } from "@ant-design/icons";

const { Text } = Typography;

const PDFFilesSection = ({ files = [], onFileOpen, isMobile = false }) => {
  const formatFileSize = (size) => {
    if (!size) return "Unknown size";
    return `${(size / 1024 / 1024).toFixed(2)} MB`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown date";
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (!files || files.length === 0) {
    return (
      <div
        style={{
          background: "linear-gradient(135deg, #f8fafc 0%, #e6f3ff 100%)",
          borderRadius: 16,
          padding: isMobile ? 24 : 32,
          textAlign: "center",
          border: "2px dashed #d1ecf1",
        }}
      >
        <div
          style={{
            background: "rgba(24, 144, 255, 0.1)",
            width: isMobile ? 60 : 80,
            height: isMobile ? 60 : 80,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto",
            marginBottom: 16,
          }}
        >
          <FileOutlined
            style={{
              fontSize: isMobile ? 24 : 32,
              color: "#1890ff",
            }}
          />
        </div>
        <Empty
          description={
            <Text style={{ color: "#666", fontSize: isMobile ? 14 : 16 }}>
              Belum ada file PDF yang diunggah
            </Text>
          }
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </div>
    );
  }

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #f8fafc 0%, #e6f3ff 100%)",
        borderRadius: 16,
        padding: isMobile ? 16 : 24,
        border: "1px solid #e6f7ff",
      }}
    >
      <Row gutter={[16, 16]}>
        {files.map((file, index) => (
          <Col xs={24} sm={12} lg={8} key={index}>
            <Card
              style={{
                borderRadius: 12,
                border: "1px solid #f0f0f0",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                overflow: "hidden",
                background: "white",
              }}
              bodyStyle={{
                padding: isMobile ? 16 : 20,
              }}
              hoverable
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow =
                  "0 8px 24px rgba(24, 144, 255, 0.12)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)";
              }}
            >
              {/* File Icon Header */}
              <div
                style={{
                  background:
                    "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",
                  borderRadius: 8,
                  padding: isMobile ? 12 : 16,
                  textAlign: "center",
                  marginBottom: 16,
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: "rgba(255, 255, 255, 0.1)",
                    transform: "skew(-12deg)",
                    transformOrigin: "top left",
                  }}
                />
                <FileOutlined
                  style={{
                    fontSize: isMobile ? 28 : 36,
                    color: "white",
                    position: "relative",
                    zIndex: 1,
                  }}
                />
              </div>

              {/* File Info */}
              <Space
                direction="vertical"
                size="small"
                style={{ width: "100%" }}
              >
                <Text
                  strong
                  style={{
                    fontSize: isMobile ? 14 : 16,
                    color: "#262626",
                    display: "block",
                    wordBreak: "break-word",
                    lineHeight: 1.4,
                  }}
                  title={file.name || file.original_filename}
                >
                  {(
                    file.name ||
                    file.original_filename ||
                    `Dokumen ${index + 1}`
                  ).length > (isMobile ? 25 : 30)
                    ? `${(
                        file.name ||
                        file.original_filename ||
                        `Dokumen ${index + 1}`
                      ).substring(0, isMobile ? 25 : 30)}...`
                    : file.name ||
                      file.original_filename ||
                      `Dokumen ${index + 1}`}
                </Text>

                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 8,
                    marginBottom: 8,
                  }}
                >
                  <Tag
                    color="blue"
                    style={{
                      fontSize: 11,
                      padding: "2px 8px",
                      borderRadius: 12,
                    }}
                  >
                    📄 {formatFileSize(file.size || file.file_size)}
                  </Tag>
                  {file.uploaded_at && (
                    <Tag
                      color="green"
                      style={{
                        fontSize: 11,
                        padding: "2px 8px",
                        borderRadius: 12,
                      }}
                    >
                      📅 {formatDate(file.uploaded_at)}
                    </Tag>
                  )}
                </div>
              </Space>

              {/* Action Buttons */}
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  marginTop: 16,
                  flexDirection: isMobile ? "column" : "row",
                }}
              >
                <Button
                  type="primary"
                  icon={<EyeOutlined />}
                  onClick={() => onFileOpen(file.file || file.url)}
                  style={{
                    borderRadius: 8,
                    fontWeight: 500,
                    flex: 1,
                    height: isMobile ? 36 : 40,
                  }}
                  size={isMobile ? "small" : "middle"}
                >
                  {isMobile ? "Buka" : "Buka File"}
                </Button>
                <Button
                  icon={<DownloadOutlined />}
                  onClick={() => {
                    const link = document.createElement("a");
                    link.href = file.file || file.url;
                    link.download =
                      file.name ||
                      file.original_filename ||
                      `dokumen-${index + 1}.pdf`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  style={{
                    borderRadius: 8,
                    borderColor: "#1890ff",
                    color: "#1890ff",
                    fontWeight: 500,
                    height: isMobile ? 36 : 40,
                  }}
                  size={isMobile ? "small" : "middle"}
                >
                  {!isMobile && "Download"}
                </Button>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default PDFFilesSection;
