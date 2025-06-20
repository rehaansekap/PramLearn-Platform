import { useState, useEffect, useContext } from "react";
import api from "../../../../api";
import { AuthContext } from "../../../../context/AuthContext";

const useQuickActions = () => {
  const { user, token } = useContext(AuthContext);
  const [quickActions, setQuickActions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchQuickActions = async () => {
    if (!user || !token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      console.log("🔄 Fetching quick actions for user:", user.username);
      const response = await api.get("student/quick-actions/");

      console.log("✅ Quick actions response:", response.data);
      setQuickActions(response.data);
    } catch (err) {
      console.error("❌ Error fetching quick actions:", err);
      setError(err.message || "Gagal memuat aksi cepat");

      // Fallback data jika API gagal
      setQuickActions({
        submit_assignment: {
          count: 0,
          label: "Submit Tugas",
          description: "0 tertunda",
          icon: "download",
          color: "#ff4d4f",
          route: "/student/assignments",
          data: [],
        },
        browse_materials: {
          count: 0,
          label: "Jelajahi Materi",
          description: "0 tersedia",
          icon: "file-text",
          color: "#1890ff",
          route: "/student/subjects",
          data: [],
        },
        announcements: {
          count: 0,
          label: "Pengumuman",
          description: "0 baru",
          icon: "bell",
          color: "#faad14",
          route: "/student/announcements",
          data: [],
        },
        schedule: {
          count: 0,
          label: "Jadwal Saya",
          description: "0 akan datang",
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
