import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../../../context/AuthContext";
import api from "../../../../api";

const useStudentARCSSubmission = (materialSlug, arcsSlug) => {
  const { token } = useContext(AuthContext);
  const [questionnaire, setQuestionnaire] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Fetch questionnaire by slug
  const fetchQuestionnaire = async () => {
    if (!materialSlug || !arcsSlug || !token) return;

    try {
      setLoading(true);
      setError(null);

      console.log("🔍 Fetching ARCS by slug:", { materialSlug, arcsSlug });

      // ✅ GUNAKAN SLUG ENDPOINT
      const response = await api.get(
        `/student/materials/${materialSlug}/arcs/${arcsSlug}/`
      );

      console.log("📋 ARCS Response:", response.data);
      setQuestionnaire(response.data);
    } catch (error) {
      console.error("❌ Error fetching ARCS questionnaire:", error);
      const errorMessage =
        error.response?.data?.error || "Gagal memuat kuesioner ARCS";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Submit ARCS answers
  const submitARCS = async (answersArray) => {
    if (!materialSlug || !arcsSlug || !token || !answersArray) {
      return { success: false, error: "Data tidak lengkap" };
    }
    try {
      setSubmitting(true);
      setError(null);

      const response = await api.post(
        `/student/materials/${materialSlug}/arcs/${arcsSlug}/submit/`,
        { answers: answersArray }
      );

      console.log("ARCS submission response:", response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Error submitting ARCS:", error);
      const errorMessage =
        error.response?.data?.error || "Gagal mengirim kuesioner";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    fetchQuestionnaire();
  }, [materialSlug, arcsSlug, token]);

  return {
    questionnaire,
    loading,
    submitting,
    error,
    submitARCS,
    refetch: fetchQuestionnaire,
  };
};

export default useStudentARCSSubmission;
