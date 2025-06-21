import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Add this import
import { Layout, Alert, Spin, message } from "antd";
import useAssignmentSubmission from "../hooks/useAssignmentSubmission";
import AssignmentSubmissionHeader from "./assignment-submission/AssignmentSubmissionHeader";
import AssignmentSubmissionSidebar from "./assignment-submission/AssignmentSubmissionSidebar";
import AssignmentQuestionCard from "./assignment-submission/AssignmentQuestionCard";
import AssignmentSubmitModal from "./assignment-submission/AssignmentSubmitModal";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/id";

dayjs.extend(relativeTime);
dayjs.locale("id");

const AssignmentSubmissionForm = ({
  assignment,
  questions,
  answers: initialAnswers,
  uploadedFiles: initialFiles,
  submitting,
  onAnswerChange,
  onFileChange,
  onFileRemove,
  onSaveDraft,
  onSubmit,
  onBack,
  getTimeRemaining,
}) => {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [submitModalVisible, setSubmitModalVisible] = useState(false);

  const {
    currentQuestionIndex,
    setCurrentQuestionIndex,
    answers,
    uploadedFiles,
    flaggedQuestions,
    autoSaving,
    updateAnswer,
    toggleQuestionFlag,
    addUploadedFile,
    removeUploadedFile,
  } = useAssignmentSubmission(
    assignment,
    questions,
    initialAnswers,
    initialFiles
  );

  // Mobile detection
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!assignment) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <Spin size="large" tip="Memuat tugas..." />
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 16px" }}>
        <Alert
          message="Belum ada soal"
          description="Tugas ini belum memiliki soal. Silakan hubungi guru Anda."
          type="info"
          showIcon
        />
      </div>
    );
  }

  const safeQuestions = Array.isArray(questions) ? questions : [];
  const timeRemaining = assignment
    ? getTimeRemaining(assignment.due_date)
    : { expired: false, text: "", color: "" };
  const isOverdue = timeRemaining?.expired || false;

  // Group questions by type
  const multipleChoiceQuestions = safeQuestions.filter(
    (q) =>
      q.question_type === "multiple_choice" ||
      (q.choice_a && q.choice_a.trim() !== "")
  );
  const essayQuestions = safeQuestions.filter(
    (q) =>
      q.question_type === "essay" || !q.choice_a || q.choice_a.trim() === ""
  );

  const allQuestions = [...multipleChoiceQuestions, ...essayQuestions];
  const currentQuestion = allQuestions[currentQuestionIndex];
  const answeredCount = Object.keys(answers).length;
  const progress =
    allQuestions.length > 0 ? (answeredCount / allQuestions.length) * 100 : 0;

  // Handlers
  const handleAnswerChange = (questionId, value) => {
    updateAnswer(questionId, value);
    onAnswerChange(questionId, value);
  };

  const handleQuestionNavigation = (direction) => {
    const newIndex =
      direction === "next"
        ? Math.min(currentQuestionIndex + 1, allQuestions.length - 1)
        : Math.max(currentQuestionIndex - 1, 0);
    setCurrentQuestionIndex(newIndex);
  };

  const handleSubmit = async () => {
    if (answeredCount === 0) {
      message.warning("Anda belum menjawab soal apapun!");
      return;
    }
    setSubmitModalVisible(true);
  };

  const handleSubmitConfirm = async () => {
    setSubmitModalVisible(false);
    try {
      const success = await onSubmit(assignment.id, {
        answers: answers,
        uploaded_files: uploadedFiles,
      });
      if (success) {
        message.success("Tugas berhasil dikumpulkan!");
        navigate(
          `/student/assignments/${assignment.slug || assignment.id}/results`
        );
      }
    } catch (error) {
      message.error("Gagal mengumpulkan tugas");
    }
  };

  return (
    <div
      style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "24px 16px",
        minHeight: "calc(100vh - 64px)",
      }}
    >
      <AssignmentSubmissionHeader
        assignment={assignment}
        currentQuestionIndex={currentQuestionIndex}
        totalQuestions={allQuestions.length}
        timeRemaining={timeRemaining}
        isOverdue={isOverdue}
        isMobile={isMobile}
        onBack={onBack}
      />

      <div style={{ marginBottom: 24 }}>
        <div
          style={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            gap: 24,
          }}
        >
          <div
            style={{
              flex: 1,
              minWidth: 320,
              maxWidth: isMobile ? "100%" : 400,
            }}
          >
            <AssignmentSubmissionSidebar
              allQuestions={allQuestions}
              currentQuestionIndex={currentQuestionIndex}
              setCurrentQuestionIndex={setCurrentQuestionIndex}
              answers={answers}
              flaggedQuestions={flaggedQuestions}
              toggleQuestionFlag={toggleQuestionFlag}
              autoSaving={autoSaving}
              progress={progress}
            />
          </div>
          <div style={{ flex: 2, minWidth: 320 }}>
            <AssignmentQuestionCard
              currentQuestion={currentQuestion}
              currentQuestionIndex={currentQuestionIndex}
              totalQuestions={allQuestions.length}
              answers={answers}
              flaggedQuestions={flaggedQuestions}
              multipleChoiceQuestions={multipleChoiceQuestions}
              isOverdue={isOverdue}
              onAnswerChange={handleAnswerChange}
              onPrev={() => handleQuestionNavigation("prev")}
              onNext={() => handleQuestionNavigation("next")}
              onSubmit={handleSubmit}
            />
          </div>
        </div>
      </div>

      <AssignmentSubmitModal
        visible={submitModalVisible}
        onOk={handleSubmitConfirm}
        onCancel={() => setSubmitModalVisible(false)}
        answeredCount={answeredCount}
        totalQuestions={allQuestions.length}
        progress={progress}
      />
    </div>
  );
};

export default AssignmentSubmissionForm;
