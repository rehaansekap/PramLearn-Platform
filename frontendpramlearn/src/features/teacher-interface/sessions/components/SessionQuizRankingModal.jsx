import React, { useEffect, useState } from "react";
import {
  Modal,
  Table,
  Typography,
  Tag,
  Space,
  Card,
  Row,
  Col,
  Statistic,
  Progress,
  Badge,
  Button,
  Tooltip,
  Alert,
  Spin,
  Avatar,
  List,
} from "antd";
import {
  TrophyOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  ReloadOutlined,
  WifiOutlined,
  DisconnectOutlined,
  UserOutlined,
  CheckCircleOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import useSessionQuizRanking from "../hooks/useSessionQuizRanking";
import moment from "moment";

const { Title, Text } = Typography;

const SessionQuizRankingModal = ({ open, onClose, quiz, materialSlug }) => {
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
      if (wsConnected) {
        refreshRanking();
      } else {
        await fetchRankingHttp();
      }
    } finally {
      setTimeout(() => setRefreshing(false), 1000);
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
        return "Belum Dimulai";
      default:
        return "Unknown";
    }
  };

  // Get rank icon
  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return "🥇";
      case 2:
        return "🥈";
      case 3:
        return "🥉";
      default:
        return "🏅";
    }
  };

  // Get rank color
  const getRankColor = (rank) => {
    switch (rank) {
      case 1:
        return "#faad14";
      case 2:
        return "#8c8c8c";
      case 3:
        return "#d4b106";
      default:
        return "#1890ff";
    }
  };

  // Calculate statistics
  const statistics = {
    totalGroups: rankings.length,
    completedGroups: rankings.filter((r) => r.status === "completed").length,
    inProgressGroups: rankings.filter((r) => r.status === "in_progress").length,
    notStartedGroups: rankings.filter((r) => r.status === "not_started").length,
    averageScore:
      rankings.length > 0
        ? (
            rankings.reduce((sum, r) => sum + r.score, 0) / rankings.length
          ).toFixed(1)
        : 0,
    highestScore:
      rankings.length > 0 ? Math.max(...rankings.map((r) => r.score)) : 0,
  };

  const columns = [
    {
      title: "Rank",
      dataIndex: "rank",
      key: "rank",
      render: (rank) => (
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 20, marginBottom: 4 }}>
            {getRankIcon(rank)}
          </div>
          <Text strong style={{ color: getRankColor(rank) }}>
            #{rank}
          </Text>
        </div>
      ),
      width: 80,
      align: "center",
    },
    {
      title: "Kelompok",
      key: "group",
      render: (_, record) => (
        <div>
          <Text strong style={{ display: "block" }}>
            {record.group_name}
          </Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.group_code}
          </Text>
          <div style={{ marginTop: 4 }}>
            <Space>
              <TeamOutlined style={{ color: "#1890ff" }} />
              <Text type="secondary">{record.member_count} anggota</Text>
            </Space>
          </div>
        </div>
      ),
      ellipsis: true,
    },
    {
      title: "Skor",
      dataIndex: "score",
      key: "score",
      render: (score, record) => (
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: 18,
              fontWeight: "bold",
              color: getRankColor(record.rank),
              marginBottom: 4,
            }}
          >
            {score.toFixed(1)}
          </div>
          <Progress
            percent={score}
            size="small"
            strokeColor={getRankColor(record.rank)}
            showInfo={false}
          />
          <Text type="secondary" style={{ fontSize: 11 }}>
            {record.correct_answers}/{record.total_questions} benar
          </Text>
        </div>
      ),
      width: 120,
      align: "center",
      sorter: (a, b) => b.score - a.score,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag
          color={getStatusColor(status)}
          icon={
            status === "completed" ? (
              <CheckCircleOutlined />
            ) : status === "in_progress" ? (
              <SyncOutlined spin />
            ) : (
              <ClockCircleOutlined />
            )
          }
        >
          {getStatusText(status)}
        </Tag>
      ),
      width: 140,
      align: "center",
      filters: [
        { text: "Selesai", value: "completed" },
        { text: "Sedang Mengerjakan", value: "in_progress" },
        { text: "Belum Dimulai", value: "not_started" },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "Waktu Submit",
      dataIndex: "submitted_at",
      key: "submitted_at",
      render: (submittedAt) =>
        submittedAt ? (
          <div style={{ textAlign: "center" }}>
            <div>{moment(submittedAt).format("DD/MM/YYYY")}</div>
            <Text type="secondary" style={{ fontSize: 11 }}>
              {moment(submittedAt).format("HH:mm")}
            </Text>
          </div>
        ) : (
          <Text type="secondary">-</Text>
        ),
      width: 120,
      align: "center",
      sorter: (a, b) => {
        if (!a.submitted_at && !b.submitted_at) return 0;
        if (!a.submitted_at) return 1;
        if (!b.submitted_at) return -1;
        return new Date(a.submitted_at) - new Date(b.submitted_at);
      },
    },
    {
      title: "Anggota",
      dataIndex: "member_names",
      key: "member_names",
      render: (memberNames) => (
        <Tooltip title={memberNames.join(", ")}>
          <div style={{ maxWidth: 150 }}>
            <Avatar.Group maxCount={3} size="small">
              {memberNames.slice(0, 3).map((name, index) => (
                <Avatar key={index} size="small" icon={<UserOutlined />} />
              ))}
            </Avatar.Group>
            {memberNames.length > 3 && (
              <Text type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>
                +{memberNames.length - 3} lainnya
              </Text>
            )}
          </div>
        </Tooltip>
      ),
      width: 180,
      responsive: ["lg"],
    },
  ];

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width="95%"
      style={{ maxWidth: 1400, top: 20 }}
      title={
        <div style={{ borderBottom: "2px solid #f0f0f0", paddingBottom: 16 }}>
          <Space>
            <TrophyOutlined style={{ color: "#faad14", fontSize: 24 }} />
            <Title level={3} style={{ margin: 0 }}>
              Ranking Quiz: {quiz?.title}
            </Title>
            <Badge
              status={wsConnected ? "processing" : "error"}
              text={
                <Text type="secondary">
                  {wsConnected ? "Real-time Connected" : "Offline Mode"}
                </Text>
              }
            />
            {materialId && (
              <Text type="secondary" style={{ fontSize: 12 }}>
                Material ID: {materialId}
              </Text>
            )}
          </Space>
        </div>
      }
      destroyOnClose
    >
      {/* Connection Status & Refresh */}
      <div style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col flex="1">
            <Space>
              {wsConnected ? (
                <Tag color="green" icon={<WifiOutlined />}>
                  Real-time Active
                </Tag>
              ) : (
                <Tag color="orange" icon={<DisconnectOutlined />}>
                  Manual Refresh
                </Tag>
              )}
              {lastUpdate && (
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Update terakhir: {moment(lastUpdate).format("HH:mm:ss")}
                </Text>
              )}
            </Space>
          </Col>
          <Col>
            <Button
              icon={<ReloadOutlined />}
              onClick={handleRefresh}
              loading={refreshing}
              size="small"
            >
              Refresh
            </Button>
          </Col>
        </Row>

        {error && (
          <Alert
            message="Koneksi Bermasalah"
            description={error}
            type="warning"
            showIcon
            style={{ marginTop: 8 }}
          />
        )}
      </div>

      {/* Statistics Cards */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="Total Kelompok"
              value={statistics.totalGroups}
              prefix={<TeamOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="Selesai"
              value={statistics.completedGroups}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="Rata-rata Skor"
              value={statistics.averageScore}
              suffix="%"
              prefix={<TrophyOutlined />}
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="Skor Tertinggi"
              value={statistics.highestScore}
              suffix="%"
              prefix={<TrophyOutlined />}
              valueStyle={{ color: "#f5222d" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Rankings Table */}
      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={rankings}
          rowKey="group_id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} dari ${total} kelompok`,
          }}
          scroll={{ x: 1000 }}
          size="small"
          rowClassName={(record) => {
            if (record.rank === 1) return "rank-first";
            if (record.rank === 2) return "rank-second";
            if (record.rank === 3) return "rank-third";
            return "";
          }}
        />
      </Spin>

      <style>{`
                .rank-first {
                  background-color: #fff7e6;
                  border-left: 4px solid #faad14;
                }
                .rank-second {
                  background-color: #f6f6f6;
                  border-left: 4px solid #8c8c8c;
                }
                .rank-third {
                  background-color: #fcf8e3;
                  border-left: 4px solid #d4b106;
                }
              `}</style>
    </Modal>
  );
};

export default SessionQuizRankingModal;
