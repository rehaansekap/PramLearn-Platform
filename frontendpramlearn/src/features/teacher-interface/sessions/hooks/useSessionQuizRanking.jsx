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
  const [materialId, setMaterialId] = useState(null); // Tambahkan state untuk materialId
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
            setRankings(data.rankings || []);
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
    }
  };

  // Fetch ranking via HTTP (fallback)
  const fetchRankingHttp = async () => {
    if (!materialSlug || !quizId || !token) return;

    try {
      setLoading(true);
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      const response = await api.get(
        `teacher/sessions/material/${materialSlug}/quizzes/${quizId}/ranking/`
      );

      setRankings(response.data);
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

  // Fallback to HTTP if WebSocket fails
  useEffect(() => {
    if (quizId && materialSlug && !wsConnected && !loading) {
      const timer = setTimeout(() => {
        fetchRankingHttp();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [quizId, materialSlug, wsConnected, loading]);

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
