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
        console.log("Fetching available quizzes..."); // Debug log
        const response = await api.get("student/quizzes/available/");
        console.log("Quizzes response:", response.data); // Debug log
        setAvailableQuizzes(response.data);
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
