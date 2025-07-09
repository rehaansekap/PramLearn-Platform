import { useState, useEffect, useContext, useCallback } from "react";
import api from "../../../../api";
import { AuthContext } from "../../../../context/AuthContext";
import { message } from "antd";

const useSessionAssignmentManagement = (materialSlug) => {
  const { token } = useContext(AuthContext);
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [assignmentDetail, setAssignmentDetail] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [students, setStudents] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [gradingLoading, setGradingLoading] = useState({});

  // Fetch assignments for material
  const fetchAssignments = useCallback(async () => {
    if (!materialSlug || !token) return;

    try {
      setLoading(true);
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      const response = await api.get(
        `teacher/sessions/material/${materialSlug}/assignments/`
      );

      setAssignments(response.data.assignments || []);
      setStudents(response.data.students || []);
      setStatistics(response.data.statistics || {});
    } catch (error) {
      console.error("Error fetching session assignments:", error);
      message.error("Gagal memuat data assignment");
      setAssignments([]);
      setStudents([]);
      setStatistics({});
    } finally {
      setLoading(false);
    }
  }, [materialSlug, token]);

  // Fetch assignment detail with submissions
  const fetchAssignmentDetail = useCallback(
    async (assignmentId) => {
      if (!materialSlug || !assignmentId || !token) return;

      try {
        setDetailLoading(true);
        setSubmissionsLoading(true);

        const response = await api.get(
          `teacher/sessions/material/${materialSlug}/assignments/${assignmentId}/`
        );

        setAssignmentDetail(response.data.assignment);
        setSubmissions(response.data.submissions || []);
        setQuestions(response.data.assignment?.questions || []);
      } catch (error) {
        console.error("Error fetching assignment detail:", error);
        message.error("Gagal memuat detail assignment");
        setAssignmentDetail(null);
        setSubmissions([]);
        setQuestions([]);
      } finally {
        setDetailLoading(false);
        setSubmissionsLoading(false);
      }
    },
    [materialSlug, token]
  );

  const fetchAssignmentForEdit = useCallback(
    async (assignmentId) => {
      if (!materialSlug || !assignmentId || !token) return null;

      try {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        const response = await api.get(
          `teacher/sessions/material/${materialSlug}/assignments/${assignmentId}/`
        );

        return response.data.assignment;
      } catch (error) {
        console.error("Error fetching assignment for edit:", error);
        message.error("Gagal memuat data assignment untuk edit");
        return null;
      }
    },
    [materialSlug, token]
  );

  // Create new assignment
  const createAssignment = useCallback(
    async (assignmentData) => {
      if (!materialSlug || !token) return false;

      try {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        const response = await api.post(
          `teacher/sessions/material/${materialSlug}/assignments/`,
          assignmentData
        );

        message.success("Assignment berhasil dibuat");
        await fetchAssignments(); // Refresh list
        return response.data.assignment;
      } catch (error) {
        console.error("Error creating assignment:", error);
        const errorMessage =
          error.response?.data?.error || "Gagal membuat assignment";
        message.error(errorMessage);
        return false;
      }
    },
    [materialSlug, token, fetchAssignments]
  );

  // Update assignment
  const updateAssignment = useCallback(
    async (assignmentId, assignmentData) => {
      if (!materialSlug || !assignmentId || !token) return false;

      try {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        const response = await api.put(
          `teacher/sessions/material/${materialSlug}/assignments/${assignmentId}/`,
          assignmentData
        );

        message.success("Assignment berhasil diperbarui");
        await fetchAssignments(); // Refresh list
        return response.data.assignment;
      } catch (error) {
        console.error("Error updating assignment:", error);
        const errorMessage =
          error.response?.data?.error || "Gagal memperbarui assignment";
        message.error(errorMessage);
        return false;
      }
    },
    [materialSlug, token, fetchAssignments]
  );

  // Delete assignment
  const deleteAssignment = useCallback(
    async (assignmentId) => {
      if (!materialSlug || !assignmentId || !token) return false;

      try {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        await api.delete(
          `teacher/sessions/material/${materialSlug}/assignments/${assignmentId}/`
        );

        message.success("Assignment berhasil dihapus");
        await fetchAssignments(); // Refresh list
        return true;
      } catch (error) {
        console.error("Error deleting assignment:", error);
        const errorMessage =
          error.response?.data?.error || "Gagal menghapus assignment";
        message.error(errorMessage);
        return false;
      }
    },
    [materialSlug, token, fetchAssignments]
  );

  // Grade assignment submission
  const gradeSubmission = useCallback(
    async (assignmentId, submissionId, grade, feedback = "") => {
      if (!materialSlug || !assignmentId || !submissionId || !token)
        return false;

      const gradingKey = `${assignmentId}_${submissionId}`;
      setGradingLoading((prev) => ({ ...prev, [gradingKey]: true }));

      try {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        const response = await api.post(
          `teacher/sessions/material/${materialSlug}/assignments/${assignmentId}/submissions/${submissionId}/grade/`,
          { grade, feedback }
        );

        message.success("Submission berhasil dinilai");

        // Update submissions in state
        setSubmissions((prev) =>
          prev.map((sub) =>
            sub.id === submissionId
              ? {
                  ...sub,
                  grade,
                  teacher_feedback: feedback,
                  graded_at: new Date().toISOString(),
                }
              : sub
          )
        );

        // Refresh assignments to update statistics
        await fetchAssignments();

        return response.data.submission;
      } catch (error) {
        console.error("Error grading submission:", error);
        const errorMessage =
          error.response?.data?.error || "Gagal menilai submission";
        message.error(errorMessage);
        return false;
      } finally {
        setGradingLoading((prev) => ({ ...prev, [gradingKey]: false }));
      }
    },
    [materialSlug, token, fetchAssignments]
  );

  // Initial fetch
  useEffect(() => {
    if (materialSlug) {
      fetchAssignments();
    }
  }, [fetchAssignments, materialSlug]);

  return {
    assignments,
    selectedAssignment,
    setSelectedAssignment,
    assignmentDetail,
    submissions,
    questions,
    students,
    statistics,
    loading,
    detailLoading,
    submissionsLoading,
    gradingLoading,
    fetchAssignments,
    fetchAssignmentDetail,
    fetchAssignmentForEdit,
    createAssignment,
    updateAssignment,
    deleteAssignment,
    gradeSubmission,
  };
};

export default useSessionAssignmentManagement;
