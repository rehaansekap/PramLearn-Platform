import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useContext,
} from "react";
import { AuthContext } from "../../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { message } from "antd";
import { WS_URL } from "../../../../api";
import api from "../../../../api";

const useGroupQuizCollaboration = (quizSlug) => {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  // States
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

  // Refs untuk managing connections
  const wsRef = useRef(null);
  const mountedRef = useRef(true);
  const reconnectTimeoutRef = useRef(null);
  const connectionStateRef = useRef("disconnected"); // 'disconnected', 'connecting', 'connected'
  const lastConnectAttemptRef = useRef(0);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  const minReconnectDelay = 2000;
  const maxReconnectDelay = 30000;

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      cleanup();
    };
  }, []);

  const cleanup = useCallback(() => {
    console.log("🧹 Cleaning up WebSocket connections...");

    // Clear reconnect timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    // Close WebSocket connection
    if (wsRef.current) {
      const ws = wsRef.current;
      wsRef.current = null;

      if (
        ws.readyState === WebSocket.OPEN ||
        ws.readyState === WebSocket.CONNECTING
      ) {
        ws.close(1000, "Component unmounting");
      }
    }

    // Reset connection state
    connectionStateRef.current = "disconnected";
    setWsConnected(false);
    reconnectAttemptsRef.current = 0;
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

      setQuiz(quizData);
      setGroupMembers(quizData.group?.members || []);
      setAnswers(quizData.current_answers || {});
      setTimeRemaining(quizData.time_remaining);
      setIsSubmitted(quizData.is_submitted || false);

      if (quizData.group?.id) {
        console.log("✅ Using group_id from API:", quizData.group.id);
        setGroupId(quizData.group.id);
      }
    } catch (err) {
      if (mountedRef.current) {
        console.error("❌ Error fetching quiz data:", err);
        setError(err);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [quizSlug]);

  // Improved WebSocket connection with better state management
  const connectWebSocket = useCallback(
    (quizId, groupId) => {
      if (!token || !mountedRef.current || isSubmitted) {
        console.log(
          "❌ Cannot connect: missing token, unmounted, or submitted"
        );
        return;
      }

      // Prevent multiple concurrent connection attempts
      if (connectionStateRef.current === "connecting") {
        console.log("⚠️ Connection already in progress, skipping");
        return;
      }

      // Rate limiting - prevent too frequent reconnection attempts
      const now = Date.now();
      if (now - lastConnectAttemptRef.current < 1000) {
        console.log("⚠️ Rate limiting connection attempts");
        return;
      }
      lastConnectAttemptRef.current = now;

      // Check if already connected to the same quiz/group
      if (wsRef.current?.readyState === WebSocket.OPEN && wsConnected) {
        console.log("✅ Already connected to WebSocket");
        return;
      }

      connectionStateRef.current = "connecting";
      console.log(
        `🔗 Attempting WebSocket connection (attempt ${
          reconnectAttemptsRef.current + 1
        })`
      );

      try {
        // Close existing connection cleanly
        if (wsRef.current) {
          const oldWs = wsRef.current;
          wsRef.current = null;

          if (
            oldWs.readyState === WebSocket.OPEN ||
            oldWs.readyState === WebSocket.CONNECTING
          ) {
            oldWs.close(1000, "Creating new connection");
          }
        }

        const wsUrl = `${WS_URL}/quiz-collaboration/${quizId}/${groupId}/?token=${token}`;
        console.log("🔗 Creating WebSocket connection to:", wsUrl);

        const newWs = new WebSocket(wsUrl);
        wsRef.current = newWs;

        // Connection timeout
        const connectionTimeout = setTimeout(() => {
          if (
            connectionStateRef.current === "connecting" &&
            newWs.readyState !== WebSocket.OPEN
          ) {
            console.log("⏱️ Connection timeout, closing...");
            newWs.close(1000, "Connection timeout");
          }
        }, 10000);

        newWs.onopen = () => {
          clearTimeout(connectionTimeout);

          if (!mountedRef.current || wsRef.current !== newWs) {
            newWs.close(1000, "Component unmounted or replaced");
            return;
          }

          console.log("✅ Quiz collaboration WebSocket connected");
          connectionStateRef.current = "connected";
          setWsConnected(true);
          reconnectAttemptsRef.current = 0;

          // Request current state after a small delay
          setTimeout(() => {
            if (newWs.readyState === WebSocket.OPEN && mountedRef.current) {
              console.log("📤 Requesting current state...");
              newWs.send(JSON.stringify({ type: "request_current_state" }));
            }
          }, 500);
        };

        newWs.onmessage = (event) => {
          if (!mountedRef.current) return;

          try {
            const data = JSON.parse(event.data);
            console.log("📨 WebSocket message:", data.type);

            switch (data.type) {
              case "pong":
                console.log("💓 Received pong");
                break;

              case "current_state":
                setAnswers((prev) => ({ ...prev, ...data.answers }));
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
                  message.success(
                    `${data.username} memilih jawaban ${data.selected_choice}`,
                    2
                  );
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
                message.success(data.message, 3);
                setIsSubmitted(true);

                if (wsRef.current) {
                  wsRef.current.close(1000, "Quiz submitted");
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

        newWs.onclose = (event) => {
          clearTimeout(connectionTimeout);

          if (!mountedRef.current) return;

          console.log("🔌 WebSocket disconnected:", {
            code: event.code,
            reason: event.reason,
            wasClean: event.wasClean,
          });

          connectionStateRef.current = "disconnected";
          setWsConnected(false);

          // Only attempt reconnection for unexpected closures
          const shouldReconnect =
            !isSubmitted &&
            ![1000, 1001, 4001, 4003].includes(event.code) &&
            reconnectAttemptsRef.current < maxReconnectAttempts &&
            mountedRef.current;

          if (shouldReconnect) {
            reconnectAttemptsRef.current++;

            // Exponential backoff with jitter
            const baseDelay = Math.min(
              minReconnectDelay * Math.pow(2, reconnectAttemptsRef.current - 1),
              maxReconnectDelay
            );
            const jitter = Math.random() * 1000; // Add up to 1s random delay
            const delay = baseDelay + jitter;

            console.log(
              `🔄 Scheduling reconnect attempt ${
                reconnectAttemptsRef.current
              }/${maxReconnectAttempts} in ${Math.round(delay)}ms`
            );

            reconnectTimeoutRef.current = setTimeout(() => {
              if (mountedRef.current && !isSubmitted) {
                connectWebSocket(quizId, groupId);
              }
            }, delay);
          } else if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
            console.log("❌ Max reconnection attempts reached");
            message.warning(
              "Koneksi terputus. Refresh halaman jika diperlukan.",
              5
            );
          }
        };

        newWs.onerror = (error) => {
          clearTimeout(connectionTimeout);
          console.error("❌ WebSocket error:", error);
          connectionStateRef.current = "disconnected";
          setWsConnected(false);
        };
      } catch (error) {
        console.error("❌ Error creating WebSocket:", error);
        connectionStateRef.current = "disconnected";
        setWsConnected(false);
      }
    },
    [token, groupMembers, isSubmitted, navigate]
  );

  // Heartbeat to maintain connection
  useEffect(() => {
    if (!wsConnected || !wsRef.current) return;

    const heartbeatInterval = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: "ping" }));
        console.log("💓 Sending heartbeat");
      }
    }, 30000); // Every 30 seconds

    return () => clearInterval(heartbeatInterval);
  }, [wsConnected]);

  // Set answer function with improved error handling
  const setAnswer = useCallback(
    async (questionId, selectedChoice) => {
      if (!mountedRef.current) return;

      // Optimistically update UI
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

        // Send via WebSocket if connected
        if (wsRef.current?.readyState === WebSocket.OPEN) {
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

        // Revert optimistic update
        if (mountedRef.current) {
          setAnswers((prev) => {
            const newAnswers = { ...prev };
            delete newAnswers[questionId];
            return newAnswers;
          });
        }
      }
    },
    [quizSlug]
  );

  // Question navigation
  const navigateToQuestion = useCallback((questionIndex) => {
    if (!mountedRef.current) return;

    setCurrentQuestionIndex(questionIndex);

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
    if (!mountedRef.current) return;

    try {
      console.log("🎯 Submitting quiz...");

      const response = await api.post(`student/group-quiz/${quizSlug}/submit/`);

      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: "quiz_submitted",
            quiz_slug: quizSlug,
          })
        );
      }

      setIsSubmitted(true);
      return response.data;
    } catch (err) {
      console.error("❌ Error submitting quiz:", err);
      throw err;
    }
  }, [quizSlug]);

  // Timer countdown
  useEffect(() => {
    if (timeRemaining <= 0 || !mountedRef.current) return;

    const timer = setInterval(() => {
      if (!mountedRef.current) return;

      setTimeRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

  // Auto submit when time runs out
  useEffect(() => {
    if (timeRemaining === 0 && !isSubmitted && mountedRef.current) {
      message.warning("Waktu habis! Quiz akan disubmit otomatis.");
      submitQuiz().catch(console.error);
    }
  }, [timeRemaining, isSubmitted, submitQuiz]);

  // Fetch quiz data on mount
  useEffect(() => {
    if (quizSlug && mountedRef.current) {
      fetchQuizData();
    }
  }, [quizSlug, fetchQuizData]);

  // Initialize WebSocket connection
  useEffect(() => {
    if (
      quiz?.id &&
      groupId &&
      token &&
      !loading &&
      !isSubmitted &&
      mountedRef.current
    ) {
      console.log("🔗 Initializing WebSocket connection...", {
        quizId: quiz.id,
        groupId: groupId,
      });

      // Small delay to ensure component is fully mounted
      const timer = setTimeout(() => {
        if (mountedRef.current) {
          connectWebSocket(quiz.id, groupId);
        }
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [quiz?.id, groupId, token, loading, isSubmitted, connectWebSocket]);

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
