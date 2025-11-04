import React, { useState, useEffect } from "react";
import { Layout, message, Row, Col } from "antd";
import { useParams, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import { Helmet } from "react-helmet";

import useStudentARCSSubmission from "../../hooks/useStudentARCSSubmission";
import {
  ARCSSubmissionHeader,
  ARCSSubmissionSidebar,
  ARCSQuestionCard,
  ARCSSubmitModal,
  ARCSSubmissionLoading,
} from "./arcs-submission";

dayjs.extend(duration);

const { Content } = Layout;

const StudentARCSSubmissionForm = () => {
  const { materialSlug, arcsSlug } = useParams();
  const navigate = useNavigate();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitModalVisible, setSubmitModalVisible] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const { questionnaire, loading, error, submitting, submitARCS } =
    useStudentARCSSubmission(materialSlug, arcsSlug);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Timer for duration limit
  useEffect(() => {
    if (questionnaire?.time_remaining) {
      setTimeRemaining(questionnaire.time_remaining);

      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [questionnaire]);

  const handleAutoSubmit = async () => {
    message.warning("Waktu habis! Kuesioner akan otomatis disubmit.");
    await handleSubmit();
  };

  const handleAnswerChange = (
    questionId,
    value,
    answerType = "likert_value"
  ) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        question_id: questionId,
        [answerType]: value,
      },
    }));
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < allQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const goToQuestion = (index) => {
    setCurrentQuestionIndex(index);
  };

  const handleSubmit = async () => {
    try {
      const answersArray = Object.values(answers).map((answer) => answer);
      const result = await submitARCS(answersArray);
      if (result) {
        message.success("Kuesioner ARCS berhasil disubmit!");
        navigate(`/student/materials/${materialSlug}/${arcsSlug}/results`);
      } else {
        message.error("Gagal submit kuesioner");
      }
    } catch (error) {
      message.error("Gagal submit kuesioner");
    }
  };

  const handleSubmitClick = () => {
    setSubmitModalVisible(true);
  };

  const handleSubmitConfirm = async () => {
    setSubmitModalVisible(false);
    await handleSubmit();
  };

  const handleSubmitCancel = () => {
    setSubmitModalVisible(false);
  };

  const handleBack = () => {
    navigate(`/student/materials/${materialSlug}`);
  };

  const isAllQuestionsAnswered = () => {
    if (!questionnaire?.questions) return false;
    return questionnaire.questions.every((q) => answers[q.id]);
  };

  const getProgress = () => {
    if (!questionnaire?.questions) return 0;
    const answeredCount = Object.keys(answers).length;
    return Math.round((answeredCount / questionnaire.questions.length) * 100);
  };

  if (loading) {
    return <ARCSSubmissionLoading />;
  }

  if (error) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
          padding: "20px",
        }}
      >
        <div style={{ textAlign: "center", maxWidth: 400 }}>
          <h3 style={{ color: "#ff4d4f", marginBottom: 16 }}>
            Gagal Memuat Kuesioner
          </h3>
          <p style={{ color: "#666", marginBottom: 24 }}>{error}</p>
          <button
            onClick={handleBack}
            style={{
              background: "#1890ff",
              color: "white",
              border: "none",
              padding: "8px 24px",
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            Kembali ke Materi
          </button>
        </div>
      </div>
    );
  }

  if (!questionnaire?.questions || questionnaire.questions.length === 0) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
          padding: "20px",
        }}
      >
        <div style={{ textAlign: "center", maxWidth: 400 }}>
          <h3 style={{ color: "#fa8c16", marginBottom: 16 }}>
            Kuesioner Tidak Tersedia
          </h3>
          <p style={{ color: "#666", marginBottom: 24 }}>
            Kuesioner ARCS ini belum memiliki pertanyaan atau sedang dalam
            proses penyiapan.
          </p>
          <button
            onClick={handleBack}
            style={{
              background: "#1890ff",
              color: "white",
              border: "none",
              padding: "8px 24px",
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            Kembali ke Materi
          </button>
        </div>
      </div>
    );
  }

  const allQuestions = questionnaire.questions || [];
  const currentQuestion = allQuestions[currentQuestionIndex];
  const answeredCount = Object.keys(answers).length;
  const progress = getProgress();

  return (
    <div
      style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "24px 16px",
        minHeight: "calc(100vh - 64px)",
      }}
    >
      <Helmet>
        <title>Pengisian ARCS | PramLearn</title>
      </Helmet>
      <div style={{ maxWidth: 1400, margin: "0 auto" }}>
        {/* Header */}
        <ARCSSubmissionHeader
          questionnaire={questionnaire}
          timeRemaining={timeRemaining}
          progress={progress}
          answeredCount={answeredCount}
          totalQuestions={allQuestions.length}
          onBack={handleBack}
          isMobile={isMobile}
        />

        {/* Main Content */}
        <Row gutter={[24, 24]}>
          {/* Sidebar */}
          <Col xs={24} lg={6}>
            <div style={{ position: "sticky", top: 24 }}>
              <ARCSSubmissionSidebar
                allQuestions={allQuestions}
                currentQuestionIndex={currentQuestionIndex}
                setCurrentQuestionIndex={goToQuestion}
                answers={answers}
                progress={progress}
                questionnaire={questionnaire}
              />
            </div>
          </Col>

          {/* Question Card */}
          <Col xs={24} lg={18}>
            <ARCSQuestionCard
              currentQuestion={currentQuestion}
              currentQuestionIndex={currentQuestionIndex}
              totalQuestions={allQuestions.length}
              answers={answers}
              questionnaire={questionnaire}
              onAnswerChange={handleAnswerChange}
              onPrev={previousQuestion}
              onNext={nextQuestion}
              onSubmit={handleSubmitClick}
              isMobile={isMobile}
            />
          </Col>
        </Row>

        {/* Submit Modal */}
        <ARCSSubmitModal
          visible={submitModalVisible}
          onOk={handleSubmitConfirm}
          onCancel={handleSubmitCancel}
          answeredCount={answeredCount}
          totalQuestions={allQuestions.length}
          progress={progress}
          questionnaire={questionnaire}
        />
      </div>
    </div>
  );
};

export default StudentARCSSubmissionForm;
