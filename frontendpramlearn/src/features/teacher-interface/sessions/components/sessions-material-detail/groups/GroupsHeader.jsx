import React from "react";
import { Typography, Space } from "antd";
import { TeamOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const GroupsHeader = ({ isMobile = false, groupsCount = 0 }) => {
  return (
    <div
      style={{
        textAlign: "center",
        marginBottom: isMobile ? 24 : 32,
        padding: isMobile ? "24px" : "32px",
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
            "url(data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.08'%3E%3Cpath d='M20 20c0 4.4-3.6 8-8 8s-8-3.6-8-8 3.6-8 8-8 8 3.6 8 8zm0-20c0 4.4-3.6 8-8 8s-8-3.6-8-8 3.6-8 8-8 8 3.6 8 8z'/%3E%3C/g%3E%3C/svg%3E)",
          opacity: 0.3,
        }}
      />

      {/* Content */}
      <div style={{ position: "relative", zIndex: 1 }}>
        <div
          style={{
            background: "rgba(255, 255, 255, 0.15)",
            width: isMobile ? 80 : 100,
            height: isMobile ? 80 : 100,
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
              fontSize: isMobile ? 32 : 40,
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
          Manajemen Kelompok
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
          Kelola kelompok belajar dan pantau aktivitas mereka
        </Text>

        {groupsCount > 0 && (
          <div
            style={{
              background: "rgba(255, 255, 255, 0.2)",
              borderRadius: 20,
              padding: "8px 16px",
              display: "inline-block",
              marginTop: 12,
            }}
          >
            <Text
              style={{
                color: "white",
                fontSize: isMobile ? 12 : 14,
                fontWeight: 600,
              }}
            >
              👥 {groupsCount} Kelompok Aktif
            </Text>
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupsHeader;
