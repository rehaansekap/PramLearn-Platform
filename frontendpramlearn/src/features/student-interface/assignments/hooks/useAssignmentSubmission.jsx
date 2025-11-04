import { useState, useEffect, useContext } from "react";
import { message } from "antd";
import { AuthContext } from "../../../../context/AuthContext";
import api from "../../../../api";
import dayjs from "dayjs";

const useAssignmentSubmission = (
  assignment,
  questions,
  initialAnswers,
  initialFiles
) => {
  const { user, token } = useContext(AuthContext);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState(initialAnswers || {});
  const [uploadedFiles, setUploadedFiles] = useState(initialFiles || []);
  const [flaggedQuestions, setFlaggedQuestions] = useState(new Set());
  const [autoSaving, setAutoSaving] = useState(false);
  const [currentTime, setCurrentTime] = useState(dayjs());

  // Real-time timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(dayjs());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto-save answers
  useEffect(() => {
    if (!assignment?.id || !user?.id || Object.keys(answers).length === 0)
      return;

    const autoSaveTimer = setTimeout(() => {
      autoSaveAnswer();
    }, 2000);

    return () => clearTimeout(autoSaveTimer);
  }, [answers, assignment?.id, user?.id]);

  const autoSaveAnswer = async () => {
    if (!assignment?.id || !answers || Object.keys(answers).length === 0)
      return;

    setAutoSaving(true);
    try {
      await api.put(
        `/student/assignment/${assignment.id}/draft/`,
        {
          draft_answers: answers,
          uploaded_files: uploadedFiles,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    } catch (error) {
      console.error("❌ Error auto-saving:", error);
    } finally {
      setAutoSaving(false);
    }
  };

  const loadExistingAnswers = async () => {
    if (!assignment?.id || !user?.id) return;

    try {
      const response = await api.get(
        `/student/assignment/${assignment.id}/answers/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data && Array.isArray(response.data)) {
        const existingAnswers = {};
        response.data.forEach((answer) => {
          if (answer.question) {
            existingAnswers[answer.question] = {
              selected_choice: answer.selected_choice,
              essay_answer: answer.answer_text || answer.essay_answer,
            };
          }
        });
        setAnswers(existingAnswers);
      }
    } catch (error) {
      console.error("❌ Error loading existing answers:", error);
    }
  };

  const updateAnswer = async (questionId, value) => {
    const answerData =
      typeof value === "string" ? { selected_choice: value } : value;

    setAnswers((prev) => ({
      ...prev,
      [questionId]: answerData,
    }));

    // Immediate save to database
    try {
      await api.post(
        "/assignment-answers/",
        {
          assignment: assignment.id,
          question: questionId,
          selected_choice: answerData.selected_choice,
          essay_answer: answerData.essay_answer,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    } catch (error) {
      console.error("❌ Error saving answer:", error);
    }
  };

  const toggleQuestionFlag = (questionId) => {
    setFlaggedQuestions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const addUploadedFile = (file) => {
    setUploadedFiles((prev) => [...prev, file]);
  };

  const removeUploadedFile = (fileUid) => {
    setUploadedFiles((prev) => prev.filter((file) => file.uid !== fileUid));
  };

  // Load existing answers on mount
  useEffect(() => {
    if (assignment?.id && user?.id) {
      loadExistingAnswers();
    }
  }, [assignment?.id, user?.id]);

  return {
    currentQuestionIndex,
    setCurrentQuestionIndex,
    answers,
    uploadedFiles,
    flaggedQuestions,
    autoSaving,
    currentTime,
    updateAnswer,
    toggleQuestionFlag,
    addUploadedFile,
    removeUploadedFile,
  };
};

export default useAssignmentSubmission;
