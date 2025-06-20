import React from "react";
import { List, Progress, Typography, Space, Tag, Button } from "antd";
import { PlayCircleOutlined, ClockCircleOutlined } from "@ant-design/icons";

const { Text } = Typography;

const MaterialProgressCard = ({ material, onClick, getProgressColor }) => {
  const isMobile = window.innerWidth <= 768;
  return (
    <List.Item
      style={{
        padding: "20px 24px",
        marginBottom: 16,
        borderRadius: 12,
        border: "1px solid #f0f0f0",
        background: "#fff",
        cursor: "pointer",
        transition: "all 0.3s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 8px 24px rgba(17, 65, 139, 0.12)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
      onClick={() => onClick(material)}
    >
      <div style={{ width: "100%", minWidth: 0 }}>
        {/* Header dengan judul dan status */}
        {isMobile && (
          <Tag
            color={
              (material.progress || 0) >= 80
                ? "green"
                : (material.progress || 0) >= 50
                ? "orange"
                : "red"
            }
            style={{
              fontSize: 11,
              padding: "2px 8px",
              flexShrink: 0,
              marginBottom: 12,
            }}
          >
            {(material.progress || 0) >= 80
              ? "Selesai"
              : (material.progress || 0) >= 50
              ? "Dalam Progress"
              : "Belum Dimulai"}
          </Tag>
        )}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 12,
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <Text
              strong
              style={{
                fontSize: 16,
                color: "#1890ff",
                display: "block",
                marginBottom: 4,
                wordBreak: "break-word",
              }}
            >
              {material.title}
            </Text>

            {material.description && (
              <Text
                style={{
                  color: "#666",
                  fontSize: 13,
                  display: "block",
                  lineHeight: 1.4,
                }}
              >
                {material.description.length > 100
                  ? `${material.description.substring(0, 100)}...`
                  : material.description}
              </Text>
            )}
          </div>

          {!isMobile && (
            <Tag
              color={
                (material.progress || 0) >= 80
                  ? "green"
                  : (material.progress || 0) >= 50
                  ? "orange"
                  : "red"
              }
              style={{ fontSize: 11, padding: "2px 8px", flexShrink: 0 }}
            >
              {(material.progress || 0) >= 80
                ? "Selesai"
                : (material.progress || 0) >= 50
                ? "Dalam Progress"
                : "Belum Dimulai"}
            </Tag>
          )}
        </div>

        {/* Progress Bar */}
        <div style={{ marginBottom: 12 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <Text style={{ fontSize: 13, color: "#666" }}>
              Progress Pembelajaran
            </Text>
            <Text style={{ fontSize: 13, fontWeight: 600, color: "#333" }}>
              {material.progress || 0}%
            </Text>
          </div>

          <Progress
            percent={material.progress || 0}
            strokeColor={getProgressColor(material.progress || 0)}
            size="small"
            showInfo={false}
          />
        </div>

        {/* Footer dengan info tambahan */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {material.last_accessed && (
              <Space size={4}>
                <ClockCircleOutlined style={{ color: "#999", fontSize: 12 }} />
                <Text style={{ fontSize: 12, color: "#999" }}>
                  Terakhir diakses:{" "}
                  {new Date(material.last_accessed).toLocaleDateString("id-ID")}
                </Text>
              </Space>
            )}
          </div>

          <Button
            type="primary"
            size="small"
            icon={<PlayCircleOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              onClick(material);
            }}
            style={{
              borderRadius: 6,
              height: 32,
              fontSize: 12,
              // jika tampilan mobile maka tombol di tengah
              marginLeft: isMobile ? "auto" : 0,
              marginRight: isMobile ? "auto" : 0,
              padding: "0 16px",
              background:
                "linear-gradient(135deg, #001529 0%, #3a3f5c 60%, #43cea2 100%)",
              border: "none",
            }}
          >
            {(material.progress || 0) > 0 ? "Lanjutkan" : "Mulai Belajar"}
          </Button>
        </div>
      </div>
    </List.Item>
  );
};

export default MaterialProgressCard;
