import { useState, useEffect, useContext } from "react";
import api from "../../../../api";
import { AuthContext } from "../../../../context/AuthContext";

const useTeacherSessions = () => {
  const { user, token } = useContext(AuthContext);
  const [sessions, setSessions] = useState([]);
  const [availableClasses, setAvailableClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSessions = async (filters = {}) => {
    if (!user || !token || user.role !== 2) return;

    try {
      setLoading(true);
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      const params = new URLSearchParams();
      if (filters.search) params.append("search", filters.search);
      if (filters.class) params.append("class", filters.class);

      const response = await api.get(`teacher/sessions/?${params.toString()}`);
      // Map API response to match SessionCard props
      const mappedSessions = (response.data.subjects || []).map((item) => ({
        id: item.id,
        name: item.name,
        slug: item.slug,
        class_name: item.class_name,
        class_id: item.class_id,
        students_count: item.students_count,
        // Map to match SessionCard
        sessions: [], // You can fetch detail if needed, or leave as []
        total_assignments: item.total_assignments ?? 0,
        total_quizzes: item.total_quizzes ?? 0,
        overall_progress: item.average_progress ?? 0,
        overall_attendance: item.attendance_rate ?? 0,
        overall_completion: item.average_progress ?? 0, // fallback, or set to 0
        average_grade: item.average_grade ?? 0,
        last_activity: item.last_session_date,
        // Fallback for SessionCard
        total_sessions: item.total_sessions ?? 0,
        recent_activities: item.recent_activities ?? 0,
      }));
      setSessions(mappedSessions);
      setAvailableClasses(response.data.available_classes);
      setError(null);
    } catch (err) {
      setError(err);
      console.error("Error fetching sessions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [user, token]);

  return {
    sessions,
    availableClasses,
    loading,
    error,
    refetch: fetchSessions,
  };
};

export default useTeacherSessions;
