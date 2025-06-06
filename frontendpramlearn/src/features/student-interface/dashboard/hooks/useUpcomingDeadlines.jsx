import { useState, useEffect, useContext } from "react";
import api from "../../../../api";
import { AuthContext } from "../../../../context/AuthContext";

const useUpcomingDeadlines = () => {
  const { user, token } = useContext(AuthContext);
  const [deadlines, setDeadlines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total_count: 0,
    overdue_count: 0,
    high_priority_count: 0,
  });

  const fetchUpcomingDeadlines = async () => {
    if (!user || !token) return;

    setLoading(true);
    setError(null);

    try {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      const response = await api.get("/student/upcoming-deadlines/");

      setDeadlines(response.data.upcoming_deadlines || []);
      setStats({
        total_count: response.data.total_count || 0,
        overdue_count: response.data.overdue_count || 0,
        high_priority_count: response.data.high_priority_count || 0,
      });
    } catch (err) {
      console.error("Error fetching upcoming deadlines:", err);
      setError(err);

      // Fallback to mock data if API fails
      const mockDeadlines = [
        {
          id: 1,
          title: "Essay tentang Algoritma",
          type: "assignment",
          due_date: new Date(
            Date.now() + 2 * 24 * 60 * 60 * 1000
          ).toISOString(),
          days_left: 2,
          subject: "Matematika Diskrit",
          material: "Pengantar Algoritma",
          is_overdue: false,
          priority: "high",
        },
        {
          id: 2,
          title: "Quiz Logika Proposisi",
          type: "quiz",
          due_date: new Date(
            Date.now() + 5 * 24 * 60 * 60 * 1000
          ).toISOString(),
          days_left: 5,
          subject: "Matematika Diskrit",
          material: "Logika Proposisi",
          is_overdue: false,
          priority: "medium",
        },
      ];

      setDeadlines(mockDeadlines);
      setStats({
        total_count: mockDeadlines.length,
        overdue_count: 0,
        high_priority_count: 1,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUpcomingDeadlines();
  }, [user, token]);

  const refreshDeadlines = () => {
    fetchUpcomingDeadlines();
  };

  return {
    deadlines,
    stats,
    loading,
    error,
    refreshDeadlines,
  };
};

export default useUpcomingDeadlines;
