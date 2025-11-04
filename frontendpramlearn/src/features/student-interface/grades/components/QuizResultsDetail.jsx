import React, { useState, useEffect } from "react";
import { Modal, Alert, Spin, Empty, Button, Divider, Typography } from "antd";
import { BookOutlined, TeamOutlined } from "@ant-design/icons";
import useQuizReview from "../hooks/useQuizReview";
import QuizResultsHeader from "./quiz-results/QuizResultsHeader";
import QuizResultsDetailInfo from "./quiz-results/QuizResultsDetailInfo";
import QuizResultsSummaryStats from "./quiz-results/QuizResultsSummaryStats";
import QuizAnswersReview from "./quiz-results/QuizAnswersReview";
import QuizImprovementSection from "./quiz-results/QuizImprovementSection";
import QuizGroupMembersSection from "./quiz-results/QuizGroupMembersSection";
import QuizContactSection from "./quiz-results/QuizContactSection";

const { Text } = Typography;

const QuizResultsDetail = ({
  visible,
  onClose,
  attemptId,
  quizTitle,
  isGroupQuiz,
  groupData,
}) => {
  const {
    quizReview,
    loading,
    error,
    fetchQuizReview,
    downloadQuizReport,
    resetQuizReview,
  } = useQuizReview();

  useEffect(() => {
    if (visible && attemptId) {
      fetchQuizReview(attemptId, isGroupQuiz);
    }

    if (!visible) {
      resetQuizReview();
    }
  }, [visible, attemptId, isGroupQuiz, fetchQuizReview, resetQuizReview]);

  if (loading) {
    return (
      <Modal
        title={`Detail Hasil ${isGroupQuiz ? "Quiz Kelompok" : "Quiz"}`}
        open={visible}
        onCancel={onClose}
        footer={null}
        width={800}
        centered
      >
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <Spin
            size="large"
            tip={`Memuat detail hasil ${
              isGroupQuiz ? "quiz kelompok" : "quiz"
            }...`}
          />
        </div>
      </Modal>
    );
  }

  if (error) {
    return (
      <Modal
        title={`Detail Hasil ${isGroupQuiz ? "Quiz Kelompok" : "Quiz"}`}
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

  if (!quizReview) {
    return (
      <Modal
        title={`Detail Hasil ${isGroupQuiz ? "Quiz Kelompok" : "Quiz"}`}
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

  const { quiz, attempt, questions = [], summary = {} } = quizReview;

  return (
    <Modal
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {isGroupQuiz ? (
            <TeamOutlined style={{ color: "#722ed1" }} />
          ) : (
            <BookOutlined style={{ color: "#1890ff" }} />
          )}
          <span>Detail Hasil {isGroupQuiz ? "Quiz Kelompok" : "Quiz"}</span>
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
      {/* Quiz Header */}
      <QuizResultsHeader
        quiz={quiz}
        attempt={attempt}
        quizTitle={quizTitle}
        isGroupQuiz={isGroupQuiz}
        groupData={groupData}
      />

      {/* Detail Information */}
      <QuizResultsDetailInfo
        quiz={quiz}
        attempt={attempt}
        isGroupQuiz={isGroupQuiz}
        groupData={groupData}
      />

      {/* Summary Statistics */}
      <QuizResultsSummaryStats summary={summary} questions={questions} />

      {/* Questions Review */}
      {questions && questions.length > 0 ? (
        <>
          <Divider orientation="left">
            <Text strong>
              Review Jawaban ({questions.length} soal)
              {isGroupQuiz && (
                <span style={{ marginLeft: 8, color: "#722ed1" }}>
                  <TeamOutlined /> Kelompok
                </span>
              )}
            </Text>
          </Divider>

          <QuizAnswersReview questions={questions} isGroupQuiz={isGroupQuiz} />
        </>
      ) : (
        <Alert
          message={`Detail Soal ${isGroupQuiz ? "Quiz Kelompok" : "Quiz"}`}
          description={
            <div>
              <Text>
                📋 Detail soal dan jawaban tidak tersedia untuk quiz ini.
              </Text>
              <div style={{ marginTop: 12 }}>
                <Text strong>Kemungkinan penyebab:</Text>
                <ul style={{ marginTop: 8, marginBottom: 0, paddingLeft: 20 }}>
                  <li>Quiz sudah selesai dan review dinonaktifkan</li>
                  <li>Quiz tidak menyimpan detail jawaban</li>
                  <li>Data quiz masih dalam proses sinkronisasi</li>
                  {isGroupQuiz && (
                    <li>Quiz kelompok tidak menampilkan review detail</li>
                  )}
                </ul>
              </div>
              <div
                style={{
                  marginTop: 16,
                  padding: 12,
                  background: "#f0f8ff",
                  borderRadius: 6,
                  border: "1px solid #d6e4ff",
                }}
              >
                <Text strong style={{ color: "#1890ff" }}>
                  💡 Tips untuk analisis lebih lanjut:
                </Text>
                <br />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {isGroupQuiz
                    ? "Diskusikan hasil quiz dengan anggota kelompok dan guru untuk evaluasi bersama."
                    : "Hubungi guru untuk mendapatkan review detail jawaban dan penjelasan materi."}
                </Text>
              </div>
            </div>
          }
          type="info"
          showIcon
          style={{ marginBottom: 24, borderRadius: 8 }}
        />
      )}

      {/* Improvement Suggestions */}
      <QuizImprovementSection
        score={attempt?.score}
        isGroupQuiz={isGroupQuiz}
      />

      {/* Group Members Section */}
      {isGroupQuiz && groupData && (
        <QuizGroupMembersSection groupData={groupData} />
      )}

      {/* Contact Teacher Section */}
      {/* <QuizContactSection isGroupQuiz={isGroupQuiz} /> */}
    </Modal>
  );
};

export default QuizResultsDetail;
