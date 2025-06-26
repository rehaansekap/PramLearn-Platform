import React from "react";
import { Modal, Typography } from "antd";

const { Text } = Typography;

const SessionQuizResultsModal = ({ open, onClose, quiz, groups }) => {
  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={1000}
      title="Quiz Results"
      centered
    >
      <div style={{ textAlign: "center", padding: "40px 0" }}>
        <Text type="secondary">
          Quiz results modal akan diimplementasi selanjutnya
        </Text>
      </div>
    </Modal>
  );
};

export default SessionQuizResultsModal;
