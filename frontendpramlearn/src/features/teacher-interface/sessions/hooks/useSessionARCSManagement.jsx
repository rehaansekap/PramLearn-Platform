import { useState, useEffect, useCallback } from "react";
import api from "../../../../api";
import { message } from "antd";

const useSessionARCSManagement = (materialSlug) => {
  const [questionnaires, setQuestionnaires] = useState([]);
  const [selectedQuestionnaire, setSelectedQuestionnaire] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [responses, setResponses] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [responsesLoading, setResponsesLoading] = useState(false);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  // Fetch questionnaires
  const fetchQuestionnaires = useCallback(async () => {
    if (!materialSlug) return;

    setLoading(true);
    try {
      const response = await api.get(
        `/teacher/sessions/${materialSlug}/arcs-questionnaires/`
      );
      setQuestionnaires(response.data.questionnaires);
    } catch (error) {
      console.error("Error fetching questionnaires:", error);
      message.error("Gagal memuat daftar kuesioner");
    } finally {
      setLoading(false);
    }
  }, [materialSlug]);

  // Create questionnaire
  const createQuestionnaire = async (data) => {
    try {
      const response = await api.post(
        `/teacher/sessions/${materialSlug}/arcs-questionnaires/`,
        data
      );
      await fetchQuestionnaires();
      message.success("Kuesioner berhasil dibuat");
      return response.data;
    } catch (error) {
      console.error("Error creating questionnaire:", error);
      message.error("Gagal membuat kuesioner");
      throw error;
    }
  };

  // Update questionnaire
  const updateQuestionnaire = async (questionnaireId, data) => {
    try {
      const response = await api.put(
        `/teacher/sessions/${materialSlug}/arcs-questionnaires/${questionnaireId}/`,
        data
      );
      await fetchQuestionnaires();
      message.success("Kuesioner berhasil diperbarui");
      return response.data;
    } catch (error) {
      console.error("Error updating questionnaire:", error);
      message.error("Gagal memperbarui kuesioner");
      throw error;
    }
  };

  // Delete questionnaire
  const deleteQuestionnaire = async (questionnaireId) => {
    try {
      await api.delete(
        `/teacher/sessions/${materialSlug}/arcs-questionnaires/${questionnaireId}/`
      );
      await fetchQuestionnaires();
      message.success("Kuesioner berhasil dihapus");
    } catch (error) {
      console.error("Error deleting questionnaire:", error);
      message.error("Gagal menghapus kuesioner");
      throw error;
    }
  };

  // Fetch questions
  const fetchQuestions = useCallback(
    async (questionnaireId) => {
      if (!questionnaireId) return;

      setQuestionsLoading(true);
      try {
        const response = await api.get(
          `/teacher/sessions/${materialSlug}/arcs-questionnaires/${questionnaireId}/questions/`
        );
        setQuestions(response.data.questions);
      } catch (error) {
        console.error("Error fetching questions:", error);
        message.error("Gagal memuat daftar pertanyaan");
      } finally {
        setQuestionsLoading(false);
      }
    },
    [materialSlug]
  );

  // Create question
  const createQuestion = async (questionnaireId, data) => {
    try {
      const response = await api.post(
        `/teacher/sessions/${materialSlug}/arcs-questionnaires/${questionnaireId}/questions/`,
        data
      );
      await fetchQuestions(questionnaireId);
      message.success("Pertanyaan berhasil ditambahkan");
      return response.data;
    } catch (error) {
      console.error("Error creating question:", error);
      message.error("Gagal menambahkan pertanyaan");
      throw error;
    }
  };

  // Fetch responses
  const fetchResponses = useCallback(
    async (questionnaireId) => {
      if (!questionnaireId) return;

      setResponsesLoading(true);
      try {
        const response = await api.get(
          `/teacher/sessions/${materialSlug}/arcs-questionnaires/${questionnaireId}/responses/`
        );
        setResponses(response.data.responses);
        return response.data;
      } catch (error) {
        console.error("Error fetching responses:", error);
        message.error("Gagal memuat jawaban siswa");
      } finally {
        setResponsesLoading(false);
      }
    },
    [materialSlug]
  );

  // Fetch analytics
  const fetchAnalytics = useCallback(
    async (questionnaireId) => {
      if (!questionnaireId) return;

      setAnalyticsLoading(true);
      try {
        const response = await api.get(
          `/teacher/sessions/${materialSlug}/arcs-questionnaires/${questionnaireId}/analytics/`
        );
        setAnalytics(response.data);
        return response.data;
      } catch (error) {
        console.error("Error fetching analytics:", error);
        message.error("Gagal memuat analisis");
      } finally {
        setAnalyticsLoading(false);
      }
    },
    [materialSlug]
  );

  // Initial fetch
  useEffect(() => {
    fetchQuestionnaires();
  }, [fetchQuestionnaires]);

  return {
    questionnaires,
    selectedQuestionnaire,
    setSelectedQuestionnaire,
    questions,
    responses,
    analytics,
    loading,
    questionsLoading,
    responsesLoading,
    analyticsLoading,
    fetchQuestionnaires,
    createQuestionnaire,
    updateQuestionnaire,
    deleteQuestionnaire,
    fetchQuestions,
    createQuestion,
    fetchResponses,
    fetchAnalytics,
  };
};

export default useSessionARCSManagement;
