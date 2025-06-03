import { useState, useEffect, useContext } from "react";
import api from "../../../api";
import { AuthContext } from "../../../context/AuthContext";

const useAssignmentManagement = (materialId) => {
  const { token } = useContext(AuthContext);
  const [assignments, setAssignments] = useState([]);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [assignmentSubmissions, setAssignmentSubmissions] = useState([]);
  const [assignmentQuestions, setAssignmentQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submissionsLoading, setSubmissionsLoading] = useState(false); // Tambahkan loading untuk submissions
  const [questionsLoading, setQuestionsLoading] = useState(false); // Tambahkan loading untuk questions

  // Fetch assignments with questions
  const fetchAssignments = async () => {
    if (!materialId || !token) return;

    try {
      setLoading(true);
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      const response = await api.get(`assignments/?material=${materialId}`);

      // Fetch questions for each assignment
      const assignmentsWithQuestions = await Promise.all(
        response.data.map(async (assignment) => {
          try {
            const questionsResponse = await api.get(
              `assignment-questions/?assignment=${assignment.id}`
            );
            return {
              ...assignment,
              questions: questionsResponse.data,
            };
          } catch (error) {
            console.error(
              `Error fetching questions for assignment ${assignment.id}:`,
              error
            );
            return {
              ...assignment,
              questions: [],
            };
          }
        })
      );

      setAssignments(assignmentsWithQuestions);
    } catch (error) {
      console.error("Error fetching assignments:", error);
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch assignment submissions
  const fetchAssignmentSubmissions = async (assignmentId) => {
    if (!assignmentId || !token) return;

    try {
      setSubmissionsLoading(true); // Set loading untuk submissions
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      const response = await api.get(
        `assignment-submissions/?assignment=${assignmentId}`
      );

      // Fetch answers for each submission
      const submissionsWithAnswers = await Promise.all(
        response.data.map(async (submission) => {
          try {
            const answersResponse = await api.get(
              `assignment-answers/?submission=${submission.id}`
            );
            return {
              ...submission,
              answers: answersResponse.data,
            };
          } catch (error) {
            console.error(
              `Error fetching answers for submission ${submission.id}:`,
              error
            );
            return {
              ...submission,
              answers: [],
            };
          }
        })
      );

      setAssignmentSubmissions(submissionsWithAnswers);
    } catch (error) {
      console.error("Error fetching assignment submissions:", error);
      setAssignmentSubmissions([]);
    } finally {
      setSubmissionsLoading(false); // Reset loading
    }
  };

  // Fetch assignment questions
  const fetchAssignmentQuestions = async (assignmentId) => {
    if (!assignmentId || !token) return;

    try {
      setQuestionsLoading(true); // Set loading untuk questions
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      const response = await api.get(
        `assignment-questions/?assignment=${assignmentId}`
      );
      setAssignmentQuestions(response.data);
    } catch (error) {
      console.error("Error fetching assignment questions:", error);
      setAssignmentQuestions([]);
    } finally {
      setQuestionsLoading(false); // Reset loading
    }
  };

  // Handle delete assignment
  const handleDeleteAssignment = async (assignmentId) => {
    try {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      await api.delete(`assignments/${assignmentId}/`);

      // Remove from state
      setAssignments((prev) =>
        prev.filter((assignment) => assignment.id !== assignmentId)
      );

      // Clear selected assignment if it was deleted
      if (selectedAssignment?.id === assignmentId) {
        setSelectedAssignment(null);
        setAssignmentSubmissions([]);
        setAssignmentQuestions([]);
      }

      return true;
    } catch (error) {
      console.error("Error deleting assignment:", error);
      return false;
    }
  };

  // Handle edit assignment
  const handleEditAssignment = (assignment) => {
    setEditingAssignment(assignment);
  };

  // Handle assignment selection
  const handleSelectAssignment = (assignment) => {
    setSelectedAssignment(assignment);
  };

  // Handle assignment success (after create/update)
  const handleSuccessAssignment = () => {
    setEditingAssignment(null);
    fetchAssignments(); // Refresh assignments list
  };

  // Effect to fetch assignments when materialId changes
  useEffect(() => {
    if (materialId) {
      fetchAssignments();
    }
  }, [materialId, token]);

  // Effect to fetch submissions and questions when assignment is selected
  useEffect(() => {
    if (selectedAssignment) {
      fetchAssignmentSubmissions(selectedAssignment.id);
      fetchAssignmentQuestions(selectedAssignment.id);
    }
  }, [selectedAssignment, token]);

  return {
    assignments,
    editingAssignment,
    setEditingAssignment,
    selectedAssignment,
    setSelectedAssignment,
    assignmentSubmissions,
    assignmentQuestions,
    loading,
    submissionsLoading, // Export submissions loading
    questionsLoading, // Export questions loading
    handleDeleteAssignment,
    handleEditAssignment,
    handleSelectAssignment,
    handleSuccessAssignment,
    fetchAssignments,
  };
};

export default useAssignmentManagement;
