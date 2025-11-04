import { useState, useEffect } from "react";
import api from "../../../../api";

const useStudentQuizzes = () => {
  const [availableQuizzes, setAvailableQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAvailableQuizzes = async () => {
      setLoading(true);
      setError(null);

      try {
        // Gunakan endpoint quizzes yang sudah ada
        const response = await api.get("/quizzes/");
        // Filter quiz yang available untuk student jika diperlukan
        const availableQuizzes = response.data.filter((quiz) => {
          // Tambahkan logika filter sesuai kebutuhan
          return quiz.is_published && new Date(quiz.start_date) <= new Date();
        });
        setAvailableQuizzes(availableQuizzes);
      } catch (err) {
        console.error("Error fetching available quizzes:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAvailableQuizzes();
  }, []);

  return {
    availableQuizzes,
    loading,
    error,
    refresh: () => window.location.reload(),
  };
};

export default useStudentQuizzes;
