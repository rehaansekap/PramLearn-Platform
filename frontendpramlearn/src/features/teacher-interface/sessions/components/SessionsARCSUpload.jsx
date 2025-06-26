import React from "react";
import { Upload, Button, Alert, Progress, Typography, Card } from "antd";
import {
  InboxOutlined,
  UploadOutlined,
  FileTextOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import useSessionsARCSUpload from "../hooks/useSessionsARCSUpload";

const { Dragger } = Upload;
const { Text, Title } = Typography;

const SessionsARCSUpload = ({ onUploadSuccess }) => {
  const {
    file,
    uploading,
    uploadProgress,
    uploadMessage,
    handleFileChange,
    handleUpload,
    resetUpload,
    getMessageType,
    getMessageText,
  } = useSessionsARCSUpload(onUploadSuccess); // Pass callback ke hook

  const beforeUpload = () => {
    return false; // Prevent automatic upload
  };

  const handleUploadClick = async () => {
    try {
      await handleUpload();
      // Success sudah dihandle di hook termasuk callback
    } catch (error) {
      // Error sudah dihandle di hook
    }
  };

  return (
    <div className="sessions-arcs-upload-container">
      {/* Drag and Drop Area */}
      <Dragger
        accept=".csv"
        multiple={false}
        onChange={handleFileChange}
        beforeUpload={beforeUpload}
        showUploadList={false}
        disabled={uploading}
        style={{
          backgroundColor: file ? "#f6ffed" : "#fafafa",
          border: file ? "2px dashed #52c41a" : "2px dashed #d9d9d9",
          borderRadius: "8px",
          marginBottom: 16,
        }}
      >
        <div className="text-center" style={{ padding: "20px" }}>
          {file ? (
            <>
              <FileTextOutlined
                style={{ fontSize: 48, color: "#52c41a", marginBottom: 16 }}
              />
              <div>
                <Text strong style={{ color: "#52c41a", fontSize: "16px" }}>
                  ✓ File Terpilih: {file.name}
                </Text>
                <br />
                <Text type="secondary">{(file.size / 1024).toFixed(2)} KB</Text>
              </div>
            </>
          ) : (
            <>
              <InboxOutlined
                style={{ fontSize: 48, color: "#999", marginBottom: 16 }}
              />
              <div>
                <Text style={{ fontSize: "16px", fontWeight: 500 }}>
                  Klik atau seret file CSV ke area ini
                </Text>
                <br />
                <Text type="secondary">
                  Mendukung file .csv dengan data ARCS siswa
                </Text>
              </div>
            </>
          )}
        </div>
      </Dragger>

      {/* Progress Bar */}
      {uploading && (
        <div style={{ marginBottom: 16 }}>
          <Progress
            percent={uploadProgress}
            status="active"
            strokeColor="#11418b"
          />
          <Text
            type="secondary"
            style={{ textAlign: "center", display: "block" }}
          >
            Mengupload dan memproses file...
          </Text>
        </div>
      )}

      {/* Upload Button */}
      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <Button
          type="primary"
          icon={<UploadOutlined />}
          onClick={handleUploadClick}
          loading={uploading}
          disabled={!file}
          size="large"
          style={{
            backgroundColor: "#11418b",
            borderColor: "#11418b",
            fontWeight: 600,
            minWidth: 150,
            marginRight: 8,
          }}
        >
          {uploading ? "Mengupload..." : "Upload File"}
        </Button>

        {file && !uploading && (
          <Button onClick={resetUpload} size="large" style={{ minWidth: 100 }}>
            Reset
          </Button>
        )}
      </div>

      {/* Message Alert */}
      {uploadMessage && (
        <Alert
          message={getMessageText()}
          type={getMessageType()}
          showIcon
          style={{ marginBottom: 16 }}
          closable
          onClose={() => resetUpload()}
        />
      )}

      {/* Format Information */}
      <Card
        size="small"
        style={{
          backgroundColor: "#f8f9fa",
          border: "1px solid #e8e8e8",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
          <InfoCircleOutlined style={{ color: "#1677ff", marginTop: 2 }} />
          <div>
            <Text strong style={{ display: "block", marginBottom: 8 }}>
              📝 Format file CSV yang didukung:
            </Text>

            <div style={{ marginBottom: 12 }}>
              <Text strong style={{ color: "#1677ff" }}>
                Format 1 - Dengan dimensi (20 pertanyaan):
              </Text>
              <div
                style={{
                  background: "#fafbfc",
                  border: "1px solid #e6e6e6",
                  borderRadius: 6,
                  padding: 8,
                  marginTop: 4,
                  fontFamily: "monospace",
                  fontSize: 12,
                  overflowX: "auto",
                }}
              >
                username,dim_A_q1,dim_A_q2,...,dim_R_q1,...,dim_C_q1,...,dim_S_q1,...
                <br />
                student001,4,5,4,5,4,3,4,4,3,4,5,4,5,4,5,4,5,4,4,5
              </div>
            </div>

            <div>
              <Text strong style={{ color: "#1677ff" }}>
                Format 2 - Langsung nilai ARCS:
              </Text>
              <div
                style={{
                  background: "#fafbfc",
                  border: "1px solid #e6e6e6",
                  borderRadius: 6,
                  padding: 8,
                  marginTop: 4,
                  fontFamily: "monospace",
                  fontSize: 12,
                  overflowX: "auto",
                }}
              >
                username,attention,relevance,confidence,satisfaction
                <br />
                student001,4.2,3.6,4.6,4.4
                <br />
                student002,3.8,4.0,3.2,3.9
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SessionsARCSUpload;
