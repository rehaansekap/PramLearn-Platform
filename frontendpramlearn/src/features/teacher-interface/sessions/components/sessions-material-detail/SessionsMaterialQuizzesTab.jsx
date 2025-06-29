import React, { useState, useEffect } from "react";
import {
  Card,
  Typography,
  Space,
  Button,
  Table,
  Tag,
  Progress,
  Row,
  Col,
  Statistic,
  message,
  Tooltip,
  Dropdown,
  Menu,
  Empty,
  Alert,
  Spin,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  TrophyOutlined,
  TeamOutlined,
  BarChartOutlined,
  MoreOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  QuestionCircleOutlined,
  StopOutlined,
} from "@ant-design/icons";
import useSessionQuizManagement from "../../hooks/useSessionQuizManagement";
import SessionsQuizModal from "./SessionsQuizModal";
import SessionsQuizRankingModal from "./SessionsQuizRankingModal";
import SessionsQuizResultsModal from "./SessionsQuizResultsModal";
import moment from "moment";

const { Title, Text } = Typography;

const SessionsMaterialQuizzesTab = ({ materialSlug, quizzes, groups }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isQuizModalVisible, setIsQuizModalVisible] = useState(false);
  const [isRankingModalVisible, setIsRankingModalVisible] = useState(false);
  const [isResultsModalVisible, setIsResultsModalVisible] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [editingQuiz, setEditingQuiz] = useState(null);

  const {
    quizzes: managedQuizzes,
    groups: managedGroups,
    statistics,
    loading,
    error,
    actionLoading,
    createQuiz,
    updateQuiz,
    deleteQuiz,
    updateQuizStatus,
    assignQuizToGroups,
    getQuizDetail,
    getQuizRanking,
    refetch,
  } = useSessionQuizManagement(materialSlug);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Handle create quiz
  const handleAddQuiz = () => {
    setEditingQuiz(null);
    setIsQuizModalVisible(true);
  };

  // Handle edit quiz
  const handleEditQuiz = (quiz) => {
    setEditingQuiz(quiz);
    setIsQuizModalVisible(true);
  };

  // Handle delete quiz
  const handleDeleteQuiz = async (quiz) => {
    await deleteQuiz(quiz);
  };

  // Handle view ranking
  const handleViewRanking = (quiz) => {
    setSelectedQuiz(quiz);
    setIsRankingModalVisible(true);
  };

  // Handle view results
  const handleViewResults = (quiz) => {
    setSelectedQuiz(quiz);
    setIsResultsModalVisible(true);
  };

  // Handle status change
  const handleStatusChange = async (quizId, isActive) => {
    try {
      console.log(
        `🔄 Changing quiz ${quizId} status to ${
          isActive ? "active" : "inactive"
        }`
      );
      await updateQuizStatus(quizId, isActive);
      console.log(`✅ Quiz ${quizId} status changed successfully`);
    } catch (error) {
      console.error("❌ Failed to update quiz status:", error);
      message.error("Gagal mengubah status quiz");
    }
  };

  // Handle quiz submission
  const handleQuizSubmit = async (quizData, quizId = null) => {
    try {
      if (quizId) {
        await updateQuiz(quizId, quizData);
      } else {
        await createQuiz(quizData);
      }
      setIsQuizModalVisible(false);
    } catch (error) {
      console.error("Error submitting quiz:", error);
    }
  };

  // Get status color
  const getStatusColor = (quiz) => {
    if (quiz.assigned_groups_count === 0) return "default";
    if (quiz.completion_rate === 100) return "success";
    if (quiz.completion_rate > 0) return "processing";
    return "warning";
  };

  // Get status text
  const getStatusText = (quiz) => {
    if (quiz.assigned_groups_count === 0) return "Belum Ditugaskan";
    if (quiz.completion_rate === 100) return "Selesai";
    if (quiz.completion_rate > 0) return "Sedang Berlangsung";
    return "Belum Dimulai";
  };

  // Get status icon
  const getStatusIcon = (quiz) => {
    if (quiz.assigned_groups_count === 0) return <QuestionCircleOutlined />;
    if (quiz.completion_rate === 100) return <CheckCircleOutlined />;
    if (quiz.completion_rate > 0) return <SyncOutlined spin />;
    return <PlayCircleOutlined />;
  };

  // Action menu for each quiz
  const getActionMenu = (quiz) => (
    <Menu>
      <Menu.Item
        key="edit"
        icon={<EditOutlined />}
        onClick={() => handleEditQuiz(quiz)}
      >
        Edit Quiz
      </Menu.Item>
      <Menu.Item
        key="ranking"
        icon={<TrophyOutlined />}
        onClick={() => handleViewRanking(quiz)}
        disabled={quiz.assigned_groups_count === 0}
      >
        Lihat Ranking
      </Menu.Item>
      <Menu.Item
        key="results"
        icon={<BarChartOutlined />}
        onClick={() => handleViewResults(quiz)}
        disabled={quiz.completed_submissions === 0}
      >
        Lihat Hasil
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item
        key="delete"
        icon={<DeleteOutlined />}
        onClick={() => handleDeleteQuiz(quiz)}
        danger
      >
        Hapus Quiz
      </Menu.Item>
    </Menu>
  );

  // Table columns
  const columns = [
    {
      title: "Quiz",
      key: "quiz",
      render: (_, record) => (
        <div>
          <Text strong style={{ display: "block", fontSize: 16 }}>
            {record.title}
          </Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.content}
          </Text>
          <div style={{ marginTop: 8 }}>
            <Space size={4}>
              <Tag color="blue">{record.question_count} soal</Tag>
              <Tag color="green">Kelompok</Tag>
              <Text type="secondary" style={{ fontSize: 11 }}>
                {moment(record.created_at).format("DD/MM/YYYY HH:mm")}
              </Text>
            </Space>
          </div>
        </div>
      ),
      ellipsis: true,
    },
    {
      title: "Assignment",
      key: "assignment",
      render: (_, record) => (
        <div style={{ textAlign: "center" }}>
          <div style={{ marginBottom: 8 }}>
            <Text strong style={{ fontSize: 16 }}>
              {record.assigned_groups_count}
            </Text>
            <Text type="secondary" style={{ display: "block", fontSize: 12 }}>
              kelompok
            </Text>
          </div>
          {record.assigned_groups_count > 0 && (
            <Tag color="blue" size="small">
              <TeamOutlined /> Ditugaskan
            </Tag>
          )}
        </div>
      ),
      width: 120,
      align: "center",
    },
    {
      title: "Progress",
      key: "progress",
      render: (_, record) => (
        <div style={{ textAlign: "center" }}>
          <Progress
            type="circle"
            percent={record.completion_rate}
            width={60}
            strokeColor={
              record.completion_rate === 100
                ? "#52c41a"
                : record.completion_rate > 0
                ? "#1890ff"
                : "#d9d9d9"
            }
          />
          <div style={{ marginTop: 8 }}>
            <Text style={{ fontSize: 12 }}>
              {record.completed_submissions}/{record.total_submissions}
            </Text>
          </div>
        </div>
      ),
      width: 100,
      align: "center",
    },
    {
      title: "Skor",
      key: "score",
      render: (_, record) => (
        <div style={{ textAlign: "center" }}>
          {record.completed_submissions > 0 ? (
            <>
              <div style={{ marginBottom: 4 }}>
                <Text strong style={{ fontSize: 16, color: "#faad14" }}>
                  {record.average_score}
                </Text>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  %
                </Text>
              </div>
              <div style={{ fontSize: 11, color: "#666" }}>
                <div>Max: {record.highest_score}%</div>
                <div>Min: {record.lowest_score}%</div>
              </div>
            </>
          ) : (
            <Text type="secondary">-</Text>
          )}
        </div>
      ),
      width: 100,
      align: "center",
    },
    {
      title: "Status",
      key: "status",
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              {
                key: "active",
                label: (
                  <Space>
                    <CheckCircleOutlined style={{ color: "#52c41a" }} />
                    Aktif
                  </Space>
                ),
                onClick: () => {
                  console.log(`🎯 Setting quiz ${record.id} to active`);
                  handleStatusChange(record.id, true);
                },
              },
              {
                key: "inactive",
                label: (
                  <Space>
                    <StopOutlined style={{ color: "#ff4d4f" }} />
                    Non-Aktif
                  </Space>
                ),
                onClick: () => {
                  console.log(`🎯 Setting quiz ${record.id} to inactive`);
                  handleStatusChange(record.id, false);
                },
              },
            ],
          }}
          trigger={["click"]}
        >
          <Tag
            color={record.is_active ? "success" : "error"}
            style={{ cursor: "pointer" }}
          >
            {record.is_active ? (
              <Space>
                <CheckCircleOutlined />
                Aktif
              </Space>
            ) : (
              <Space>
                <StopOutlined />
                Non-Aktif
              </Space>
            )}
          </Tag>
        </Dropdown>
      ),
      width: 100,
      align: "center",
    },
    {
      title: "Aksi",
      key: "actions",
      render: (_, record) => (
        <div style={{ textAlign: "center" }}>
          <Space size="small">
            {!isMobile && (
              <>
                <Tooltip title="Edit Quiz">
                  <Button
                    type="text"
                    icon={<EditOutlined />}
                    onClick={() => handleEditQuiz(record)}
                    loading={actionLoading[`updating_${record.id}`]}
                  />
                </Tooltip>
                <Tooltip title="Lihat Ranking">
                  <Button
                    type="text"
                    icon={<TrophyOutlined />}
                    onClick={() => handleViewRanking(record)}
                    disabled={record.assigned_groups_count === 0}
                  />
                </Tooltip>
                <Tooltip title="Lihat Hasil">
                  <Button
                    type="text"
                    icon={<BarChartOutlined />}
                    onClick={() => handleViewResults(record)}
                    disabled={record.completed_submissions === 0}
                  />
                </Tooltip>
              </>
            )}
            <Dropdown
              overlay={getActionMenu(record)}
              trigger={["click"]}
              placement="bottomRight"
            >
              <Button
                type="text"
                icon={<MoreOutlined />}
                loading={actionLoading[`deleting_${record.id}`]}
              />
            </Dropdown>
          </Space>
        </div>
      ),
      width: isMobile ? 80 : 160,
      align: "center",
    },
  ];

  return (
    <div>
      {/* Header Section */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ marginBottom: 24, textAlign: "center" }}>
          <QuestionCircleOutlined
            style={{
              fontSize: isMobile ? 24 : 32,
              color: "#11418b",
              marginBottom: isMobile ? 8 : 12,
            }}
          />
          <Title
            level={isMobile ? 5 : 4}
            style={{
              marginBottom: 8,
              fontSize: isMobile ? "16px" : "20px",
              fontWeight: 700,
              color: "#11418b",
            }}
          >
            Manajemen Quiz
          </Title>
          <Text
            type="secondary"
            style={{
              fontSize: isMobile ? "12px" : "14px",
              color: "#666",
            }}
          >
            Kelola quiz kelompok dan pantau progres pengerjaan quiz siswa
          </Text>
          <div style={{ marginTop: 16 }}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddQuiz}
              size={isMobile ? "small" : "middle"}
              loading={actionLoading.creating}
            >
              {isMobile ? "Buat" : "Buat Quiz"}
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <Row gutter={16}>
          <Col xs={12} sm={6}>
            <Card size="small">
              <Statistic
                title="Total Quiz"
                value={statistics.total_quizzes || 0}
                prefix={<QuestionCircleOutlined />}
                valueStyle={{ color: "#1890ff" }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small">
              <Statistic
                title="Total Kelompok"
                value={statistics.total_groups || 0}
                prefix={<TeamOutlined />}
                valueStyle={{ color: "#52c41a" }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small">
              <Statistic
                title="Ditugaskan"
                value={statistics.total_assigned_groups || 0}
                prefix={<PlayCircleOutlined />}
                valueStyle={{ color: "#faad14" }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small">
              <Statistic
                title="Completion Rate"
                value={statistics.overall_completion_rate || 0}
                suffix="%"
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: "#f5222d" }}
              />
            </Card>
          </Col>
        </Row>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert
          message="Error"
          description="Gagal memuat data quiz. Silakan refresh halaman."
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
          action={
            <Button size="small" onClick={refetch}>
              Refresh
            </Button>
          }
        />
      )}

      {/* Quiz Table */}
      <Card>
        <Spin spinning={loading}>
          {managedQuizzes.length === 0 && !loading ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <div>
                  <Text type="secondary">Belum ada quiz yang dibuat</Text>
                  <br />
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleAddQuiz}
                    style={{ marginTop: 16 }}
                  >
                    Buat Quiz Pertama
                  </Button>
                </div>
              }
            />
          ) : (
            <Table
              columns={columns}
              dataSource={managedQuizzes}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} dari ${total} quiz`,
              }}
              scroll={{ x: 800 }}
              size="small"
            />
          )}
        </Spin>
      </Card>

      {/* Modals */}
      <SessionsQuizModal
        open={isQuizModalVisible}
        onClose={() => setIsQuizModalVisible(false)}
        onSubmit={handleQuizSubmit}
        editingQuiz={editingQuiz}
        groups={managedGroups}
        loading={
          actionLoading.creating || actionLoading[`updating_${editingQuiz?.id}`]
        }
        materialSlug={materialSlug}
      />

      <SessionsQuizRankingModal
        open={isRankingModalVisible}
        onClose={() => setIsRankingModalVisible(false)}
        quiz={selectedQuiz}
        materialSlug={materialSlug}
      />

      <SessionsQuizResultsModal
        open={isResultsModalVisible}
        onClose={() => setIsResultsModalVisible(false)}
        quiz={selectedQuiz}
        materialSlug={materialSlug}
        onGetQuizDetail={getQuizDetail}
      />
    </div>
  );
};

export default SessionsMaterialQuizzesTab;
