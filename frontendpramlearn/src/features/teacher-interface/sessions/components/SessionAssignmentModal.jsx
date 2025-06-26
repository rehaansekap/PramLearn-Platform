import React from "react";
import { Modal, Typography } from "antd";

const { Text } = Typography;

const SessionAssignmentModal = ({
  open,
  onClose,
  materialSlug,
  students,
  editingAssignment,
  onSuccess,
}) => {
  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={800}
      title="Assignment Management"
      centered
    >
      <div style={{ textAlign: "center", padding: "40px 0" }}>
        <Text type="secondary">
          Assignment modal akan diimplementasi selanjutnya
        </Text>
      </div>
    </Modal>
  );
};

export default SessionAssignmentModal;
