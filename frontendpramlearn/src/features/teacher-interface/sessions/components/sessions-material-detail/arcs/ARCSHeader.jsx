import React from "react";
import { Typography, Space, Button } from "antd";
import {
  FileTextOutlined,
  PlusOutlined,
  ReloadOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const ARCSHeader = ({
  isMobile = false,
  questionnaireCount = 0,
  onCreateQuestionnaire,
  onRefresh,
  loading = false,
}) => {
  return (
    <div
      style={{
        textAlign: "center",
        marginBottom: isMobile ? 16 : 24,
        padding: isMobile ? "20px 16px" : "28px 24px",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        borderRadius: 12,
        color: "white",
        boxShadow: "0 6px 20px rgba(102, 126, 234, 0.25)",
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
            "url(data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.06'%3E%3Cpath d='M20 20m-8 0a8 8 0 1 1 16 0a8 8 0 1 1 -16 0'/%3E%3C/g%3E%3C/svg%3E)",
          opacity: 0.4,
        }}
      />

      {/* Content */}
      <div style={{ position: "relative", zIndex: 1 }}>
        <div
          style={{
            background: "rgba(255, 255, 255, 0.15)",
            width: isMobile ? 64 : 80,
            height: isMobile ? 64 : 80,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto",
            marginBottom: isMobile ? 12 : 16,
            backdropFilter: "blur(10px)",
            border: "2px solid rgba(255, 255, 255, 0.2)",
          }}
        >
          <FileTextOutlined
            style={{
              fontSize: isMobile ? 24 : 32,
              color: "white",
            }}
          />
        </div>

        <Title
          level={isMobile ? 5 : 4}
          style={{
            color: "white",
            margin: 0,
            marginBottom: isMobile ? 6 : 8,
            fontWeight: 700,
            fontSize: isMobile ? 16 : 20,
          }}
        >
          Manajemen ARCS
        </Title>

        <Text
          style={{
            fontSize: isMobile ? 12 : 14,
            color: "rgba(255, 255, 255, 0.9)",
            fontWeight: 400,
            display: "block",
            marginBottom: isMobile ? 12 : 16,
            maxWidth: isMobile ? 280 : 400,
            margin: `0 auto ${isMobile ? 12 : 16}px`,
            lineHeight: 1.5,
          }}
        >
          Kelola kuesioner ARCS
          {isMobile
            ? ""
            : " (Attention, Relevance, Confidence, Satisfaction)"}{" "}
          untuk mengukur motivasi siswa
        </Text>

        <Space
          size={isMobile ? "small" : "middle"}
          wrap
          style={{ justifyContent: "center" }}
        >
          <Button
            icon={<ReloadOutlined />}
            onClick={onRefresh}
            loading={loading}
            size={isMobile ? "small" : "middle"}
            style={{
              background: "rgba(255, 255, 255, 0.2)",
              borderColor: "rgba(255, 255, 255, 0.3)",
              color: "white",
              backdropFilter: "blur(10px)",
              fontWeight: 600,
              height: isMobile ? 32 : 40,
              minWidth: isMobile ? 80 : 100,
              borderRadius: isMobile ? 16 : 20,
              fontSize: isMobile ? 12 : 14,
            }}
          >
            {isMobile ? "" : "Refresh"}
          </Button>

          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={onCreateQuestionnaire}
            size={isMobile ? "small" : "middle"}
            style={{
              background: "rgba(255, 255, 255, 0.9)",
              borderColor: "rgba(255, 255, 255, 0.9)",
              color: "#667eea",
              backdropFilter: "blur(10px)",
              fontWeight: 600,
              height: isMobile ? 32 : 40,
              minWidth: isMobile ? 120 : 160,
              borderRadius: isMobile ? 16 : 20,
              boxShadow: "0 3px 8px rgba(255, 255, 255, 0.3)",
              fontSize: isMobile ? 12 : 14,
            }}
          >
            Buat{isMobile ? "" : " Kuesioner"}
          </Button>

          {questionnaireCount > 0 && (
            <div
              style={{
                background: "rgba(255, 255, 255, 0.2)",
                borderRadius: isMobile ? 12 : 16,
                padding: isMobile ? "6px 12px" : "8px 16px",
                display: "inline-block",
                // marginTop: isMobile ? 12 : 16,
                backdropFilter: "blur(10px)",
              }}
            >
              <Text
                style={{
                  color: "white",
                  fontSize: isMobile ? 11 : 13,
                  fontWeight: 600,
                }}
              >
                💎 {questionnaireCount} Kuesioner Aktif
              </Text>
            </div>
          )}
        </Space>
      </div>
    </div>
  );
};

export default ARCSHeader;
