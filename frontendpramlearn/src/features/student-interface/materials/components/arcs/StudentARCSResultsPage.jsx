import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Space, Alert, Button } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { Helmet } from "react-helmet";

import useStudentARCSResults from "../../hooks/useStudentARCSResults";
import {
  ARCSResultsHeader,
  ARCSDimensionScores,
  ARCSAnalysisCard,
  ARCSAnswersReview,
  ARCSResultsActions,
  ARCSResultsLoading,
} from "./arcs-results";

const StudentARCSResultsPage = () => {
  const { materialSlug, arcsSlug } = useParams();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const { results, loading, error } = useStudentARCSResults(
    materialSlug,
    arcsSlug
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleBack = () => {
    navigate(`/student/materials/${materialSlug}`);
  };

  if (loading) {
    return <ARCSResultsLoading />;
  }

  if (error) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#f8f9fa",
          padding: isMobile ? "16px" : "24px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ maxWidth: 500, width: "100%" }}>
          <Alert
            message="Gagal Memuat Hasil ARCS"
            description={
              <div>
                <p style={{ marginBottom: 16 }}>{error}</p>
                <Space wrap>
                  <Button
                    type="primary"
                    icon={<ArrowLeftOutlined />}
                    onClick={handleBack}
                    size={isMobile ? "middle" : "large"}
                  >
                    Kembali ke Materi
                  </Button>
                  <Button
                    onClick={() => window.location.reload()}
                    size={isMobile ? "middle" : "large"}
                  >
                    Coba Lagi
                  </Button>
                </Space>
              </div>
            }
            type="error"
            showIcon
            style={{ borderRadius: isMobile ? 12 : 12 }}
          />
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#f8f9fa",
          padding: isMobile ? "16px" : "24px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ maxWidth: 500, width: "100%" }}>
          <Alert
            message="Hasil ARCS Tidak Ditemukan"
            description={
              <div>
                <p style={{ marginBottom: 16 }}>
                  Hasil kuesioner ARCS tidak tersedia atau belum pernah
                  diselesaikan.
                </p>
                <Button
                  type="primary"
                  icon={<ArrowLeftOutlined />}
                  onClick={handleBack}
                  size={isMobile ? "middle" : "large"}
                >
                  Kembali ke Materi
                </Button>
              </div>
            }
            type="warning"
            showIcon
            style={{ borderRadius: isMobile ? 12 : 12 }}
          />
        </div>
      </div>
    );
  }

  const {
    questionnaire,
    material,
    response,
    dimension_scores,
    motivation_level,
    answers,
  } = results;

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "60vh",
        padding: isMobile ? "16px 8px" : "20px",
      }}
    >
      <Helmet>
        <title>Hasil ARCS | PramLearn</title>
      </Helmet>
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          width: "100%",
        }}
      >
        {/* Header Section */}
        <ARCSResultsHeader
          results={results}
          onBack={handleBack}
          isMobile={isMobile}
        />

        {/* Content Sections */}
        <Space
          direction="vertical"
          size={isMobile ? "middle" : "large"}
          style={{ width: "100%" }}
        >
          {/* Dimension Scores */}
          <ARCSDimensionScores
            dimensionScores={dimension_scores}
            isMobile={isMobile}
          />

          {/* Analysis Card */}
          <ARCSAnalysisCard
            dimensionScores={dimension_scores}
            motivationLevel={motivation_level}
            isMobile={isMobile}
          />

          {/* Detailed Answers Review */}
          <ARCSAnswersReview
            answers={answers}
            questionnaire={questionnaire}
            isMobile={isMobile}
          />

          {/* Actions */}
          <ARCSResultsActions
            materialSlug={materialSlug}
            results={results}
            isMobile={isMobile}
          />
        </Space>
      </div>
    </div>
  );
};

export default StudentARCSResultsPage;
