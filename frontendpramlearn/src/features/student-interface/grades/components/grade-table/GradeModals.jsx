import React from "react";
import QuizResultsDetail from "../QuizResultsDetail";
import AssignmentFeedback from "../AssignmentFeedback";

const GradeModals = ({ selectedGrade, detailModalVisible, onCloseDetail }) => {
  if (!selectedGrade) return null;

  return (
    <>
      {/* Modal untuk Assignment */}
      {selectedGrade.type === "assignment" && (
        <AssignmentFeedback
          visible={detailModalVisible}
          onClose={onCloseDetail}
          gradeId={selectedGrade.id}
          assignmentTitle={selectedGrade.title}
        />
      )}

      {/* Modal untuk Quiz */}
      {selectedGrade.type === "quiz" && (
        <QuizResultsDetail
          visible={detailModalVisible}
          onClose={onCloseDetail}
          attemptId={selectedGrade.attempt_id || selectedGrade.id}
          quizTitle={selectedGrade.title}
          isGroupQuiz={
            selectedGrade.is_group_quiz || !!selectedGrade.group_data
          }
          groupData={selectedGrade?.group_data || null}
        />
      )}
    </>
  );
};

export default GradeModals;
