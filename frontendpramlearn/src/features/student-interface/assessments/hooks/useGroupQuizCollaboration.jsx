import { useState, useEffect, useCallback, useRef } from "react";
import { message } from "antd";
import api from "../../../../api";
import { WS_URL } from "../../../../api"; // Import WS_URL from your API config
import { useContext } from "react";
import { AuthContext } from "../../../../context/AuthContext";

const useGroupQuizCollaboration = (quizSlug) => {
  const { token } = useContext(AuthContext); // Tambahkan ini
  const [quiz, setQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [groupMembers, setGroupMembers] = useState([]);
  const [onlineMembers, setOnlineMembers] = useState(new Set());
  const [isSubmitted, setIsSubmitted] = useState(false);

  const wsRef = useRef(null);
  const [wsConnected, setWsConnected] = useState(false);

  // Fetch quiz data
  const fetchQuizData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`student/group-quiz/${quizSlug}/`);
      const data = response.data;

      setQuiz(data);
      setAnswers(data.current_answers || {});
      setGroupMembers(data.group?.members || []);
      setTimeRemaining(data.time_remaining);
      setIsSubmitted(data.is_submitted);

      // Connect to WebSocket after quiz data is loaded
      if (data.group?.id) {
        connectWebSocket(data.id, data.group.id);
      }
    } catch (err) {
      setError(err);
      console.error("Error fetching quiz data:", err);
    } finally {
      setLoading(false);
    }
  }, [quizSlug]);

  // WebSocket connection
  const connectWebSocket = useCallback(
    (quizId, groupId) => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        return;
      }

      // Pastikan user sudah login
      if (!token) {
        console.log("❌ No token available, cannot connect to WebSocket");
        return;
      }

      // Sertakan token dalam WebSocket URL
      const wsUrl = `${WS_URL}/quiz-collaboration/${quizId}/${groupId}/?token=${token}`;
      console.log("🔗 Connecting to WebSocket:", wsUrl);

      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log("✅ Quiz collaboration WebSocket connected");
        setWsConnected(true);

        // Request current state
        wsRef.current.send(
          JSON.stringify({
            type: "request_current_state",
          })
        );
      };

      wsRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log("WebSocket message received:", data);

        switch (data.type) {
          case "current_state":
            // Update answers with current state
            setAnswers((prev) => ({
              ...prev,
              ...data.answers,
            }));
            break;

          case "answer_updated":
            // Real-time answer update
            setAnswers((prev) => ({
              ...prev,
              [data.question_id]: {
                selected_choice: data.selected_choice,
                student_name: data.username,
                answered_by: data.user_id,
              },
            }));

            // Show notification for other users' answers
            const currentUser = groupMembers.find((m) => m.is_current_user);
            if (currentUser && data.user_id !== currentUser.id) {
              message.info(`${data.username} menjawab soal`, 2);
            }
            break;

          case "question_changed":
            // Show notification when someone changes question
            const currentUserForQuestion = groupMembers.find(
              (m) => m.is_current_user
            );
            if (
              currentUserForQuestion &&
              data.user_id !== currentUserForQuestion.id
            ) {
              message.info(
                `${data.username} pindah ke soal ${data.question_index + 1}`,
                1
              );
            }
            break;

          case "user_joined":
            setOnlineMembers((prev) => new Set([...prev, data.user_id]));
            message.success(data.message, 2);
            break;

          case "user_left":
            setOnlineMembers((prev) => {
              const newSet = new Set(prev);
              newSet.delete(data.user_id);
              return newSet;
            });
            message.warning(data.message, 2);
            break;

          case "error":
            message.error(data.message);
            break;

          default:
            console.log("Unknown message type:", data.type);
        }
      };

      wsRef.current.onclose = (event) => {
        console.log("Quiz collaboration WebSocket disconnected:", event.code);
        setWsConnected(false);

        // Reconnect after 3 seconds if not intentional close
        if (event.code !== 1000) {
          setTimeout(() => {
            if (!isSubmitted) {
              connectWebSocket(quizId, groupId);
            }
          }, 3000);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error("Quiz collaboration WebSocket error:", error);
        setWsConnected(false);
      };
    },
    [groupMembers, isSubmitted, token] // Tambahkan token ke dependencies
  );

  // Set answer function
  const setAnswer = useCallback((questionId, selectedChoice) => {
    // Update local state immediately for responsive UI
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        selected_choice: selectedChoice,
        student_name: "You",
        answered_by: "current_user",
      },
    }));

    // Send to WebSocket for real-time collaboration
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: "answer_selected",
          question_id: questionId,
          selected_choice: selectedChoice,
        })
      );
    }
  }, []);

  // Question navigation
  const navigateToQuestion = useCallback((questionIndex) => {
    setCurrentQuestionIndex(questionIndex);

    // Notify other group members about question change
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: "question_changed",
          question_index: questionIndex,
        })
      );
    }
  }, []);

  // Submit quiz
  const submitQuiz = useCallback(async () => {
    try {
      const response = await api.post(`student/group-quiz/${quizSlug}/submit/`);
      setIsSubmitted(true);

      // Close WebSocket connection
      if (wsRef.current) {
        wsRef.current.close(1000); // Normal closure
      }

      return response.data;
    } catch (err) {
      throw err;
    }
  }, [quizSlug]);

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

  // Auto submit when time runs out
  useEffect(() => {
    if (timeRemaining === 0 && !isSubmitted) {
      message.warning("Waktu habis! Quiz akan disubmit otomatis.");
      submitQuiz().catch(console.error);
    }
  }, [timeRemaining, isSubmitted, submitQuiz]);

  // Initial data fetch
  useEffect(() => {
    if (quizSlug) {
      fetchQuizData();
    }

    // Cleanup on unmount
    return () => {
      if (wsRef.current) {
        wsRef.current.close(1000);
      }
    };
  }, [quizSlug, fetchQuizData]);

  return {
    quiz,
    currentQuestionIndex,
    answers,
    loading,
    error,
    timeRemaining,
    groupMembers,
    onlineMembers,
    isSubmitted,
    wsConnected,
    setCurrentQuestionIndex: navigateToQuestion,
    setAnswer,
    submitQuiz,
    refetchQuiz: fetchQuizData,
  };
};

export default useGroupQuizCollaboration;
