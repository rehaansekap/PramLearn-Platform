import { useState, useCallback, useContext } from "react";
import { message } from "antd";
import { AuthContext } from "../../../../context/AuthContext";
import api from "../../../../api"; // Import api instance

const useQuizReview = () => {
  const { user, token } = useContext(AuthContext);
  const [quizReview, setQuizReview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        // PERBAIKAN: Gunakan endpoint yang sesuai
        const endpoint = isGroupQuiz
          ? `/student/group-quiz-review/${attemptId}/`
          : `/student/quiz-review/${attemptId}/`;

        const response = await api.get(endpoint);

        console.log("✅ Quiz review response:", response.data);

        if (response.data) {
          setQuizReview(response.data);
          return response.data;
        } else {
          throw new Error("Data review quiz tidak ditemukan");
        }
      } catch (err) {
        console.error("❌ Error fetching quiz review:", err);

        let errorMessage = "Terjadi kesalahan saat memuat review quiz";

        if (err.response) {
          const status = err.response.status;
          const responseData = err.response.data;

          if (status === 404) {
            errorMessage = "Review quiz tidak ditemukan";
          } else if (status === 403) {
            errorMessage =
              "Anda tidak memiliki akses untuk melihat review quiz ini";
          } else if (status === 401) {
            errorMessage = "Sesi Anda telah berakhir. Silakan login kembali";
          } else {
            errorMessage =
              responseData?.message ||
              responseData?.detail ||
              `Error ${status}`;
          }
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
          ? `/student/group-quiz-review/${attemptId}/download/`
          : `/student/quiz-review/${attemptId}/download/`;

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

  // Reset state
  const resetQuizReview = useCallback(() => {
    setQuizReview(null);
    setError(null);
  }, []);

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
