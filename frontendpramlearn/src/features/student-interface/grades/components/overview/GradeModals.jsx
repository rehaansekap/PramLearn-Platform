import React from "react";
import QuizResultsDetail from "../QuizResultsDetail";
import AssignmentFeedback from "../AssignmentFeedback";

const GradeModals = ({ selectedGrade, detailModalVisible, onCloseDetail }) => {
  if (!selectedGrade) return null;

  return (
    <>
      {selectedGrade.type === "quiz" && (
        <QuizResultsDetail
          visible={detailModalVisible}
          onClose={onCloseDetail}
          attemptId={selectedGrade.attempt_id || selectedGrade.id}
          isGroupQuiz={selectedGrade.is_group_quiz || false}
          quizTitle={selectedGrade.title}
        />
      )}

      {selectedGrade.type === "assignment" && (
        <AssignmentFeedback
          visible={detailModalVisible}
          onClose={onCloseDetail}
          submissionId={selectedGrade.submission_id || selectedGrade.id}
          gradeId={selectedGrade.id}
          assignmentTitle={selectedGrade.title}
        />
      )}
    </>
  );
};

export default GradeModals;
