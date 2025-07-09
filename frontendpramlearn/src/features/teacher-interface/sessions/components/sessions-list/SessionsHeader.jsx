import React from "react";
import { Typography, Button, Space, Tooltip } from "antd";
import {
  CalendarOutlined,
  PlusOutlined,
  ReloadOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const SessionsHeader = ({ onRefresh, refreshing, sessionsCount, isMobile }) => {
  return (
    <div
      style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        borderRadius: isMobile ? 12 : 16,
        padding: isMobile ? "20px 16px" : "32px",
        marginBottom: isMobile ? 16 : 24,
        width: isMobile ? "100%" : "auto",
        display: "flex",
        justifyContent: isMobile ? "center" : "flex-start",
        alignItems: isMobile ? "center" : "flex-start",
        color: "white",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background decoration - Sesuaikan untuk mobile */}
      <div
        style={{
          position: "absolute",
          top: isMobile ? -30 : -50,
          right: isMobile ? -30 : -50,
          width: isMobile ? 120 : 200,
          height: isMobile ? 120 : 200,
          background: "rgba(255, 255, 255, 0.1)",
          borderRadius: "50%",
          zIndex: 1,
        }}
      />

      <div style={{ position: "relative", zIndex: 2 }}>
        <Space
          style={{
            width: "100%",
            justifyContent: "space-between",
            alignItems: isMobile ? "center" : "flex-start",
          }}
          size={isMobile ? "small" : "large"}
          direction={isMobile ? "column" : "row"}
        >
          <div
            style={{ textAlign: isMobile ? "center" : "left", width: "100%" }}
          >
            {/* Jika mobile tampilkan refresh di sini */}
            {isMobile && (
              <div
                style={{
                  width: isMobile ? "100%" : "auto",
                  display: "flex",
                  justifyContent: isMobile ? "center" : "flex-end",
                  marginTop: isMobile ? 0 : 0,
                  marginBottom: isMobile ? 6 : 0,
                }}
              >
                <Tooltip title="Refresh Data">
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={onRefresh}
                    loading={refreshing}
                    size={isMobile ? "middle" : "large"}
                    style={{
                      background: "rgba(255, 255, 255, 0.2)",
                      border: "1px solid rgba(255, 255, 255, 0.3)",
                      color: "white",
                      backdropFilter: "blur(10px)",
                      borderRadius: 12,
                      height: isMobile ? 36 : 48,
                      width: isMobile ? 36 : 48,
                      minWidth: isMobile ? 36 : 48,
                    }}
                  />
                </Tooltip>
              </div>
            )}

            {/* Header Title and Count */}
            <Space
              align="center"
              style={{
                marginBottom: isMobile ? 6 : 8,
                justifyContent: isMobile ? "center" : "flex-start",
                width: "100%",
              }}
              size="small"
            >
              <CalendarOutlined style={{ fontSize: isMobile ? 20 : 28 }} />
              <Title
                level={isMobile ? 3 : 2}
                style={{
                  color: "white",
                  margin: 0,
                  fontWeight: 700,
                  fontSize: isMobile ? "18px" : "28px",
                }}
              >
                Sesi Pembelajaran
              </Title>
            </Space>

            <Text
              style={{
                color: "rgba(255, 255, 255, 0.9)",
                fontSize: isMobile ? 14 : 16,
                display: "block",
                marginBottom: isMobile ? 12 : 16,
                textAlign: isMobile ? "center" : "left",
              }}
            >
              Kelola dan pantau sesi pembelajaran Anda
            </Text>

            <div
              style={{
                display: "flex",
                justifyContent: isMobile ? "center" : "flex-start",
                width: "100%",
              }}
            >
              <div
                style={{
                  background: "rgba(255, 255, 255, 0.2)",
                  padding: isMobile ? "6px 12px" : "8px 16px",
                  borderRadius: isMobile ? 16 : 20,
                  backdropFilter: "blur(10px)",
                }}
              >
                <Text
                  style={{
                    color: "white",
                    fontWeight: 600,
                    fontSize: isMobile ? 12 : 14,
                  }}
                >
                  {sessionsCount} Sesi Aktif
                </Text>
              </div>
            </div>
          </div>

          {/* Refresh Button - Pindah ke bawah untuk mobile */}
          {!isMobile && (
            <div
              style={{
                width: isMobile ? "100%" : "auto",
                display: "flex",
                justifyContent: isMobile ? "center" : "flex-end",
                marginTop: isMobile ? 8 : 0,
              }}
            >
              <Tooltip title="Refresh Data">
                <Button
                  icon={<ReloadOutlined />}
                  onClick={onRefresh}
                  loading={refreshing}
                  size={isMobile ? "middle" : "large"}
                  style={{
                    background: "rgba(255, 255, 255, 0.2)",
                    border: "1px solid rgba(255, 255, 255, 0.3)",
                    color: "white",
                    backdropFilter: "blur(10px)",
                    borderRadius: 12,
                    height: isMobile ? 36 : 48,
                    width: isMobile ? 36 : 48,
                    minWidth: isMobile ? 36 : 48,
                  }}
                />
              </Tooltip>
            </div>
          )}
        </Space>
      </div>
    </div>
  );
};

export default SessionsHeader;
