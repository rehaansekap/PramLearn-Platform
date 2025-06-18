import { useState, useEffect, useCallback, useContext } from "react";
import { message } from "antd";
import api from "../../../../api";
import { AuthContext } from "../../../../context/AuthContext"; // ✅ PERBAIKI INI

const useStudentGrades = () => {
  const { user, token } = useContext(AuthContext);

  const [grades, setGrades] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSubjects = useCallback(async () => {
    if (!token || !user) return;

    try {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      const response = await api.get("/student/subjects/");

      if (response.data && response.data.subjects) {
        setSubjects(response.data.subjects);
      } else if (Array.isArray(response.data)) {
        setSubjects(response.data);
      }
    } catch (err) {
      console.error("❌ Error fetching subjects:", err);
    }
  }, [token, user]);

  // Fetch grades dengan filtering
  const fetchGrades = useCallback(
    async (filters = {}) => {
      if (!token || !user) {
        console.log("⚠️ No token or user, skipping fetchGrades");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Set authorization header
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        // Build query parameters
        const params = new URLSearchParams();
        if (filters.subject_id) params.append("subject_id", filters.subject_id);
        if (filters.type) params.append("type", filters.type);
        if (filters.date_from) params.append("date_from", filters.date_from);
        if (filters.date_to) params.append("date_to", filters.date_to);

        const queryString = params.toString();
        const url = queryString
          ? `/student/grades/?${queryString}`
          : "/student/grades/";

        const response = await api.get(url);

        if (response.data) {
          // ✅ PASTIKAN GRADES ADALAH ARRAY
          const gradesData = response.data.grades || [];
          setGrades(gradesData);
          setStatistics(response.data.statistics || {});
        }
      } catch (err) {
        console.error("❌ Error fetching grades:", err);
        setError(err.response?.data?.message || "Gagal mengambil data nilai");
        message.error("Gagal mengambil data nilai");
      } finally {
        setLoading(false);
      }
    },
    [token, user]
  );

  // Fetch analytics data
  const fetchAnalytics = useCallback(async () => {
    if (!token || !user) return null;

    try {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      const response = await api.get("/student/analytics/grade-trends/");

      return response.data;
    } catch (err) {
      console.error("❌ Error fetching analytics:", err);
      message.error("Gagal mengambil data analytics");
      return null;
    }
  }, [token, user]);

  // Fetch achievements
  const fetchAchievements = useCallback(async () => {
    if (!token || !user) return;

    try {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      const response = await api.get("/student/achievements/");

      if (response.data) {
        setAchievements(response.data.achievements || []);

        // Show notification for new achievements
        if (
          response.data.new_achievements &&
          response.data.new_achievements.length > 0
        ) {
          response.data.new_achievements.forEach((achievement) => {
            message.success(`🎉 Achievement baru: ${achievement.title}!`);
          });
        }
      }
    } catch (err) {
      console.error("❌ Error fetching achievements:", err);
      message.error("Gagal mengambil data pencapaian");
    }
  }, [token, user]);

  // Export grades data
  const exportGrades = useCallback(
    async (format = "xlsx") => {
      if (!token || !user) return;

      try {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        const response = await api.get(
          `/student/grades/export/?format=${format}`,
          {
            responseType: "blob",
          }
        );

        // Create download link
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `grades.${format}`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);

        message.success(
          `Data nilai berhasil diexport dalam format ${format.toUpperCase()}`
        );
      } catch (err) {
        console.error("❌ Error exporting grades:", err);
        message.error("Gagal mengexport data nilai");
      }
    },
    [token, user]
  );

  // Initial fetch
  useEffect(() => {
    if (user && token) {
      fetchGrades();
      fetchAchievements();
    } else {
      console.log("⚠️ Skipping fetch - no user or token");
    }
  }, [user, token, fetchGrades, fetchAchievements]);

  // Utility functions
  const getGradeColor = useCallback((score) => {
    if (score >= 90) return "#52c41a";
    if (score >= 80) return "#1890ff";
    if (score >= 70) return "#faad14";
    if (score >= 60) return "#fa8c16";
    return "#ff4d4f";
  }, []);

  const getGradeLetter = useCallback((score) => {
    if (score >= 90) return "A";
    if (score >= 80) return "B";
    if (score >= 70) return "C";
    if (score >= 60) return "D";
    return "E";
  }, []);

  const calculateTrendPercentage = useCallback((grades) => {
    if (grades.length < 10)
      return { trend: "insufficient_data", percentage: 0 };

    const recentGrades = grades.slice(0, 5);
    const olderGrades = grades.slice(5, 10);

    const recentAvg =
      recentGrades.reduce((sum, g) => sum + g.grade, 0) / recentGrades.length;
    const olderAvg =
      olderGrades.reduce((sum, g) => sum + g.grade, 0) / olderGrades.length;

    const difference = recentAvg - olderAvg;
    const percentage = Math.abs((difference / olderAvg) * 100);

    let trend = "stable";
    if (difference > 2) trend = "up";
    else if (difference < -2) trend = "down";

    return { trend, percentage: Math.round(percentage * 10) / 10 };
  }, []);

  useEffect(() => {
    if (user && token) {
      fetchGrades();
      fetchSubjects();
      fetchAchievements();
    }
  }, [user, token, fetchGrades, fetchSubjects, fetchAchievements]);

  return {
    grades,
    subjects,
    statistics,
    achievements,
    loading,
    error,
    fetchGrades,
    fetchAnalytics,
    fetchAchievements,
    exportGrades,
    getGradeColor,
    getGradeLetter,
    calculateTrendPercentage,
    hasGrades: grades.length > 0,
    totalGrades: grades.length,
  };
};

export default useStudentGrades;
