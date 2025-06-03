import React, { useState } from "react";
import { Upload, Button, Alert, Progress, Typography } from "antd";
import {
  InboxOutlined,
  UploadOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import api from "../../../api";

const { Dragger } = Upload;
const { Text } = Typography;

const UploadARCSCSV = () => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = (info) => {
    const { fileList } = info;

    if (fileList.length > 0) {
      const selectedFile = fileList[0].originFileObj;

      // Validasi tipe file
      if (selectedFile && !selectedFile.name.toLowerCase().endsWith(".csv")) {
        setMessage("error:File harus berformat .csv");
        setFile(null);
        return;
      }

      setFile(selectedFile);
      setMessage("");
    } else {
      setFile(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage("error:Silakan pilih file CSV terlebih dahulu.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    setUploadProgress(0);

    // Simulasi progress
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + 10;
      });
    }, 200);

    try {
      const response = await api.post("upload-arcs-csv/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setUploadProgress(100);
      setMessage(`success:${response.data.message}`);
      setFile(null);
    } catch (error) {
      setUploadProgress(0);
      setMessage(
        `error:${
          error.response?.data?.error ||
          "Terjadi kesalahan saat mengupload file."
        }`
      );
    } finally {
      setUploading(false);
      clearInterval(progressInterval);
    }
  };

  const beforeUpload = () => {
    return false; // Prevent automatic upload
  };

  const messageType = message.startsWith("error:")
    ? "error"
    : message.startsWith("success:")
    ? "success"
    : "info";
  const messageText = message.replace(/^(error:|success:|info:)/, "");

  return (
    <div className="upload-arcs-container">
      {/* Drag and Drop Area - styling minimal */}
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
            Mengupload file...
          </Text>
        </div>
      )}

      {/* Upload Button - perbaikan warna */}
      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <Button
          type="primary"
          icon={<UploadOutlined />}
          onClick={handleUpload}
          loading={uploading}
          disabled={!file}
          size="large"
          style={{
            backgroundColor: "#11418b",
            borderColor: "#11418b",
            fontWeight: 600,
            minWidth: 150,
          }}
        >
          {uploading ? "Mengupload..." : "Upload File"}
        </Button>
      </div>

      {/* Message Alert */}
      {message && (
        <Alert
          message={messageText}
          type={messageType}
          showIcon
          style={{ marginBottom: 16 }}
          closable
          onClose={() => setMessage("")}
        />
      )}

      {/* Sample Format */}
      <div
        style={{
          padding: "16px",
          backgroundColor: "#f8f9fa",
          borderRadius: "6px",
          border: "1px solid #e8e8e8",
        }}
      >
        <Text strong style={{ display: "block", marginBottom: 8 }}>
          📝 Contoh format file CSV:
        </Text>
        <div
          style={{
            backgroundColor: "#fff",
            padding: "12px",
            borderRadius: "4px",
            border: "1px solid #e8e8e8",
            fontFamily: "monospace",
            fontSize: "12px",
          }}
        >
          <div>username,attention,relevance,confidence,satisfaction</div>
          <div>student001,85,78,92,88</div>
          <div>student002,76,84,79,91</div>
          <div>student003,92,88,85,87</div>
        </div>
      </div>
    </div>
  );
};

export default UploadARCSCSV;
