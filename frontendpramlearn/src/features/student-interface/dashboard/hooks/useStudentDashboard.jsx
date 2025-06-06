import { useState, useEffect, useContext } from "react";
import api from "../../../../api";
import { AuthContext } from "../../../../context/AuthContext";

const useStudentDashboard = () => {
  const { user, token } = useContext(AuthContext);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboard = async () => {
    if (!user || !token) return;

    try {
      setLoading(true);
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      const response = await api.get("student/dashboard/");
      setDashboard(response.data);
      setError(null);
    } catch (err) {
      setError(err);
      console.error("Error fetching student dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [user, token]);

  return {
    dashboard,
    loading,
    error,
    user,
    refetch: fetchDashboard,
  };
};

export default useStudentDashboard;
