import React, { useState } from "react";
import { Spin, Alert } from "antd";
import StudentAssignmentList from "./components/StudentAssignmentList";
import AssignmentSubmissionForm from "./components/AssignmentSubmissionForm";
import SubmissionHistory from "./components/SubmissionHistory";
import useStudentAssignmentSubmission from "./hooks/useStudentAssignmentSubmission";

const StudentAssignments = () => {
  const [currentView, setCurrentView] = useState("list"); // list, submit, history

  const {
    // Data
    assignments,
    selectedAssignment,
    assignmentQuestions,
    submissions,
    answers,
    uploadedFiles,

    // States
    loading,
    submitting,
    draftSaving,
    isDraftDirty,
    error,

    // Actions
    selectAssignment,
    updateAnswer,
    addUploadedFile,
    removeUploadedFile,
    saveDraft,
    submitAssignment,

    // Utilities
    getAssignmentStatus,
    getTimeRemaining,
  } = useStudentAssignmentSubmission();

  const handleSelectAssignment = async (assignment) => {
    console.log("Handling assignment selection:", assignment);
    try {
      await selectAssignment(assignment);
      const status = getAssignmentStatus(assignment);

      if (status.status === "submitted" || status.status === "graded") {
        setCurrentView("history");
      } else {
        setCurrentView("submit");
      }
    } catch (error) {
      console.error("Error selecting assignment:", error);
    }
  };

  const handleBackToList = () => {
    setCurrentView("list");
  };

  const handleSubmitSuccess = () => {
    setCurrentView("history");
  };

  // Render based on current view
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
        onAnswerChange={updateAnswer}
        onFileChange={addUploadedFile}
        onFileRemove={removeUploadedFile}
        onSaveDraft={saveDraft}
        onSubmit={async (assignmentId, data) => {
          const success = await submitAssignment(assignmentId, data);
          if (success) {
            handleSubmitSuccess();
          }
          return success;
        }}
        onBack={handleBackToList}
        getTimeRemaining={getTimeRemaining}
      />
    );
  }

  if (currentView === "history" && selectedAssignment) {
    return (
      <SubmissionHistory
        submissions={submissions}
        assignment={selectedAssignment}
        onBack={handleBackToList}
      />
    );
  }

  // Fallback loading state
  return (
    <div style={{ textAlign: "center", padding: "40px 0" }}>
      <Spin size="large" tip="Loading..." />
    </div>
  );
};

export default StudentAssignments;
