import React, { useState, useEffect } from "react";
import { Alert, Row, Col, Spin, Space } from "antd";
import useSubmissionHistory from "../hooks/useSubmissionHistory";
import SubmissionHistoryHeader from "./submission-history/SubmissionHistoryHeader";
import SubmissionResultCard from "./submission-history/SubmissionResultCard";
import StatisticsCards from "./submission-history/StatisticsCards";
import AnswerReview from "./submission-history/AnswerReview";
import ActionButtons from "./submission-history/ActionButtons";
import TeacherFeedback from "./submission-history/TeacherFeedback";
import { getGradeColor, getGradeText } from "../utils/gradeUtils";
import { useNavigate } from "react-router-dom";

const SubmissionHistory = ({ onBack, assignment, submissions }) => {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const {
    assignmentState,
    submissionsState,
    loading,
    submissionDetails,
    loadingDetails,
  } = useSubmissionHistory(assignment, submissions);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "60px 0" }}>
        <Spin size="large" tip="Memuat riwayat tugas..." />
      </div>
    );
  }

  // Error state
  if (!assignmentState || submissionsState.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "60px 0" }}>
        <Alert
          message="Tugas atau riwayat pengumpulan tidak ditemukan"
          description="Tugas yang Anda cari tidak tersedia atau belum pernah dikerjakan."
          type="warning"
          showIcon
          style={{ borderRadius: 12, maxWidth: 500, margin: "0 auto" }}
          action={
            <Space>
              <button
                type="primary"
                onClick={() => navigate("/student/assignments")}
                style={{
                  background: "#1890ff",
                  color: "white",
                  border: "none",
                  padding: "8px 16px",
                  borderRadius: 6,
                  cursor: "pointer",
                }}
              >
                Kembali ke Daftar Tugas
              </button>
            </Space>
          }
        />
      </div>
    );
  }

  const latestSubmission = submissionsState[0];
  const isGraded = latestSubmission && latestSubmission.grade !== null;

  return (
    <div
      style={{
        maxWidth: 1400,
        margin: "0 auto",
        padding: "24px 16px",
        minHeight: "calc(100vh - 64px)",
      }}
    >
      <SubmissionHistoryHeader
        assignment={assignmentState}
        latestSubmission={latestSubmission}
        isMobile={isMobile}
      />

      {/* 2 Column Layout */}
      <Row gutter={[24, 24]}>
        {/* Left Column - Statistics & Info */}
        <Col xs={24} lg={10}>
          {/* Main Result Display */}
          {isGraded && (
            <SubmissionResultCard
              submission={latestSubmission}
              submissionDetails={submissionDetails}
              assignment={assignmentState}
              isMobile={isMobile}
              getGradeColor={getGradeColor}
              getGradeText={getGradeText}
            />
          )}

          <Space direction="vertical" style={{ width: "100%" }} size={24}>
            {/* Statistics Cards */}
            <StatisticsCards
              submissionDetails={submissionDetails}
              assignment={assignmentState}
              latestSubmission={latestSubmission}
              isMobile={isMobile}
            />

            {/* Teacher Feedback */}
            <TeacherFeedback feedback={latestSubmission?.teacher_feedback} />
          </Space>
        </Col>

        {/* Right Column - Answer Review */}
        <Col xs={24} lg={14}>
          <AnswerReview
            submissionDetails={submissionDetails}
            loadingDetails={loadingDetails}
            isMobile={isMobile}
          />
        </Col>
      </Row>

      {/* Action Buttons */}
      <ActionButtons isMobile={isMobile} />
    </div>
  );
};

export default SubmissionHistory;
