import { useState, useCallback, useEffect, useContext } from "react";
import { message } from "antd";
import { AuthContext } from "../../../../context/AuthContext";
import api from "../../../../api";

const useSessionARCSManagement = (materialSlug) => {
  const { token } = useContext(AuthContext);
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
    if (!materialSlug || !token) return;

    setLoading(true);
    try {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      const response = await api.get(
        `teacher/sessions/${materialSlug}/arcs-questionnaires/`
      );

      setQuestionnaires(response.data.questionnaires || []);
    } catch (error) {
      console.error("Error fetching questionnaires:", error);
      const errorMessage =
        error.response?.data?.error || "Gagal memuat daftar kuesioner";
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [materialSlug, token]);

  // Fetch questions
  const fetchQuestions = useCallback(
    async (questionnaireId) => {
      if (!materialSlug || !questionnaireId || !token) return;

      setQuestionsLoading(true);
      try {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        const response = await api.get(
          `teacher/sessions/${materialSlug}/arcs-questionnaires/${questionnaireId}/questions/`
        );

        setQuestions(response.data.questions || []);
      } catch (error) {
        console.error("Error fetching questions:", error);
        const errorMessage =
          error.response?.data?.error || "Gagal memuat pertanyaan";
        message.error(errorMessage);
      } finally {
        setQuestionsLoading(false);
      }
    },
    [materialSlug, token]
  );

  // Fetch responses
  const fetchResponses = useCallback(
    async (questionnaireId) => {
      if (!materialSlug || !questionnaireId || !token) return;

      setResponsesLoading(true);
      try {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        const response = await api.get(
          `teacher/sessions/${materialSlug}/arcs-questionnaires/${questionnaireId}/responses/`
        );

        console.log("Raw responses data:", response.data);

        // Process responses to ensure proper structure
        const processedResponses =
          response.data.responses?.map((resp) => ({
            ...resp,
            id: resp.id,
            student_name: resp.student_name || "Unknown Student",
            student_username: resp.student_username || "No username",
            is_completed: resp.is_completed || false,
            submitted_at: resp.submitted_at || resp.created_at,
            answers:
              resp.answers?.map((answer) => ({
                ...answer,
                question_text: answer.question_text || answer.question?.text,
                dimension: answer.dimension || answer.question?.dimension,
                likert_value: answer.likert_value || 0,
              })) || [],
          })) || [];

        setResponses(processedResponses);
      } catch (error) {
        console.error("Error fetching responses:", error);
        const errorMessage =
          error.response?.data?.error || "Gagal memuat data respons";
        message.error(errorMessage);
        setResponses([]);
      } finally {
        setResponsesLoading(false);
      }
    },
    [materialSlug, token]
  );

  // Fetch analytics
  const fetchAnalytics = useCallback(
    async (questionnaireId) => {
      if (!materialSlug || !questionnaireId || !token) return;

      setAnalyticsLoading(true);
      try {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        const response = await api.get(
          `teacher/sessions/${materialSlug}/arcs-questionnaires/${questionnaireId}/analytics/`
        );

        setAnalytics(response.data);
      } catch (error) {
        console.error("Error fetching analytics:", error);
        const errorMessage =
          error.response?.data?.error || "Gagal memuat data analitik";
        message.error(errorMessage);
      } finally {
        setAnalyticsLoading(false);
      }
    },
    [materialSlug, token]
  );

  // Create questionnaire
  const createQuestionnaire = async (data) => {
    if (!materialSlug || !token) return;

    try {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      const response = await api.post(
        `teacher/sessions/${materialSlug}/arcs-questionnaires/`,
        data
      );

      await fetchQuestionnaires(); // Refresh list
      message.success("Kuesioner berhasil dibuat");
      return response.data;
    } catch (error) {
      console.error("Error creating questionnaire:", error);
      const errorMessage =
        error.response?.data?.error || "Gagal membuat kuesioner";
      message.error(errorMessage);
      throw error;
    }
  };

  // Update questionnaire
  const updateQuestionnaire = async (questionnaireId, data) => {
    if (!materialSlug || !questionnaireId || !token) return;

    try {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      const response = await api.put(
        `teacher/sessions/${materialSlug}/arcs-questionnaires/${questionnaireId}/`,
        data
      );

      await fetchQuestionnaires(); // Refresh list
      message.success("Kuesioner berhasil diperbarui");
      return response.data;
    } catch (error) {
      console.error("Error updating questionnaire:", error);
      const errorMessage =
        error.response?.data?.error || "Gagal memperbarui kuesioner";
      message.error(errorMessage);
      throw error;
    }
  };

  // Delete questionnaire
  const deleteQuestionnaire = async (questionnaireId) => {
    if (!materialSlug || !questionnaireId || !token) return;

    try {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      await api.delete(
        `teacher/sessions/${materialSlug}/arcs-questionnaires/${questionnaireId}/`
      );

      await fetchQuestionnaires(); // Refresh list

      if (selectedQuestionnaire?.id === questionnaireId) {
        setSelectedQuestionnaire(null);
        setQuestions([]);
        setResponses([]);
        setAnalytics(null);
      }

      message.success("Kuesioner berhasil dihapus");
    } catch (error) {
      console.error("Error deleting questionnaire:", error);
      const errorMessage =
        error.response?.data?.error || "Gagal menghapus kuesioner";
      message.error(errorMessage);
      throw error;
    }
  };

  // Create question
  const createQuestion = async (questionnaireId, questionData) => {
    if (!materialSlug || !questionnaireId || !token) return;

    try {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      const response = await api.post(
        `teacher/sessions/${materialSlug}/arcs-questionnaires/${questionnaireId}/questions/`,
        questionData
      );

      await fetchQuestions(questionnaireId); // Refresh questions
      await fetchQuestionnaires(); // Refresh questionnaires list to update counts

      message.success("Pertanyaan berhasil ditambahkan");
      return response.data;
    } catch (error) {
      console.error("Error creating question:", error);
      const errorMessage =
        error.response?.data?.error || "Gagal menambahkan pertanyaan";
      message.error(errorMessage);
      throw error;
    }
  };

  // Update question
  const updateQuestion = async (questionnaireId, questionId, questionData) => {
    if (!materialSlug || !questionnaireId || !questionId || !token) return;

    try {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      const response = await api.put(
        `teacher/sessions/${materialSlug}/arcs-questionnaires/${questionnaireId}/questions/${questionId}/`,
        questionData
      );

      await fetchQuestions(questionnaireId); // Refresh questions
      message.success("Pertanyaan berhasil diperbarui");
      return response.data;
    } catch (error) {
      console.error("Error updating question:", error);
      const errorMessage =
        error.response?.data?.error || "Gagal memperbarui pertanyaan";
      message.error(errorMessage);
      throw error;
    }
  };

  // Delete question
  const deleteQuestion = async (questionnaireId, questionId) => {
    if (!materialSlug || !questionnaireId || !questionId || !token) return;

    try {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      await api.delete(
        `teacher/sessions/${materialSlug}/arcs-questionnaires/${questionnaireId}/questions/${questionId}/`
      );

      await fetchQuestions(questionnaireId); // Refresh questions
      await fetchQuestionnaires(); // Refresh questionnaires list to update counts

      message.success("Pertanyaan berhasil dihapus");
    } catch (error) {
      console.error("Error deleting question:", error);
      const errorMessage =
        error.response?.data?.error || "Gagal menghapus pertanyaan";
      message.error(errorMessage);
      throw error;
    }
  };

  // Load initial data
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
    updateQuestion,
    deleteQuestion,
    fetchResponses,
    fetchAnalytics,
  };
};

export default useSessionARCSManagement;
