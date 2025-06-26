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
  Progress,
} from "antd";
import {
  FileTextOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ReloadOutlined,
  LoadingOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import SessionAssignmentModal from "./SessionAssignmentModal";
import SessionAssignmentDetailModal from "./SessionAssignmentDetailModal";
import Swal from "sweetalert2";
import dayjs from "dayjs";

const { Title, Text } = Typography;

const SessionMaterialAssignmentsTab = ({
  materialSlug,
  assignments,
  students,
}) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isAssignmentModalVisible, setIsAssignmentModalVisible] =
    useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleAddAssignment = () => {
    setEditingAssignment(null);
    setIsAssignmentModalVisible(true);
  };

  const handleEditAssignment = async (assignment) => {
    const editKey = `edit_${assignment.id}`;
    setActionLoading((prev) => ({ ...prev, [editKey]: true }));

    try {
      setEditingAssignment(assignment);
      setIsAssignmentModalVisible(true);
    } catch (error) {
      message.error("Gagal memuat data tugas");
    } finally {
      setActionLoading((prev) => ({ ...prev, [editKey]: false }));
    }
  };

  const handleDeleteAssignment = async (assignment) => {
    const result = await Swal.fire({
      title: "Yakin ingin menghapus tugas ini?",
      text: `Tugas "${assignment.title}" akan dihapus secara permanen!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      const deleteKey = `delete_${assignment.id}`;
      setActionLoading((prev) => ({ ...prev, [deleteKey]: true }));

      try {
        // API call to delete assignment
        message.success(`Tugas "${assignment.title}" berhasil dihapus`);
        // Refresh data
      } catch (error) {
        console.error("Error deleting assignment:", error);
        message.error("Gagal menghapus tugas");
      } finally {
        setActionLoading((prev) => ({ ...prev, [deleteKey]: false }));
      }
    }
  };

  const handleViewDetail = (assignment) => {
    setSelectedAssignment(assignment);
    setIsDetailModalVisible(true);
  };

  const getAssignmentStatistics = () => {
    const totalAssignments = assignments?.length || 0;
    const overdueAssignments =
      assignments?.filter(
        (a) => a.due_date && dayjs(a.due_date).isBefore(dayjs())
      ).length || 0;
    const totalSubmissions =
      assignments?.reduce((sum, a) => sum + (a.total_submissions || 0), 0) || 0;
    const gradedSubmissions =
      assignments?.reduce((sum, a) => sum + (a.graded_submissions || 0), 0) ||
      0;

    return {
      totalAssignments,
      overdueAssignments,
      totalSubmissions,
      gradedSubmissions,
    };
  };

  const statistics = getAssignmentStatistics();

  const getStatusTag = (assignment) => {
    if (!assignment.due_date) {
      return <Tag color="blue">Tanpa Deadline</Tag>;
    }

    const now = dayjs();
    const dueDate = dayjs(assignment.due_date);

    if (dueDate.isBefore(now)) {
      return <Tag color="red">Overdue</Tag>;
    } else if (dueDate.diff(now, "day") <= 3) {
      return <Tag color="orange">Akan Berakhir</Tag>;
    } else {
      return <Tag color="green">Aktif</Tag>;
    }
  };

  const getSubmissionProgress = (assignment) => {
    const totalStudents = students?.length || 0;
    const submissions = assignment.total_submissions || 0;
    const percentage =
      totalStudents > 0 ? (submissions / totalStudents) * 100 : 0;

    return Math.round(percentage);
  };

  const columns = [
    {
      title: "No",
      key: "no",
      render: (_, __, index) => index + 1,
      width: 60,
      align: "center",
    },
    {
      title: "Judul Tugas",
      dataIndex: "title",
      key: "title",
      render: (title, record) => (
        <div>
          <Text strong style={{ display: "block" }}>
            {title}
          </Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.description || "Tidak ada deskripsi"}
          </Text>
        </div>
      ),
      ellipsis: true,
    },
    {
      title: "Deadline",
      dataIndex: "due_date",
      key: "due_date",
      render: (date, record) => (
        <div>
          {date ? (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <CalendarOutlined style={{ color: "#1890ff" }} />
                <Text style={{ fontSize: 12 }}>
                  {dayjs(date).format("DD MMM YYYY")}
                </Text>
              </div>
              <div style={{ marginTop: 4 }}>{getStatusTag(record)}</div>
            </>
          ) : (
            <Tag color="blue">Tanpa Deadline</Tag>
          )}
        </div>
      ),
      width: 140,
      responsive: ["md"],
    },
    {
      title: "Soal",
      key: "question_count",
      render: (_, record) => (
        <Tag color="blue">{record.question_count || 0} Soal</Tag>
      ),
      width: 100,
      align: "center",
    },
    {
      title: "Submissions",
      key: "submissions",
      render: (_, record) => {
        const progress = getSubmissionProgress(record);
        return (
          <div style={{ minWidth: 120 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 4,
              }}
            >
              <Text style={{ fontSize: 12 }}>
                {record.total_submissions || 0}/{students?.length || 0}
              </Text>
              <Text style={{ fontSize: 12 }}>{progress}%</Text>
            </div>
            <Progress
              percent={progress}
              size="small"
              strokeColor={
                progress >= 80
                  ? "#52c41a"
                  : progress >= 50
                  ? "#faad14"
                  : "#ff4d4f"
              }
              showInfo={false}
            />
          </div>
        );
      },
      width: 140,
      align: "center",
      responsive: ["lg"],
    },
    {
      title: "Dinilai",
      key: "graded",
      render: (_, record) => (
        <Tag color="green">{record.graded_submissions || 0} Dinilai</Tag>
      ),
      width: 100,
      align: "center",
      responsive: ["lg"],
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="small">
          <Button
            icon={<EyeOutlined />}
            size="small"
            onClick={() => handleViewDetail(record)}
            style={{ backgroundColor: "#1890ff", color: "#fff" }}
          >
            {!isMobile && "Detail"}
          </Button>
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEditAssignment(record)}
            loading={actionLoading[`edit_${record.id}`]}
            style={{ backgroundColor: "#52c41a", color: "#fff" }}
          >
            {!isMobile && "Edit"}
          </Button>
          <Button
            icon={<DeleteOutlined />}
            size="small"
            danger
            onClick={() => handleDeleteAssignment(record)}
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
        <p style={{ marginTop: 16, color: "#666" }}>Memuat data tugas...</p>
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
                <FileTextOutlined style={{ marginRight: 8 }} />
                Manajemen Tugas
              </Title>
              <Text type="secondary">
                Kelola tugas dan pantau pengumpulan siswa
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
                  onClick={handleAddAssignment}
                  style={{ backgroundColor: "#11418b", borderRadius: 8 }}
                >
                  Tambah Tugas
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
              title="Total Tugas"
              value={statistics.totalAssignments}
              prefix={<FileTextOutlined style={{ color: "#1677ff" }} />}
              valueStyle={{ color: "#1677ff", fontSize: 18 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" style={{ borderRadius: 8 }}>
            <Statistic
              title="Overdue"
              value={statistics.overdueAssignments}
              prefix={<CalendarOutlined style={{ color: "#ff4d4f" }} />}
              valueStyle={{ color: "#ff4d4f", fontSize: 18 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" style={{ borderRadius: 8 }}>
            <Statistic
              title="Total Submissions"
              value={statistics.totalSubmissions}
              prefix={<FileTextOutlined style={{ color: "#52c41a" }} />}
              valueStyle={{ color: "#52c41a", fontSize: 18 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" style={{ borderRadius: 8 }}>
            <Statistic
              title="Sudah Dinilai"
              value={statistics.gradedSubmissions}
              prefix={<FileTextOutlined style={{ color: "#faad14" }} />}
              valueStyle={{ color: "#faad14", fontSize: 18 }}
            />
          </Card>
        </Col>
      </Row>

      {/* Assignments Table */}
      <Card style={{ borderRadius: 12 }} bodyStyle={{ padding: "24px" }}>
        {assignments && assignments.length > 0 ? (
          <Table
            dataSource={assignments.map((assignment) => ({
              ...assignment,
              key: assignment.id,
            }))}
            columns={columns}
            pagination={{
              pageSize: 10,
              showSizeChanger: false,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} dari ${total} tugas`,
              style: { textAlign: "center" },
            }}
            className="session-assignments-table"
            style={{ width: "100%" }}
            scroll={{ x: isMobile ? 1000 : undefined }}
            size="middle"
          />
        ) : (
          <Empty
            description="Belum ada tugas dibuat"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            style={{ padding: "40px 0" }}
          >
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddAssignment}
              style={{ backgroundColor: "#11418b" }}
            >
              Buat Tugas Pertama
            </Button>
          </Empty>
        )}
      </Card>

      {/* Modals */}
      <SessionAssignmentModal
        open={isAssignmentModalVisible}
        onClose={() => {
          setIsAssignmentModalVisible(false);
          setEditingAssignment(null);
        }}
        materialSlug={materialSlug}
        students={students}
        editingAssignment={editingAssignment}
        onSuccess={() => {
          setIsAssignmentModalVisible(false);
          setEditingAssignment(null);
          // Refresh data
        }}
      />

      <SessionAssignmentDetailModal
        open={isDetailModalVisible}
        onClose={() => {
          setIsDetailModalVisible(false);
          setSelectedAssignment(null);
        }}
        assignment={selectedAssignment}
        students={students}
      />
    </div>
  );
};

export default SessionMaterialAssignmentsTab;
