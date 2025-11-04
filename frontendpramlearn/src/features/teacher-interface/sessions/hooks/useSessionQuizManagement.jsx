import { useState, useEffect, useContext, useCallback } from "react";
import { message } from "antd";
import api from "../../../../api";
import { AuthContext } from "../../../../context/AuthContext";
import Swal from "sweetalert2";

const useSessionQuizManagement = (materialSlug) => {
  const { token } = useContext(AuthContext);
  const [quizzes, setQuizzes] = useState([]);
  const [groups, setGroups] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState({});

  // Fetch quiz data
  const fetchQuizData = useCallback(async () => {
    if (!materialSlug || !token) return;

    try {
      setLoading(true);
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      const response = await api.get(
        `teacher/sessions/material/${materialSlug}/quizzes/`
      );

      setQuizzes(response.data.quizzes || []);
      setGroups(response.data.groups || []);
      setStatistics(response.data.statistics || {});
      setError(null);
    } catch (err) {
      setError(err);
      console.error("Error fetching quiz data:", err);
      message.error("Gagal memuat data quiz");
    } finally {
      setLoading(false);
    }
  }, [materialSlug, token]);

  // Create quiz
  const createQuiz = async (quizData) => {
    try {
      setActionLoading((prev) => ({ ...prev, creating: true }));

      const response = await api.post(
        `teacher/sessions/material/${materialSlug}/quizzes/`,
        quizData
      );

      message.success("Quiz berhasil dibuat!");
      await fetchQuizData();
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.error || "Gagal membuat quiz";
      message.error(errorMessage);
      throw error;
    } finally {
      setActionLoading((prev) => ({ ...prev, creating: false }));
    }
  };

  // Update quiz
  const updateQuiz = async (quizId, quizData) => {
    try {
      setActionLoading((prev) => ({ ...prev, [`updating_${quizId}`]: true }));

      const response = await api.put(
        `teacher/sessions/material/${materialSlug}/quizzes/${quizId}/update`,
        quizData
      );

      message.success("Quiz berhasil diperbarui!");
      await fetchQuizData();
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || "Gagal memperbarui quiz";
      message.error(errorMessage);
      throw error;
    } finally {
      setActionLoading((prev) => ({ ...prev, [`updating_${quizId}`]: false }));
    }
  };

  // Update quiz status
  const updateQuizStatus = async (quizId, isActive) => {
    try {
      setActionLoading((prev) => ({ ...prev, [`status_${quizId}`]: true }));

      const response = await api.patch(
        `teacher/sessions/material/${materialSlug}/quizzes/${quizId}/update`,
        { is_active: isActive }
      );

      message.success(response.data.message);
      await fetchQuizData();
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || "Gagal mengubah status quiz";
      message.error(errorMessage);
      throw error;
    } finally {
      setActionLoading((prev) => ({ ...prev, [`status_${quizId}`]: false }));
    }
  };

  // Delete quiz
  const deleteQuiz = async (quiz) => {
    try {
      const result = await Swal.fire({
        title: "Hapus Quiz?",
        text: `Apakah Anda yakin ingin menghapus quiz "${quiz.title}"? Tindakan ini tidak dapat dibatalkan.`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#ff4d4f",
        cancelButtonColor: "#d9d9d9",
        confirmButtonText: "Ya, Hapus!",
        cancelButtonText: "Batal",
      });

      if (result.isConfirmed) {
        setActionLoading((prev) => ({
          ...prev,
          [`deleting_${quiz.id}`]: true,
        }));

        await api.delete(
          `teacher/sessions/material/${materialSlug}/quizzes/${quiz.id}/`
        );

        message.success("Quiz berhasil dihapus!");
        await fetchQuizData();

        Swal.fire(
          "Terhapus!",
          `Quiz "${quiz.title}" telah dihapus.`,
          "success"
        );
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || "Gagal menghapus quiz";
      message.error(errorMessage);
      Swal.fire("Error!", errorMessage, "error");
    } finally {
      setActionLoading((prev) => ({ ...prev, [`deleting_${quiz.id}`]: false }));
    }
  };

  // Assign quiz to groups
  const assignQuizToGroups = async (quizId, groupIds, startTime, endTime) => {
    try {
      setActionLoading((prev) => ({ ...prev, [`assigning_${quizId}`]: true }));

      const response = await api.post(
        `teacher/sessions/material/${materialSlug}/quiz-assignment/`,
        {
          quiz_id: quizId,
          group_ids: groupIds,
          start_time: startTime,
          end_time: endTime,
        }
      );

      message.success(response.data.message);
      await fetchQuizData();
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.error || "Gagal assign quiz";
      message.error(errorMessage);
      throw error;
    } finally {
      setActionLoading((prev) => ({ ...prev, [`assigning_${quizId}`]: false }));
    }
  };

  // Get quiz detail with results
  const getQuizDetail = async (quizId) => {
    try {
      setActionLoading((prev) => ({ ...prev, [`fetching_${quizId}`]: true }));

      const response = await api.get(
        `teacher/sessions/material/${materialSlug}/quizzes/${quizId}/`
      );

      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || "Gagal memuat detail quiz";
      message.error(errorMessage);
      throw error;
    } finally {
      setActionLoading((prev) => ({ ...prev, [`fetching_${quizId}`]: false }));
    }
  };

  // Get quiz ranking
  const getQuizRanking = async (quizId) => {
    try {
      const response = await api.get(
        `teacher/sessions/material/${materialSlug}/quizzes/${quizId}/ranking/`
      );

      return response.data;
    } catch (error) {
      console.error("Error fetching quiz ranking:", error);
      throw error;
    }
  };

  useEffect(() => {
    fetchQuizData();
  }, [fetchQuizData]);

  return {
    quizzes,
    groups,
    statistics,
    loading,
    error,
    actionLoading,
    createQuiz,
    updateQuiz,
    updateQuizStatus,
    deleteQuiz,
    assignQuizToGroups,
    getQuizDetail,
    getQuizRanking,
    refetch: fetchQuizData,
  };
};

export default useSessionQuizManagement;
