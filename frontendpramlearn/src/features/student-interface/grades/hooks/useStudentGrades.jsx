import { useState, useEffect, useContext, useCallback } from "react";
import { message } from "antd";
import api from "../../../../api";
import { AuthContext } from "../../../../context/AuthContext";

const useStudentGrades = () => {
  const { user, token } = useContext(AuthContext);
  const [grades, setGrades] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch grades
  const fetchGrades = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      // Mock data for now - replace with actual API call
      const mockGrades = [
        {
          id: 1,
          type: "quiz",
          title: "Mathematics Quiz 1",
          subject_name: "Mathematics",
          grade: 85,
          date: "2024-01-15T10:00:00Z",
          teacher_feedback: "Good work on algebraic equations!",
        },
        {
          id: 2,
          type: "assignment",
          title: "Physics Assignment 1",
          subject_name: "Physics",
          grade: 92,
          date: "2024-01-20T14:30:00Z",
          teacher_feedback: "Excellent understanding of Newton's laws",
        },
        {
          id: 3,
          type: "quiz",
          title: "Chemistry Quiz 1",
          subject_name: "Chemistry",
          grade: 78,
          date: "2024-01-22T09:15:00Z",
          teacher_feedback: "Need improvement in balancing chemical equations",
        },
        {
          id: 4,
          type: "assignment",
          title: "Biology Essay",
          subject_name: "Biology",
          grade: 88,
          date: "2024-01-25T16:00:00Z",
          teacher_feedback: "Well-structured essay on cell division",
        },
        {
          id: 5,
          type: "quiz",
          title: "Mathematics Quiz 2",
          subject_name: "Mathematics",
          grade: 95,
          date: "2024-01-28T11:00:00Z",
          teacher_feedback: "Outstanding performance in trigonometry!",
        },
      ];

      const mockSubjects = [
        { id: 1, name: "Mathematics", teacher_name: "Mr. Smith" },
        { id: 2, name: "Physics", teacher_name: "Ms. Johnson" },
        { id: 3, name: "Chemistry", teacher_name: "Dr. Brown" },
        { id: 4, name: "Biology", teacher_name: "Mrs. Davis" },
      ];

      // Sort grades by date (newest first)
      const sortedGrades = mockGrades.sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );

      setGrades(sortedGrades);
      setSubjects(mockSubjects);

      // Calculate statistics
      const validGrades = sortedGrades.filter((g) => g.grade !== null);
      const quizGrades = validGrades.filter((g) => g.type === "quiz");
      const assignmentGrades = validGrades.filter(
        (g) => g.type === "assignment"
      );

      const avgGrade =
        validGrades.length > 0
          ? validGrades.reduce((sum, g) => sum + g.grade, 0) /
            validGrades.length
          : 0;

      const quizAvg =
        quizGrades.length > 0
          ? quizGrades.reduce((sum, g) => sum + g.grade, 0) / quizGrades.length
          : 0;

      const assignmentAvg =
        assignmentGrades.length > 0
          ? assignmentGrades.reduce((sum, g) => sum + g.grade, 0) /
            assignmentGrades.length
          : 0;

      setStatistics({
        total_assessments: validGrades.length,
        average_grade: avgGrade,
        quiz_average: quizAvg,
        assignment_average: assignmentAvg,
        completed_assessments: validGrades.length,
        grade_distribution: {
          A: validGrades.filter((g) => g.grade >= 90).length,
          B: validGrades.filter((g) => g.grade >= 80 && g.grade < 90).length,
          C: validGrades.filter((g) => g.grade >= 70 && g.grade < 80).length,
          D: validGrades.filter((g) => g.grade >= 60 && g.grade < 70).length,
          E: validGrades.filter((g) => g.grade < 60).length,
        },
      });
    } catch (err) {
      console.error("Error fetching grades:", err);
      setError(err);
      message.error("Failed to load grades");
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Get grade color based on score
  const getGradeColor = useCallback((grade) => {
    if (grade >= 80) return "success";
    if (grade >= 60) return "warning";
    return "error";
  }, []);

  // Get grade letter
  const getGradeLetter = useCallback((grade) => {
    if (grade >= 90) return "A";
    if (grade >= 80) return "B";
    if (grade >= 70) return "C";
    if (grade >= 60) return "D";
    return "E";
  }, []);

  // Export grades (placeholder)
  const exportGrades = useCallback(async (format = "excel") => {
    try {
      message.success(`Export ${format.toUpperCase()} feature coming soon`);
    } catch (err) {
      message.error("Failed to export data");
    }
  }, []);

  // Initialize data
  useEffect(() => {
    fetchGrades();
  }, [fetchGrades]);

  return {
    // Data
    grades,
    statistics,
    subjects,

    // States
    loading,
    error,

    // Actions
    fetchGrades,
    exportGrades,

    // Utilities
    getGradeColor,
    getGradeLetter,
  };
};

export default useStudentGrades;
