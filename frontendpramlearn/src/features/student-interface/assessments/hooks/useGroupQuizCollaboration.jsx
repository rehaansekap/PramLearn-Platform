import { useState, useEffect, useCallback, useRef } from "react";
import { message } from "antd";
import { useNavigate } from "react-router-dom"; // Tambahkan ini
import api from "../../../../api";
import { WS_URL } from "../../../../api";
import { useContext } from "react";
import { AuthContext } from "../../../../context/AuthContext";

const useGroupQuizCollaboration = (quizSlug) => {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [groupId, setGroupId] = useState(null); // 🔧 TAMBAHKAN INI
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

  // Fetch quiz data
  const fetchQuizData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`student/group-quiz/${quizSlug}/`);
      const quizData = response.data;

      console.log("🔍 Quiz data received:", quizData); // Debug log

      setQuiz(quizData);
      setGroupMembers(quizData.group?.members || []);
      setAnswers(quizData.current_answers || {});
      setTimeRemaining(quizData.time_remaining);
      setIsSubmitted(quizData.is_completed || false);

      // 🔧 PERBAIKAN: Ambil group_id dari response API, bukan dari mock data
      if (quizData.group?.id) {
        console.log("✅ Using group_id from API:", quizData.group.id);
        // Store group_id for WebSocket connection
        setGroupId(quizData.group.id);
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [quizSlug]);

  // WebSocket connection
  const connectWebSocket = useCallback(
    (quizId, groupId) => {
      if (!token) {
        console.log("❌ No token available, cannot connect to WebSocket");
        return;
      }

      try {
        // Tutup koneksi lama jika ada
        if (wsRef.current) {
          wsRef.current.close();
        }

        const wsUrl = `${WS_URL}/quiz-collaboration/${quizId}/${groupId}/?token=${token}`;
        console.log("🔗 Connecting to WebSocket:", wsUrl);

        wsRef.current = new WebSocket(wsUrl);

        let pingInterval;
        let connectionTimeout;
        let reconnectAttempts = 0;
        const MAX_RECONNECT_ATTEMPTS = 5;

        // Connection timeout
        connectionTimeout = setTimeout(() => {
          if (wsRef.current?.readyState === WebSocket.CONNECTING) {
            console.log("⏰ WebSocket connection timeout");
            wsRef.current.close();
            setWsConnected(false);
          }
        }, 10000);

        wsRef.current.onopen = () => {
          clearTimeout(connectionTimeout);
          console.log("✅ Quiz collaboration WebSocket connected");
          setWsConnected(true);
          reconnectAttempts = 0; // Reset reconnect attempts

          // Start heartbeat with longer interval
          pingInterval = setInterval(() => {
            if (wsRef.current?.readyState === WebSocket.OPEN) {
              console.log("💓 Sending heartbeat");
              wsRef.current.send(JSON.stringify({ type: "ping" }));
            }
          }, 45000); // Send ping every 45 seconds

          // Request current state dengan delay yang lebih lama
          setTimeout(() => {
            if (wsRef.current?.readyState === WebSocket.OPEN) {
              console.log("📤 Requesting current state...");
              wsRef.current.send(
                JSON.stringify({
                  type: "request_current_state",
                })
              );
            }
          }, 1000); // Delay 1 detik setelah connection open
        };

        wsRef.current.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log("📨 WebSocket message received:", data);

            switch (data.type) {
              case "pong":
                console.log("💓 Received pong");
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

              // ✨ TAMBAHKAN INI: Handle quiz submission broadcast
              case "quiz_submitted":
                console.log("🎯 Received quiz submission broadcast:", data);

                // Show notification
                message.success(data.message, 3);

                // Set submitted state
                setIsSubmitted(true);

                // Close WebSocket connection
                if (wsRef.current) {
                  wsRef.current.close(1000);
                }

                // Redirect all group members to results page
                setTimeout(() => {
                  navigate(data.redirect_url);
                }, 1500); // Small delay to show the message
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
          clearTimeout(connectionTimeout);
          clearInterval(pingInterval);

          console.log("🔌 Quiz collaboration WebSocket disconnected:", {
            code: event.code,
            reason: event.reason,
            wasClean: event.wasClean,
          });
          setWsConnected(false);

          // Handle different close codes
          if (event.code === 1005) {
            console.log(
              "⚠️ Connection closed abnormally (1005) - likely server issue"
            );
          }

          // 🔧 PERBAIKAN: Limit reconnection attempts
          if (
            !isSubmitted &&
            ![1000, 4001, 4003].includes(event.code) &&
            reconnectAttempts < MAX_RECONNECT_ATTEMPTS
          ) {
            reconnectAttempts++;
            const delay = Math.min(3000 * reconnectAttempts, 30000); // Exponential backoff, max 30s

            console.log(
              `🔄 Attempting to reconnect (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS}) in ${
                delay / 1000
              } seconds...`
            );

            setTimeout(() => {
              if (!isSubmitted) {
                connectWebSocket(quizId, groupId);
              }
            }, delay);
          } else if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
            console.log(
              "❌ Max reconnection attempts reached. Switching to polling mode."
            );
            message.warning(
              "Koneksi real-time bermasalah. Menggunakan mode polling."
            );
            // You could implement polling fallback here
          }
        };

        wsRef.current.onerror = (error) => {
          clearTimeout(connectionTimeout);
          clearInterval(pingInterval);
          console.error("❌ Quiz collaboration WebSocket error:", error);
          setWsConnected(false);
        };
      } catch (error) {
        console.error("❌ Error creating WebSocket connection:", error);
      }
    },
    [groupMembers, isSubmitted, token, navigate]
  );

  // Set answer function
  const setAnswer = useCallback(
    async (questionId, selectedChoice) => {
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

        setAnswers((prev) => {
          const newAnswers = { ...prev };
          delete newAnswers[questionId];
          return newAnswers;
        });
      }
    },
    [quizSlug]
  );

  // Question navigation
  const navigateToQuestion = useCallback((questionIndex) => {
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

  // ✨ UPDATE INI: Submit quiz dengan WebSocket broadcast
  const submitQuiz = useCallback(async () => {
    try {
      console.log("🎯 Submitting quiz and broadcasting to group...");

      // Submit quiz via API
      const response = await api.post(`student/group-quiz/${quizSlug}/submit/`);

      // Broadcast submission to all group members via WebSocket
      if (wsRef.current?.readyState === WebSocket.OPEN) {
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
      submitQuiz()
        .then(() => {
          // Navigation will be handled by WebSocket broadcast
          console.log("✅ Auto-submit completed");
        })
        .catch(console.error);
    }
  }, [timeRemaining, isSubmitted, submitQuiz, quizSlug]);

  // Initial data fetch
  useEffect(() => {
    if (quizSlug) {
      fetchQuizData();
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close(1000);
      }
    };
  }, [quizSlug, fetchQuizData]);

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
