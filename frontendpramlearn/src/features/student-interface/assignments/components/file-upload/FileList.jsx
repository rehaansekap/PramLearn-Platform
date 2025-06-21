import React from "react";
import { Card, List, Typography, Empty } from "antd";
import { FileOutlined } from "@ant-design/icons";
import FileListItem from "./FileListItem";

const { Text } = Typography;

const FileList = ({
  fileList = [],
  onPreview,
  onRemove,
  disabled = false,
  formatFileSize,
}) => {
  if (fileList.length === 0) {
    return null;
  }

  return (
    <Card
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <FileOutlined style={{ color: "#11418b" }} />
          <span>File yang Diunggah</span>
        </div>
      }
      style={{ marginBottom: 16 }}
    >
      {fileList.length > 0 ? (
        <List
          dataSource={fileList}
          renderItem={(file) => (
            <FileListItem
              key={file.uid}
              file={file}
              onPreview={onPreview}
              onRemove={onRemove}
              disabled={disabled}
              formatFileSize={formatFileSize}
            />
          )}
        />
      ) : (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <Text type="secondary">Belum ada file yang diunggah</Text>
          }
        />
      )}
    </Card>
  );
};

export default FileList;
