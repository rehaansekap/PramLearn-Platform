import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../../../context/AuthContext";
import api from "../../../../api";

const useStudentARCS = (materialSlug) => {
  const { token } = useContext(AuthContext);
  const [questionnaires, setQuestionnaires] = useState([]);
  const [selectedQuestionnaire, setSelectedQuestionnaire] = useState(null);
  const [questionnaireDetail, setQuestionnaireDetail] = useState(null); 
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false); 
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [isInQuestionnaireMode, setIsInQuestionnaireMode] = useState(false); 

  // Reset state saat questionnaire berubah
  const resetQuestionnaireState = () => {
    setAnswers({});
    setCurrentQuestionIndex(0);
    setError(null);
    setQuestionnaireDetail(null);
    setIsInQuestionnaireMode(false);
  };

  // Fetch available questionnaires
  const fetchQuestionnaires = async () => {
    if (!materialSlug || !token) return;

    try {
      setLoading(true);
      setError(null);

      // console.log(`Fetching ARCS questionnaires for material: ${materialSlug}`);

      const response = await api.get(
        `/student/materials/${materialSlug}/arcs-questionnaires/`
      );

      // console.log("Questionnaires response:", response.data);
      setQuestionnaires(response.data.questionnaires || []);
    } catch (error) {
      console.error("Error fetching ARCS questionnaires:", error);
      setError("Failed to load questionnaires");
    } finally {
      setLoading(false);
    }
  };

  // Fetch questionnaire details
  const fetchQuestionnaireDetail = async (questionnaireId) => {
    if (!materialSlug || !questionnaireId || !token) return;

    try {
      setDetailLoading(true);
      setError(null);

      // console.log(
      //   `Fetching questionnaire detail: ${questionnaireId} for material: ${materialSlug}`
      // );

      const response = await api.get(
        `/student/materials/${materialSlug}/arcs-questionnaires/${questionnaireId}/`
      );

      // console.log("Questionnaire detail response:", response.data);

      setQuestionnaireDetail(response.data);
      setSelectedQuestionnaire(response.data);
      setIsInQuestionnaireMode(true); 
      resetQuestionnaireState(); // Reset state
    } catch (error) {
      console.error("Error fetching questionnaire detail:", error);
      console.error("Error response:", error.response?.data);
      setError(
        error.response?.data?.error || "Failed to load questionnaire details"
      );
    } finally {
      setDetailLoading(false);
    }
  };

  // Update answer for current question
  const updateAnswer = (questionId, answerValue, answerType = "likert_value") => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        question_id: questionId,
        [answerType]: answerValue,
      },
    }));
  };

  // Navigate to next question
  const nextQuestion = () => {
    if (
      questionnaireDetail &&
      currentQuestionIndex < questionnaireDetail.questions.length - 1
    ) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  // Navigate to previous question
  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  // Go to specific question
  const goToQuestion = (index) => {
    if (
      questionnaireDetail &&
      index >= 0 &&
      index < questionnaireDetail.questions.length
    ) {
      setCurrentQuestionIndex(index);
    }
  };

  // Submit questionnaire answers
  const submitQuestionnaire = async () => {
    if (!questionnaireDetail || !materialSlug || !token) return;

    try {
      setSubmitting(true);
      setError(null);

      const answersArray = Object.values(answers);

      if (answersArray.length !== questionnaireDetail.questions.length) {
        throw new Error("Please answer all questions before submitting");
      }

      // console.log("Submitting ARCS questionnaire:", {
      //   questionnaire_id: questionnaireDetail.id,
      //   answers: answersArray
      // });

      const response = await api.post(
        `/student/materials/${materialSlug}/arcs-questionnaires/${questionnaireDetail.id}/submit/`,
        { answers: answersArray }
      );

      // console.log("ARCS submission response:", response.data);

      await fetchQuestionnaires();

      setQuestionnaireDetail(null);
      setSelectedQuestionnaire(null);
      setIsInQuestionnaireMode(false);
      resetQuestionnaireState();

      return { success: true, data: response.data };
    } catch (error) {
      console.error("Error submitting questionnaire:", error);
      const errorMessage =
        error.response?.data?.error || "Failed to submit questionnaire";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setSubmitting(false);
    }
  };

  // Get current question
  const getCurrentQuestion = () => {
    if (!questionnaireDetail || !questionnaireDetail.questions) return null;
    return questionnaireDetail.questions[currentQuestionIndex];
  };

  // Get answer for specific question
  const getAnswer = (questionId) => {
    return answers[questionId] || null;
  };

  // Check if all questions are answered
  const isAllQuestionsAnswered = () => {
    if (!questionnaireDetail) return false;
    return questionnaireDetail.questions.every((q) => answers[q.id]);
  };

  // Get progress percentage
  const getProgress = () => {
    if (!questionnaireDetail) return 0;
    const answeredCount = Object.keys(answers).length;
    return (answeredCount / questionnaireDetail.questions.length) * 100;
  };

  // Select questionnaire dan langsung fetch detail
  const selectQuestionnaire = async (questionnaire) => {
    // console.log("Selecting questionnaire:", questionnaire);
    setSelectedQuestionnaire(questionnaire);
    await fetchQuestionnaireDetail(questionnaire.id);
  };

  // Back to list dengan reset state
  const backToList = () => {
    setQuestionnaireDetail(null);
    setSelectedQuestionnaire(null);
    setIsInQuestionnaireMode(false);
    resetQuestionnaireState();
  };

  useEffect(() => {
    fetchQuestionnaires();
  }, [materialSlug, token]);

  return {
    questionnaires,
    selectedQuestionnaire,
    questionnaireDetail, 
    isInQuestionnaireMode, 
    currentQuestionIndex,
    answers,
    loading,
    detailLoading,
    submitting,
    error,
    fetchQuestionnaires,
    fetchQuestionnaireDetail,
    selectQuestionnaire,
    updateAnswer,
    nextQuestion,
    previousQuestion,
    goToQuestion,
    submitQuestionnaire,
    getCurrentQuestion,
    getAnswer,
    isAllQuestionsAnswered,
    getProgress,
    backToList,
    resetQuestionnaireState,
    setError,
    setCurrentQuestionIndex,
  };
};

export default useStudentARCS;