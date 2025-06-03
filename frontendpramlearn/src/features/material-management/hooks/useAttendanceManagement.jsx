import { useState, useEffect, useContext } from "react";
import api from "../../../api";
import { AuthContext } from "../../../context/AuthContext";

const useAttendanceManagement = (materialId) => {
  const { token } = useContext(AuthContext);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch attendance records
  const fetchAttendance = async () => {
    if (!materialId || !token) return;

    setLoading(true);
    try {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      const response = await api.get(`materials/${materialId}/attendance/`);
      setAttendanceRecords(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching attendance:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  // Update attendance status
  const updateAttendanceStatus = async (studentId, status) => {
    try {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      const response = await api.post(
        `materials/${materialId}/attendance/${studentId}/`,
        {
          status,
        }
      );

      // Update local state
      setAttendanceRecords((prev) => {
        const existing = prev.find((record) => record.student === studentId);
        if (existing) {
          return prev.map((record) =>
            record.student === studentId ? response.data : record
          );
        } else {
          return [...prev, response.data];
        }
      });

      return response.data;
    } catch (err) {
      console.error("Error updating attendance:", err);
      throw err;
    }
  };

  // Bulk create attendance records
  const bulkCreateAttendance = async () => {
    try {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      const response = await api.post(
        `materials/${materialId}/attendance/bulk-create/`
      );
      await fetchAttendance(); // Refresh data
      return response.data;
    } catch (err) {
      console.error("Error bulk creating attendance:", err);
      throw err;
    }
  };

  // Get attendance status for specific student
  const getStudentAttendanceStatus = (studentId) => {
    const record = attendanceRecords.find(
      (record) => record.student === studentId
    );
    return record ? record.status : "absent";
  };

  useEffect(() => {
    fetchAttendance();
  }, [materialId, token]);

  return {
    attendanceRecords,
    loading,
    error,
    updateAttendanceStatus,
    bulkCreateAttendance,
    getStudentAttendanceStatus,
    refetchAttendance: fetchAttendance,
  };
};

export default useAttendanceManagement;
