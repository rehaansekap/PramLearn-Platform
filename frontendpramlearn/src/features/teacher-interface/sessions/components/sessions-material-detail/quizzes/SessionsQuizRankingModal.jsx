import React, { useState, useEffect } from "react";
import {
  Modal,
  Table,
  Avatar,
  Tag,
  Typography,
  Space,
  Spin,
  Card,
  Row,
  Col,
  Statistic,
  Progress,
  Button,
  Alert,
  Empty,
  Divider,
} from "antd";
import {
  TrophyOutlined,
  UserOutlined,
  ReloadOutlined,
  FireOutlined,
  StarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  LoadingOutlined,
  WifiOutlined,
  DisconnectOutlined,
  CrownOutlined,
} from "@ant-design/icons";
import useSessionQuizRanking from "../../../hooks/useSessionQuizRanking";
import moment from "moment";

const { Title, Text } = Typography;

const SessionsQuizRankingModal = ({
  open,
  onClose,
  quiz,
  materialSlug,
  isMobile = false,
}) => {
  const {
    rankings,
    loading,
    wsConnected,
    error,
    lastUpdate,
    materialId,
    refreshRanking,
    fetchRankingHttp,
  } = useSessionQuizRanking(materialSlug, quiz?.id);

  const [refreshing, setRefreshing] = useState(false);

  // Manual refresh with loading indicator
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshRanking();
    } catch (error) {
      console.error("Error refreshing ranking:", error);
    } finally {
      setRefreshing(false);
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "success";
      case "in_progress":
        return "processing";
      case "not_started":
        return "default";
      default:
        return "default";
    }
  };

  // Get status text
  const getStatusText = (status) => {
    switch (status) {
      case "completed":
        return "Selesai";
      case "in_progress":
        return "Sedang Mengerjakan";
      case "not_started":
        return "Belum Mulai";
      default:
        return "Unknown";
    }
  };

  // Get rank icon
  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <CrownOutlined style={{ color: "#faad14", fontSize: 20 }} />;
      case 2:
        return <StarOutlined style={{ color: "#d9d9d9", fontSize: 18 }} />;
      case 3:
        return <StarOutlined style={{ color: "#cd7f32", fontSize: 18 }} />;
      default:
        return (
          <span style={{ fontWeight: "bold", color: "#666" }}>#{rank}</span>
        );
    }
  };

  // Get rank color
  const getRankColor = (rank) => {
    switch (rank) {
      case 1:
        return "#faad14";
      case 2:
        return "#d9d9d9";
      case 3:
        return "#cd7f32";
      default:
        return "#666";
    }
  };

  // Calculate statistics
  const getStatistics = () => {
    if (!rankings || rankings.length === 0) {
      return {
        totalParticipants: 0,
        completedCount: 0,
        averageScore: 0,
        averageTimeSpent: 0,
        completionRate: 0,
      };
    }

    const completed = rankings.filter((r) => r.status === "completed");
    const totalScore = completed.reduce((sum, r) => sum + (r.score || 0), 0);
    const totalTime = completed.reduce(
      (sum, r) => sum + (r.time_spent || 0),
      0
    );

    return {
      totalParticipants: rankings.length,
      completedCount: completed.length,
      averageScore:
        completed.length > 0 ? (totalScore / completed.length).toFixed(1) : 0,
      averageTimeSpent:
        completed.length > 0 ? Math.round(totalTime / completed.length) : 0,
      completionRate:
        rankings.length > 0
          ? ((completed.length / rankings.length) * 100).toFixed(1)
          : 0,
    };
  };

  const statistics = getStatistics();

  const columns = [
    {
      title: "Peringkat",
      key: "rank",
      render: (_, record, index) => (
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              background:
                index === 0
                  ? "linear-gradient(135deg, #faad14 0%, #ffc53d 100%)"
                  : index === 1
                  ? "linear-gradient(135deg, #d9d9d9 0%, #bfbfbf 100%)"
                  : index === 2
                  ? "linear-gradient(135deg, #cd7f32 0%, #daa520 100%)"
                  : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              borderRadius: "50%",
              width: isMobile ? 32 : 40,
              height: isMobile ? 32 : 40,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: "bold",
              fontSize: isMobile ? 12 : 14,
              margin: "0 auto",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            }}
          >
            {index + 1}
          </div>
          {index < 3 && (
            <div style={{ marginTop: 4 }}>{getRankIcon(index + 1)}</div>
          )}
        </div>
      ),
      width: isMobile ? 60 : 80,
      align: "center",
    },
    {
      title: "Kelompok",
      key: "group",
      render: (_, record) => (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Avatar
            size={isMobile ? 32 : 40}
            style={{
              background:
                record.status === "completed"
                  ? "linear-gradient(135deg, #52c41a 0%, #73d13d 100%)"
                  : record.status === "in_progress"
                  ? "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)"
                  : "linear-gradient(135deg, #d9d9d9 0%, #bfbfbf 100%)",
              border: "2px solid white",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          >
            {record.group_name?.charAt(0)?.toUpperCase()}
          </Avatar>
          <div style={{ minWidth: 0, flex: 1 }}>
            <Text
              strong
              style={{
                fontSize: isMobile ? 12 : 14,
                color: "#262626",
                display: "block",
              }}
            >
              {record.group_name}
            </Text>
            <Text
              type="secondary"
              style={{
                fontSize: isMobile ? 10 : 11,
                display: "block",
              }}
            >
              {record.group_code}
            </Text>
            <div style={{ marginTop: 2 }}>
              <Tag
                color={getStatusColor(record.status)}
                size="small"
                style={{ fontSize: 9 }}
              >
                {getStatusText(record.status)}
              </Tag>
            </div>
          </div>
        </div>
      ),
      width: isMobile ? 120 : 160,
    },
    {
      title: "Skor",
      key: "score",
      render: (_, record) => (
        <div style={{ textAlign: "center" }}>
          {record.status === "completed" ? (
            <div>
              <div
                style={{
                  fontSize: isMobile ? 18 : 24,
                  fontWeight: "bold",
                  color:
                    record.score >= 80
                      ? "#52c41a"
                      : record.score >= 60
                      ? "#faad14"
                      : "#ff4d4f",
                  marginBottom: 4,
                }}
              >
                {Math.round(record.score)}
              </div>
              <Progress
                percent={record.score}
                size="small"
                strokeColor={
                  record.score >= 80
                    ? "#52c41a"
                    : record.score >= 60
                    ? "#faad14"
                    : "#ff4d4f"
                }
                showInfo={false}
                strokeWidth={6}
              />
            </div>
          ) : (
            <Text type="secondary">-</Text>
          )}
        </div>
      ),
      width: isMobile ? 80 : 100,
      align: "center",
    },
    // {
    //   title: "Waktu",
    //   key: "time",
    //   render: (_, record) => (
    //     <div style={{ textAlign: "center" }}>
    //       {record.status === "completed" && record.time_spent ? (
    //         <div>
    //           <div
    //             style={{
    //               fontSize: isMobile ? 12 : 14,
    //               fontWeight: "600",
    //               color: "#1890ff",
    //               marginBottom: 2,
    //             }}
    //           >
    //             {Math.floor(record.time_spent / 60)}:
    //             {(record.time_spent % 60).toString().padStart(2, "0")}
    //           </div>
    //           <Text type="secondary" style={{ fontSize: 10 }}>
    //             <ClockCircleOutlined /> menit
    //           </Text>
    //         </div>
    //       ) : record.status === "in_progress" ? (
    //         <div>
    //           <LoadingOutlined style={{ color: "#1890ff", fontSize: 16 }} />
    //           <div style={{ fontSize: 10, color: "#1890ff" }}>
    //             Sedang mengerjakan
    //           </div>
    //         </div>
    //       ) : (
    //         <Text type="secondary">-</Text>
    //       )}
    //     </div>
    //   ),
    //   width: isMobile ? 70 : 90,
    //   align: "center",
    //   responsive: ["sm"],
    // },
    {
      title: "Completed",
      key: "completed_at",
      render: (_, record) => (
        <div style={{ textAlign: "center" }}>
          {record.completed_at ? (
            <div>
              <Text style={{ fontSize: isMobile ? 10 : 11 }}>
                {moment(record.completed_at).format("DD/MM HH:mm")}
              </Text>
              <div style={{ fontSize: 9, color: "#999", marginTop: 2 }}>
                {moment(record.completed_at).fromNow()}
              </div>
            </div>
          ) : (
            <Text type="secondary">-</Text>
          )}
        </div>
      ),
      width: isMobile ? 80 : 100,
      align: "center",
      responsive: ["md"],
    },
  ];

  if (!quiz) return null;

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={isMobile ? "95%" : "90%"}
      style={{ maxWidth: 1000 }}
      centered
      destroyOnClose
      title={
        <div
          style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            margin: "-24px -24px 0",
            padding: "20px 24px",
            borderRadius: "8px 8px 0 0",
            color: "white",
            alignItems: "center",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div>
              <Title level={4} style={{ margin: 0, color: "white" }}>
                🏆 Ranking Quiz
              </Title>
              <Text style={{ color: "rgba(255,255,255,0.9)", fontSize: 14 }}>
                {quiz.title}
              </Text>
            </div>
          </div>
        </div>
      }
    >
      <div style={{ padding: "20px 0" }}>
        {/* Connection Status */}
        <div style={{ marginBottom: 20 }}>
          <Alert
            message={
              <Space>
                {wsConnected ? (
                  <>
                    <WifiOutlined style={{ color: "#52c41a" }} />
                    <Text>Real-time aktif</Text>
                  </>
                ) : (
                  <>
                    <DisconnectOutlined style={{ color: "#ff4d4f" }} />
                    <Text>Koneksi terputus</Text>
                  </>
                )}
                {lastUpdate && (
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    • Update terakhir: {moment(lastUpdate).format("HH:mm:ss")}
                  </Text>
                )}
              </Space>
            }
            type={wsConnected ? "success" : "warning"}
            showIcon={false}
            style={{ borderRadius: 8 }}
            action={
              <Button
                type="text"
                icon={<ReloadOutlined />}
                onClick={handleRefresh}
                loading={refreshing}
                size="small"
                style={{ borderRadius: 6 }}
              >
                Refresh
              </Button>
            }
          />
        </div>

        {/* Statistics Cards */}
        <Row gutter={[12, 12]} style={{ marginBottom: 24 }}>
          <Col xs={8} sm={6}>
            <Card
              size="small"
              style={{ textAlign: "center", borderRadius: 12 }}
            >
              <Statistic
                title="Peserta"
                value={statistics.totalParticipants}
                prefix={<UserOutlined style={{ color: "#1890ff" }} />}
                valueStyle={{ color: "#1890ff", fontSize: isMobile ? 16 : 20 }}
                titleStyle={{ fontSize: isMobile ? 10 : 12 }}
              />
            </Card>
          </Col>
          <Col xs={8} sm={6}>
            <Card
              size="small"
              style={{ textAlign: "center", borderRadius: 12 }}
            >
              <Statistic
                title="Selesai"
                value={statistics.completedCount}
                prefix={<CheckCircleOutlined style={{ color: "#52c41a" }} />}
                valueStyle={{ color: "#52c41a", fontSize: isMobile ? 16 : 20 }}
                titleStyle={{ fontSize: isMobile ? 10 : 12 }}
              />
            </Card>
          </Col>
          <Col xs={8} sm={6}>
            <Card
              size="small"
              style={{ textAlign: "center", borderRadius: 12 }}
            >
              <Statistic
                title="Rata-rata"
                value={statistics.averageScore}
                suffix="%"
                prefix={<StarOutlined style={{ color: "#faad14" }} />}
                valueStyle={{ color: "#faad14", fontSize: isMobile ? 16 : 20 }}
                titleStyle={{ fontSize: isMobile ? 10 : 12 }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card
              size="small"
              style={{ textAlign: "center", borderRadius: 12 }}
            >
              <Statistic
                title="Completion"
                value={statistics.completionRate}
                suffix="%"
                prefix={<FireOutlined style={{ color: "#722ed1" }} />}
                valueStyle={{ color: "#722ed1", fontSize: isMobile ? 16 : 20 }}
                titleStyle={{ fontSize: isMobile ? 10 : 12 }}
              />
            </Card>
          </Col>
        </Row>

        {/* Rankings Table */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <Spin size="large" />
            <p style={{ marginTop: 16, color: "#666" }}>
              Memuat data ranking...
            </p>
          </div>
        ) : error ? (
          <Alert
            message="Error"
            description="Gagal memuat data ranking. Silakan coba lagi."
            type="error"
            showIcon
            style={{ borderRadius: 8 }}
            action={
              <Button
                type="primary"
                danger
                onClick={handleRefresh}
                icon={<ReloadOutlined />}
                style={{ borderRadius: 6 }}
              >
                Coba Lagi
              </Button>
            }
          />
        ) : rankings && rankings.length > 0 ? (
          <Card
            style={{
              borderRadius: 16,
              border: "none",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            }}
            bodyStyle={{ padding: 0 }}
          >
            <Table
              dataSource={rankings.map((ranking, index) => ({
                ...ranking,
                key: ranking.group_id || index,
              }))}
              columns={columns}
              pagination={false}
              scroll={{ x: isMobile ? 500 : undefined }}
              size={isMobile ? "small" : "middle"}
            />
          </Card>
        ) : (
          <Card
            style={{
              textAlign: "center",
              padding: "40px 20px",
              borderRadius: 16,
            }}
          >
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <div>
                  <Text style={{ fontSize: 16, color: "#666" }}>
                    Belum ada data ranking
                  </Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: 14 }}>
                    Kelompok belum mulai mengerjakan quiz
                  </Text>
                </div>
              }
            />
          </Card>
        )}
      </div>
    </Modal>
  );
};

export default SessionsQuizRankingModal;
