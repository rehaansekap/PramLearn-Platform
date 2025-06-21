import React, { useEffect, useState, useCallback } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { Spin, Alert, Button } from "antd";
import StudentAssignmentList from "./components/StudentAssignmentList";
import AssignmentSubmissionForm from "./components/AssignmentSubmissionForm";
import SubmissionHistory from "./components/SubmissionHistory";
import useStudentAssignmentSubmission from "./hooks/useStudentAssignmentSubmission";

const StudentAssignments = () => {
  const { assignmentSlug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Custom hook untuk fetch data assignment & submission
  const {
    assignments,
    selectedAssignment,
    assignmentQuestions,
    submissions,
    currentSubmission,
    loading,
    error,
    getAssignmentStatus,
    setSelectedAssignment,
    getTimeRemaining,
    answers,
    uploadedFiles,
    submitting,
    draftSaving,
    isDraftDirty,
    refreshAssignments,
    fetchAssignmentQuestions,
    updateAnswer,
    addUploadedFile,
    removeUploadedFile,
    fetchSubmissionHistory,
    saveDraft,
    submitAssignment,
  } = useStudentAssignmentSubmission();

  const [currentView, setCurrentView] = useState("list");
  const [notFound, setNotFound] = useState(false);

  // Fetch submission history saat view berubah ke history
  useEffect(() => {
    if (currentView === "history" && selectedAssignment?.id) {
      console.log(
        "🔄 Fetching submission history for results view:",
        selectedAssignment.id
      );
      fetchSubmissionHistory(selectedAssignment.id);
    }
  }, [currentView, selectedAssignment?.id, fetchSubmissionHistory]);

  // Otomatis pilih assignment jika akses langsung via slug
  useEffect(() => {
    if (assignmentSlug && assignments.length > 0 && !selectedAssignment) {
      const found = assignments.find(
        (a) =>
          a.slug === assignmentSlug ||
          (a.title &&
            a.title
              .toLowerCase()
              .replace(/\s+/g, "-")
              .replace(/[^a-z0-9-]/g, "") === assignmentSlug)
      );
      if (found) {
        setSelectedAssignment(found);
      } else {
        setNotFound(true);
      }
    }
  }, [assignmentSlug, assignments, selectedAssignment, setSelectedAssignment]);

  useEffect(() => {
    if (selectedAssignment?.id && currentView === "submit") {
      console.log(
        "🔄 Fetching questions for assignment:",
        selectedAssignment.id
      );
      // Pastikan hook memiliki fungsi fetchAssignmentQuestions yang exposed
      fetchAssignmentQuestions(selectedAssignment.id);
    }
  }, [selectedAssignment?.id, currentView]);

  // Atur currentView berdasarkan status assignment & URL
  useEffect(() => {
    if (notFound) {
      setCurrentView("notfound");
      return;
    }
    if (assignmentSlug && selectedAssignment) {
      const status = getAssignmentStatus(selectedAssignment);
      if (
        location.pathname.endsWith("/results") ||
        status.status === "submitted" ||
        status.status === "graded"
      ) {
        setCurrentView("history");
      } else {
        setCurrentView("submit");
      }
    } else if (!assignmentSlug) {
      setCurrentView("list");
    }
  }, [
    assignmentSlug,
    selectedAssignment,
    location.pathname,
    getAssignmentStatus,
    notFound,
  ]);

  // Handler untuk kembali ke daftar assignment
  const handleBackToList = useCallback(() => {
    // Clear states
    setSelectedAssignment(null);
    setCurrentView("list");

    // Navigate ke route list tanpa slug
    navigate("/student/assignments", { replace: true });
  }, [navigate, setSelectedAssignment]);

  // Handler ketika memilih assignment dari list
  const handleSelectAssignment = useCallback(
    (assignment) => {
      setSelectedAssignment(assignment);
      const status = getAssignmentStatus(assignment);
      if (status.status === "submitted" || status.status === "graded") {
        setCurrentView("history");
        // ✅ TAMBAHKAN: Fetch submissions sebelum navigate
        fetchSubmissionHistory(assignment.id);
        navigate(
          `/student/assignments/${assignment.slug || assignment.id}/results`
        );
      } else {
        setCurrentView("submit");
        navigate(`/student/assignments/${assignment.slug || assignment.id}`);
      }
    },
    [
      getAssignmentStatus,
      navigate,
      setSelectedAssignment,
      fetchSubmissionHistory,
    ]
  );

  // Render error jika assignment tidak ditemukan
  if (currentView === "notfound") {
    return (
      <div style={{ textAlign: "center", padding: "40px 0" }}>
        <Alert
          message="Assignment tidak ditemukan"
          description="Assignment yang Anda cari tidak tersedia atau sudah dihapus."
          type="warning"
          showIcon
          style={{ borderRadius: 12, maxWidth: 500, margin: "0 auto" }}
          action={
            <Button type="primary" onClick={handleBackToList}>
              Kembali ke Daftar Assignment
            </Button>
          }
        />
      </div>
    );
  }

  // Render loading
  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "60px 0" }}>
        <Spin size="large" tip="Memuat data assignment..." />
      </div>
    );
  }

  // Render error umum
  if (error) {
    return (
      <div style={{ textAlign: "center", padding: "60px 0" }}>
        <Alert
          message="Terjadi kesalahan"
          description={error}
          type="error"
          showIcon
          style={{ borderRadius: 12, maxWidth: 500, margin: "0 auto" }}
          action={
            <Button type="primary" onClick={refreshAssignments}>
              Coba Lagi
            </Button>
          }
        />
      </div>
    );
  }

  // Render daftar assignment
  if (currentView === "list") {
    return (
      <StudentAssignmentList
        assignments={assignments}
        loading={loading}
        error={error}
        onSelectAssignment={handleSelectAssignment}
        getAssignmentStatus={getAssignmentStatus}
        getTimeRemaining={getTimeRemaining}
      />
    );
  }

  // Render form pengerjaan assignment
  if (currentView === "submit" && selectedAssignment) {
    return (
      <AssignmentSubmissionForm
        assignment={selectedAssignment}
        questions={assignmentQuestions}
        answers={answers}
        uploadedFiles={uploadedFiles}
        submitting={submitting}
        draftSaving={draftSaving}
        isDraftDirty={isDraftDirty}
        onAnswerChange={updateAnswer} // Make sure this is updateAnswer, not undefined
        onFileChange={addUploadedFile}
        onFileRemove={removeUploadedFile}
        onSaveDraft={saveDraft}
        onSubmit={submitAssignment}
        onBack={handleBackToList}
        getTimeRemaining={getTimeRemaining}
        updateAnswer={updateAnswer} // Remove this duplicate prop
        currentSubmission={currentSubmission}
      />
    );
  }

  // Render riwayat submission
  if (currentView === "history" && selectedAssignment) {
    return (
      <SubmissionHistory
        onBack={handleBackToList}
        assignment={selectedAssignment}
        submissions={submissions}
      />
    );
  }

  // Fallback loading
  return (
    <div style={{ textAlign: "center", padding: "40px 0" }}>
      <Spin size="large" tip="Loading..." />
    </div>
  );
};

export default StudentAssignments;
