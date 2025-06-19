import { useState, useCallback } from "react";
import { message } from "antd";
import api from "../../../../api";

const useQuizReview = () => {
  const [quizReview, setQuizReview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");

  // Reset quiz review data
  const resetQuizReview = useCallback(() => {
    setQuizReview(null);
    setError(null);
  }, []);

  // Fetch quiz review details
  const fetchQuizReview = useCallback(
    async (attemptId, isGroupQuiz = false) => {
      if (!attemptId || !token) {
        setError("ID attempt atau token tidak valid");
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        const endpoint = isGroupQuiz
          ? `/student/group-quiz-review/${attemptId}/`
          : `/student/quiz-review/${attemptId}/`;

        const response = await api.get(endpoint, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setQuizReview(response.data);
        return response.data;
      } catch (err) {
        console.error("Error fetching quiz review:", err);

        let errorMessage = "Gagal memuat detail quiz";

        if (err.response?.status === 404) {
          errorMessage = "Data quiz tidak ditemukan";
        } else if (err.response?.status === 403) {
          errorMessage = "Anda tidak memiliki akses untuk melihat quiz ini";
        } else if (err.response?.status === 401) {
          errorMessage = "Sesi Anda telah berakhir. Silakan login kembali";
        } else if (err.request) {
          errorMessage = "Tidak dapat terhubung ke server";
        } else {
          errorMessage =
            err.message || "Terjadi kesalahan yang tidak diketahui";
        }

        setError(errorMessage);
        message.error(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  // Download quiz report
  const downloadQuizReport = useCallback(
    async (attemptId, format = "pdf", isGroupQuiz = false) => {
      if (!attemptId || !token) {
        message.error("ID attempt atau token tidak valid");
        return;
      }

      try {
        const endpoint = isGroupQuiz
          ? `/student/group-quiz-review/${attemptId}/`
          : `/student/quiz-review/${attemptId}/`;

        const response = await api.get(endpoint, {
          params: { format },
          responseType: "blob",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Create download link
        const blob = new Blob([response.data], {
          type:
            format === "pdf"
              ? "application/pdf"
              : "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = `quiz-report-${attemptId}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        message.success("Report berhasil didownload");
      } catch (err) {
        console.error("Error downloading quiz report:", err);

        let errorMessage = "Gagal mendownload report";

        if (err.response?.status === 404) {
          errorMessage = "File report tidak ditemukan";
        } else if (err.response?.status === 403) {
          errorMessage =
            "Anda tidak memiliki akses untuk mendownload report ini";
        }

        message.error(errorMessage);
      }
    },
    [token]
  );

  return {
    quizReview,
    loading,
    error,
    fetchQuizReview,
    downloadQuizReport,
    resetQuizReview,
  };
};

export default useQuizReview;
