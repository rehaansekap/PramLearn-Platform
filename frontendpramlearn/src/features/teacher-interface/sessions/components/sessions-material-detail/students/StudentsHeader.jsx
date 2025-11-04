import React from "react";
import { Typography, Space } from "antd";
import { TeamOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const StudentsHeader = ({ isMobile = false, studentsCount = 0 }) => {
  return (
    <div
      style={{
        textAlign: "center",
        marginBottom: isMobile ? 24 : 32,
        padding: isMobile ? "20px" : "28px",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        borderRadius: 16,
        color: "white",
        boxShadow: "0 8px 32px rgba(102, 126, 234, 0.2)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background Pattern */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            "url(data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E)",
          opacity: 0.3,
        }}
      />

      {/* Content */}
      <div style={{ position: "relative", zIndex: 1 }}>
        <div
          style={{
            background: "rgba(255, 255, 255, 0.15)",
            width: isMobile ? 70 : 90,
            height: isMobile ? 70 : 90,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto",
            marginBottom: isMobile ? 16 : 20,
            backdropFilter: "blur(10px)",
            border: "3px solid rgba(255, 255, 255, 0.2)",
          }}
        >
          <TeamOutlined
            style={{
              fontSize: isMobile ? 28 : 36,
              color: "white",
            }}
          />
        </div>

        <Title
          level={isMobile ? 4 : 3}
          style={{
            color: "white",
            margin: 0,
            marginBottom: isMobile ? 8 : 12,
            fontWeight: 700,
          }}
        >
          Data Siswa
        </Title>

        <Text
          style={{
            fontSize: isMobile ? 14 : 16,
            color: "rgba(255, 255, 255, 0.9)",
            fontWeight: 400,
            display: "block",
            marginBottom: 8,
          }}
        >
          Kelola dan pantau progress siswa dalam materi ini
        </Text>

        {studentsCount > 0 && (
          <div
            style={{
              background: "rgba(255, 255, 255, 0.2)",
              borderRadius: 20,
              padding: "6px 16px",
              display: "inline-block",
              marginTop: 8,
            }}
          >
            <Text
              style={{
                color: "white",
                fontSize: isMobile ? 12 : 14,
                fontWeight: 600,
              }}
            >
              👨‍🎓 {studentsCount} Siswa Terdaftar
            </Text>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentsHeader;
