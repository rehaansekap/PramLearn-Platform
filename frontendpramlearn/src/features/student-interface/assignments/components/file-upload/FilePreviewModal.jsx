import React from "react";
import { Modal, Image, Typography, Space, Tag } from "antd";
import { FileOutlined } from "@ant-design/icons";
import FileIcon from "./FileIcon";

const { Text, Title } = Typography;

const FilePreviewModal = ({ visible, onClose, file, formatFileSize }) => {
  if (!file) return null;

  const isImage = file.type?.startsWith("image/");

  return (
    <Modal
      open={visible}
      title={
        <Space>
          <FileIcon fileName={file.name} size={20} />
          <span>Pratinjau File</span>
        </Space>
      }
      footer={null}
      onCancel={onClose}
      width={800}
      centered
      destroyOnClose
    >
      <div style={{ marginBottom: 16 }}>
        <Space direction="vertical" size="small" style={{ width: "100%" }}>
          <div>
            <Text strong>Nama File: </Text>
            <Text>{file.name}</Text>
          </div>
          <div>
            <Text strong>Ukuran: </Text>
            <Tag color="blue">{formatFileSize(file.size)}</Tag>
          </div>
          <div>
            <Text strong>Tipe: </Text>
            <Tag color="green">{file.type || "Tidak diketahui"}</Tag>
          </div>
        </Space>
      </div>

      {isImage ? (
        <div style={{ textAlign: "center" }}>
          <Image
            alt={file.name}
            style={{
              width: "100%",
              maxHeight: "500px",
              objectFit: "contain",
            }}
            src={file.url}
            preview={false}
          />
        </div>
      ) : (
        <div
          style={{
            textAlign: "center",
            padding: "60px 20px",
            background: "#fafafa",
            borderRadius: 8,
          }}
        >
          <FileIcon fileName={file.name} size={64} />
          <div style={{ marginTop: 16 }}>
            <Title level={4} type="secondary">
              Pratinjau tidak tersedia
            </Title>
            <Text type="secondary">
              Pratinjau hanya tersedia untuk file gambar
            </Text>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default FilePreviewModal;
