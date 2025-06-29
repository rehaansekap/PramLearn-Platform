import React from "react";
import { Typography, Button, Space } from "antd";
import { FileTextOutlined, PlayCircleOutlined } from "@ant-design/icons";

const { Text } = Typography;

const LastMaterialSection = ({ subject, onQuickAccessMaterial }) => {
  const getLastMaterialProgress = () => {
    if (subject.last_material_progress !== undefined) {
      return subject.last_material_progress;
    }

    // Fallback: cari progress dari materials array
    if (subject.materials && subject.last_material_slug) {
      const lastMaterial = subject.materials.find(
        (m) => m.slug === subject.last_material_slug
      );
      return lastMaterial?.progress || 0;
    }

    return 0;
  };

  const materialProgress = getLastMaterialProgress();

  return (
    <>
      <div style={{ marginBottom: 8 }}>
        <Text
          style={{
            color: "#666",
            fontSize: 13,
            fontWeight: 500,
          }}
        >
          Materi Terakhir:
        </Text>
      </div>

      <div
        style={{
          background: "#f8f9fa",
          padding: "12px 16px",
          borderRadius: 8,
          border: "1px solid #e9ecef",
          marginBottom: 16,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <Text
              style={{
                // jika nama material terlalu panjang buat menjadi ....
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                fontSize: 13,
                fontWeight: 600,
                color: "#1890ff",
                display: "block",
                marginBottom: 4,
                wordBreak: "break-word",
              }}
            >
              {subject.last_material_title}
            </Text>
            <Text
              style={{
                fontSize: 12,
                color: "#8c8c8c",
                lineHeight: 1.4,
              }}
            >
              Progress: {materialProgress}%
            </Text>
          </div>

          {onQuickAccessMaterial && (
            <Button
              type="link"
              size="small"
              icon={<PlayCircleOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                onQuickAccessMaterial(subject.last_material_slug);
              }}
              style={{
                padding: "4px 8px",
                height: "auto",
                fontSize: 12,
                color: "#1890ff",
              }}
            >
              Lanjut
            </Button>
          )}
        </div>
      </div>
    </>
  );
};

export default LastMaterialSection;
