import React from "react";
import { Row, Col, Typography } from "antd";
import { FilePdfOutlined } from "@ant-design/icons";
import PDFCard from "./PDFCard";
import PDFEmptyState from "./PDFEmptyState";

const { Title, Text } = Typography;

const StudentPDFViewer = ({
  pdfFiles,
  progress,
  updateProgress,
  onActivity,
}) => {
  const handlePdfOpen = async (pdfUrl, index) => {
    // Record aktivitas buka PDF
    if (onActivity) {
      await onActivity("pdf_opened", { position: index });
    }

    // Update last position dengan updater function
    if (updateProgress) {
      updateProgress((prev) => ({
        ...prev,
        last_position: index,
      }));
    }

    // Buka PDF di tab baru
    const fullUrl = pdfUrl.startsWith("http")
      ? pdfUrl
      : `${window.location.origin}${pdfUrl}`;
    window.open(fullUrl, "_blank");
  };

  if (!pdfFiles || pdfFiles.length === 0) {
    return <PDFEmptyState />;
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
            <PDFCard
              file={file}
              index={index}
              progress={progress}
              onPdfOpen={handlePdfOpen}
            />
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default StudentPDFViewer;
