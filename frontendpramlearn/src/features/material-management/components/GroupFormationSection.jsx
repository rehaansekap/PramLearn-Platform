import React from "react";
import { Button, Alert, Card, Typography, Space } from "antd";
import { TeamOutlined, UsergroupAddOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const GroupFormationSection = ({
  onCreateHomogen,
  onCreateHeterogen,
  loading,
  message,
  isMobile,
}) => {
  return (
    <Card
      className="group-formation-card"
      style={{
        marginTop: 0,
        borderRadius: 12,
        border: "1px solid #e8f4fd",
        backgroundColor: "#fafcff",
      }}
      bodyStyle={{ padding: "24px" }}
    >
      {/* Header - dengan layout tengah */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          marginBottom: 20,
        }}
      >
        <UsergroupAddOutlined
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
          Pembentukan Kelompok Otomatis
        </Title>
        <Text type="secondary" style={{ fontSize: "14px", color: "#666" }}>
          Bentuk kelompok berdasarkan profil motivasi ARCS siswa
        </Text>
      </div>

      {/* Buttons - Sesuaikan dengan QuizzesTab */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: 16,
          flexDirection: isMobile ? "column" : "row", // Responsif untuk mobile
          gap: isMobile ? 12 : 24, // Jarak antar tombol
        }}
      >
        <Button
          type="primary"
          icon={<TeamOutlined />}
          onClick={onCreateHomogen}
          loading={loading}
          style={{
            height: 40,
            fontSize: 16,
            fontWeight: 600,
            borderRadius: 8,
            padding: "0 24px",
            minWidth: isMobile ? "100%" : 140, // Full width di mobile
            backgroundColor: "#52c41a",
            borderColor: "#52c41a",
          }}
        >
          Bentuk Kelompok Homogen
        </Button>

        <Button
          type="primary"
          icon={<TeamOutlined />}
          onClick={onCreateHeterogen}
          loading={loading}
          style={{
            height: 40,
            fontSize: 16,
            fontWeight: 600,
            borderRadius: 8,
            padding: "0 24px",
            minWidth: isMobile ? "100%" : 140, // Full width di mobile
          }}
        >
          Bentuk Kelompok Heterogen
        </Button>
      </div>

      {/* Message */}
      {message && (
        <Alert
          message={message}
          type={message.includes("berhasil") ? "success" : "info"}
          showIcon
          style={{
            marginTop: 16,
            borderRadius: 8,
          }}
        />
      )}

      {/* Info - Lebih compact */}
      <div
        style={{
          marginTop: 16, // Kurangi dari 20 ke 16
          padding: 12, // Kurangi dari 16 ke 12
          backgroundColor: "#f0f7ff",
          borderRadius: 6, // Kurangi dari 8 ke 6
          border: "1px solid #d6e4ff",
        }}
      >
        <Text strong style={{ color: "#1677ff", fontSize: "13px" }}>
          💡 Info:
        </Text>
        <div style={{ marginTop: 6, fontSize: "12px", color: "#666" }}>
          <strong>Homogen:</strong> Siswa dengan tingkat motivasi yang sama •{" "}
          <strong>Heterogen:</strong> Siswa dengan tingkat motivasi yang beragam
        </div>
      </div>
    </Card>
  );
};

export default GroupFormationSection;
