import React, { useState, useEffect } from "react";
import { Modal, Spin, Alert, Button, Empty } from "antd";
import { FileTextOutlined } from "@ant-design/icons";
import api from "../../../../api";
import AssignmentSummaryCard from "./assignment-feedback/AssignmentSummaryCard";
import AssignmentFeedbackAlert from "./assignment-feedback/AssignmentFeedbackAlert";
import AssignmentDetailInfo from "./assignment-feedback/AssignmentDetailInfo";
import AssignmentAnswerReview from "./assignment-feedback/AssignmentAnswerReview";
import AssignmentRubricSection from "./assignment-feedback/AssignmentRubricSection";
import AssignmentImprovementCard from "./assignment-feedback/AssignmentImprovementCard";

const AssignmentFeedback = ({
  visible,
  onClose,
  submissionId,
  gradeId,
  assignmentTitle,
  onDownloadReport,
}) => {
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (visible && submissionId) {
      fetchFeedback();
    }
    if (!visible) {
      setFeedback(null);
      setError(null);
    }
    // eslint-disable-next-line
  }, [visible, submissionId]);

  const fetchFeedback = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token)
        throw new Error("Token tidak ditemukan. Silakan login kembali.");
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      const response = await api.get(
        `/student/assignment-feedback/grade/${submissionId}/`
      );
      if (response.data) setFeedback(response.data);
      else throw new Error("Data feedback tidak ditemukan");
    } catch (err) {
      if (err.response) {
        const status = err.response.status;
        if (status === 404) setError("Feedback assignment tidak ditemukan");
        else if (status === 403)
          setError("Anda tidak memiliki akses untuk melihat feedback ini");
        else if (status === 401)
          setError("Sesi Anda telah berakhir. Silakan login kembali");
        else
          setError(
            `Error ${status}: ${
              err.response.data?.message ||
              err.response.data?.detail ||
              err.response.data?.error ||
              "Terjadi kesalahan"
            }`
          );
      } else if (err.request) {
        setError(
          "Tidak dapat terhubung ke server. Periksa koneksi internet Anda"
        );
      } else {
        setError(err.message || "Terjadi kesalahan saat memuat feedback");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Modal
        title="Feedback Assignment"
        open={visible}
        onCancel={onClose}
        footer={null}
        width={800}
        centered
      >
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <Spin size="large" tip="Memuat feedback assignment..." />
        </div>
      </Modal>
    );
  }

  if (error) {
    return (
      <Modal
        title="Feedback Assignment"
        open={visible}
        onCancel={onClose}
        footer={[
          <Button key="close" onClick={onClose}>
            Tutup
          </Button>,
        ]}
        width={600}
        centered
      >
        <Alert
          message="Gagal memuat data"
          description={error}
          type="error"
          showIcon
          style={{ borderRadius: 8 }}
        />
      </Modal>
    );
  }

  if (!feedback) {
    return (
      <Modal
        title="Feedback Assignment"
        open={visible}
        onCancel={onClose}
        footer={[
          <Button key="close" onClick={onClose}>
            Tutup
          </Button>,
        ]}
        width={600}
        centered
      >
        <Empty description="Data tidak ditemukan" />
      </Modal>
    );
  }

  const {
    assignment,
    submission,
    rubric_items = [],
    answers = [],
    teacher_feedback,
    grading_history = [],
    graded_at,
    graded_by,
  } = feedback;

  return (
    <Modal
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <FileTextOutlined style={{ color: "#52c41a" }} />
          <span>Feedback Assignment</span>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="close" type="primary" onClick={onClose}>
          Tutup
        </Button>,
      ]}
      width={900}
      style={{ top: 20 }}
      bodyStyle={{ maxHeight: "70vh", overflowY: "auto" }}
      centered
      destroyOnClose
    >
      <AssignmentSummaryCard
        assignment={assignment}
        assignmentTitle={assignmentTitle}
        submission={submission}
      />

      <AssignmentFeedbackAlert teacher_feedback={teacher_feedback} />

      <AssignmentDetailInfo
        submission={submission}
        graded_at={graded_at}
        graded_by={graded_by}
      />

      {/* Section: Jawaban & Rubrik */}
      {!answers.length && !rubric_items.length ? (
        <Alert
          message="Detail Jawaban Assignment"
          description={
            <div>
              <b>Detail jawaban tidak tersedia untuk assignment ini.</b>
              <ul style={{ marginTop: 8, marginBottom: 0, paddingLeft: 20 }}>
                <li>Assignment dinilai secara manual oleh guru</li>
                <li>Assignment dikerjakan dalam bentuk upload file</li>
                <li>Sistem belum mencatat detail jawaban individual</li>
                <li>Assignment berupa tugas praktikum atau presentasi</li>
              </ul>
              <div
                style={{
                  marginTop: 16,
                  padding: 12,
                  background: "#f0f8ff",
                  borderRadius: 6,
                  border: "1px solid #d6e4ff",
                }}
              >
                <b>💡 Tips:</b> Hubungi guru mata pelajaran untuk mendapatkan
                penjelasan lebih lanjut tentang penilaian dan area yang perlu
                diperbaiki.
              </div>
            </div>
          }
          type="info"
          showIcon
          style={{ marginBottom: 24, borderRadius: 8 }}
        />
      ) : (
        <>
          <AssignmentAnswerReview answers={answers} />
          <AssignmentRubricSection rubric_items={rubric_items} />
        </>
      )}

      <AssignmentImprovementCard score={submission?.final_score} />
    </Modal>
  );
};

export default AssignmentFeedback;
