import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Alert, Spin, Row, Col, Space } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import api from "../../../../../api";
import GroupQuizHeader from "./GroupQuizHeader";
import GroupQuizScoreCard from "./GroupQuizScoreCard";
import GroupQuizStatistics from "./GroupQuizStatistics";
import GroupMembersContribution from "./GroupMembersContribution";
import GroupQuizAnswersReview from "./GroupQuizAnswersReview";
import GroupQuizActions from "./GroupQuizActions";

const GroupQuizResults = () => {
  const { quizSlug } = useParams();
  const navigate = useNavigate();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (quizSlug) {
      fetchResults();
    }
  }, [quizSlug]);

  const fetchResults = async () => {
    setLoading(true);
    setError(null);

    try {
      const resultsResponse = await api.get(
        `student/group-quiz/${quizSlug}/results/`
      );
      setResults(resultsResponse.data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "24px 16px",
          minHeight: "calc(100vh - 64px)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "60vh",
          }}
        >
          <Spin size="large" tip="Memuat hasil kuis kelompok..." />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "24px 16px",
          minHeight: "calc(100vh - 64px)",
        }}
      >
        <Alert
          message="Gagal memuat hasil kuis"
          description={error.message}
          type="error"
          showIcon
          style={{ borderRadius: 12 }}
          action={
            <Space>
              <button
                className="ant-btn ant-btn-sm"
                onClick={() => window.location.reload()}
              >
                <ReloadOutlined /> Coba Lagi
              </button>
              <button
                className="ant-btn ant-btn-sm"
                onClick={() => navigate("/student/assessments")}
              >
                Kembali
              </button>
            </Space>
          }
        />
      </div>
    );
  }

  // No results state
  if (!results) {
    return (
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "24px 16px",
          minHeight: "calc(100vh - 64px)",
        }}
      >
        <Alert
          message="Hasil kuis tidak ditemukan"
          description="Belum ada hasil kuis untuk ditampilkan."
          type="warning"
          showIcon
          style={{ borderRadius: 12 }}
        />
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "24px 16px",
        minHeight: "calc(100vh - 64px)",
      }}
    >
      {/* Header dengan breadcrumb */}
      <GroupQuizHeader
        results={results}
        onBack={() => navigate("/student/assessments")}
      />

      {/* Main Content - Two Panel Layout */}
      <Row gutter={[24, 24]}>
        {/* Left Panel - Score & Stats */}
        <Col xs={24} lg={10}>
          <Space direction="vertical" size={24} style={{ width: "100%" }}>
            {/* Overall Result Card */}
            <GroupQuizScoreCard results={results} />

            {/* Statistics Cards */}
            <GroupQuizStatistics results={results} />

            {/* Group Members Contribution */}
            <GroupMembersContribution results={results} />
          </Space>
        </Col>

        {/* Right Panel - Detailed Answers Review */}
        <Col xs={24} lg={14}>
          <GroupQuizAnswersReview results={results} />
        </Col>
      </Row>

      {/* Action Buttons */}
      <GroupQuizActions results={results} />
    </div>
  );
};

export default GroupQuizResults;
