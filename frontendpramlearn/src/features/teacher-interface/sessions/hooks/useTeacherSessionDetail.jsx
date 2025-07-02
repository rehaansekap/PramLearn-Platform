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

      // Map students_performance to the expected format
      const mappedStudents = (data.students_performance || []).map(
        (student) => {
          // Split full_name into first_name and last_name
          const nameParts = (student.full_name || "").split(" ");
          const firstName = nameParts[0] || "";
          const lastName = nameParts.slice(1).join(" ") || "";

          // Determine attendance status based on attendance_rate
          let attendanceStatus = "unknown";
          if (student.attendance_rate >= 90) {
            attendanceStatus = "present";
          } else if (student.attendance_rate >= 70) {
            attendanceStatus = "late";
          } else if (student.attendance_rate > 0) {
            attendanceStatus = "excused";
          } else {
            attendanceStatus = "absent";
          }

          return {
            ...student,
            first_name: firstName,
            last_name: lastName,
            completion_percentage: student.average_progress || 0,
            attendance_status: attendanceStatus,
            is_online: false, // Default to false, you might want to add this to your API
          };
        }
      );

      setSessionDetail({
        ...data,
        sessions_data: data.sessions || [],
        students: mappedStudents,
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
