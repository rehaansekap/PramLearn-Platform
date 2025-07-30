import { useState, useEffect, useContext, useRef } from "react";
import { AuthContext } from "../../../../context/AuthContext";
import { WS_URL } from "../../../../api";
import { message } from "antd";
import api from "../../../../api";

const useSessionQuizRanking = (materialSlug, quizId) => {
  const { token } = useContext(AuthContext);
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [materialId, setMaterialId] = useState(null);
  const wsRef = useRef(null);

  // Get materialId from materialSlug
  const getMaterialId = async () => {
    if (!materialSlug || !token) return null;

    try {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      const response = await api.get(
        `teacher/sessions/material/${materialSlug}/`
      );
      return response.data.material?.id;
    } catch (error) {
      console.error("Error getting material ID:", error);
      return null;
    }
  };

  // Connect to WebSocket for real-time updates
  const connectWebSocket = async () => {
    if (!quizId || !materialSlug || !token || wsRef.current) return;

    try {
      // Get materialId first
      const matId = await getMaterialId();
      if (!matId) {
        console.error("❌ Could not get material ID");
        setError("Gagal mendapatkan ID material");
        return;
      }

      setMaterialId(matId);

      const wsUrl = `${WS_URL}/quiz-ranking/${quizId}/${matId}/`;
      console.log("🔗 Connecting to WebSocket:", wsUrl);

      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log("✅ Quiz ranking WebSocket connected");
        setWsConnected(true);
        setError(null);
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "ranking_update") {
            console.log(
              "📊 Received ranking update via WebSocket:",
              data.rankings
            );

            // Transform WebSocket data to include proper time formatting
            const transformedRankings =
              data.rankings?.map((ranking) => ({
                ...ranking,
                // Ensure time_spent is properly handled
                time_spent: ranking.time_spent || 0,
                // Ensure completed_at is properly handled
                completed_at: ranking.completed_at || ranking.submitted_at,
                // Add any missing fields
                status: ranking.status || "not_started",
              })) || [];

            setRankings(transformedRankings);
            setLastUpdate(new Date());
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      wsRef.current.onclose = (event) => {
        console.log("❌ Quiz ranking WebSocket disconnected:", event.code);
        setWsConnected(false);

        // Auto reconnect if not intentional close
        if (event.code !== 1000) {
          setTimeout(connectWebSocket, 3000);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error("❌ Quiz ranking WebSocket error:", error);
        setWsConnected(false);
        setError("Koneksi real-time bermasalah");
      };
    } catch (error) {
      console.error("Error creating WebSocket:", error);
      setWsConnected(false);
      setError("Gagal menghubungkan ke server real-time");
    }
  };

  // Disconnect WebSocket
  const disconnectWebSocket = () => {
    if (wsRef.current) {
      wsRef.current.close(1000);
      wsRef.current = null;
      setWsConnected(false);
    }
  };

  // Manual refresh ranking
  const refreshRanking = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: "request_ranking_update",
        })
      );
    } else {
      // Fallback to HTTP if WebSocket not available
      fetchRankingHttp();
    }
  };

  // Fetch ranking via HTTP (fallback) - PERBAIKAN UTAMA
  const fetchRankingHttp = async () => {
    if (!materialSlug || !quizId || !token) return;

    try {
      setLoading(true);
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      // PERBAIKAN: Gunakan endpoint yang sama dengan data API yang Anda tunjukkan
      const response = await api.get(
        `teacher/sessions/material/${materialSlug}/quizzes/`
      );

      console.log("📊 Raw API response:", response.data);

      // PERBAIKAN: Transform data dari format API yang benar
      const quiz = response.data.quizzes?.find(
        (q) => q.id === parseInt(quizId)
      );

      if (!quiz || !quiz.assigned_groups) {
        console.warn("Quiz or assigned groups not found");
        setRankings([]);
        return;
      }

      // Transform assigned_groups data to rankings format
      const transformedRankings = quiz.assigned_groups.map((group, index) => {
        // Calculate time spent in seconds
        let timeSpent = 0;
        if (group.start_time && group.submitted_at) {
          const startTime = new Date(group.start_time);
          const endTime = new Date(group.submitted_at);
          timeSpent = Math.floor((endTime - startTime) / 1000);
        }

        // Determine status
        let status = "not_started";
        if (group.is_completed && group.submitted_at) {
          status = "completed";
        } else if (group.submissions_count > 0) {
          status = "in_progress";
        }

        // Get group details from groups array
        const groupDetails = response.data.groups?.find(
          (g) => g.id === group.group_id
        );

        return {
          group_id: group.group_id,
          group_name: group.group_name,
          group_code: group.group_code,
          score: Math.round(group.score || 0),
          status: status,
          member_count: groupDetails?.member_count || 0,
          member_names:
            groupDetails?.members?.map(
              (m) => `${m.first_name} ${m.last_name}`.trim() || m.username
            ) || [],
          start_time: group.start_time,
          end_time: group.end_time,
          submitted_at: group.submitted_at,
          completed_at: group.submitted_at,
          time_spent: timeSpent,
          correct_answers: 0, // Will be calculated if needed
          total_questions: quiz.question_count || 0,
          answers: [],
        };
      });

      // Sort by score (descending), then by submission time (ascending for completed)
      transformedRankings.sort((a, b) => {
        if (a.status === "completed" && b.status === "completed") {
          if (a.score === b.score) {
            // If scores are equal, sort by submission time (earlier submission ranks higher)
            return new Date(a.submitted_at) - new Date(b.submitted_at);
          }
          return b.score - a.score; // Higher score ranks higher
        }

        // Completed tasks always rank higher than incomplete ones
        if (a.status === "completed" && b.status !== "completed") return -1;
        if (a.status !== "completed" && b.status === "completed") return 1;

        // For incomplete tasks, sort by score
        return b.score - a.score;
      });

      console.log("📊 Transformed rankings:", transformedRankings);

      setRankings(transformedRankings);
      setLastUpdate(new Date());
      setError(null);
    } catch (error) {
      console.error("Error fetching ranking via HTTP:", error);
      setError("Gagal memuat ranking");
      message.error("Gagal memuat ranking quiz");
    } finally {
      setLoading(false);
    }
  };

  // Connect WebSocket when quiz ID changes
  useEffect(() => {
    if (quizId && materialSlug) {
      connectWebSocket();
    }

    return () => {
      disconnectWebSocket();
    };
  }, [quizId, materialSlug, token]);

  // Fallback to HTTP if WebSocket fails or immediate load
  useEffect(() => {
    if (quizId && materialSlug) {
      // Always try to fetch via HTTP first for immediate data
      fetchRankingHttp();

      // Then setup fallback timer for WebSocket failures
      const timer = setTimeout(() => {
        if (!wsConnected && !loading) {
          fetchRankingHttp();
        }
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [quizId, materialSlug]);

  return {
    rankings,
    loading,
    wsConnected,
    error,
    lastUpdate,
    materialId,
    refreshRanking,
    fetchRankingHttp,
    connectWebSocket,
    disconnectWebSocket,
  };
};

export default useSessionQuizRanking;
