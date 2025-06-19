import React, { useState, useEffect } from "react";
import {
  Modal,
  Card,
  Row,
  Col,
  Typography,
  Space,
  Tag,
  Button,
  Divider,
  Progress,
  Alert,
  Spin,
  Empty,
  List,
  Rate,
  Timeline,
  Statistic,
  message,
  Tooltip,
} from "antd";
import {
  DownloadOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  FileOutlined,
  FileTextOutlined,
  StarOutlined,
  CommentOutlined,
  CalendarOutlined,
  UserOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import api from "../../../../api";

const { Title, Text, Paragraph } = Typography;

const AssignmentFeedback = ({
  visible,
  onClose,
  submissionId,
  gradeId,
  assignmentTitle,
  onDownloadReport,
}) => {
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch assignment feedback
  useEffect(() => {
    if (visible && submissionId) {
      console.log("Fetching feedback for grade ID:", submissionId);
      fetchFeedback();
    }

    if (!visible) {
      setFeedback(null);
      setError(null);
    }
  }, [visible, submissionId]);

  const fetchFeedback = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token tidak ditemukan. Silakan login kembali.");
      }

      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      // Gunakan submissionId sebagai gradeId
      const response = await api.get(
        `/student/assignment-feedback/grade/${submissionId}/`
      );

      console.log("✅ Assignment feedback response:", response.data);

      if (response.data) {
        setFeedback(response.data);
      } else {
        throw new Error("Data feedback tidak ditemukan");
      }
    } catch (err) {
      console.error("❌ Error fetching assignment feedback:", err);

      if (err.response) {
        const status = err.response.status;
        if (status === 404) {
          setError("Feedback assignment tidak ditemukan");
        } else if (status === 403) {
          setError("Anda tidak memiliki akses untuk melihat feedback ini");
        } else if (status === 401) {
          setError("Sesi Anda telah berakhir. Silakan login kembali");
        } else {
          setError(
            `Error ${status}: ${
              err.response.data?.message ||
              err.response.data?.detail ||
              err.response.data?.error ||
              "Terjadi kesalahan"
            }`
          );
        }
      } else if (err.request) {
        setError(
          "Tidak dapat terhubung ke server. Periksa koneksi internet Anda"
        );
      } else {
        setError(err.message || "Terjadi kesalahan saat memuat feedback");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (format = "pdf") => {
    if (onDownloadReport) {
      onDownloadReport(format);
    } else {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Token tidak ditemukan");
        }

        // PERBAIKAN: Gunakan query parameter untuk download
        const response = await api.get(
          `/student/assignment-feedback/grade/${submissionId}/`,
          {
            params: { download: format },
            headers: {
              Authorization: `Bearer ${token}`,
            },
            responseType: "blob", // Important untuk download file
          }
        );

        // Create download link
        const blob = new Blob([response.data], {
          type:
            format === "pdf"
              ? "application/pdf"
              : "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = `assignment-feedback-${submissionId}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        message.success("Report berhasil didownload");
      } catch (err) {
        console.error("Error downloading assignment feedback:", err);

        if (err.response?.status === 404) {
          setError("Download tidak tersedia untuk feedback ini");
        } else {
          setError("Gagal mengunduh laporan feedback");
        }
      }
    }
  };

  const getGradeColor = (grade) => {
    if (grade >= 90) return "#52c41a";
    if (grade >= 80) return "#1890ff";
    if (grade >= 70) return "#faad14";
    if (grade >= 60) return "#fa8c16";
    return "#ff4d4f";
  };

  const getGradeLetter = (grade) => {
    if (grade >= 90) return "A";
    if (grade >= 80) return "B";
    if (grade >= 70) return "C";
    if (grade >= 60) return "D";
    return "E";
  };

  const renderRubricItem = (item) => {
    return (
      <Card
        key={item.id}
        size="small"
        style={{
          marginBottom: 12,
          borderRadius: 8,
          border: `1px solid ${getGradeColor(item.score)}`,
        }}
      >
        <Row gutter={[16, 8]}>
          <Col xs={24} md={16}>
            <Space direction="vertical" size="small" style={{ width: "100%" }}>
              <Text strong style={{ color: "#11418b" }}>
                {item.criteria}
              </Text>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {item.description}
              </Text>
            </Space>
          </Col>
          <Col xs={24} md={8}>
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  color: getGradeColor(item.score),
                  fontSize: 18,
                  fontWeight: "bold",
                  marginBottom: 4,
                }}
              >
                {item.score}/{item.max_score}
              </div>
              <Progress
                percent={(item.score / item.max_score) * 100}
                strokeColor={getGradeColor(item.score)}
                showInfo={false}
                size="small"
              />
            </div>
          </Col>
          {item.feedback && (
            <Col span={24}>
              <Alert
                message="Catatan"
                description={item.feedback}
                type="info"
                showIcon
                style={{ marginTop: 8 }}
              />
            </Col>
          )}
        </Row>
      </Card>
    );
  };

  const renderAnswerReview = (answer, index) => {
    return (
      <Card
        key={answer.id || index}
        size="small"
        style={{ marginBottom: 16, borderRadius: 8 }}
      >
        <Space direction="vertical" style={{ width: "100%" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text strong>Soal {index + 1}</Text>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              {answer.points_earned !== null && (
                <Tag
                  color={getGradeColor(
                    (answer.points_earned / answer.max_points) * 100
                  )}
                >
                  {answer.points_earned}/{answer.max_points} poin
                </Tag>
              )}
              <Tag color={answer.is_correct ? "success" : "error"}>
                {answer.is_correct ? "Benar" : "Salah"}
              </Tag>
            </div>
          </div>

          {/* Question Text */}
          <div
            style={{
              background: "#f8f9fa",
              padding: "12px 16px",
              borderRadius: 8,
              border: "1px solid #e9ecef",
            }}
          >
            <Text strong style={{ color: "#2c3e50" }}>
              Pertanyaan:
            </Text>
            <Paragraph style={{ marginTop: 8, marginBottom: 0 }}>
              {answer.question_text}
            </Paragraph>
          </div>

          {/* Student Answer */}
          <Card size="small" style={{ background: "#f9f9f9" }}>
            <Text strong>Jawaban Anda:</Text>
            <div style={{ marginTop: 8 }}>
              {answer.answer_type === "multiple_choice" ? (
                // Multiple Choice Answer
                <div>
                  {answer.selected_choice ? (
                    <Tag
                      color={answer.is_correct ? "success" : "error"}
                      style={{
                        fontSize: 14,
                        padding: "4px 12px",
                        fontWeight: "bold",
                      }}
                    >
                      Pilihan {answer.selected_choice}
                    </Tag>
                  ) : (
                    <Text type="secondary" italic>
                      Tidak ada jawaban dipilih
                    </Text>
                  )}
                </div>
              ) : (
                // Essay Answer
                <div>
                  {answer.answer_text ? (
                    <Paragraph
                      style={{
                        background: "white",
                        padding: "12px",
                        borderRadius: 6,
                        border: "1px solid #d9d9d9",
                        marginBottom: 0,
                      }}
                    >
                      {answer.answer_text}
                    </Paragraph>
                  ) : (
                    <Text type="secondary" italic>
                      Tidak ada jawaban essay
                    </Text>
                  )}
                </div>
              )}
            </div>

            {answer.attachment && (
              <div style={{ marginTop: 8 }}>
                <Button
                  size="small"
                  icon={<FileTextOutlined />}
                  onClick={() => window.open(answer.attachment, "_blank")}
                >
                  Lihat Lampiran
                </Button>
              </div>
            )}
          </Card>

          {/* Teacher Feedback */}
          {answer.teacher_feedback && answer.teacher_feedback.trim() !== "" && (
            <Alert
              message="Komentar Guru"
              description={answer.teacher_feedback}
              type="info"
              showIcon
              icon={<CommentOutlined />}
              style={{ borderRadius: 6 }}
            />
          )}

          {/* Additional Info for Multiple Choice */}
          {answer.answer_type === "multiple_choice" && !answer.is_correct && (
            <Alert
              message="Jawaban yang Benar"
              description="Informasi jawaban yang benar tidak tersedia dalam feedback ini."
              type="warning"
              showIcon
              style={{ borderRadius: 6 }}
            />
          )}
        </Space>
      </Card>
    );
  };

  // PERBAIKAN: Kondisi return harus di dalam fungsi komponen
  if (loading) {
    return (
      <Modal
        title="Feedback Assignment"
        open={visible}
        onCancel={onClose}
        footer={null}
        width={800}
        centered
      >
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <Spin size="large" tip="Memuat feedback assignment..." />
        </div>
      </Modal>
    );
  }

  if (error) {
    return (
      <Modal
        title="Feedback Assignment"
        open={visible}
        onCancel={onClose}
        footer={[
          <Button key="close" onClick={onClose}>
            Tutup
          </Button>,
        ]}
        width={600}
        centered
      >
        <Alert
          message="Gagal memuat data"
          description={error}
          type="error"
          showIcon
          style={{ borderRadius: 8 }}
        />
      </Modal>
    );
  }

  if (!feedback) {
    return (
      <Modal
        title="Feedback Assignment"
        open={visible}
        onCancel={onClose}
        footer={[
          <Button key="close" onClick={onClose}>
            Tutup
          </Button>,
        ]}
        width={600}
        centered
      >
        <Empty description="Data tidak ditemukan" />
      </Modal>
    );
  }

  const {
    assignment,
    submission,
    rubric_items = [],
    answers = [],
    teacher_feedback,
    grading_history = [],
  } = feedback;

  return (
    <Modal
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <FileTextOutlined style={{ color: "#52c41a" }} />
          <span>Feedback Assignment</span>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={[
        // <Button
        //   key="download"
        //   type="default"
        //   icon={<DownloadOutlined />}
        //   onClick={() => handleDownload("pdf")}
        // >
        //   Download Report
        // </Button>,
        <Button key="close" type="primary" onClick={onClose}>
          Tutup
        </Button>,
      ]}
      width={900}
      style={{ top: 20 }}
      bodyStyle={{ maxHeight: "70vh", overflowY: "auto" }}
      centered
      destroyOnClose
    >
      {/* Assignment Info Header */}
      {/* Progress Summary - Tampilkan ringkasan berdasarkan data yang ada */}
      <Card
        style={{
          marginBottom: 24,
          marginTop: 16,
          borderRadius: 12,
          background:
            "linear-gradient(135deg, #001529 0%, #3a3f5c 60%, #43cea2 100%)",
        }}
      >
        <div style={{ color: "white" }}>
          <Row gutter={[24, 16]} align="middle">
            <Col xs={24} md={16}>
              <Space direction="vertical" size="small">
                <Title level={4} style={{ color: "white", margin: 0 }}>
                  🎯 Ringkasan Pencapaian
                </Title>
                <Text style={{ color: "rgba(255,255,255,0.9)" }}>
                  Assignment "{assignment?.title || assignmentTitle}" telah
                  diselesaikan dengan baik
                </Text>

                <div style={{ marginTop: 12 }}>
                  <Space wrap>
                    <Tag
                      color={
                        submission?.final_score >= 85
                          ? "success"
                          : submission?.final_score >= 70
                          ? "warning"
                          : "error"
                      }
                      style={{ fontWeight: "bold" }}
                    >
                      {submission?.final_score >= 85
                        ? "🌟 Sangat Baik"
                        : submission?.final_score >= 70
                        ? "👍 Baik"
                        : "📚 Perlu Perbaikan"}
                    </Tag>
                    <Tag color="blue">
                      {assignment?.subject_name || "Mata Pelajaran"}
                    </Tag>
                  </Space>
                </div>
              </Space>
            </Col>

            <Col xs={24} md={8}>
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontSize: 32,
                    fontWeight: "bold",
                    marginBottom: 8,
                    textShadow: "0 2px 4px rgba(0,0,0,0.3)",
                  }}
                >
                  {submission?.final_score?.toFixed(0) || "0"}
                </div>
                <div
                  style={{
                    fontSize: 14,
                    opacity: 0.9,
                    textShadow: "0 1px 2px rgba(0,0,0,0.3)",
                  }}
                >
                  dari 100 poin
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </Card>

      {/* PERBAIKAN: Tampilkan teacher feedback bahkan jika "No feedback available" */}
      <Alert
        message="Feedback Keseluruhan"
        description={
          teacher_feedback && teacher_feedback !== "No feedback available" ? (
            teacher_feedback
          ) : (
            <div>
              <Text type="secondary" italic>
                Belum ada feedback khusus dari guru untuk assignment ini.
              </Text>
              <br />
              <Text type="secondary" style={{ fontSize: 12 }}>
                Anda dapat melihat detail penilaian di bawah.
              </Text>
            </div>
          )
        }
        type={
          teacher_feedback && teacher_feedback !== "No feedback available"
            ? "info"
            : "warning"
        }
        showIcon
        icon={
          teacher_feedback && teacher_feedback !== "No feedback available" ? (
            <StarOutlined />
          ) : (
            <CommentOutlined />
          )
        }
        style={{ marginBottom: 24, borderRadius: 8 }}
      />

      {/* PERBAIKAN: Tampilkan informasi grading berdasarkan data yang ada */}
      <Card style={{ marginBottom: 24, borderRadius: 12 }}>
        <Title level={5} style={{ marginBottom: 16 }}>
          Detail Penilaian Assignment
        </Title>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12}>
            <div
              style={{ padding: 16, background: "#f8f9fa", borderRadius: 8 }}
            >
              <Space direction="vertical" style={{ width: "100%" }}>
                <Text strong style={{ color: "#1890ff" }}>
                  📊 Informasi Penilaian
                </Text>
                <div>
                  <Text type="secondary">Nilai Akhir: </Text>
                  <Text
                    strong
                    style={{
                      fontSize: 16,
                      color: getGradeColor(submission?.final_score || 0),
                    }}
                  >
                    {submission?.final_score?.toFixed(1) || "0.0"}/100
                  </Text>
                </div>
                <div>
                  <Text type="secondary">Grade: </Text>
                  <Tag
                    color={getGradeColor(submission?.final_score || 0)}
                    style={{ fontWeight: "bold" }}
                  >
                    {getGradeLetter(submission?.final_score || 0)}
                  </Tag>
                </div>
                <div>
                  <Text type="secondary">Status: </Text>
                  <Tag color="success">Sudah Dinilai</Tag>
                </div>
              </Space>
            </div>
          </Col>

          <Col xs={24} sm={12}>
            <div
              style={{ padding: 16, background: "#f0f8ff", borderRadius: 8 }}
            >
              <Space direction="vertical" style={{ width: "100%" }}>
                <Text strong style={{ color: "#722ed1" }}>
                  📅 Timeline Assignment
                </Text>
                <div>
                  <Text type="secondary">Dikumpulkan: </Text>
                  <br />
                  <Text strong>
                    {submission?.submitted_at
                      ? dayjs(submission.submitted_at).format("DD MMMM YYYY")
                      : "N/A"}
                  </Text>
                </div>
                <div>
                  <Text type="secondary">Dinilai: </Text>
                  <br />
                  <Text strong>
                    {feedback.graded_at
                      ? dayjs(feedback.graded_at).format("DD MMMM YYYY")
                      : "N/A"}
                  </Text>
                </div>
                <div>
                  <Text type="secondary">Dinilai oleh: </Text>
                  <Tag color="blue">{feedback.graded_by || "Teacher"}</Tag>
                </div>
              </Space>
            </div>
          </Col>
        </Row>
      </Card>

      {/* PERBAIKAN: Tampilkan pesan yang jelas ketika tidak ada detail jawaban */}
      {(!answers || answers.length === 0) &&
      (!rubric_items || rubric_items.length === 0) ? (
        <Alert
          message="Detail Jawaban Assignment"
          description={
            <div>
              <Space
                direction="vertical"
                size="small"
                style={{ width: "100%" }}
              >
                <Text>
                  <InfoCircleOutlined
                    style={{ marginRight: 8, color: "#1890ff" }}
                  />
                  Detail jawaban tidak tersedia untuk assignment ini.
                </Text>

                <div style={{ marginTop: 12 }}>
                  <Text strong>Kemungkinan penyebab:</Text>
                  <ul
                    style={{ marginTop: 8, marginBottom: 0, paddingLeft: 20 }}
                  >
                    <li>Assignment dinilai secara manual oleh guru</li>
                    <li>Assignment dikerjakan dalam bentuk upload file</li>
                    <li>Sistem belum mencatat detail jawaban individual</li>
                    <li>Assignment berupa tugas praktikum atau presentasi</li>
                  </ul>
                </div>

                <div
                  style={{
                    marginTop: 16,
                    padding: 12,
                    background: "#f0f8ff",
                    borderRadius: 6,
                    border: "1px solid #d6e4ff",
                  }}
                >
                  <Text strong style={{ color: "#1890ff" }}>
                    💡 Tips untuk mendapatkan feedback lebih detail:
                  </Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Hubungi guru mata pelajaran untuk mendapatkan penjelasan
                    lebih lanjut tentang penilaian dan area yang perlu
                    diperbaiki.
                  </Text>
                </div>
              </Space>
            </div>
          }
          type="info"
          showIcon
          style={{ marginBottom: 24, borderRadius: 8 }}
        />
      ) : (
        // Jika ada answers atau rubric_items, tampilkan seperti biasa
        <>
          {/* Answer Review */}
          {answers && answers.length > 0 && (
            <>
              <Divider orientation="left">
                <Text strong>Review Jawaban ({answers.length} soal)</Text>
              </Divider>

              <div style={{ marginBottom: 24 }}>
                {answers.map(renderAnswerReview)}
              </div>
            </>
          )}

          {/* Rubric Items */}
          {rubric_items && rubric_items.length > 0 && (
            <>
              <Divider orientation="left">
                <Text strong>Kriteria Penilaian</Text>
              </Divider>

              <div style={{ marginBottom: 24 }}>
                {rubric_items.map(renderRubricItem)}
              </div>
            </>
          )}
        </>
      )}

      {/* Improvement Suggestions - Tampilkan saran umum */}
      <Card style={{ marginTop: 24, borderRadius: 12 }}>
        <Title level={5} style={{ marginBottom: 16 }}>
          💡 Saran Pengembangan
        </Title>

        {submission?.final_score >= 90 ? (
          <Alert
            message="Pencapaian Luar Biasa! 🎉"
            description={
              <div>
                <p>
                  Selamat! Anda telah menunjukkan pemahaman yang sangat baik
                  pada assignment ini.
                </p>
                <p>
                  <strong>Saran untuk langkah selanjutnya:</strong>
                </p>
                <ul>
                  <li>Pertahankan konsistensi belajar yang sudah baik</li>
                  <li>Bantu teman-teman yang membutuhkan bantuan</li>
                  <li>
                    Eksplorasi materi tambahan untuk memperdalam pemahaman
                  </li>
                </ul>
              </div>
            }
            type="success"
            showIcon
          />
        ) : submission?.final_score >= 75 ? (
          <Alert
            message="Hasil yang Baik! 👍"
            description={
              <div>
                <p>
                  Anda telah menunjukkan pemahaman yang cukup baik pada
                  assignment ini.
                </p>
                <p>
                  <strong>Saran untuk perbaikan:</strong>
                </p>
                <ul>
                  <li>Review kembali materi yang terkait dengan assignment</li>
                  <li>
                    Konsultasi dengan guru untuk klarifikasi konsep yang belum
                    jelas
                  </li>
                  <li>Latihan soal tambahan untuk memperkuat pemahaman</li>
                </ul>
              </div>
            }
            type="info"
            showIcon
          />
        ) : (
          <Alert
            message="Perlu Perbaikan 📚"
            description={
              <div>
                <p>
                  Ada beberapa area yang perlu diperbaiki untuk assignment ini.
                </p>
                <p>
                  <strong>Langkah yang disarankan:</strong>
                </p>
                <ul>
                  <li>Pelajari kembali materi dasar yang terkait</li>
                  <li>
                    Minta bantuan guru atau teman untuk penjelasan lebih detail
                  </li>
                  <li>Buat catatan ringkasan untuk memudahkan review</li>
                  <li>Kerjakan latihan soal tambahan</li>
                  <li>
                    Jangan ragu untuk bertanya jika ada yang tidak dipahami
                  </li>
                </ul>
              </div>
            }
            type="warning"
            showIcon
          />
        )}
      </Card>

      {/* Contact Teacher Section */}
      {/* <Card
        style={{
          marginTop: 24,
          borderRadius: 12,
          border: "2px dashed #d9d9d9",
        }}
      >
        <div style={{ textAlign: "center", padding: "16px 0" }}>
          <CommentOutlined
            style={{ fontSize: 24, color: "#1890ff", marginBottom: 12 }}
          />
          <Title level={5} style={{ margin: "0 0 8px 0" }}>
            Butuh Penjelasan Lebih Lanjut?
          </Title>
          <Text type="secondary">
            Hubungi guru mata pelajaran untuk diskusi lebih detail tentang hasil
            assignment ini
          </Text>
          <div style={{ marginTop: 16 }}>
            <Space>
              <Button type="primary" ghost icon={<UserOutlined />}>
                Kontak Guru
              </Button>
              <Button icon={<CalendarOutlined />}>Jadwalkan Konsultasi</Button>
            </Space>
          </div>
        </div>
      </Card> */}
    </Modal>
  );
};

export default AssignmentFeedback;
