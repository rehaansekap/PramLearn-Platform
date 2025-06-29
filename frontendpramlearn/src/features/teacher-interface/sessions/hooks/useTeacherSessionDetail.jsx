import { useState, useEffect, useContext } from "react";
import api from "../../../../api";
import { AuthContext } from "../../../../context/AuthContext";

const useTeacherSessionDetail = (subjectSlug) => {
  const { user, token } = useContext(AuthContext);
  const [sessionDetail, setSessionDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSessionDetail = async () => {
    if (!user || !token || user.role !== 2 || !subjectSlug) return;

    try {
      setLoading(true);
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      const response = await api.get(`teacher/sessions/${subjectSlug}/`);
      const data = response.data;
      setSessionDetail({
        ...data,
        sessions_data: data.sessions || [],
        students: data.students_performance || [],
        statistics: {
          ...data.statistics,
          students_count:
            data.statistics?.total_students ||
            (data.students_performance ? data.students_performance.length : 0),
        },
      });
      setError(null);
    } catch (err) {
      setError(err);
      console.error("Error fetching session detail:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (subjectSlug) {
      fetchSessionDetail();
    }
  }, [user, token, subjectSlug]);

  return {
    sessionDetail,
    loading,
    error,
    refetch: fetchSessionDetail,
  };
};

export default useTeacherSessionDetail;
