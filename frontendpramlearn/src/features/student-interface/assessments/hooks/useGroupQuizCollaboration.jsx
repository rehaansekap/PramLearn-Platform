import { useState, useEffect, useCallback, useRef } from "react";
import { message } from "antd";
import { useNavigate } from "react-router-dom";
import api from "../../../../api";
import { WS_URL } from "../../../../api";
import { useContext } from "react";
import { AuthContext } from "../../../../context/AuthContext";

const useGroupQuizCollaboration = (quizSlug) => {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [groupId, setGroupId] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [groupMembers, setGroupMembers] = useState([]);
  const [onlineMembers, setOnlineMembers] = useState(new Set());
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);

  const wsRef = useRef(null);
  const connectionAttemptRef = useRef(0);
  const maxConnectionAttempts = 3;
  const isConnectingRef = useRef(false);
  const mountedRef = useRef(true); // 🔧 ADD: Track if component is mounted

  // 🔧 IMPROVED: Better cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (wsRef.current) {
        console.log("🔌 Cleaning up WebSocket on unmount");
        wsRef.current.close(1000);
        wsRef.current = null;
      }
    };
  }, []);

  // Fetch quiz data
  const fetchQuizData = useCallback(async () => {
    if (!mountedRef.current) return;

    try {
      setLoading(true);
      setError(null);

      const response = await api.get(`student/group-quiz/${quizSlug}/`);
      const quizData = response.data;

      if (!mountedRef.current) return;

      console.log("🔍 Quiz data received:", quizData);

      setQuiz(quizData);
      setGroupMembers(quizData.group?.members || []);
      setAnswers(quizData.current_answers || {});
      setTimeRemaining(quizData.time_remaining);
      setIsSubmitted(quizData.is_completed || false);

      if (quizData.group?.id) {
        console.log("✅ Using group_id from API:", quizData.group.id);
        setGroupId(quizData.group.id);
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [quizSlug]);

  // 🔧 IMPROVED: WebSocket connection with better debouncing
  const connectWebSocket = useCallback(
    (quizId, groupId) => {
      if (!token || !mountedRef.current) {
        console.log("❌ Cannot connect: no token or component unmounted");
        return;
      }

      // Prevent multiple concurrent connections
      if (isConnectingRef.current) {
        console.log("⚠️ Connection already in progress, skipping");
        return;
      }

      // Check if already connected to same quiz/group
      if (wsRef.current?.readyState === WebSocket.OPEN && wsConnected) {
        console.log("✅ Already connected to WebSocket");
        return;
      }

      isConnectingRef.current = true;

      try {
        // Close existing connection
        if (wsRef.current) {
          console.log("🔌 Closing existing WebSocket connection");
          wsRef.current.close();
          wsRef.current = null;
        }

        // Reset states
        setWsConnected(false);

        const wsUrl = `${WS_URL}/quiz-collaboration/${quizId}/${groupId}/?token=${token}`;
        console.log("🔗 Creating new WebSocket connection:", wsUrl);

        wsRef.current = new WebSocket(wsUrl);

        wsRef.current.onopen = () => {
          if (!mountedRef.current) return;

          console.log("✅ Quiz collaboration WebSocket connected");
          setWsConnected(true);
          isConnectingRef.current = false;
          connectionAttemptRef.current = 0;

          // 🔧 IMPROVED: Wait for connection to stabilize before requesting state
          setTimeout(() => {
            if (
              wsRef.current?.readyState === WebSocket.OPEN &&
              mountedRef.current
            ) {
              console.log("📤 Requesting current state...");
              wsRef.current.send(
                JSON.stringify({
                  type: "request_current_state",
                })
              );
            }
          }, 500); // 🔧 REDUCED: Wait only 500ms
        };

        wsRef.current.onmessage = (event) => {
          if (!mountedRef.current) return;

          try {
            const data = JSON.parse(event.data);
            console.log("📨 WebSocket message received:", data);

            switch (data.type) {
              case "pong":
                console.log("💓 Received pong from server");
                break;

              case "connection_established":
                console.log("🔗 Connection established:", data.message);
                break;

              case "current_state":
                console.log("📊 Received current state:", data.answers);
                setAnswers((prev) => ({
                  ...prev,
                  ...data.answers,
                }));
                break;

              case "answer_updated":
                setAnswers((prev) => ({
                  ...prev,
                  [data.question_id]: {
                    selected_choice: data.selected_choice,
                    student_name: data.username,
                    answered_by: data.user_id,
                  },
                }));

                const currentUser = groupMembers.find((m) => m.is_current_user);
                if (currentUser && data.user_id !== currentUser.id) {
                  message.info(`${data.username} menjawab soal`, 2);
                }
                break;

              case "question_changed":
                const currentUserForQuestion = groupMembers.find(
                  (m) => m.is_current_user
                );
                if (
                  currentUserForQuestion &&
                  data.user_id !== currentUserForQuestion.id
                ) {
                  message.info(
                    `${data.username} pindah ke soal ${
                      data.question_index + 1
                    }`,
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

              case "quiz_submitted":
                console.log("🎯 Received quiz submission broadcast:", data);
                message.success(data.message, 3);
                setIsSubmitted(true);

                if (wsRef.current) {
                  wsRef.current.close(1000);
                }

                setTimeout(() => {
                  if (mountedRef.current) {
                    navigate(data.redirect_url);
                  }
                }, 1500);
                break;

              case "error":
                console.error("❌ WebSocket error message:", data.message);
                message.error(data.message);
                break;

              default:
                console.log("❓ Unknown message type:", data.type);
            }
          } catch (error) {
            console.error("❌ Error parsing WebSocket message:", error);
          }
        };

        wsRef.current.onclose = (event) => {
          if (!mountedRef.current) return;

          console.log("🔌 Quiz collaboration WebSocket disconnected:", {
            code: event.code,
            reason: event.reason,
            wasClean: event.wasClean,
          });

          setWsConnected(false);
          isConnectingRef.current = false;

          // 🔧 IMPROVED: Only reconnect on unexpected disconnections
          if (
            !isSubmitted &&
            ![1000, 1001, 4001, 4003].includes(event.code) &&
            connectionAttemptRef.current < maxConnectionAttempts &&
            mountedRef.current
          ) {
            connectionAttemptRef.current++;
            const delay = Math.min(2000 * connectionAttemptRef.current, 5000);

            console.log(
              `🔄 Attempting to reconnect (${
                connectionAttemptRef.current
              }/${maxConnectionAttempts}) in ${delay / 1000} seconds...`
            );

            setTimeout(() => {
              if (!isSubmitted && mountedRef.current) {
                connectWebSocket(quizId, groupId);
              }
            }, delay);
          } else if (connectionAttemptRef.current >= maxConnectionAttempts) {
            console.log("❌ Max reconnection attempts reached.");
            message.warning(
              "Koneksi terputus. Silakan refresh halaman jika diperlukan."
            );
          }
        };

        wsRef.current.onerror = (error) => {
          console.error("❌ Quiz collaboration WebSocket error:", error);
          setWsConnected(false);
          isConnectingRef.current = false;
        };
      } catch (error) {
        console.error("❌ Error creating WebSocket connection:", error);
        setWsConnected(false);
        isConnectingRef.current = false;
      }
    },
    [groupMembers, isSubmitted, token, navigate]
  );

  // Set answer function
  const setAnswer = useCallback(
    async (questionId, selectedChoice) => {
      if (!mountedRef.current) return;

      setAnswers((prev) => ({
        ...prev,
        [questionId]: {
          selected_choice: selectedChoice,
          student_name: "You",
          answered_by: "current_user",
        },
      }));

      try {
        await api.post(`student/group-quiz/${quizSlug}/save-answer/`, {
          question_id: questionId,
          selected_choice: selectedChoice,
        });

        // Only send if connection is stable
        if (wsRef.current?.readyState === WebSocket.OPEN && wsConnected) {
          wsRef.current.send(
            JSON.stringify({
              type: "answer_selected",
              question_id: questionId,
              selected_choice: selectedChoice,
            })
          );
        }
      } catch (error) {
        console.error("Failed to save answer:", error);
        message.error("Gagal menyimpan jawaban");

        if (mountedRef.current) {
          setAnswers((prev) => {
            const newAnswers = { ...prev };
            delete newAnswers[questionId];
            return newAnswers;
          });
        }
      }
    },
    [quizSlug, wsConnected]
  );

  // Question navigation
  const navigateToQuestion = useCallback(
    (questionIndex) => {
      if (!mountedRef.current) return;

      setCurrentQuestionIndex(questionIndex);

      if (wsRef.current?.readyState === WebSocket.OPEN && wsConnected) {
        wsRef.current.send(
          JSON.stringify({
            type: "question_changed",
            question_index: questionIndex,
          })
        );
      }
    },
    [wsConnected]
  );

  // Submit quiz
  const submitQuiz = useCallback(async () => {
    if (!mountedRef.current) return;

    try {
      console.log("🎯 Submitting quiz and broadcasting to group...");

      const response = await api.post(`student/group-quiz/${quizSlug}/submit/`);

      if (wsRef.current?.readyState === WebSocket.OPEN && wsConnected) {
        wsRef.current.send(
          JSON.stringify({
            type: "quiz_submitted",
            quiz_slug: quizSlug,
          })
        );
        console.log("✅ Quiz submission broadcasted to group members");
      }

      setIsSubmitted(true);
      return response.data;
    } catch (err) {
      console.error("❌ Error submitting quiz:", err);
      throw err;
    }
  }, [quizSlug, wsConnected]);

  // Timer countdown
  useEffect(() => {
    if (timeRemaining <= 0 || !mountedRef.current) return;

    const timer = setInterval(() => {
      if (!mountedRef.current) return;

      setTimeRemaining((prev) => {
        const newTime = prev - 1;
        return Math.max(0, newTime);
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

  // Auto submit when time runs out
  useEffect(() => {
    if (timeRemaining === 0 && !isSubmitted && mountedRef.current) {
      message.warning("Waktu habis! Quiz akan disubmit otomatis.");
      submitQuiz()
        .then(() => {
          console.log("✅ Auto-submit completed");
        })
        .catch(console.error);
    }
  }, [timeRemaining, isSubmitted, submitQuiz]);

  // 🔧 IMPROVED: Better data fetching and WebSocket initialization
  useEffect(() => {
    if (quizSlug && mountedRef.current) {
      console.log("🚀 Starting quiz data fetch for:", quizSlug);
      fetchQuizData();
    }
  }, [quizSlug, fetchQuizData]);

  // 🔧 IMPROVED: Separate effect for WebSocket connection after data is loaded
  useEffect(() => {
    if (quiz?.id && groupId && token && !loading && mountedRef.current) {
      console.log("🔗 Initializing WebSocket connection...", {
        quizId: quiz.id,
        groupId: groupId,
      });

      // 🔧 ADD: Small delay to ensure component is fully mounted
      const timer = setTimeout(() => {
        if (mountedRef.current) {
          connectWebSocket(quiz.id, groupId);
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [quiz?.id, groupId, token, loading, connectWebSocket]);

  return {
    quiz,
    groupId,
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
    connectWebSocket,
  };
};

export default useGroupQuizCollaboration;
