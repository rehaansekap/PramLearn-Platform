import React from "react";
import { Upload, Button, Card, Progress, Typography } from "antd";
import { UploadOutlined, InboxOutlined } from "@ant-design/icons";

const { Dragger } = Upload;
const { Text } = Typography;

const FileUploadArea = ({
  onUpload,
  disabled = false,
  uploading = false,
  fileCount = 0,
  maxFiles = 5,
  maxSizePerFile = 10,
  allowedTypes = [],
}) => {
  const uploadProps = {
    beforeUpload: (file) => onUpload(file, fileCount),
    multiple: true,
    showUploadList: false,
    disabled: disabled || fileCount >= maxFiles,
  };

  return (
    <Card style={{ marginBottom: 16 }}>
      <Dragger {...uploadProps}>
        <p className="ant-upload-drag-icon">
          <InboxOutlined style={{ color: "#11418b" }} />
        </p>
        <p className="ant-upload-text">
          Klik atau seret file ke area ini untuk mengunggah
        </p>
        <p className="ant-upload-hint">
          Mendukung multiple file. Maksimum {maxFiles} file, {maxSizePerFile}MB
          per file.
          <br />
          Tipe file yang diizinkan: {allowedTypes.join(", ")}
        </p>

        {uploading && (
          <Progress
            percent={100}
            status="active"
            strokeColor="#11418b"
            style={{ marginTop: 16 }}
          />
        )}
      </Dragger>

      <div style={{ marginTop: 16, textAlign: "center" }}>
        <Upload {...uploadProps}>
          <Button
            icon={<UploadOutlined />}
            disabled={disabled || fileCount >= maxFiles}
            style={{ marginRight: 8 }}
          >
            Pilih File
          </Button>
        </Upload>
        <Text type="secondary" style={{ fontSize: 12 }}>
          {fileCount}/{maxFiles} file terunggah
        </Text>
      </div>
    </Card>
  );
};

export default FileUploadArea;
