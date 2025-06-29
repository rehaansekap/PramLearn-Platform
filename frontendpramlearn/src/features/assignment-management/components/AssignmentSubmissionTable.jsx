import React, { useState } from "react";
import { Table, Button, Space, Tag, Spin } from "antd";
import {
  EyeOutlined,
  UserOutlined,
  FileTextOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import AssignmentSubmissionDetailModal from "./AssignmentSubmissionDetailModal";
import dayjs from "dayjs";

const AssignmentSubmissionTable = ({
  submissions,
  students,
  questions,
  selectedAssignment,
  onReload,
  loading = false,
  isMobile,
}) => {
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [detailLoading, setDetailLoading] = useState({});

  const filteredSubmissions = selectedAssignment
    ? submissions.filter((s) => s.assignment === selectedAssignment.id)
    : submissions;

  const getStudentName = (studentId) => {
    const student = students.find((s) => s.id === studentId);
    if (!student) return `Student ID: ${studentId}`;
    const fullName = `${student.first_name || ""} ${
      student.last_name || ""
    }`.trim();
    return fullName || student.username || `Student ID: ${studentId}`;
  };

  const getGradeColor = (grade) => {
    if (grade >= 80) return "green";
    if (grade >= 60) return "orange";
    return "red";
  };

  // Handle detail submission dengan loading
  const handleViewDetail = async (submission) => {
    const detailKey = `detail_${submission.id}`;
    setDetailLoading((prev) => ({ ...prev, [detailKey]: true }));

    try {
      // Simulasi loading untuk fetch detail data jika diperlukan
      setTimeout(() => {
        setSelectedSubmission(submission);
        setDetailLoading((prev) => ({ ...prev, [detailKey]: false }));
      }, 300);
    } catch (error) {
      console.error("Error loading submission detail:", error);
      setDetailLoading((prev) => ({ ...prev, [detailKey]: false }));
    }
  };

  const columns = [
    {
      title: "No",
      key: "no",
      render: (_, __, idx) => idx + 1,
      width: 60,
      align: "center",
    },
    {
      title: "Nama Siswa",
      key: "nama",
      render: (_, record) => {
        // 1. Gunakan student_detail jika ada
        if (record.student_detail) {
          const { first_name, last_name, username } = record.student_detail;
          const fullName = [first_name, last_name].filter(Boolean).join(" ");
          return (
            <Space>
              <UserOutlined style={{ color: "#1677ff" }} />
              <span style={{ fontWeight: 500 }}>
                {fullName || username || "-"}
              </span>
            </Space>
          );
        }

        // 2. Fallback ke students list
        let student = students.find(
          (s) => String(s.id) === String(record.student)
        );
        if (!student && record.username) {
          student = students.find((s) => s.username === record.username);
        }
        let displayName = "-";
        if (student) {
          displayName =
            [student.first_name, student.last_name].filter(Boolean).join(" ") ||
            student.username ||
            "-";
        } else {
          displayName = record.username || `Student ID: ${record.student}`;
        }
        return (
          <Space>
            <UserOutlined style={{ color: "#1677ff" }} />
            <span style={{ fontWeight: 500 }}>{displayName}</span>
          </Space>
        );
      },
      ellipsis: true,
    },
    {
      title: "Tanggal Submit",
      dataIndex: "submission_date",
      key: "submission_date",
      render: (date) => dayjs(date).format("DD/MM/YYYY HH:mm"),
      responsive: ["md"],
      width: 150,
    },
    {
      title: "Nilai",
      dataIndex: "grade",
      key: "grade",
      render: (grade) =>
        grade !== null ? (
          <Tag color={getGradeColor(grade)} style={{ fontWeight: 500 }}>
            {Math.round(grade * 100) / 100}
          </Tag>
        ) : (
          <Tag color="gray">Belum dinilai</Tag>
        ),
      width: 100,
      align: "center",
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Button
          size="small"
          icon={<EyeOutlined />}
          onClick={() => handleViewDetail(record)}
          loading={detailLoading[`detail_${record.id}`]}
          style={{
            backgroundColor: "#1890ff",
            color: "#fff",
            borderRadius: 6,
            minWidth: 32,
            height: 32,
          }}
          title="Lihat Detail Jawaban"
        >
          <span className="hidden md:inline">Detail</span>
        </Button>
      ),
      width: 100,
      align: "center",
    },
  ];

  const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 12,
        boxShadow: "0 2px 8px #f0f1f2",
        padding: 24,
        marginTop: 16,
        width: "100%",
        maxWidth: "100%",
        marginLeft: "auto",
        marginRight: "auto",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <FileTextOutlined
          style={{ fontSize: 28, color: "#11418b", marginBottom: 8 }}
        />
        <h3
          className="text-lg font-semibold text-gray-800 mb-1"
          style={{ marginBottom: 4 }}
        >
          Submission Assignment
        </h3>
        <p className="text-sm text-gray-600" style={{ marginBottom: 0 }}>
          Daftar siswa yang sudah mengumpulkan
          <br /> assignment <b>{selectedAssignment?.title}</b>
        </p>
      </div>

      {/* Loading State */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <Spin indicator={antIcon} />
          <p style={{ fontSize: "16px", color: "#666", marginTop: 16 }}>
            Memuat data submission...
          </p>
        </div>
      ) : filteredSubmissions.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <FileTextOutlined style={{ fontSize: 48, color: "#d9d9d9" }} />
          <p style={{ fontSize: "16px", color: "#666", marginTop: 16 }}>
            Belum ada submission untuk assignment ini.
          </p>
        </div>
      ) : (
        <Table
          dataSource={filteredSubmissions.map((submission) => ({
            ...submission,
            key: submission.id,
          }))}
          columns={columns}
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: false,
            style: { textAlign: "center" },
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} dari ${total} submission`,
          }}
          className="assignment-table user-table-responsive"
          style={{
            width: "100%",
          }}
          scroll={{ x: isMobile ? 600 : undefined }}
          size="middle"
        />
      )}

      {selectedSubmission && (
        <AssignmentSubmissionDetailModal
          open={!!selectedSubmission}
          onClose={() => setSelectedSubmission(null)}
          submission={selectedSubmission}
          questions={questions.filter(
            (q) => q.assignment === selectedAssignment.id
          )}
          answers={selectedSubmission.answers || []}
          selectedAssignment={selectedAssignment}
        />
      )}
    </div>
  );
};

export default AssignmentSubmissionTable;
