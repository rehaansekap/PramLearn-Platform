import React, { useState, useEffect, useRef } from "react";
import {
  Modal,
  Table,
  Card,
  Spin,
  Tag,
  Progress,
  Space,
  Button,
  Alert,
} from "antd";
import {
  TrophyOutlined,
  ReloadOutlined,
  UserOutlined,
  ClockCircleOutlined,
  WifiOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import api from "../../../api";
import dayjs from "dayjs";

const QuizRankingModal = ({ open, onClose, quiz, materialId }) => {
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false); // Loading awal
  const [refreshing, setRefreshing] = useState(false); // Loading refresh manual
  const [lastUpdate, setLastUpdate] = useState(null);
  const [wsConnected, setWsConnected] = useState(false);
  const [wsConnecting, setWsConnecting] = useState(false); // Loading WebSocket connection
  const [error, setError] = useState(null); // Error state
  const wsRef = useRef(null);

  // WebSocket connection
  useEffect(() => {
    if (open && quiz?.id && materialId) {
      setInitialLoading(true);
      setError(null);
      connectWebSocket();
      return () => {
        if (wsRef.current) {
          wsRef.current.close();
          wsRef.current = null;
        }
      };
    }
  }, [open, quiz?.id, materialId]);

  const connectWebSocket = () => {
    try {
      setWsConnecting(true);
      const wsUrl = `ws://localhost:8000/ws/quiz-ranking/${quiz.id}/${materialId}/`;
      console.log("🔗 Connecting to WebSocket:", wsUrl);

      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log("✅ Quiz ranking WebSocket connected");
        setWsConnected(true);
        setWsConnecting(false);
        setError(null);
        // Request initial ranking data
        wsRef.current.send(
          JSON.stringify({
            type: "request_ranking_update",
          })
        );
      };

      wsRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log("📨 Quiz ranking WebSocket message:", data);

        if (data.type === "ranking_update") {
          setRankings(data.rankings);
          setLastUpdate(new Date());
          setLoading(false);
          setInitialLoading(false);
          setRefreshing(false); // Reset refreshing state
        }
      };

      wsRef.current.onclose = () => {
        console.log("❌ Quiz ranking WebSocket disconnected");
        setWsConnected(false);
        setWsConnecting(false);
        // Auto reconnect after 3 seconds
        setTimeout(() => {
          if (open && quiz?.id && materialId) {
            connectWebSocket();
          }
        }, 3000);
      };

      wsRef.current.onerror = (error) => {
        console.error("❌ Quiz ranking WebSocket error:", error);
        setWsConnected(false);
        setWsConnecting(false);
        setError("Koneksi WebSocket bermasalah. Mencoba koneksi ulang...");
        // Fallback ke HTTP jika WebSocket gagal
        fetchRanking();
      };
    } catch (error) {
      console.error("❌ WebSocket connection error:", error);
      setWsConnected(false);
      setWsConnecting(false);
      setError("Gagal menghubungkan ke server real-time");
      // Fallback ke HTTP
      fetchRanking();
    }
  };

  // Fallback HTTP fetch
  const fetchRanking = async (isRefresh = false) => {
    if (!quiz?.id || !materialId) return;

    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError(null);

    try {
      const url = `quiz-ranking/${quiz.id}/?material_id=${materialId}`;
      const response = await api.get(url);
      setRankings(response.data);
      setLastUpdate(new Date());
    } catch (error) {
      console.error("Error fetching quiz ranking:", error);
      setError("Gagal memuat data ranking. Silakan coba lagi.");
    } finally {
      setLoading(false);
      setInitialLoading(false);
      setRefreshing(false); // Pastikan direset
    }
  };

  // PERBAIKAN: Handle refresh yang lebih robust
  const handleRefresh = () => {
    console.log("🔄 Manual refresh requested", {
      wsConnected,
      wsRef: !!wsRef.current,
    });

    if (wsConnected && wsRef.current) {
      // Jika WebSocket aktif, request update via WebSocket
      setRefreshing(true);
      wsRef.current.send(
        JSON.stringify({
          type: "request_ranking_update",
        })
      );

      // Set timeout untuk fallback jika WebSocket tidak response
      setTimeout(() => {
        if (refreshing) {
          console.log("⚠️ WebSocket timeout, falling back to HTTP");
          fetchRanking(true);
        }
      }, 5000);
    } else {
      // Jika tidak ada WebSocket, gunakan HTTP
      console.log("📡 Using HTTP refresh");
      fetchRanking(true);
    }
  };

  const columns = [
    {
      title: "Rank",
      key: "rank",
      render: (_, __, idx) => {
        const rank = idx + 1;
        let badgeColor = "#666";
        if (rank === 1) badgeColor = "#FFD700";
        else if (rank === 2) badgeColor = "#C0C0C0";
        else if (rank === 3) badgeColor = "#CD7F32";

        return (
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: "18px",
                fontWeight: "bold",
                color: badgeColor,
              }}
            >
              {rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : rank}
            </div>
          </div>
        );
      },
      width: 80,
      align: "center",
    },
    {
      title: "Kelompok",
      dataIndex: "group_name",
      key: "group_name",
      render: (name, record) => (
        <div>
          <div style={{ fontWeight: 500, marginBottom: 4 }}>{name}</div>
          <div style={{ fontSize: "12px", color: "#666" }}>
            <UserOutlined style={{ marginRight: 4 }} />
            {record.member_count || 0} anggota
          </div>
        </div>
      ),
    },
    {
      title: "Skor",
      dataIndex: "score",
      key: "score",
      render: (score) => (
        <div style={{ textAlign: "center" }}>
          <div
            style={{ fontSize: "18px", fontWeight: "bold", color: "#1890ff" }}
          >
            {score?.toFixed(1) || 0}
          </div>
          <Progress
            percent={score || 0}
            size="small"
            strokeColor={
              score >= 80 ? "#52c41a" : score >= 60 ? "#faad14" : "#ff4d4f"
            }
            showInfo={false}
          />
        </div>
      ),
      width: 120,
      align: "center",
      sorter: (a, b) => (b.score || 0) - (a.score || 0),
    },
    {
      title: "Benar/Total",
      key: "correct_answers",
      render: (_, record) => (
        <Tag
          color={
            record.correct_answers === record.total_questions
              ? "green"
              : "orange"
          }
        >
          {record.correct_answers || 0}/{record.total_questions || 0}
        </Tag>
      ),
      width: 100,
      align: "center",
      responsive: ["md"],
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const statusConfig = {
          completed: { color: "green", text: "Selesai" },
          in_progress: { color: "blue", text: "Sedang Mengerjakan" },
          not_started: { color: "gray", text: "Belum Mulai" },
        };
        const config = statusConfig[status] || statusConfig["not_started"];
        return <Tag color={config.color}>{config.text}</Tag>;
      },
      width: 130,
      align: "center",
      responsive: ["md"],
    },
  ];

  const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={900}
      title={
        <div style={{ textAlign: "center", padding: "8px 0" }}>
          <div>
            <TrophyOutlined
              style={{ fontSize: "40px", color: "#FFD700", marginRight: 8 }}
            />
          </div>
          <div
            style={{
              fontSize: "20px",
              fontWeight: 700,
              color: "#11418b",
              marginBottom: 2,
              marginTop: 4,
            }}
          >
            {quiz?.title || "Quiz"}
          </div>
          <div style={{ fontSize: "13px", color: "#666", marginBottom: 12 }}>
            {quiz?.questions?.length || 0} soal &nbsp;•&nbsp; Real-time ranking
          </div>
          <Button
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
            loading={refreshing}
            style={{
              borderRadius: 6,
              fontWeight: 500,
              background: "#f5f5f5",
              color: "#11418b",
              border: "none",
            }}
          >
            Refresh
          </Button>
        </div>
      }
      className="quiz-ranking-modal"
    >
      {/* WebSocket Status & Error */}
      <div style={{ marginBottom: 16 }}>
        <Card
          size="small"
          style={{ background: "#f8f9fa", border: "1px solid #e9ecef" }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              <ClockCircleOutlined
                style={{ color: "#1890ff", marginRight: 8 }}
              />
              <span style={{ fontSize: "14px", color: "#666" }}>
                Last Update:{" "}
                {lastUpdate
                  ? dayjs(lastUpdate).format("DD/MM/YYYY HH:mm:ss")
                  : "-"}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ fontSize: "14px" }}>
                <strong>
                  {rankings.filter((r) => r.status === "completed").length}
                </strong>{" "}
                selesai
              </div>
              <div style={{ fontSize: "14px" }}>
                <strong>
                  {rankings.filter((r) => r.status === "in_progress").length}
                </strong>{" "}
                sedang mengerjakan
              </div>
              <div style={{ fontSize: "14px" }}>
                <strong>{rankings.length}</strong> total kelompok
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <WifiOutlined
                  style={{
                    color: wsConnected
                      ? "#52c41a"
                      : wsConnecting
                      ? "#faad14"
                      : "#ff4d4f",
                  }}
                />
                <span style={{ fontSize: "12px", color: "#666" }}>
                  {wsConnected
                    ? "Real-time"
                    : wsConnecting
                    ? "Connecting..."
                    : "Offline"}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Error Alert */}
        {error && (
          <Alert
            message="Peringatan"
            description={error}
            type="warning"
            showIcon
            style={{ marginTop: 8 }}
            action={
              <Button size="small" onClick={() => connectWebSocket()}>
                Coba Lagi
              </Button>
            }
          />
        )}
      </div>

      {/* Loading States */}
      {initialLoading ? (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <Spin indicator={antIcon} />
          <p style={{ marginTop: 16, color: "#666" }}>
            Memuat data ranking real-time...
          </p>
        </div>
      ) : rankings.length === 0 && !loading ? (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <TrophyOutlined style={{ fontSize: 48, color: "#ccc" }} />
          <p style={{ marginTop: 16, color: "#666", fontSize: "16px" }}>
            Belum ada kelompok yang mengerjakan quiz ini
          </p>
        </div>
      ) : (
        <Table
          dataSource={rankings.map((item, idx) => ({
            ...item,
            key: item.group_id || idx,
            rank: idx + 1,
          }))}
          columns={columns}
          pagination={{
            pageSize: 10,
            showSizeChanger: false,
            style: { textAlign: "center" },
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} dari ${total} kelompok`,
          }}
          loading={loading || refreshing}
          style={{ width: "100%" }}
          className="ranking-table"
          scroll={{ x: 600 }}
          size="middle"
        />
      )}
    </Modal>
  );
};

export default QuizRankingModal;
