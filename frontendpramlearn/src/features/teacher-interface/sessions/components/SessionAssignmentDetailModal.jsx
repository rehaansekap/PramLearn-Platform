import React from "react";
import { Modal, Typography } from "antd";

const { Text } = Typography;

const SessionAssignmentDetailModal = ({
  open,
  onClose,
  assignment,
  students,
}) => {
  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={1000}
      title="Assignment Detail"
      centered
    >
      <div style={{ textAlign: "center", padding: "40px 0" }}>
        <Text type="secondary">
          Assignment detail modal akan diimplementasi selanjutnya
        </Text>
      </div>
    </Modal>
  );
};

export default SessionAssignmentDetailModal;
