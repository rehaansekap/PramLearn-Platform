import React, { useState, useEffect } from "react";
import { Card, Alert, message, Space, Divider } from "antd";
import { UploadOutlined, BarChartOutlined } from "@ant-design/icons";
import ARCSUploadArea from "./ARCSUploadArea";
import ARCSUploadActions from "./ARCSUploadActions";
import ARCSUploadProgress from "./ARCSUploadProgress";
import ARCSFormatGuide from "./ARCSFormatGuide";
import ARCSAnalysisExportButton from "./ARCSAnalysisExportButton";
import useSessionsARCSUpload from "../../../hooks/useSessionsARCSUpload";

const ARCSUploadContainer = ({ onUploadSuccess, isMobile = false }) => {
  const {
    file,
    uploading,
    uploadProgress,
    uploadMessage,
    handleFileChange,
    handleUpload,
    resetUpload,
    getMessageType,
    getMessageText,
  } = useSessionsARCSUpload(onUploadSuccess);

  const [containerHeight, setContainerHeight] = useState("auto");

  useEffect(() => {
    const updateHeight = () => {
      const viewportHeight = window.innerHeight;
      const headerHeight = 64;
      const padding = 48;
      const availableHeight = viewportHeight - headerHeight - padding;
      setContainerHeight(
        isMobile ? "auto" : `${Math.max(600, availableHeight)}px`
      );
    };

    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, [isMobile]);

  const handleUploadClick = async () => {
    try {
      await handleUpload();
    } catch (error) {
      // Error handling sudah dilakukan di hook
    }
  };

  return (
    <div
      style={{
        maxWidth: isMobile ? "100%" : 900,
        margin: "0 auto",
        padding: isMobile ? "16px" : "24px",
        minHeight: containerHeight,
        display: "flex",
        flexDirection: "column",
        gap: isMobile ? 16 : 24,
      }}
    >
      {/* Header Card */}
      <Card
        style={{
          borderRadius: 12,
          border: "1px solid #e6f7ff",
          background: "linear-gradient(135deg, #f0f9ff 0%, #e6f7ff 100%)",
        }}
        bodyStyle={{ padding: isMobile ? "16px" : "24px" }}
      >
        <div style={{ textAlign: "center" }}>
          <UploadOutlined
            style={{
              fontSize: isMobile ? 24 : 32,
              color: "#11418b",
              marginBottom: 12,
            }}
          />
          <h2
            style={{
              margin: 0,
              marginBottom: 8,
              color: "#11418b",
              fontSize: isMobile ? "18px" : "22px",
              fontWeight: 700,
              lineHeight: 1.3,
            }}
          >
            Upload Data ARCS dari CSV
          </h2>
          <p
            style={{
              // margin: 0,
              color: "#666",
              fontSize: isMobile ? "13px" : "14px",
              lineHeight: 1.5,
              maxWidth: 600,
              margin: "0 auto",
            }}
          >
            Upload file CSV berisi data pengisian kuesioner ARCS siswa. Sistem
            akan otomatis melakukan clustering untuk menentukan tingkat motivasi
            (Low, Medium, High) berdasarkan skor ARCS.
          </p>
        </div>

        <Alert
          message="Informasi Penting"
          description="Pastikan format file CSV sesuai dengan panduan di bawah. Data yang diupload akan menggantikan profil motivasi siswa yang sudah ada."
          type="info"
          showIcon
          style={{
            marginTop: 16,
            borderRadius: 8,
            backgroundColor: "#f0f9ff",
            border: "1px solid #bae0ff",
          }}
        />
      </Card>

      {/* Upload Area */}
      <Card
        style={{
          borderRadius: 12,
          border: "1px solid #f0f0f0",
          flexGrow: 1,
        }}
        bodyStyle={{ padding: isMobile ? "16px" : "24px" }}
      >
        <ARCSUploadArea
          file={file}
          uploading={uploading}
          onFileChange={handleFileChange}
          isMobile={isMobile}
        />

        {uploading && (
          <ARCSUploadProgress progress={uploadProgress} isMobile={isMobile} />
        )}

        <ARCSUploadActions
          file={file}
          uploading={uploading}
          onUpload={handleUploadClick}
          onReset={resetUpload}
          isMobile={isMobile}
        />

        {uploadMessage && (
          <Alert
            message={getMessageText()}
            type={getMessageType()}
            showIcon
            style={{
              marginTop: 16,
              borderRadius: 8,
            }}
            closable
            onClose={resetUpload}
          />
        )}
      </Card>

      {/* Export Analysis Section */}
      <Card
        style={{
          borderRadius: 12,
          border: "1px solid #e6f4ff",
          background: "linear-gradient(135deg, #f8fafc 0%, #e6f4ff 100%)",
        }}
        bodyStyle={{ padding: isMobile ? "16px" : "24px" }}
      >
        <div style={{ textAlign: "center" }}>
          <BarChartOutlined
            style={{
              fontSize: isMobile ? 20 : 24,
              color: "#11418b",
              marginBottom: 12,
            }}
          />
          <h3
            style={{
              margin: 0,
              marginBottom: 8,
              color: "#11418b",
              fontSize: isMobile ? "16px" : "18px",
              fontWeight: 600,
            }}
          >
            Analisis Hasil Clustering
          </h3>
          <p
            style={{
              margin: 0,
              marginBottom: 16,
              color: "#666",
              fontSize: isMobile ? "12px" : "13px",
              lineHeight: 1.4,
            }}
          >
            Download laporan lengkap analisis clustering ARCS beserta
            rekomendasi strategis dalam format PDF
          </p>

          <ARCSAnalysisExportButton isMobile={isMobile} />
        </div>
      </Card>

      {/* Format Guide */}
      <ARCSFormatGuide isMobile={isMobile} />
    </div>
  );
};

export default ARCSUploadContainer;
