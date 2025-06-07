import React, { useState, useEffect } from "react";
import { Modal, Table, Tag, Spin } from "antd";
import { FileTextOutlined } from "@ant-design/icons";

const AssignmentSubmissionDetailModal = ({
  open,
  onClose,
  submission,
  questions,
  answers,
  selectedAssignment,
}) => {
  const [loading, setLoading] = useState(false);

  // Loading saat modal dibuka
  useEffect(() => {
    if (open && submission) {
      setLoading(true);
      // Simulasi loading data detail
      const timer = setTimeout(() => {
        setLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [open, submission]);

  // Map questionId -> answer
  const answerMap = {};
  answers.forEach((ans) => {
    answerMap[ans.question] = ans;
  });

  // Get student name
  const getStudentName = () => {
    if (submission?.student_detail) {
      const { first_name, last_name, username } = submission.student_detail;
      const fullName = [first_name, last_name].filter(Boolean).join(" ");
      return fullName || username || "Siswa tidak dikenal";
    }
    return submission?.username || "Siswa tidak dikenal";
  };

  // Get assignment title - prioritas: selectedAssignment > submission.assignment_title
  const getAssignmentTitle = () => {
    return selectedAssignment?.title || submission?.assignment_title || "N/A";
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
      title: "Soal",
      dataIndex: "text",
      key: "text",
      render: (text) => (
        <div style={{ whiteSpace: "normal", wordBreak: "break-word" }}>
          {text}
        </div>
      ),
    },
    {
      title: "Jawaban Siswa",
      key: "selected_choice",
      render: (_, record) => {
        const ans = answerMap[record.id];
        return ans ? (
          <Tag
            color="blue"
            style={{
              fontSize: "14px",
              padding: "4px 8px",
              fontWeight: 500,
            }}
          >
            {ans.selected_choice}
          </Tag>
        ) : (
          <Tag color="gray">Tidak dijawab</Tag>
        );
      },
      width: 130,
      align: "center",
    },
    {
      title: "Kunci Jawaban",
      key: "correct_choice",
      render: (_, record) => (
        <Tag
          color="green"
          style={{
            fontSize: "14px",
            padding: "4px 8px",
            fontWeight: 500,
          }}
        >
          {record.correct_choice}
        </Tag>
      ),
      width: 130,
      align: "center",
    },
    {
      title: "Status",
      key: "status",
      render: (_, record) => {
        const ans = answerMap[record.id];
        const isCorrect = ans?.is_correct;
        return (
          <Tag color={isCorrect ? "green" : "red"}>
            {isCorrect ? "Benar" : "Salah"}
          </Tag>
        );
      },
      width: 100,
      align: "center",
    },
  ];

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={window.innerWidth <= 768 ? "95%" : 900} // Responsif untuk mobile
      centered
      className="assignment-submission-detail-modal"
      destroyOnClose
    >
      {/* Header dengan style konsisten */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginBottom: 24,
          paddingTop: 16,
        }}
      >
        <FileTextOutlined
          style={{
            fontSize: window.innerWidth <= 768 ? 24 : 28,
            color: "#11418b",
            marginBottom: 8,
          }}
        />
        <h3
          style={{
            marginBottom: 4,
            fontSize: window.innerWidth <= 768 ? "18px" : "20px",
            fontWeight: 700,
            color: "#11418b",
            textAlign: "center",
          }}
        >
          Detail Pengerjaan Assignment
        </h3>
        <p
          style={{
            marginBottom: 0,
            fontSize: window.innerWidth <= 768 ? "12px" : "14px",
            color: "#666",
            textAlign: "center",
          }}
        >
          Jawaban lengkap dari{" "}
          <b style={{ color: "#11418b" }}>{getStudentName()}</b>
        </p>
      </div>

      {/* Loading State */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <Spin size="large" />
          <p style={{ fontSize: "16px", color: "#666", marginTop: 16 }}>
            Memuat detail jawaban...
          </p>
        </div>
      ) : (
        <>
          {/* Assignment Info Card */}
          <div
            style={{
              background: "#f8f9fa",
              border: "1px solid #e9ecef",
              borderRadius: "8px",
              padding: window.innerWidth <= 768 ? "12px" : "16px", // Padding responsif
              marginBottom: "20px",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: window.innerWidth <= 768 ? "column" : "row", // Responsif untuk mobile
                justifyContent: "space-between",
                alignItems: "center",
                gap: window.innerWidth <= 768 ? 8 : 16, // Jarak antar elemen
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: window.innerWidth <= 768 ? "14px" : "16px",
                    fontWeight: 600,
                    color: "#11418b",
                    marginBottom: 4,
                  }}
                >
                  Assignment: {getAssignmentTitle()}
                </div>
                <div
                  style={{
                    fontSize: window.innerWidth <= 768 ? "12px" : "14px",
                    color: "#666",
                  }}
                >
                  Nilai:{" "}
                  {submission?.grade !== null ? (
                    <Tag
                      color={
                        submission.grade >= 80
                          ? "green"
                          : submission.grade >= 60
                          ? "orange"
                          : "red"
                      }
                    >
                      {Math.round(submission.grade * 100) / 100}
                    </Tag>
                  ) : (
                    <Tag color="gray">Belum dinilai</Tag>
                  )}
                </div>
              </div>
              <div
                style={{
                  textAlign: window.innerWidth <= 768 ? "left" : "right",
                }}
              >
                <div
                  style={{
                    fontSize: window.innerWidth <= 768 ? "12px" : "14px",
                    color: "#666",
                  }}
                >
                  Tanggal Submit:{" "}
                  {submission?.submission_date
                    ? new Date(submission.submission_date).toLocaleString(
                        "id-ID"
                      )
                    : "N/A"}
                </div>
              </div>
            </div>
          </div>

          {/* Table dengan style konsisten */}
          <Table
            dataSource={questions.map((question, idx) => ({
              ...question,
              key: question.id,
              no: idx + 1,
            }))}
            columns={columns}
            pagination={false}
            className="assignment-table user-table-responsive"
            style={{
              width: "100%",
            }}
            scroll={{ x: window.innerWidth <= 768 ? 600 : undefined }} // Tambahkan scroll horizontal untuk mobile
            size="middle"
          />
        </>
      )}
    </Modal>
  );
};

export default AssignmentSubmissionDetailModal;
