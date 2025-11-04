import { useState, useEffect, useCallback } from "react";
import { message } from "antd";
import api from "../../../../api";

const useStudentQuizAttempt = (quizSlug) => {
  // Changed from quizId to quizSlug
  const [quiz, setQuiz] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [flaggedQuestions, setFlaggedQuestions] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(0);

  // Initialize quiz and attempt
  useEffect(() => {
    if (!quizSlug) return; // Changed from quizId to quizSlug

    const initializeQuiz = async () => {
      setLoading(true);
      setError(null);

      try {
        // Get quiz details by slug
        const quizResponse = await api.get(`student/quiz/${quizSlug}/`); // Changed from quizId to quizSlug
        setQuiz(quizResponse.data);

        // Get or create attempt using quiz slug
        const attemptResponse = await api.post(
          `student/quiz/${quizSlug}/attempt/`
        ); // Changed from quizId to quizSlug
        const attemptData = attemptResponse.data;
        setAttempt(attemptData);

        // Load existing answers if any
        if (attemptData.answers) {
          const existingAnswers = {};
          attemptData.answers.forEach((answer) => {
            existingAnswers[answer.question] = answer.selected_answer;
          });
          setAnswers(existingAnswers);
        }

        // Calculate time remaining
        if (attemptData.end_time) {
          const endTime = new Date(attemptData.end_time).getTime();
          const now = new Date().getTime();
          const remaining = Math.max(0, Math.floor((endTime - now) / 1000));
          setTimeRemaining(remaining);
        }
      } catch (err) {
        setError(err);
        console.error("Error initializing quiz:", err);
      } finally {
        setLoading(false);
      }
    };

    initializeQuiz();
  }, [quizSlug]); // Changed from quizId to quizSlug

  // Timer countdown
  useEffect(() => {
    if (timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        const newTime = prev - 1;
        return Math.max(0, newTime);
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

  // Set answer for a question
  const setAnswer = useCallback((questionId, selectedAnswer) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: selectedAnswer,
    }));
  }, []);

  // Toggle question flag
  const toggleQuestionFlag = useCallback((questionId) => {
    setFlaggedQuestions((prev) => {
      const newFlags = new Set(prev);
      if (newFlags.has(questionId)) {
        newFlags.delete(questionId);
      } else {
        newFlags.add(questionId);
      }
      return newFlags;
    });
  }, []);

  // Auto-save answers
  const autoSave = useCallback(async () => {
    if (!attempt?.id || Object.keys(answers).length === 0) return;

    try {
      await api.put(`student/quiz-attempt/${attempt.id}/answers/`, {
        answers: Object.entries(answers).map(
          ([questionId, selectedAnswer]) => ({
            question: parseInt(questionId),
            selected_answer: selectedAnswer,
          })
        ),
      });
    } catch (error) {
      console.error("Auto-save failed:", error);
    }
  }, [attempt?.id, answers]);

  // Submit quiz
  const submitQuiz = useCallback(async () => {
    if (!attempt?.id) {
      throw new Error("No active attempt found");
    }

    try {
      // Save final answers
      await autoSave();

      // Submit quiz
      const response = await api.post(
        `student/quiz-attempt/${attempt.id}/submit/`
      );

      setAttempt((prev) => ({
        ...prev,
        submitted_at: new Date().toISOString(),
        score: response.data.score,
      }));

      return response.data;
    } catch (error) {
      console.error("Submit quiz failed:", error);
      throw error;
    }
  }, [attempt?.id, autoSave]);

  return {
    quiz,
    attempt,
    answers,
    currentQuestionIndex,
    flaggedQuestions,
    loading,
    error,
    timeRemaining,
    setCurrentQuestionIndex,
    setAnswer,
    toggleQuestionFlag,
    submitQuiz,
    autoSave,
  };
};

export default useStudentQuizAttempt;
