import { useState, useEffect, useContext } from "react";
import api from "../../../../api";
import { AuthContext } from "../../../../context/AuthContext";

const useTeacherClasses = () => {
  const { user, token } = useContext(AuthContext);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchClasses = async (searchQuery = "") => {
    if (!user || !token || (user.role !== 2 && user.role !== 1)) return;

    try {
      setLoading(true);
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      const params = new URLSearchParams();
      if (searchQuery) {
        params.append("search", searchQuery);
      }

      const response = await api.get(`teacher/classes/?${params.toString()}`);
      setClasses(response.data.classes || []);
      setError(null);
    } catch (err) {
      setError(err);
      console.error("Error fetching teacher classes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, [user, token]);

  return {
    classes,
    loading,
    error,
    refetch: fetchClasses,
  };
};

export default useTeacherClasses;
