import { useState } from "react";

const useModalManagement = () => {
  const [quizModalOpen, setQuizModalOpen] = useState(false);
  const [assignmentModalOpen, setAssignmentModalOpen] = useState(false);

  const openQuizModal = () => setQuizModalOpen(true);
  const closeQuizModal = () => setQuizModalOpen(false);
  const openAssignmentModal = () => setAssignmentModalOpen(true);
  const closeAssignmentModal = () => setAssignmentModalOpen(false);

  return {
    quizModalOpen,
    assignmentModalOpen,
    openQuizModal,
    closeQuizModal,
    openAssignmentModal,
    closeAssignmentModal,
  };
};

export default useModalManagement;
