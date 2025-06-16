import { useState, useEffect } from "react";
import api from "../../../../api";

const useStudentGroupQuizzes = () => {
  const [groupQuizzes, setGroupQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGroupQuizzes = async () => {
      setLoading(true);
      setError(null);

      try {
        console.log("🔍 Fetching group quizzes...");
        const response = await api.get("/student/group-quiz/");
        console.log("📊 Group quizzes response:", response.data);
        setGroupQuizzes(response.data);
      } catch (err) {
        console.error("❌ Error fetching group quizzes:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchGroupQuizzes();
  }, []);

  return {
    groupQuizzes,
    loading,
    error,
    refresh: () => window.location.reload(),
  };
};

export default useStudentGroupQuizzes;
