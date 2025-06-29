import React from "react";
import { Card, Typography, Alert } from "antd";
import { CloudUploadOutlined, InfoCircleOutlined } from "@ant-design/icons";
import UploadARCSCSV from "../../motivation-profile/components/UploadARCSCSV";

const { Title, Text } = Typography;

const MotivationProfileSection = () => {
  return (
    <Card
      className="motivation-profile-card"
      style={{
        marginTop: 0,
        borderRadius: 12,
        border: "1px solid #f0f5ff",
        backgroundColor: "#fafcff",
      }}
      bodyStyle={{ padding: "20px" }}
    >
      {/* Header - lebih compact */}
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
          Upload Data Profil Motivasi ARCS
        </Title>
        <Text type="secondary" style={{ fontSize: "14px", color: "#666" }}>
          Upload file CSV untuk menganalisis profil motivasi siswa
        </Text>
      </div>

      {/* Upload Component - tanpa wrapper tambahan */}
      <UploadARCSCSV />
    </Card>
  );
};

export default MotivationProfileSection;
