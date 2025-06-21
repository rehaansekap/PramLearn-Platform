import React, { useState } from "react";
import { Card, Typography, Space, Alert } from "antd";
import { FileOutlined } from "@ant-design/icons";
import StudentFileUpload from "./StudentFileUpload";
import { FILE_TYPES, FILE_SIZE } from "../utils/fileUtils";

const { Title, Text } = Typography;

const AssignmentFileSection = ({
  assignment,
  onFilesChange,
  disabled = false,
}) => {
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const handleFileChange = (newFile) => {
    const updatedFiles = [...uploadedFiles, newFile];
    setUploadedFiles(updatedFiles);
    onFilesChange && onFilesChange(updatedFiles);
  };

  const handleFileRemove = (fileUid) => {
    const updatedFiles = uploadedFiles.filter((file) => file.uid !== fileUid);
    setUploadedFiles(updatedFiles);
    onFilesChange && onFilesChange(updatedFiles);
  };

  // Konfigurasi berdasarkan jenis assignment
  const getUploadConfig = () => {
    // Bisa disesuaikan berdasarkan konfigurasi assignment
    return {
      maxFiles: assignment?.max_files || 3,
      maxSizePerFile: assignment?.max_file_size || FILE_SIZE.MEDIUM,
      allowedTypes: assignment?.allowed_file_types || FILE_TYPES.ALL,
    };
  };

  const config = getUploadConfig();

  return (
    <Card
      style={{
        marginTop: 24,
        borderRadius: 12,
        border: "2px solid #f0f0f0",
      }}
    >
      <div style={{ marginBottom: 16 }}>
        <Space>
          <FileOutlined style={{ color: "#11418b", fontSize: 20 }} />
          <Title level={4} style={{ margin: 0, color: "#11418b" }}>
            Lampiran File (Opsional)
          </Title>
        </Space>
        <Text type="secondary" style={{ display: "block", marginTop: 8 }}>
          Unggah file pendukung untuk jawaban Anda
        </Text>
      </div>

      {assignment?.file_upload_required && (
        <Alert
          message="File wajib diunggah"
          description="Assignment ini memerlukan file lampiran untuk melengkapi jawaban Anda."
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      <StudentFileUpload
        fileList={uploadedFiles}
        onChange={handleFileChange}
        onRemove={handleFileRemove}
        disabled={disabled}
        maxFiles={config.maxFiles}
        maxSizePerFile={config.maxSizePerFile}
        allowedTypes={config.allowedTypes}
        showTitle={false}
      />

      {uploadedFiles.length > 0 && (
        <Alert
          message={`${uploadedFiles.length} file siap untuk dikirim`}
          type="success"
          showIcon
          style={{ marginTop: 16 }}
        />
      )}
    </Card>
  );
};

export default AssignmentFileSection;
