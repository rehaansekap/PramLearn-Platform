import React from "react";
import { Modal, Space, Typography, Progress, Alert } from "antd";
import { SendOutlined } from "@ant-design/icons";

const { Text } = Typography;

const AssignmentSubmitModal = ({
  visible,
  onOk,
  onCancel,
  answeredCount,
  totalQuestions,
  progress,
}) => (
  <Modal
    open={visible}
    onOk={onOk}
    onCancel={onCancel}
    okText="Ya, Submit"
    cancelText="Batal"
    title={
      <Space>
        <SendOutlined style={{ color: "#1890ff" }} />
        <span>Submit Tugas</span>
      </Space>
    }
    centered
    width={500}
  >
    <Space direction="vertical" style={{ width: "100%" }}>
      <Text
        style={{
          textAlign: "center",
          alignItems: "center",
          display: "flex",
          justifyContent: "center",
          color: "#1f2937",
        }}
      >
        Apakah Anda yakin ingin submit tugas ini?
      </Text>
      <div
        style={{
          background: "#f6f6f6",
          padding: "12px 16px",
          borderRadius: 8,
          marginTop: 12,
        }}
      >
        <Text strong>Progress Saat Ini:</Text>
        <br />
        <Text>
          Soal terjawab: {answeredCount} dari {totalQuestions}
        </Text>
        <br />
        <Progress
          percent={progress}
          size="small"
          strokeColor="#1890ff"
          style={{ marginTop: 8 }}
        />
      </div>
      {answeredCount < totalQuestions && (
        <Alert
          message="Masih ada soal yang belum dijawab"
          type="warning"
          showIcon
          style={{ marginTop: 12 }}
        />
      )}
    </Space>
  </Modal>
);

export default AssignmentSubmitModal;
