import React from "react";
import { List, Button, Tooltip, Typography, Space, Tag, Modal } from "antd";
import { EyeOutlined, DeleteOutlined } from "@ant-design/icons";
import FileIcon from "./FileIcon";

const { Text } = Typography;

const FileListItem = ({
  file,
  onPreview,
  onRemove,
  disabled = false,
  formatFileSize,
}) => {
  const handleRemove = () => {
    Modal.confirm({
      title: "Hapus File",
      content: `Apakah Anda yakin ingin menghapus "${file.name}"?`,
      okText: "Hapus",
      okType: "danger",
      cancelText: "Batal",
      onOk: () => {
        onRemove(file.uid);
        if (file.url && file.url.startsWith("blob:")) {
          URL.revokeObjectURL(file.url);
        }
      },
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "done":
        return "success";
      case "uploading":
        return "processing";
      case "error":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "done":
        return "Siap";
      case "uploading":
        return "Mengunggah";
      case "error":
        return "Error";
      default:
        return "Menunggu";
    }
  };

  return (
    <List.Item
      style={{
        padding: "12px 0",
        borderBottom: "1px solid #f0f0f0",
      }}
      actions={[
        <Tooltip title="Pratinjau">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => onPreview(file)}
            disabled={!file.type?.startsWith("image/")}
            style={{
              color: file.type?.startsWith("image/") ? "#1890ff" : "#ccc",
            }}
          />
        </Tooltip>,
        <Tooltip title="Hapus">
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={handleRemove}
            disabled={disabled}
          />
        </Tooltip>,
      ]}
    >
      <List.Item.Meta
        avatar={<FileIcon fileName={file.name} />}
        title={
          <Space direction="vertical" size="small">
            <Text
              strong
              style={{
                fontSize: 14,
                wordBreak: "break-word",
                maxWidth: "300px",
              }}
              title={file.name}
            >
              {file.name.length > 30
                ? `${file.name.substring(0, 30)}...`
                : file.name}
            </Text>
            <Space size="small" wrap>
              <Tag size="small" color="blue">
                {formatFileSize(file.size)}
              </Tag>
              <Tag size="small" color={getStatusColor(file.status)}>
                {getStatusText(file.status)}
              </Tag>
            </Space>
          </Space>
        }
      />
    </List.Item>
  );
};

export default FileListItem;
