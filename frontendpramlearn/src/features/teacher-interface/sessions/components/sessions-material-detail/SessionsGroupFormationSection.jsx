import React, { useState } from "react";
import { Card, Button, Alert, Typography, Space, message, Tooltip } from "antd";
import {
  TeamOutlined,
  LoadingOutlined,
  UsergroupAddOutlined,
  FilePdfOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import useSessionGroupFormation from "../../hooks/useSessionGroupFormation";

const { Title, Text } = Typography;

const SessionsGroupFormationSection = ({
  materialSlug,
  students,
  onGroupsChanged,
}) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const {
    groupMessage,
    groupProcessing,
    exportingPdf,
    handleAutoGroup,
    handleExportAnalysis,
  } = useSessionGroupFormation(materialSlug, onGroupsChanged);

  const handleCreateHomogen = async () => {
    try {
      await handleAutoGroup("homogen");
      if (onGroupsChanged) onGroupsChanged();
    } catch (error) {
      message.error("Gagal membuat kelompok homogen");
    }
  };

  const handleCreateHeterogen = async () => {
    try {
      await handleAutoGroup("heterogen");
      if (onGroupsChanged) onGroupsChanged();
    } catch (error) {
      message.error("Gagal membuat kelompok heterogen");
    }
  };

  return (
    <Card
      style={{
        borderRadius: 12,
        border: "2px dashed #d9d9d9",
        textAlign: "center",
        padding: "16px",
      }}
      bodyStyle={{ padding: "24px" }}
    >
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <UsergroupAddOutlined
          style={{
            fontSize: isMobile ? 24 : 32,
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
          Pembentukan Kelompok Otomatis
        </Title>
        <Text type="secondary" style={{ fontSize: "14px", color: "#666" }}>
          Bentuk kelompok berdasarkan profil motivasi ARCS siswa
        </Text>
      </div>

      {/* Group Formation Buttons */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: 16,
          flexDirection: isMobile ? "column" : "row",
          gap: isMobile ? 12 : 24,
        }}
      >
        <Button
          type="primary"
          icon={groupProcessing ? <LoadingOutlined /> : <TeamOutlined />}
          onClick={handleCreateHomogen}
          loading={groupProcessing}
          disabled={!students || students.length === 0 || exportingPdf}
          size="large"
          style={{
            backgroundColor: "#52c41a",
            borderColor: "#52c41a",
            minWidth: isMobile ? "100%" : 200,
            height: 48,
            fontWeight: 600,
            borderRadius: 8,
          }}
        >
          Bentuk Kelompok Homogen
        </Button>

        <Button
          type="primary"
          icon={groupProcessing ? <LoadingOutlined /> : <TeamOutlined />}
          onClick={handleCreateHeterogen}
          loading={groupProcessing}
          disabled={!students || students.length === 0 || exportingPdf}
          size="large"
          style={{
            backgroundColor: "#1677ff",
            borderColor: "#1677ff",
            minWidth: isMobile ? "100%" : 200,
            height: 48,
            fontWeight: 600,
            borderRadius: 8,
          }}
        >
          Bentuk Kelompok Heterogen
        </Button>
      </div>

      {/* Export Analysis Button */}
      <div style={{ marginBottom: 16 }}>
        <Tooltip title="Download laporan analisis pembentukan kelompok dalam format PDF">
          <Button
            type="default"
            icon={exportingPdf ? <LoadingOutlined /> : <FilePdfOutlined />}
            onClick={handleExportAnalysis}
            loading={exportingPdf}
            disabled={groupProcessing}
            size="large"
            style={{
              minWidth: isMobile ? "100%" : 250,
              height: 44,
              fontWeight: 600,
              borderRadius: 8,
              borderColor: "#11418b",
              color: "#11418b",
              backgroundColor: "white",
            }}
          >
            {exportingPdf ? (
              "Membuat Laporan PDF..."
            ) : (
              <>
                <DownloadOutlined style={{ marginRight: 4 }} />
                Export Analisis PDF
              </>
            )}
          </Button>
        </Tooltip>
      </div>

      {/* Message */}
      {groupMessage && (
        <Alert
          message={groupMessage}
          type={groupMessage.includes("berhasil") ? "success" : "info"}
          showIcon
          style={{
            marginTop: 16,
            borderRadius: 8,
          }}
        />
      )}

      {/* Info */}
      <div
        style={{
          marginTop: 16,
          padding: 12,
          backgroundColor: "#f0f7ff",
          borderRadius: 6,
          border: "1px solid #d6e4ff",
        }}
      >
        <Text strong style={{ color: "#1677ff", fontSize: "13px" }}>
          💡 Info:
        </Text>
        <div style={{ marginTop: 6, fontSize: "12px", color: "#666" }}>
          <strong>Homogen:</strong> Siswa dengan tingkat motivasi yang sama •{" "}
          <strong>Heterogen:</strong> Siswa dengan tingkat motivasi yang beragam
          <br />
          <strong>Export PDF:</strong> Download laporan analisis lengkap proses
          pembentukan kelompok
          <br />
          <em style={{ color: "#ff7875" }}>
            * Pastikan profil motivasi siswa sudah dianalisis sebelum membentuk
            kelompok
          </em>
        </div>
      </div>

      {/* Warning if no students */}
      {(!students || students.length === 0) && (
        <Alert
          message="Tidak ada data siswa"
          description="Pastikan ada siswa yang terdaftar dalam kelas ini sebelum membentuk kelompok."
          type="warning"
          showIcon
          style={{ marginTop: 16 }}
        />
      )}
    </Card>
  );
};

export default SessionsGroupFormationSection;
