import React from "react";
import { Upload, Typography } from "antd";
import { InboxOutlined, FileTextOutlined } from "@ant-design/icons";

const { Dragger } = Upload;
const { Text } = Typography;

const ARCSUploadArea = ({
  file,
  uploading,
  onFileChange,
  isMobile = false,
}) => {
  const beforeUpload = () => false; // Prevent automatic upload

  return (
    <Dragger
      accept=".csv"
      multiple={false}
      onChange={onFileChange}
      beforeUpload={beforeUpload}
      showUploadList={false}
      disabled={uploading}
      style={{
        backgroundColor: file ? "#f6ffed" : "#fafafa",
        border: file ? "2px dashed #52c41a" : "2px dashed #d9d9d9",
        borderRadius: 12,
        transition: "all 0.3s ease",
        cursor: uploading ? "not-allowed" : "pointer",
      }}
    >
      <div
        style={{
          padding: isMobile ? "24px 16px" : "40px 24px",
          textAlign: "center",
        }}
      >
        {file ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div
              style={{
                width: isMobile ? 64 : 80,
                height: isMobile ? 64 : 80,
                borderRadius: "50%",
                backgroundColor: "#f6ffed",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
                border: "2px solid #52c41a",
              }}
            >
              <FileTextOutlined
                style={{
                  fontSize: isMobile ? 24 : 32,
                  color: "#52c41a",
                }}
              />
            </div>
            <div>
              <Text
                strong
                style={{
                  color: "#52c41a",
                  fontSize: isMobile ? "14px" : "16px",
                  display: "block",
                  marginBottom: 4,
                }}
              >
                ✓ File Terpilih: {file.name}
              </Text>
              <Text
                type="secondary"
                style={{ fontSize: isMobile ? "12px" : "13px" }}
              >
                {(file.size / 1024).toFixed(2)} KB
              </Text>
            </div>
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div
              style={{
                width: isMobile ? 64 : 80,
                height: isMobile ? 64 : 80,
                borderRadius: "50%",
                backgroundColor: "#f5f5f5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
                border: "2px solid #e8e8e8",
              }}
            >
              <InboxOutlined
                style={{
                  fontSize: isMobile ? 24 : 32,
                  color: "#999",
                }}
              />
            </div>
            <div>
              <Text
                style={{
                  fontSize: isMobile ? "14px" : "16px",
                  fontWeight: 500,
                  display: "block",
                  marginBottom: 4,
                  color: "#333",
                }}
              >
                {isMobile
                  ? "Tap untuk pilih file CSV"
                  : "Klik atau seret file CSV ke area ini"}
              </Text>
              <Text
                type="secondary"
                style={{ fontSize: isMobile ? "12px" : "13px" }}
              >
                Mendukung file .csv dengan data ARCS siswa
              </Text>
            </div>
          </div>
        )}
      </div>
    </Dragger>
  );
};

export default ARCSUploadArea;
