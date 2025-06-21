import React from "react";
import { Modal, Alert } from "antd";

const QuizSubmitModal = ({
  visible,
  onOk,
  onCancel,
  answeredCount,
  totalQuestions,
}) => (
  <Modal
    open={visible}
    onOk={onOk}
    onCancel={onCancel}
    okText="Ya, Submit"
    cancelText="Batal"
    title="Submit Kuis"
  >
    <p>Apakah Anda yakin ingin submit kuis?</p>
    <p>
      <strong>Soal terjawab:</strong> {answeredCount} dari {totalQuestions}
    </p>
    {answeredCount < totalQuestions && (
      <Alert
        message="Masih ada soal yang belum dijawab"
        type="warning"
        showIcon
        style={{ marginTop: 8 }}
      />
    )}
  </Modal>
);

export default QuizSubmitModal;
