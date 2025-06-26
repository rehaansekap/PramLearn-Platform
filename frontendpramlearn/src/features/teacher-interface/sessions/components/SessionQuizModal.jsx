import React from "react";
import { Modal, Typography } from "antd";

const { Text } = Typography;

const SessionQuizModal = ({
  open,
  onClose,
  materialSlug,
  groups,
  editingQuiz,
  onSuccess,
}) => {
  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={800}
      title="Quiz Management"
      centered
    >
      <div style={{ textAlign: "center", padding: "40px 0" }}>
        <Text type="secondary">Quiz modal akan diimplementasi selanjutnya</Text>
      </div>
    </Modal>
  );
};

export default SessionQuizModal;
