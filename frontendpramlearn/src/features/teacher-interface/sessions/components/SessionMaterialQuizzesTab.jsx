import React, { useState, useEffect } from "react";
import {
  Table,
  Card,
  Typography,
  Space,
  Button,
  Tag,
  Modal,
  Spin,
  Empty,
  Row,
  Col,
  Statistic,
  message,
} from "antd";
import {
  QuestionCircleOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  BarChartOutlined,
  ReloadOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import SessionQuizModal from "./SessionQuizModal";
import SessionQuizResultsModal from "./SessionQuizResultsModal";
import Swal from "sweetalert2";

const { Title, Text } = Typography;

const SessionMaterialQuizzesTab = ({ materialSlug, quizzes, groups }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isQuizModalVisible, setIsQuizModalVisible] = useState(false);
  const [isResultsModalVisible, setIsResultsModalVisible] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleAddQuiz = () => {
    setEditingQuiz(null);
    setIsQuizModalVisible(true);
  };

  const handleEditQuiz = async (quiz) => {
    const editKey = `edit_${quiz.id}`;
    setActionLoading((prev) => ({ ...prev, [editKey]: true }));

    try {
      setEditingQuiz(quiz);
      setIsQuizModalVisible(true);
    } catch (error) {
      message.error("Gagal memuat data quiz");
    } finally {
      setActionLoading((prev) => ({ ...prev, [editKey]: false }));
    }
  };

  const handleDeleteQuiz = async (quiz) => {
    const result = await Swal.fire({
      title: "Yakin ingin menghapus quiz ini?",
      text: `Quiz "${quiz.title}" akan dihapus secara permanen!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      const deleteKey = `delete_${quiz.id}`;
      setActionLoading((prev) => ({ ...prev, [deleteKey]: true }));

      try {
        // API call to delete quiz
        message.success(`Quiz "${quiz.title}" berhasil dihapus`);
        // Refresh data
      } catch (error) {
        console.error("Error deleting quiz:", error);
        message.error("Gagal menghapus quiz");
      } finally {
        setActionLoading((prev) => ({ ...prev, [deleteKey]: false }));
      }
    }
  };

  const handleViewResults = (quiz) => {
    setSelectedQuiz(quiz);
    setIsResultsModalVisible(true);
  };

  const getQuizStatistics = () => {
    const totalQuizzes = quizzes?.length || 0;
    const assignedQuizzes =
      quizzes?.filter((q) => q.assigned_groups > 0).length || 0;
    const totalAssignments =
      quizzes?.reduce((sum, q) => sum + (q.assigned_groups || 0), 0) || 0;
    const completedSubmissions =
      quizzes?.reduce((sum, q) => sum + (q.completed_submissions || 0), 0) || 0;

    return {
      totalQuizzes,
      assignedQuizzes,
      totalAssignments,
      completedSubmissions,
    };
  };

  const statistics = getQuizStatistics();

  const columns = [
    {
      title: "No",
      key: "no",
      render: (_, __, index) => index + 1,
      width: 60,
      align: "center",
    },
    {
      title: "Judul Quiz",
      dataIndex: "title",
      key: "title",
      render: (title, record) => (
        <div>
          <Text strong style={{ display: "block" }}>
            {title}
          </Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.content || "Tidak ada deskripsi"}
          </Text>
        </div>
      ),
      ellipsis: true,
    },
    {
      title: "Jumlah Soal",
      key: "question_count",
      render: (_, record) => (
        <Tag color="blue">{record.question_count || 0} Soal</Tag>
      ),
      width: 120,
      align: "center",
    },
    {
      title: "Kelompok Assigned",
      key: "assigned_groups",
      render: (_, record) => (
        <Tag color="green">{record.assigned_groups || 0} Kelompok</Tag>
      ),
      width: 140,
      align: "center",
      responsive: ["md"],
    },
    {
      title: "Submissions",
      key: "submissions",
      render: (_, record) => (
        <Tag color="orange">{record.completed_submissions || 0} Selesai</Tag>
      ),
      width: 120,
      align: "center",
      responsive: ["lg"],
    },
    {
      title: "Tanggal Dibuat",
      dataIndex: "created_at",
      key: "created_at",
      render: (date) =>
        date ? new Date(date).toLocaleDateString("id-ID") : "-",
      width: 120,
      responsive: ["lg"],
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="small">
          <Button
            icon={<BarChartOutlined />}
            size="small"
            onClick={() => handleViewResults(record)}
            style={{ backgroundColor: "#1890ff", color: "#fff" }}
          >
            {!isMobile && "Hasil"}
          </Button>
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEditQuiz(record)}
            loading={actionLoading[`edit_${record.id}`]}
            style={{ backgroundColor: "#52c41a", color: "#fff" }}
          >
            {!isMobile && "Edit"}
          </Button>
          <Button
            icon={<DeleteOutlined />}
            size="small"
            danger
            onClick={() => handleDeleteQuiz(record)}
            loading={actionLoading[`delete_${record.id}`]}
          >
            {!isMobile && "Hapus"}
          </Button>
        </Space>
      ),
      width: isMobile ? 120 : 200,
      fixed: "right",
    },
  ];

  const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "40px 0" }}>
        <Spin indicator={antIcon} />
        <p style={{ marginTop: 16, color: "#666" }}>Memuat data quiz...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={16}>
            <Space direction="vertical" size="small">
              <Title level={4} style={{ margin: 0, color: "#11418b" }}>
                <QuestionCircleOutlined style={{ marginRight: 8 }} />
                Manajemen Quiz
              </Title>
              <Text type="secondary">
                Kelola quiz dan pantau hasil pengerjaan kelompok
              </Text>
            </Space>
          </Col>
          <Col xs={24} lg={8}>
            <div style={{ textAlign: isMobile ? "center" : "right" }}>
              <Space>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={() => window.location.reload()}
                  style={{ borderRadius: 8 }}
                >
                  Refresh
                </Button>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleAddQuiz}
                  style={{ backgroundColor: "#11418b", borderRadius: 8 }}
                  disabled={!groups || groups.length === 0}
                >
                  Tambah Quiz
                </Button>
              </Space>
            </div>
          </Col>
        </Row>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card size="small" style={{ borderRadius: 8 }}>
            <Statistic
              title="Total Quiz"
              value={statistics.totalQuizzes}
              prefix={<QuestionCircleOutlined style={{ color: "#1677ff" }} />}
              valueStyle={{ color: "#1677ff", fontSize: 18 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" style={{ borderRadius: 8 }}>
            <Statistic
              title="Quiz Aktif"
              value={statistics.assignedQuizzes}
              prefix={<QuestionCircleOutlined style={{ color: "#52c41a" }} />}
              valueStyle={{ color: "#52c41a", fontSize: 18 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" style={{ borderRadius: 8 }}>
            <Statistic
              title="Total Assignment"
              value={statistics.totalAssignments}
              prefix={<QuestionCircleOutlined style={{ color: "#faad14" }} />}
              valueStyle={{ color: "#faad14", fontSize: 18 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" style={{ borderRadius: 8 }}>
            <Statistic
              title="Submissions"
              value={statistics.completedSubmissions}
              prefix={<QuestionCircleOutlined style={{ color: "#722ed1" }} />}
              valueStyle={{ color: "#722ed1", fontSize: 18 }}
            />
          </Card>
        </Col>
      </Row>

      {/* Warning if no groups */}
      {(!groups || groups.length === 0) && (
        <Card style={{ borderRadius: 12, marginBottom: 24 }}>
          <Empty
            description="Belum ada kelompok untuk assign quiz"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            style={{ padding: "40px 0" }}
          >
            <Text type="secondary">
              Buat kelompok terlebih dahulu sebelum membuat quiz
            </Text>
          </Empty>
        </Card>
      )}

      {/* Quizzes Table */}
      <Card style={{ borderRadius: 12 }} bodyStyle={{ padding: "24px" }}>
        {quizzes && quizzes.length > 0 ? (
          <Table
            dataSource={quizzes.map((quiz) => ({
              ...quiz,
              key: quiz.id,
            }))}
            columns={columns}
            pagination={{
              pageSize: 10,
              showSizeChanger: false,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} dari ${total} quiz`,
              style: { textAlign: "center" },
            }}
            className="session-quizzes-table"
            style={{ width: "100%" }}
            scroll={{ x: isMobile ? 900 : undefined }}
            size="middle"
          />
        ) : (
          <Empty
            description="Belum ada quiz dibuat"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            style={{ padding: "40px 0" }}
          >
            {groups && groups.length > 0 && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAddQuiz}
                style={{ backgroundColor: "#11418b" }}
              >
                Buat Quiz Pertama
              </Button>
            )}
          </Empty>
        )}
      </Card>

      {/* Modals */}
      <SessionQuizModal
        open={isQuizModalVisible}
        onClose={() => {
          setIsQuizModalVisible(false);
          setEditingQuiz(null);
        }}
        materialSlug={materialSlug}
        groups={groups}
        editingQuiz={editingQuiz}
        onSuccess={() => {
          setIsQuizModalVisible(false);
          setEditingQuiz(null);
          // Refresh data
        }}
      />

      <SessionQuizResultsModal
        open={isResultsModalVisible}
        onClose={() => {
          setIsResultsModalVisible(false);
          setSelectedQuiz(null);
        }}
        quiz={selectedQuiz}
        groups={groups}
      />
    </div>
  );
};

export default SessionMaterialQuizzesTab;
