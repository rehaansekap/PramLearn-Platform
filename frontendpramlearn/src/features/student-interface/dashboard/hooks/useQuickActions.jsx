import { useState, useEffect, useContext } from "react";
import api from "../../../../api";
import { AuthContext } from "../../../../context/AuthContext";

const useQuickActions = () => {
  const { user, token } = useContext(AuthContext);
  const [quickActions, setQuickActions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchQuickActions = async () => {
    if (!user || !token) return;

    try {
      setLoading(true);
      setError(null);

      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      const response = await api.get("student/quick-actions/");

      setQuickActions(response.data);
    } catch (err) {
      console.error("Error fetching quick actions:", err);
      setError(err.message || "Failed to fetch quick actions");

      // Set default fallback data
      setQuickActions({
        submit_assignment: {
          count: 0,
          label: "Submit Assignment",
          description: "0 pending",
          icon: "download",
          color: "#ff4d4f",
          route: "/student/assignments",
          data: [],
        },
        browse_materials: {
          count: 0,
          label: "Browse Materials",
          description: "0 available",
          icon: "file-text",
          color: "#1890ff",
          route: "/student/subjects",
          data: [],
        },
        announcements: {
          count: 0,
          label: "Announcements",
          description: "0 new",
          icon: "bell",
          color: "#faad14",
          route: "/student/announcements",
          data: [],
        },
        schedule: {
          count: 0,
          label: "My Schedule",
          description: "0 upcoming",
          icon: "calendar",
          color: "#52c41a",
          route: "/student/schedule",
          data: [],
        },
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuickActions();
  }, [user, token]);

  const refreshQuickActions = () => {
    fetchQuickActions();
  };

  return {
    quickActions,
    loading,
    error,
    refreshQuickActions,
  };
};

export default useQuickActions;
