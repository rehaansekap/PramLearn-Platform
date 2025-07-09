import React from "react";
import { Progress, Typography } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

const { Text } = Typography;

const ARCSUploadProgress = ({ progress, isMobile = false }) => {
  return (
    <div
      style={{
        marginTop: 20,
        marginBottom: 20,
        padding: isMobile ? "16px" : "20px",
        backgroundColor: "#f8fafc",
        borderRadius: 12,
        border: "1px solid #e2e8f0",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <LoadingOutlined
          style={{
            fontSize: isMobile ? 20 : 24,
            color: "#11418b",
            marginRight: 8,
          }}
        />
        <Text
          strong
          style={{
            fontSize: isMobile ? "14px" : "16px",
            color: "#11418b",
          }}
        >
          Memproses dan menganalisis data...
        </Text>
      </div>

      <Progress
        percent={progress}
        status="active"
        strokeColor={{
          "0%": "#11418b",
          "100%": "#1677ff",
        }}
        trailColor="#e6f4ff"
        strokeWidth={isMobile ? 6 : 8}
        style={{ marginBottom: 8 }}
      />

      <Text
        type="secondary"
        style={{
          textAlign: "center",
          display: "block",
          fontSize: isMobile ? "12px" : "13px",
        }}
      >
        Mohon tunggu, sistem sedang melakukan clustering profil motivasi
        siswa...
      </Text>
    </div>
  );
};

export default ARCSUploadProgress;
