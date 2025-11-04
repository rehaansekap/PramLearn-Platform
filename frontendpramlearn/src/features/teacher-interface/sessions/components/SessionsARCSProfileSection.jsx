import React from "react";
import { Card, Typography } from "antd";
import { CloudUploadOutlined } from "@ant-design/icons";
import SessionsARCSUpload from "./SessionsARCSUpload";

const { Title, Text } = Typography;

const SessionsARCSProfileSection = ({ onUploadSuccess }) => {
  return (
    <Card
      className="sessions-arcs-profile-card"
      style={{
        marginTop: 0,
        borderRadius: 12,
        border: "1px solid #f0f5ff",
        backgroundColor: "#fafcff",
      }}
      bodyStyle={{ padding: "20px" }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          marginBottom: 16,
        }}
      >
        <CloudUploadOutlined
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
          Update Profil Motivasi ARCS Siswa
        </Title>
        <Text type="secondary" style={{ fontSize: "14px", color: "#666" }}>
          Upload file CSV untuk memperbarui analisis profil motivasi siswa dalam
          pertemuan ini
        </Text>
      </div>

      {/* Upload Component */}
      <SessionsARCSUpload onUploadSuccess={onUploadSuccess} />
    </Card>
  );
};

export default SessionsARCSProfileSection;
