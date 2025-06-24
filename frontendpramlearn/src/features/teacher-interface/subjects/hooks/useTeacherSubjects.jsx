import { useState, useEffect, useContext } from "react";
import api from "../../../../api";
import { AuthContext } from "../../../../context/AuthContext";

const useTeacherSubjects = () => {
  const { user, token } = useContext(AuthContext);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSubjects = async (searchQuery = "") => {
    if (!user || !token || (user.role !== 2 && user.role !== 1)) return;

    try {
      setLoading(true);
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      const params = new URLSearchParams();
      if (searchQuery) {
        params.append("search", searchQuery);
      }

      const response = await api.get(`teacher/subjects/?${params.toString()}`);
      setSubjects(response.data.subjects || []);
      setError(null);
    } catch (err) {
      setError(err);
      console.error("Error fetching teacher subjects:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, [user, token]);

  return {
    subjects,
    loading,
    error,
    refetch: fetchSubjects,
  };
};

export default useTeacherSubjects;
