import React, { useState } from "react";
import {
  Upload,
  Button,
  Typography,
  Card,
  Space,
  Progress,
  Tag,
  Modal,
  Image,
  List,
  Tooltip,
  message,
} from "antd";
import {
  UploadOutlined,
  DeleteOutlined,
  EyeOutlined,
  FileOutlined,
  FilePdfOutlined,
  FileImageOutlined,
  FileWordOutlined,
  FileExcelOutlined,
  InboxOutlined,
} from "@ant-design/icons";

const { Dragger } = Upload;
const { Text, Title } = Typography;

const StudentFileUpload = ({
  fileList = [],
  onChange,
  onRemove,
  disabled = false,
  maxFiles = 5,
  maxSizePerFile = 10, // MB
  allowedTypes = [
    "pdf",
    "doc",
    "docx",
    "xls",
    "xlsx",
    "jpg",
    "jpeg",
    "png",
    "txt",
  ],
}) => {
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Get file icon based on type
  const getFileIcon = (fileName) => {
    const extension = fileName.split(".").pop().toLowerCase();

    switch (extension) {
      case "pdf":
        return <FilePdfOutlined style={{ color: "#ff4d4f", fontSize: 24 }} />;
      case "doc":
      case "docx":
        return <FileWordOutlined style={{ color: "#1890ff", fontSize: 24 }} />;
      case "xls":
      case "xlsx":
        return <FileExcelOutlined style={{ color: "#52c41a", fontSize: 24 }} />;
      case "jpg":
      case "jpeg":
      case "png":
        return <FileImageOutlined style={{ color: "#722ed1", fontSize: 24 }} />;
      default:
        return <FileOutlined style={{ color: "#666", fontSize: 24 }} />;
    }
  };

  // Validate file
  const validateFile = (file) => {
    const fileName = file.name;
    const fileSize = file.size / 1024 / 1024; // Convert to MB
    const fileExtension = fileName.split(".").pop().toLowerCase();

    // Check file type
    if (!allowedTypes.includes(fileExtension)) {
      message.error(`File type .${fileExtension} is not allowed`);
      return false;
    }

    // Check file size
    if (fileSize > maxSizePerFile) {
      message.error(`File size must be less than ${maxSizePerFile}MB`);
      return false;
    }

    // Check max files
    if (fileList.length >= maxFiles) {
      message.error(`Maximum ${maxFiles} files allowed`);
      return false;
    }

    return true;
  };

  // Handle file upload
  const handleUpload = async (file) => {
    if (!validateFile(file)) {
      return false;
    }

    setUploading(true);

    // Create file object
    const fileObj = {
      uid: `${Date.now()}-${Math.random()}`,
      name: file.name,
      status: "done",
      originFileObj: file,
      size: file.size,
      type: file.type,
    };

    // Add preview URL for images
    if (file.type.startsWith("image/")) {
      fileObj.url = URL.createObjectURL(file);
    }

    onChange && onChange(fileObj);
    setUploading(false);

    return false; // Prevent default upload
  };

  // Handle file preview
  const handlePreview = (file) => {
    if (file.type && file.type.startsWith("image/")) {
      setPreviewFile(file);
      setPreviewVisible(true);
    } else {
      // For non-image files, you might want to show a different preview
      message.info("Preview not available for this file type");
    }
  };

  // Handle file remove
  const handleRemove = (file) => {
    Modal.confirm({
      title: "Remove File",
      content: `Are you sure you want to remove "${file.name}"?`,
      okText: "Remove",
      okType: "danger",
      onOk: () => {
        onRemove && onRemove(file.uid);
        if (file.url && file.url.startsWith("blob:")) {
          URL.revokeObjectURL(file.url);
        }
      },
    });
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const uploadProps = {
    beforeUpload: handleUpload,
    multiple: true,
    showUploadList: false,
    disabled: disabled || fileList.length >= maxFiles,
  };

  return (
    <div>
      {/* Upload Area */}
      <Card style={{ marginBottom: 16 }}>
        <Dragger {...uploadProps}>
          <p className="ant-upload-drag-icon">
            <InboxOutlined style={{ color: "#11418b" }} />
          </p>
          <p className="ant-upload-text">
            Click or drag files to this area to upload
          </p>
          <p className="ant-upload-hint">
            Support for multiple files. Maximum {maxFiles} files,{" "}
            {maxSizePerFile}MB each.
            <br />
            Allowed types: {allowedTypes.join(", ")}
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
              disabled={disabled || fileList.length >= maxFiles}
              style={{ marginRight: 8 }}
            >
              Browse Files
            </Button>
          </Upload>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {fileList.length}/{maxFiles} files uploaded
          </Text>
        </div>
      </Card>

      {/* File List */}
      {fileList.length > 0 && (
        <Card title="Uploaded Files" style={{ marginBottom: 16 }}>
          <List
            dataSource={fileList}
            renderItem={(file) => (
              <List.Item
                style={{
                  padding: "12px 0",
                  borderBottom: "1px solid #f0f0f0",
                }}
                actions={[
                  <Tooltip title="Preview">
                    <Button
                      type="text"
                      icon={<EyeOutlined />}
                      onClick={() => handlePreview(file)}
                      disabled={!file.type?.startsWith("image/")}
                    />
                  </Tooltip>,
                  <Tooltip title="Remove">
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleRemove(file)}
                      disabled={disabled}
                    />
                  </Tooltip>,
                ]}
              >
                <List.Item.Meta
                  avatar={getFileIcon(file.name)}
                  title={
                    <Space direction="vertical" size="small">
                      <Text strong style={{ fontSize: 14 }}>
                        {file.name}
                      </Text>
                      <Space size="small">
                        <Tag size="small">{formatFileSize(file.size)}</Tag>
                        <Tag
                          size="small"
                          color={
                            file.status === "done" ? "success" : "processing"
                          }
                        >
                          {file.status === "done" ? "Ready" : "Processing"}
                        </Tag>
                      </Space>
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        </Card>
      )}

      {/* Preview Modal */}
      <Modal
        open={previewVisible}
        title={previewFile?.name}
        footer={null}
        onCancel={() => setPreviewVisible(false)}
        width={800}
        centered
      >
        {previewFile && (
          <Image
            alt={previewFile.name}
            style={{ width: "100%" }}
            src={previewFile.url}
          />
        )}
      </Modal>
    </div>
  );
};

export default StudentFileUpload;
