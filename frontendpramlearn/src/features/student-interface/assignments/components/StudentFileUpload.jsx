import React from "react";
import { Typography } from "antd";
import useFileUpload from "../hooks/useFileUpload";
import FileUploadArea from "./file-upload/FileUploadArea";
import FileList from "./file-upload/FileList";
import FilePreviewModal from "./file-upload/FilePreviewModal";

const { Title } = Typography;

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
  title = "Unggah File Jawaban",
  showTitle = true,
}) => {
  const {
    uploading,
    previewVisible,
    previewFile,
    setPreviewVisible,
    handleUpload,
    handlePreview,
    handleRemove,
    formatFileSize,
  } = useFileUpload({
    maxFiles,
    maxSizePerFile,
    allowedTypes,
    onChange,
    onRemove,
  });

  return (
    <div>
      {showTitle && (
        <Title
          level={4}
          style={{
            marginBottom: 24,
            color: "#11418b",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          📎 {title}
        </Title>
      )}

      {/* Area Upload */}
      <FileUploadArea
        onUpload={handleUpload}
        disabled={disabled}
        uploading={uploading}
        fileCount={fileList.length}
        maxFiles={maxFiles}
        maxSizePerFile={maxSizePerFile}
        allowedTypes={allowedTypes}
      />

      {/* Daftar File */}
      <FileList
        fileList={fileList}
        onPreview={handlePreview}
        onRemove={handleRemove}
        disabled={disabled}
        formatFileSize={formatFileSize}
      />

      {/* Modal Preview */}
      <FilePreviewModal
        visible={previewVisible}
        onClose={() => setPreviewVisible(false)}
        file={previewFile}
        formatFileSize={formatFileSize}
      />
    </div>
  );
};

export default StudentFileUpload;
