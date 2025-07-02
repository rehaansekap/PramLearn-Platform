import React from "react";
import { Button, Space } from "antd";
import { UploadOutlined, ReloadOutlined } from "@ant-design/icons";

const ARCSUploadActions = ({
  file,
  uploading,
  onUpload,
  onReset,
  isMobile = false,
}) => {
  return (
    <div
      style={{
        textAlign: "center",
        marginTop: 24,
        padding: isMobile ? "16px 0" : "20px 0",
      }}
    >
      <Space
        size={isMobile ? "small" : "middle"}
        direction={isMobile ? "vertical" : "horizontal"}
        style={{ width: isMobile ? "100%" : "auto" }}
      >
        <Button
          type="primary"
          icon={<UploadOutlined />}
          onClick={onUpload}
          loading={uploading}
          disabled={!file}
          size={isMobile ? "middle" : "large"}
          style={{
            backgroundColor: "#11418b",
            borderColor: "#11418b",
            fontWeight: 600,
            minWidth: isMobile ? "100%" : 160,
            height: isMobile ? 40 : 44,
            borderRadius: 8,
            boxShadow: "0 2px 8px rgba(17, 65, 139, 0.3)",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            if (!uploading && file) {
              e.target.style.backgroundColor = "#0d3a7a";
              e.target.style.transform = "translateY(-1px)";
              e.target.style.boxShadow = "0 4px 12px rgba(17, 65, 139, 0.4)";
            }
          }}
          onMouseLeave={(e) => {
            if (!uploading && file) {
              e.target.style.backgroundColor = "#11418b";
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 2px 8px rgba(17, 65, 139, 0.3)";
            }
          }}
        >
          {uploading ? "Mengupload..." : "Upload & Proses"}
        </Button>

        {file && !uploading && (
          <Button
            icon={<ReloadOutlined />}
            onClick={onReset}
            size={isMobile ? "middle" : "large"}
            style={{
              minWidth: isMobile ? "100%" : 120,
              height: isMobile ? 40 : 44,
              borderRadius: 8,
              fontWeight: 500,
              borderColor: "#d9d9d9",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.target.style.borderColor = "#11418b";
              e.target.style.color = "#11418b";
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = "#d9d9d9";
              e.target.style.color = "inherit";
            }}
          >
            Reset
          </Button>
        )}
      </Space>
    </div>
  );
};

export default ARCSUploadActions;
