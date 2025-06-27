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
  Tooltip,
  Dropdown,
  Menu,
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
  UserOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  MoreOutlined,
  BarChartOutlined,
} from "@ant-design/icons";
import useSessionAssignmentManagement from "../hooks/useSessionAssignmentManagement";
import SessionAssignmentForm from "./SessionAssignmentForm";
import SessionAssignmentDetailModal from "./SessionAssignmentDetailModal";
import Swal from "sweetalert2";
import dayjs from "dayjs";

const { Title, Text } = Typography;

const SessionMaterialAssignmentsTab = ({
  materialSlug,
  assignments: propAssignments = [],
  students: propStudents = [],
}) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isAssignmentModalVisible, setIsAssignmentModalVisible] =
    useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [actionLoading, setActionLoading] = useState({});

  const {
    assignments,
    selectedAssignment,
    setSelectedAssignment,
    assignmentDetail,
    submissions,
    questions,
    students,
    statistics,
    loading,
    detailLoading,
    submissionsLoading,
    gradingLoading,
    fetchAssignments,
    fetchAssignmentDetail,
    fetchAssignmentForEdit,
    createAssignment,
    updateAssignment,
    deleteAssignment,
    gradeSubmission,
  } = useSessionAssignmentManagement(materialSlug);

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
      const assignmentWithQuestions = await fetchAssignmentForEdit(
        assignment.id
      );

      if (assignmentWithQuestions) {
        setEditingAssignment(assignmentWithQuestions);
      } else {
        setEditingAssignment(assignment);
      }

      setIsAssignmentModalVisible(true);
    } catch (error) {
      message.error("Gagal memuat data assignment");
    } finally {
      setActionLoading((prev) => ({ ...prev, [editKey]: false }));
    }
  };

  const handleDeleteAssignment = async (assignment) => {
    const deleteKey = `delete_${assignment.id}`;

    const result = await Swal.fire({
      title: "Hapus Assignment?",
      html: `
        <div style="text-align: left; margin: 16px 0;">
          <strong>${assignment.title}</strong>
          <br><br>
          <div style="color: #ff4d4f;">
            ⚠️ Semua data submission akan ikut terhapus!
          </div>
        </div>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      setActionLoading((prev) => ({ ...prev, [deleteKey]: true }));

      try {
        const success = await deleteAssignment(assignment.id);
        if (success) {
          Swal.fire({
            title: "Berhasil!",
            text: "Assignment berhasil dihapus",
            icon: "success",
            timer: 2000,
            showConfirmButton: false,
          });
        }
      } catch (error) {
        console.error("Error deleting assignment:", error);
      } finally {
        setActionLoading((prev) => ({ ...prev, [deleteKey]: false }));
      }
    }
  };

  const handleViewDetail = async (assignment) => {
    const viewKey = `view_${assignment.id}`;
    setActionLoading((prev) => ({ ...prev, [viewKey]: true }));

    try {
      setSelectedAssignment(assignment);
      await fetchAssignmentDetail(assignment.id);
      setIsDetailModalVisible(true);
    } catch (error) {
      message.error("Gagal memuat detail assignment");
    } finally {
      setActionLoading((prev) => ({ ...prev, [viewKey]: false }));
    }
  };

  const handleAssignmentFormSuccess = async (assignmentData) => {
    if (editingAssignment) {
      await updateAssignment(editingAssignment.id, assignmentData);
    } else {
      await createAssignment(assignmentData);
    }
  };

  const getAssignmentStatistics = () => {
    const totalAssignments = assignments.length;
    const totalSubmissions = assignments.reduce(
      (sum, a) => sum + a.total_submissions,
      0
    );
    const pendingGrading = assignments.reduce(
      (sum, a) => sum + a.pending_submissions,
      0
    );
    const averageGrade =
      totalAssignments > 0
        ? assignments.reduce((sum, a) => sum + a.average_grade, 0) /
          totalAssignments
        : 0;

    return {
      totalAssignments,
      totalSubmissions,
      pendingGrading,
      averageGrade: Math.round(averageGrade * 10) / 10,
    };
  };

  const stats = getAssignmentStatistics();

  const getStatusTag = (assignment) => {
    const now = dayjs();
    const dueDate = assignment.due_date ? dayjs(assignment.due_date) : null;

    if (!dueDate) {
      return <Tag color="blue">Tanpa Deadline</Tag>;
    }

    const isOverdue = now.isAfter(dueDate);
    const isUpcoming = dueDate.diff(now, "hours") <= 24 && !isOverdue;

    if (isOverdue) {
      return (
        <Tag color="red" icon={<ExclamationCircleOutlined />}>
          Overdue
        </Tag>
      );
    } else if (isUpcoming) {
      return (
        <Tag color="orange" icon={<ClockCircleOutlined />}>
          Segera Berakhir
        </Tag>
      );
    } else {
      return (
        <Tag color="green" icon={<CheckCircleOutlined />}>
          Aktif
        </Tag>
      );
    }
  };

  const getSubmissionProgress = (assignment) => {
    const totalStudents = students.length;
    const submissionRate =
      totalStudents > 0
        ? Math.round((assignment.total_submissions / totalStudents) * 100)
        : 0;

    return (
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 4,
          }}
        >
          <Text style={{ fontSize: 12 }}>Progress Submission</Text>
          <Text style={{ fontSize: 12 }}>{submissionRate}%</Text>
        </div>
        <Progress
          percent={submissionRate}
          size="small"
          strokeColor={
            submissionRate >= 80
              ? "#52c41a"
              : submissionRate >= 50
              ? "#faad14"
              : "#ff4d4f"
          }
          showInfo={false}
        />
      </div>
    );
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
      title: "Assignment",
      dataIndex: "title",
      key: "title",
      render: (title, record) => (
        <div>
          <Text strong style={{ display: "block", fontSize: 14 }}>
            {title}
          </Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.description
              ? record.description.length > 80
                ? `${record.description.substring(0, 80)}...`
                : record.description
              : "Tidak ada deskripsi"}
          </Text>
          <div style={{ marginTop: 4 }}>
            <Tag color="blue" size="small">
              {record.question_count} Soal
            </Tag>
          </div>
        </div>
      ),
      ellipsis: true,
    },
    {
      title: "Deadline & Status",
      key: "deadline",
      render: (_, record) => (
        <div>
          {record.due_date ? (
            <>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  marginBottom: 4,
                }}
              >
                <CalendarOutlined style={{ color: "#1890ff", fontSize: 12 }} />
                <Text style={{ fontSize: 12 }}>
                  {dayjs(record.due_date).format("DD MMM YYYY HH:mm")}
                </Text>
              </div>
              {getStatusTag(record)}
            </>
          ) : (
            <Tag color="blue">Tanpa Deadline</Tag>
          )}
        </div>
      ),
      width: 160,
      responsive: ["md"],
    },
    {
      title: "Submissions",
      key: "submissions",
      render: (_, record) => (
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 4,
            }}
          >
            <Tag color="green">{record.total_submissions} Submit</Tag>
            <Tag color="orange">{record.pending_submissions} Pending</Tag>
          </div>
          {getSubmissionProgress(record)}
        </div>
      ),
      width: 180,
      align: "center",
      responsive: ["lg"],
    },
    {
      title: "Rata-rata Nilai",
      key: "average_grade",
      render: (_, record) => (
        <div style={{ textAlign: "center" }}>
          {record.graded_submissions > 0 ? (
            <div>
              <div style={{ fontSize: 16, fontWeight: 600 }}>
                {record.average_grade}
              </div>
              <Text type="secondary" style={{ fontSize: 11 }}>
                {record.graded_submissions} dinilai
              </Text>
            </div>
          ) : (
            <Text type="secondary">Belum ada nilai</Text>
          )}
        </div>
      ),
      width: 120,
      align: "center",
      responsive: ["lg"],
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => {
        const menuItems = [
          {
            key: "edit",
            label: "Edit Assignment",
            icon: <EditOutlined />,
            onClick: () => handleEditAssignment(record),
          },
          {
            key: "analytics",
            label: "Lihat Analytics",
            icon: <BarChartOutlined />,
            onClick: () => message.info("Fitur analytics akan segera hadir"),
          },
          {
            key: "delete",
            label: "Hapus Assignment",
            icon: <DeleteOutlined />,
            danger: true,
            onClick: () => handleDeleteAssignment(record),
          },
        ];

        return (
          <Space size="small">
            <Button
              icon={<EyeOutlined />}
              size="small"
              onClick={() => handleViewDetail(record)}
              loading={actionLoading[`view_${record.id}`]}
              style={{ backgroundColor: "#1890ff", color: "#fff" }}
            >
              {!isMobile && "Detail"}
            </Button>
            <Dropdown
              menu={{ items: menuItems }}
              trigger={["click"]}
              placement="bottomRight"
            >
              <Button
                icon={<MoreOutlined />}
                size="small"
                loading={
                  actionLoading[`edit_${record.id}`] ||
                  actionLoading[`delete_${record.id}`]
                }
              />
            </Dropdown>
          </Space>
        );
      },
      width: isMobile ? 100 : 140,
      fixed: "right",
    },
  ];

  const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

  if (loading) {
    return (
      <Card>
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <Spin indicator={antIcon} />
          <p style={{ marginTop: 16, color: "#666" }}>
            Memuat data assignment...
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div>
      {/* Header Section */}
      <Card style={{ marginBottom: 24 }} bodyStyle={{ padding: "20px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 16,
          }}
        >
          <div>
            <Title level={4} style={{ margin: 0, color: "#11418b" }}>
              <FileTextOutlined style={{ marginRight: 8 }} />
              Assignment Management
            </Title>
            <Text type="secondary">Kelola assignment untuk materi ini</Text>
          </div>
          <Space>
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchAssignments}
              loading={loading}
            >
              Refresh
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddAssignment}
              style={{ backgroundColor: "#11418b" }}
            >
              Buat Assignment
            </Button>
          </Space>
        </div>

        {/* Statistics Row */}
        <Row gutter={16}>
          <Col xs={12} sm={6}>
            <Statistic
              title="Total Assignment"
              value={stats.totalAssignments}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: "#11418b" }}
            />
          </Col>
          <Col xs={12} sm={6}>
            <Statistic
              title="Total Submission"
              value={stats.totalSubmissions}
              prefix={<UserOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Col>
          <Col xs={12} sm={6}>
            <Statistic
              title="Pending Grading"
              value={stats.pendingGrading}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: "#faad14" }}
            />
          </Col>
          <Col xs={12} sm={6}>
            <Statistic
              title="Rata-rata Nilai"
              value={stats.averageGrade}
              precision={1}
              valueStyle={{ color: "#1890ff" }}
            />
          </Col>
        </Row>
      </Card>

      {/* Assignments Table */}
      <Card>
        {assignments.length > 0 ? (
          <Table
            dataSource={assignments.map((assignment, idx) => ({
              ...assignment,
              key: assignment.id,
              no: idx + 1,
            }))}
            columns={columns}
            pagination={{
              pageSize: 10,
              showSizeChanger: false,
              style: { textAlign: "center" },
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} dari ${total} assignment`,
            }}
            className="session-assignments-table"
            style={{ width: "100%" }}
            scroll={{ x: isMobile ? 1000 : undefined }}
            size="middle"
          />
        ) : (
          <Empty
            description="Belum ada assignment dibuat"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            style={{ padding: "40px 0" }}
          >
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddAssignment}
              style={{ backgroundColor: "#11418b" }}
            >
              Buat Assignment Pertama
            </Button>
          </Empty>
        )}
      </Card>

      {/* Modals */}
      <SessionAssignmentForm
        open={isAssignmentModalVisible}
        onClose={() => {
          setIsAssignmentModalVisible(false);
          setEditingAssignment(null);
        }}
        materialSlug={materialSlug}
        editingAssignment={editingAssignment}
        onSuccess={handleAssignmentFormSuccess}
      />

      <SessionAssignmentDetailModal
        open={isDetailModalVisible}
        onClose={() => {
          setIsDetailModalVisible(false);
          setSelectedAssignment(null);
        }}
        assignment={selectedAssignment}
        assignmentDetail={assignmentDetail}
        submissions={submissions}
        questions={questions}
        students={students}
        loading={detailLoading}
        submissionsLoading={submissionsLoading}
        gradingLoading={gradingLoading}
        onGradeSubmission={gradeSubmission}
      />
    </div>
  );
};

export default SessionMaterialAssignmentsTab;
