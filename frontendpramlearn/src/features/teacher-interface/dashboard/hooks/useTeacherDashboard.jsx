import { useState, useEffect, useContext, useCallback } from "react";
import api from "../../../../api";
import { AuthContext } from "../../../../context/AuthContext";

const useTeacherDashboard = () => {
  const { user, token } = useContext(AuthContext);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboard = useCallback(async () => {
    if (!user || !token || user.role !== 2) return;

    try {
      setLoading(true);
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      const response = await api.get("teacher/dashboard/");
      setDashboard(response.data);
      setError(null);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [user, token]);

  const refreshDashboard = useCallback(async () => {
    if (!user || !token || user.role !== 2) return;

    try {
      setRefreshing(true);
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      const response = await api.get("teacher/dashboard/");
      setDashboard(response.data);
      setError(null);
    } catch (err) {
      console.error("Dashboard refresh error:", err);
      setError(err);
    } finally {
      setRefreshing(false);
    }
  }, [user, token]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return {
    dashboard,
    loading,
    error,
    user,
    refreshing,
    refetch: fetchDashboard,
    refresh: refreshDashboard,
  };
};

export default useTeacherDashboard;
