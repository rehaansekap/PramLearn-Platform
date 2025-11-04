import React, { useState, useEffect } from "react";
import { Alert, message, Button } from "antd";
import { ReloadOutlined } from "@ant-design/icons";

import useSessionQuizManagement from "../../hooks/useSessionQuizManagement";

// Import new components
import QuizzesHeader from "./quizzes/QuizzesHeader";
import QuizzesStatsCards from "./quizzes/QuizzesStatsCards";
import QuizzesTable from "./quizzes/QuizzesTable";
import QuizFormModal from "./quizzes/QuizFormModal";
import SessionsQuizRankingModal from "./quizzes/SessionsQuizRankingModal";
import SessionsQuizResultsModal from "./quizzes/SessionsQuizResultsModal";

const SessionsMaterialQuizzesTab = ({
  materialSlug,
  materialDetail,
  isMobile = false,
}) => {
  const [isQuizModalVisible, setIsQuizModalVisible] = useState(false);
  const [isRankingModalVisible, setIsRankingModalVisible] = useState(false);
  const [isResultsModalVisible, setIsResultsModalVisible] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [editingQuiz, setEditingQuiz] = useState(null);

  const {
    quizzes: managedQuizzes,
    groups: managedGroups,
    statistics,
    loading,
    error,
    actionLoading,
    createQuiz,
    updateQuiz,
    deleteQuiz,
    updateQuizStatus,
    getQuizDetail,
    refetch,
  } = useSessionQuizManagement(materialSlug);

  // Handle create quiz
  const handleAddQuiz = () => {
    setEditingQuiz(null);
    setIsQuizModalVisible(true);
  };

  // Handle edit quiz
  const handleEditQuiz = (quiz) => {
    setEditingQuiz(quiz);
    setIsQuizModalVisible(true);
  };

  // Handle delete quiz
  const handleDeleteQuiz = async (quiz) => {
    await deleteQuiz(quiz);
  };

  // Handle view ranking
  const handleViewRanking = (quiz) => {
    setSelectedQuiz(quiz);
    setIsRankingModalVisible(true);
  };

  // Handle view results
  const handleViewResults = (quiz) => {
    setSelectedQuiz(quiz);
    setIsResultsModalVisible(true);
  };

  // Handle status change
  const handleStatusChange = async (quizId, isActive) => {
    try {
      await updateQuizStatus(quizId, isActive);
    } catch (error) {
      console.error("Failed to update quiz status:", error);
      message.error("Gagal mengubah status quiz");
    }
  };

  // Handle quiz submission
  const handleQuizSubmit = async (quizData, quizId = null) => {
    try {
      if (quizId) {
        await updateQuiz(quizId, quizData);
      } else {
        await createQuiz(quizData);
      }
      setIsQuizModalVisible(false);
    } catch (error) {
      console.error("Error submitting quiz:", error);
    }
  };

  if (error) {
    return (
      <div
        style={{
          background: "linear-gradient(135deg, #f8fafc 0%, #e6f3ff 100%)",
          minHeight: "400px",
          borderRadius: 16,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 20px",
        }}
      >
        <div style={{ textAlign: "center", maxWidth: 400 }}>
          <Alert
            message="Gagal Memuat Data Quiz"
            description="Terjadi kesalahan saat mengambil data quiz. Silakan refresh halaman atau coba lagi."
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
            action={
              <Button
                type="primary"
                danger
                icon={<ReloadOutlined />}
                onClick={refetch}
                style={{ borderRadius: 8 }}
              >
                Coba Lagi
              </Button>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        // background: "linear-gradient(135deg, #f8fafc 0%, #e6f3ff 100%)",
        minHeight: "100vh",
        padding: isMobile ? 16 : 24,
        borderRadius: 16,
      }}
    >
      {/* Header */}
      <QuizzesHeader
        isMobile={isMobile}
        quizzesCount={managedQuizzes.length}
        onAddQuiz={handleAddQuiz}
        loading={actionLoading.creating}
      />

      {/* Statistics Cards */}
      <QuizzesStatsCards statistics={statistics} isMobile={isMobile} />

      {/* Quiz Table */}
      <QuizzesTable
        quizzes={managedQuizzes}
        loading={loading}
        actionLoading={actionLoading}
        onEditQuiz={handleEditQuiz}
        onDeleteQuiz={handleDeleteQuiz}
        onViewRanking={handleViewRanking}
        onViewResults={handleViewResults}
        onStatusChange={handleStatusChange}
        isMobile={isMobile}
      />

      {/* Modals */}
      <QuizFormModal
        open={isQuizModalVisible}
        onClose={() => setIsQuizModalVisible(false)}
        onSubmit={handleQuizSubmit}
        editingQuiz={editingQuiz}
        groups={managedGroups}
        loading={
          actionLoading.creating || actionLoading[`updating_${editingQuiz?.id}`]
        }
        isMobile={isMobile}
      />

      <SessionsQuizRankingModal
        open={isRankingModalVisible}
        onClose={() => setIsRankingModalVisible(false)}
        quiz={selectedQuiz}
        materialSlug={materialSlug}
      />

      <SessionsQuizResultsModal
        open={isResultsModalVisible}
        onClose={() => setIsResultsModalVisible(false)}
        quiz={selectedQuiz}
        materialSlug={materialSlug}
        onGetQuizDetail={getQuizDetail}
      />
    </div>
  );
};

export default SessionsMaterialQuizzesTab;
