import { useState, useEffect, useContext, useCallback } from "react";
import { message } from "antd";
import api from "../../../../api";
import { AuthContext } from "../../../../context/AuthContext";
import dayjs from "dayjs";

const useStudentAssignmentSubmission = () => {
  const { user, token } = useContext(AuthContext);
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [assignmentQuestions, setAssignmentQuestions] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [currentSubmission, setCurrentSubmission] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [draftSaving, setDraftSaving] = useState(false);
  const [error, setError] = useState(null);

  // Draft state
  const [answers, setAnswers] = useState({});
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isDraftDirty, setIsDraftDirty] = useState(false);

  // Fetch available assignments
  const fetchAvailableAssignments = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    setError(null);
    try {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      const response = await api.get("student/assignments/available/");
      console.log("Assignments response:", response.data);
      setAssignments(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError(err);
      console.error("Error fetching assignments:", err);
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Fetch assignment questions
  const fetchAssignmentQuestions = useCallback(
    async (assignmentId) => {
      if (!assignmentId || !token) return;

      try {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        const response = await api.get(
          `student/assignment/${assignmentId}/questions/`
        );
        console.log("Questions response:", response.data);

        // Handle different response structures
        if (response.data && response.data.questions) {
          setAssignmentQuestions(
            Array.isArray(response.data.questions)
              ? response.data.questions
              : []
          );
        } else if (Array.isArray(response.data)) {
          setAssignmentQuestions(response.data);
        } else {
          setAssignmentQuestions([]);
        }
      } catch (err) {
        console.error("Error fetching assignment questions:", err);
        setAssignmentQuestions([]);
      }
    },
    [token]
  );

  // Fetch submission history
  const fetchSubmissionHistory = useCallback(
    async (assignmentId) => {
      if (!assignmentId || !token) return;

      try {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        const response = await api.get(
          `student/assignment/${assignmentId}/submissions/`
        );
        console.log("Submissions response:", response.data);
        setSubmissions(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        console.error("Error fetching submission history:", err);
        setSubmissions([]);
      }
    },
    [token]
  );

  // Load draft
  const loadDraft = useCallback(
    async (assignmentId) => {
      if (!assignmentId || !token) return;

      try {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        const response = await api.get(
          `student/assignment/${assignmentId}/draft/`
        );
        console.log("Draft response:", response.data);

        if (response.data) {
          setAnswers(response.data.draft_answers || {});
          setUploadedFiles(
            Array.isArray(response.data.uploaded_files)
              ? response.data.uploaded_files
              : []
          );
          setIsDraftDirty(false);
        }
      } catch (err) {
        console.log("No draft found or error loading draft:", err);
        setAnswers({});
        setUploadedFiles([]);
      }
    },
    [token]
  );

  // Save draft
  const saveDraft = useCallback(
    async (assignmentId, draftData) => {
      if (!assignmentId || !token || draftSaving) return;

      setDraftSaving(true);
      try {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        await api.put(`student/assignment/${assignmentId}/draft/`, {
          draft_answers: draftData.answers || answers,
          uploaded_files: draftData.files || uploadedFiles,
          last_saved: new Date().toISOString(),
        });
        setIsDraftDirty(false);
        message.success("Draft saved successfully", 2);
      } catch (err) {
        console.error("Error saving draft:", err);
        message.error("Failed to save draft");
      } finally {
        setDraftSaving(false);
      }
    },
    [token, answers, uploadedFiles, draftSaving]
  );

  // Auto-save draft every 30 seconds
  useEffect(() => {
    if (!selectedAssignment || !isDraftDirty) return;

    const autoSaveInterval = setInterval(() => {
      saveDraft(selectedAssignment.id);
    }, 30000); // 30 seconds

    return () => clearInterval(autoSaveInterval);
  }, [selectedAssignment, isDraftDirty, saveDraft]);

  // Submit assignment
  const submitAssignment = useCallback(
    async (assignmentId, submissionData) => {
      if (!assignmentId || !token || submitting) return false;

      setSubmitting(true);
      try {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        const formData = new FormData();
        formData.append("assignment", assignmentId);

        // Add answers
        const answersToSubmit = submissionData.answers || answers;
        Object.keys(answersToSubmit).forEach((questionId) => {
          formData.append(
            `answers[${questionId}]`,
            answersToSubmit[questionId]
          );
        });

        // Add files
        const filesToSubmit = submissionData.files || uploadedFiles;
        if (Array.isArray(filesToSubmit)) {
          filesToSubmit.forEach((file, index) => {
            if (file.originFileObj) {
              formData.append(`files`, file.originFileObj);
            }
          });
        }

        const response = await api.post(
          `student/assignment/${assignmentId}/submit/`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        // Clear draft after successful submission
        setAnswers({});
        setUploadedFiles([]);
        setIsDraftDirty(false);

        // Refresh submission history
        await fetchSubmissionHistory(assignmentId);

        message.success("Assignment submitted successfully!");
        return response.data;
      } catch (err) {
        console.error("Error submitting assignment:", err);
        message.error("Failed to submit assignment");
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [token, answers, uploadedFiles, submitting, fetchSubmissionHistory]
  );

  // Get assignment status
  const getAssignmentStatus = useCallback(
    (assignment) => {
      const now = dayjs();
      const dueDate = dayjs(assignment.due_date);
      const hasSubmission =
        Array.isArray(submissions) &&
        submissions.some((s) => s.assignment === assignment.id);

      if (hasSubmission) {
        const submission = submissions.find(
          (s) => s.assignment === assignment.id
        );
        if (submission && submission.grade !== null) {
          return { status: "graded", color: "success", text: "Graded" };
        }
        return { status: "submitted", color: "processing", text: "Submitted" };
      }

      if (now.isAfter(dueDate)) {
        return { status: "overdue", color: "error", text: "Overdue" };
      }

      return { status: "available", color: "default", text: "Available" };
    },
    [submissions]
  );

  // Get time remaining
  const getTimeRemaining = useCallback((dueDate) => {
    const now = dayjs();
    const due = dayjs(dueDate);

    if (now.isAfter(due)) {
      return { expired: true, text: "Expired", color: "red" };
    }

    const diff = due.diff(now);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 7) {
      return { expired: false, text: `${days} days left`, color: "green" };
    } else if (days > 3) {
      return { expired: false, text: `${days} days left`, color: "orange" };
    } else if (days > 0) {
      return { expired: false, text: `${days}d ${hours}h left`, color: "red" };
    } else if (hours > 0) {
      return { expired: false, text: `${hours}h left`, color: "red" };
    } else {
      return { expired: false, text: "Due soon", color: "red" };
    }
  }, []);

  // Update answer
  const updateAnswer = useCallback((questionId, answer) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
    setIsDraftDirty(true);
  }, []);

  // Add uploaded file
  const addUploadedFile = useCallback((file) => {
    setUploadedFiles((prev) =>
      Array.isArray(prev) ? [...prev, file] : [file]
    );
    setIsDraftDirty(true);
  }, []);

  // Remove uploaded file
  const removeUploadedFile = useCallback((fileId) => {
    setUploadedFiles((prev) =>
      Array.isArray(prev) ? prev.filter((f) => f.uid !== fileId) : []
    );
    setIsDraftDirty(true);
  }, []);

  // Select assignment
  const selectAssignment = useCallback(
    async (assignment) => {
      console.log("Selecting assignment:", assignment);
      setSelectedAssignment(assignment);
      setCurrentSubmission(null);

      // Reset states
      setAssignmentQuestions([]);
      setSubmissions([]);
      setAnswers({});
      setUploadedFiles([]);

      if (assignment?.id) {
        await Promise.all([
          fetchAssignmentQuestions(assignment.id),
          fetchSubmissionHistory(assignment.id),
          loadDraft(assignment.id),
        ]);
      }
    },
    [fetchAssignmentQuestions, fetchSubmissionHistory, loadDraft]
  );

  // Initialize
  useEffect(() => {
    fetchAvailableAssignments();
  }, [fetchAvailableAssignments]);

  return {
    // Data
    assignments: Array.isArray(assignments) ? assignments : [],
    selectedAssignment,
    assignmentQuestions: Array.isArray(assignmentQuestions)
      ? assignmentQuestions
      : [],
    submissions: Array.isArray(submissions) ? submissions : [],
    currentSubmission,
    answers: answers || {},
    uploadedFiles: Array.isArray(uploadedFiles) ? uploadedFiles : [],

    // States
    loading,
    submitting,
    draftSaving,
    isDraftDirty,
    error,

    // Actions
    selectAssignment,
    updateAnswer,
    addUploadedFile,
    removeUploadedFile,
    saveDraft,
    submitAssignment,
    fetchAvailableAssignments,

    // Utilities
    getAssignmentStatus,
    getTimeRemaining,
  };
};

export default useStudentAssignmentSubmission;
