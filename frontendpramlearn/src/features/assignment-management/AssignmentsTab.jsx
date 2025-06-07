import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Space,
  Typography,
  Tag,
  Modal,
  Empty,
  Spin,
  Card,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  FileTextOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import AssignmentSubmissionTable from "./components/AssignmentSubmissionTable";
import Swal from "sweetalert2";
import dayjs from "dayjs";

const { Title } = Typography;

const AssignmentsTab = ({
  assignments = [],
  selectedAssignment,
  assignmentSubmissions = [],
  assignmentQuestions = [],
  studentDetails = [],
  onCreateAssignment,
  onEditAssignment,
  onDeleteAssignment,
  onSelectAssignment,
  loading,
  submissionsLoading = false, // Tambahkan prop loading untuk submissions
}) => {
  const [actionLoading, setActionLoading] = useState({});
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const confirmDeleteAssignment = async (assignmentId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      const deleteKey = `delete_${assignmentId}`;
      setActionLoading((prev) => ({ ...prev, [deleteKey]: true }));

      try {
        await onDeleteAssignment?.(assignmentId);
        Swal.fire("Deleted!", "Assignment has been deleted.", "success");
      } catch (error) {
        console.error("Error deleting assignment:", error);
        Swal.fire("Error!", "Failed to delete assignment.", "error");
      } finally {
        setActionLoading((prev) => ({ ...prev, [deleteKey]: false }));
      }
    }
  };

  // Handler untuk toggle detail assignment dengan loading
  const handleToggleAssignmentDetail = async (assignment) => {
    const toggleKey = `toggle_${assignment.id}`;
    setActionLoading((prev) => ({ ...prev, [toggleKey]: true }));

    try {
      if (selectedAssignment && selectedAssignment.id === assignment.id) {
        // Jika assignment yang sama diklik, tutup detail
        onSelectAssignment(null);
      } else {
        // Jika assignment berbeda atau belum ada yang dipilih, buka detail
        onSelectAssignment(assignment);
      }
    } catch (error) {
      console.error("Error toggling assignment detail:", error);
    } finally {
      setActionLoading((prev) => ({ ...prev, [toggleKey]: false }));
    }
  };

  // Handler untuk edit dengan loading
  const handleEditWithLoading = async (assignment) => {
    const editKey = `edit_${assignment.id}`;
    setActionLoading((prev) => ({ ...prev, [editKey]: true }));

    try {
      await onEditAssignment?.(assignment);
    } catch (error) {
      console.error("Error editing assignment:", error);
    } finally {
      setActionLoading((prev) => ({ ...prev, [editKey]: false }));
    }
  };

  const assignmentColumns = [
    {
      title: "No",
      key: "no",
      render: (_, __, idx) => idx + 1,
      width: 60,
      align: "center",
      className: "assignment-col-no",
    },
    {
      title: "Judul",
      dataIndex: "title",
      key: "title",
      ellipsis: true,
      render: (text) => (
        <div
          style={{
            whiteSpace: "normal",
            wordBreak: "break-word",
            maxWidth: 220,
            fontWeight: 500,
          }}
        >
          {text}
        </div>
      ),
    },
    {
      title: "Deskripsi",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
      responsive: ["lg"],
      render: (text) => (
        <div
          style={{
            whiteSpace: "normal",
            wordBreak: "break-word",
            maxWidth: 200,
          }}
        >
          {text?.length > 50 ? `${text.substring(0, 50)}...` : text}
        </div>
      ),
    },
    {
      title: "Due Date",
      dataIndex: "due_date",
      key: "due_date",
      render: (date) => dayjs(date).format("DD/MM/YYYY HH:mm"),
      responsive: ["md"],
      width: 150,
      align: "center",
    },
    {
      title: "Status",
      key: "status",
      render: (_, record) => {
        const now = dayjs();
        const dueDate = dayjs(record.due_date);
        const isOverdue = now.isAfter(dueDate);

        return (
          <Tag color={isOverdue ? "red" : "green"}>
            {isOverdue ? "Overdue" : "Active"}
          </Tag>
        );
      },
      width: 100,
      align: "center",
      responsive: ["md"],
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => {
        // Cek apakah assignment ini sedang ditampilkan detailnya
        const isDetailOpen =
          selectedAssignment && selectedAssignment.id === record.id;

        return (
          <Space size="middle" wrap>
            <Button
              size="small"
              icon={isDetailOpen ? <EyeInvisibleOutlined /> : <EyeOutlined />}
              onClick={() => handleToggleAssignmentDetail(record)}
              style={{
                backgroundColor: isDetailOpen ? "#ff4d4f" : "#1890ff",
                color: "#fff",
                border: "none",
              }}
              title={
                isDetailOpen
                  ? "Tutup Detail Submissions"
                  : "Lihat Detail Submissions"
              }
              className="assignment-action-btn"
              loading={actionLoading[`toggle_${record.id}`]}
            />
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEditWithLoading(record)}
              style={{
                backgroundColor: "#4CAF50",
                color: "#fff",
                border: "none",
              }}
              title="Edit Assignment"
              className="assignment-action-btn"
              loading={actionLoading[`edit_${record.id}`]}
            />
            <Button
              size="small"
              icon={<DeleteOutlined />}
              onClick={() => confirmDeleteAssignment(record.id)}
              style={{
                backgroundColor: "#f44336",
                color: "#fff",
                border: "none",
              }}
              title="Delete Assignment"
              className="assignment-action-btn"
              loading={actionLoading[`delete_${record.id}`]}
            />
          </Space>
        );
      },
      width: 150,
      align: "center",
      className: "assignment-col-actions",
    },
  ];

  const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

  if (loading) {
    return (
      <Card className="rounded-lg shadow-sm">
        <div className="flex justify-center items-center py-10">
          <Spin indicator={antIcon} />
          <span className="ml-3 text-gray-500">Memuat data assignment...</span>
        </div>
      </Card>
    );
  }

  return (
    <div>
      {/* Header dengan icon dan tombol create */}
      <div
        style={{
          width: "100%",
          textAlign: "center",
          marginBottom: 24,
        }}
      >
        <FileTextOutlined
          style={{
            fontSize: isMobile ? 24 : 32,
            color: "#11418b",
            marginBottom: isMobile ? 8 : 12,
          }}
        />
        <h3
          className="text-lg font-semibold text-gray-800 mb-1"
          style={{
            marginBottom: 4,
            fontSize: isMobile ? "16px" : "20px",
          }}
        >
          Daftar Assignment
        </h3>
        <p
          className="text-sm text-gray-600"
          style={{
            marginBottom: 16,
            fontSize: isMobile ? "12px" : "14px",
          }}
        >
          Kelola assignment untuk materi ini
        </p>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={onCreateAssignment}
          style={{
            height: 40,
            fontSize: 16,
            fontWeight: 600,
            borderRadius: 8,
            padding: "0 24px",
            minWidth: isMobile ? "100%" : 140,
          }}
        >
          Buat Assignment Baru
        </Button>
      </div>

      {/* No data state */}
      {assignments.length === 0 ? (
        <Card className="rounded-lg shadow-sm">
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <div>
                <p style={{ fontSize: "16px", marginBottom: "8px" }}>
                  Belum ada assignment yang dibuat
                </p>
                <p style={{ fontSize: "14px", color: "#666" }}>
                  Buat assignment pertama Anda untuk memulai
                </p>
              </div>
            }
          >
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={onCreateAssignment}
            >
              Buat Assignment Pertama
            </Button>
          </Empty>
        </Card>
      ) : (
        /* Table */
        <Table
          dataSource={assignments.map((assignment, idx) => ({
            ...assignment,
            key: assignment.id,
            no: idx + 1,
          }))}
          loading={loading}
          columns={assignmentColumns}
          pagination={{
            pageSize: 10,
            showSizeChanger: false,
            style: { textAlign: "center" },
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} dari ${total} assignments`,
          }}
          style={{ width: "100%" }}
          className="user-table-responsive"
          scroll={{ x: isMobile ? 600 : undefined }} // Tambahkan scroll horizontal untuk mobile
          size="middle"
        />
      )}

      {/* Submission Table - Tampilkan hanya jika ada selectedAssignment */}
      {selectedAssignment && (
        <div style={{ marginTop: 32 }}>
          <AssignmentSubmissionTable
            submissions={assignmentSubmissions}
            students={studentDetails}
            questions={assignmentQuestions}
            selectedAssignment={selectedAssignment}
            loading={submissionsLoading} // Pass loading state
            isMobile={isMobile}
          />
        </div>
      )}
    </div>
  );
};

export default AssignmentsTab;
