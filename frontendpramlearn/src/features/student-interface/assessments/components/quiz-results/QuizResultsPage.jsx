import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Spin, Alert, Button, Space } from "antd";
import { ReloadOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import api from "../../../../../api";
import QuizResultsHeader from "./QuizResultsHeader";
import QuizResultsOverview from "./QuizResultsOverview";
import QuizStatisticsCards from "./QuizStatisticsCards";
import QuizAnswersReview from "./QuizAnswersReview";
import QuizResultsActions from "./QuizResultsActions";

const QuizResultsPage = () => {
  const { quizSlug } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);
  const [quizDetails, setQuizDetails] = useState(null);

  useEffect(() => {
    if (quizSlug) {
      fetchQuizResults();
    }
  }, [quizSlug]);

  const fetchQuizResults = async () => {
    setLoading(true);
    setError(null);

    try {
      const [resultsResponse, quizResponse] = await Promise.all([
        api.get(`student/quiz/${quizSlug}/results/`),
        api.get(`student/quiz/${quizSlug}/`),
      ]);

      setResults(resultsResponse.data);
      setQuizDetails(quizResponse.data);
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
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <Spin size="large" tip="Memuat hasil kuis..." />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={{ maxWidth: 800, margin: "0 auto", padding: 16 }}>
        <Alert
          message="Gagal memuat hasil kuis"
          description={error.message}
          type="error"
          showIcon
          action={
            <Space>
              <Button
                size="small"
                icon={<ReloadOutlined />}
                onClick={() => window.location.reload()}
              >
                Coba Lagi
              </Button>
              <Button
                size="small"
                onClick={() => navigate("/student/assessments")}
              >
                Kembali
              </Button>
            </Space>
          }
        />
      </div>
    );
  }

  // No results state
  if (!results) {
    return (
      <div style={{ maxWidth: 800, margin: "0 auto", padding: 16 }}>
        <Alert
          message="Hasil kuis tidak ditemukan"
          description="Belum ada hasil kuis untuk ditampilkan."
          type="warning"
          showIcon
          action={
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/student/assessments")}
            >
              Kembali ke Daftar Kuis
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 16 }}>
      {/* Header dengan breadcrumb */}
      <QuizResultsHeader
        quizDetails={quizDetails}
        results={results}
        onBack={() => navigate("/student/assessments")}
      />

      {/* Overview hasil kuis */}
      <QuizResultsOverview results={results} />

      {/* Statistik detail */}
      <QuizStatisticsCards results={results} />

      {/* Review jawaban detail */}
      <QuizAnswersReview answers={results.answers || []} />

      {/* Action buttons */}
      <QuizResultsActions />
    </div>
  );
};

export default QuizResultsPage;
