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
  Tooltip,
  message,
} from "antd";
import {
  CloseOutlined,
  DownloadOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  QuestionCircleOutlined,
  BookOutlined,
  StarOutlined,
  CommentOutlined,
  TeamOutlined,
  UserOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import useQuizReview from "../hooks/useQuizReview";
import dayjs from "dayjs";
import api from "../../../../api";

const { Title, Text, Paragraph } = Typography;

const QuizResultsDetail = ({
  visible,
  onClose,
  attemptId,
  quizTitle,
  isGroupQuiz,
  groupData,
  
  onDownloadReport,
}) => {
  const {
    quizReview,
    loading,
    error,
    fetchQuizReview,
    downloadQuizReport,
    resetQuizReview,
  } = useQuizReview();

  // Fetch quiz review details
  useEffect(() => {
    if (visible && attemptId) {
      fetchQuizReview(attemptId, isGroupQuiz); // Pass isGroupQuiz parameter
    }

    if (!visible) {
      resetQuizReview();
    }
  }, [visible, attemptId, isGroupQuiz, fetchQuizReview, resetQuizReview]);

  // Update handleDownload:
  const handleDownload = async (format = "pdf") => {
    if (onDownloadReport) {
      onDownloadReport(format);
    } else {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Token tidak ditemukan");
        }

        // PERBAIKAN: Gunakan endpoint yang sesuai
        const endpoint = isGroupQuiz
          ? `/student/group-quiz-review/${attemptId}/`
          : `/student/quiz-review/${attemptId}/`;

        const response = await api.get(endpoint, {
          params: { download: format },
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: "blob", // Important untuk download file
        });

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
        a.download = `${
          isGroupQuiz ? "group-" : ""
        }quiz-feedback-${attemptId}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        message.success("Report berhasil didownload");
      } catch (err) {
        console.error("Error downloading quiz report:", err);
        if (err.response?.status === 404) {
          message.error("Download tidak tersedia untuk quiz ini");
        } else {
          message.error("Gagal mengunduh laporan quiz");
        }
      }
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return "#52c41a";
    if (score >= 80) return "#1890ff";
    if (score >= 70) return "#faad14";
    if (score >= 60) return "#fa8c16";
    return "#ff4d4f";
  };

  const getGradeLetter = (score) => {
    if (score >= 90) return "A";
    if (score >= 80) return "B";
    if (score >= 70) return "C";
    if (score >= 60) return "D";
    return "E";
  };

  const renderQuestionReview = (question, index) => {
    const isCorrect = question.is_correct;
    const userAnswer = question.user_answer;
    const correctAnswer = question.correct_answer;
    const answeredBy = question.answered_by_name || "Tim";

    return (
      <Card
        key={question.id || index}
        size="small"
        style={{
          marginBottom: 16,
          borderRadius: 8,
          border: `2px solid ${isCorrect ? "#52c41a" : "#ff4d4f"}`,
        }}
      >
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <div style={{ flex: 1 }}>
                <Space style={{ marginBottom: 8 }}>
                  <Tag color={isCorrect ? "green" : "red"}>
                    {isCorrect ? "Benar" : "Salah"}
                  </Tag>
                  <Text strong>Soal {index + 1}</Text>
                  {question.points && (
                    <Tag color="blue">{question.points} poin</Tag>
                  )}
                  {isGroupQuiz && (
                    <Tag color="purple" icon={<UserOutlined />}>
                      {answeredBy}
                    </Tag>
                  )}
                </Space>

                <Paragraph style={{ marginBottom: 12 }}>
                  {question.question_text}
                </Paragraph>

                {/* Question Image if exists */}
                {question.question_image && (
                  <div style={{ marginBottom: 12 }}>
                    <img
                      src={question.question_image}
                      alt="Question"
                      style={{
                        maxWidth: "100%",
                        height: "auto",
                        borderRadius: 4,
                      }}
                    />
                  </div>
                )}
              </div>

              <div
                style={{
                  fontSize: 24,
                  color: isCorrect ? "#52c41a" : "#ff4d4f",
                }}
              >
                {isCorrect ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
              </div>
            </div>
          </Col>

          <Col span={24}>
            <Row gutter={[16, 8]}>
              {/* Team/User Answer */}
              <Col xs={24} md={12}>
                <Card
                  size="small"
                  style={{ background: isCorrect ? "#f6ffed" : "#fff2f0" }}
                >
                  <Text
                    strong
                    style={{ color: isCorrect ? "#52c41a" : "#ff4d4f" }}
                  >
                    {isGroupQuiz ? "Jawaban Tim:" : "Jawaban Anda:"}
                  </Text>
                  <div style={{ marginTop: 4 }}>
                    {userAnswer ? (
                      <Text>{userAnswer}</Text>
                    ) : (
                      <Text type="secondary" italic>
                        Tidak dijawab
                      </Text>
                    )}
                  </div>
                </Card>
              </Col>

              {/* Correct Answer */}
              {!isCorrect && (
                <Col xs={24} md={12}>
                  <Card size="small" style={{ background: "#f6ffed" }}>
                    <Text strong style={{ color: "#52c41a" }}>
                      Jawaban Benar:
                    </Text>
                    <div style={{ marginTop: 4 }}>
                      <Text>{correctAnswer}</Text>
                    </div>
                  </Card>
                </Col>
              )}
            </Row>
          </Col>

          {/* Explanation */}
          {question.explanation && (
            <Col span={24}>
              <Alert
                message="Penjelasan"
                description={question.explanation}
                type="info"
                showIcon
                icon={<QuestionCircleOutlined />}
                style={{ borderRadius: 6 }}
              />
            </Col>
          )}
        </Row>
      </Card>
    );
  };

  if (loading) {
    return (
      <Modal
        title={`Detail Hasil ${isGroupQuiz ? "Quiz Kelompok" : "Quiz"}`}
        open={visible}
        onCancel={onClose}
        footer={null}
        width={800}
        centered
      >
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <Spin
            size="large"
            tip={`Memuat detail hasil ${
              isGroupQuiz ? "quiz kelompok" : "quiz"
            }...`}
          />
        </div>
      </Modal>
    );
  }

  if (error) {
    return (
      <Modal
        title={`Detail Hasil ${isGroupQuiz ? "Quiz Kelompok" : "Quiz"}`}
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

  if (!quizReview) {
    return (
      <Modal
        title={`Detail Hasil ${isGroupQuiz ? "Quiz Kelompok" : "Quiz"}`}
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

  const { quiz, attempt, questions = [], summary = {} } = quizReview;

  return (
    <Modal
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {isGroupQuiz ? (
            <TeamOutlined style={{ color: "#722ed1" }} />
          ) : (
            <BookOutlined style={{ color: "#1890ff" }} />
          )}
          <span>Detail Hasil {isGroupQuiz ? "Quiz Kelompok" : "Quiz"}</span>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={[
        <Button
          key="download"
          type="default"
          icon={<DownloadOutlined />}
          onClick={() => handleDownload("pdf")}
        >
          Download Report
        </Button>,
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
      {/* Quiz Header - Mirip AssignmentFeedback */}
      <Card
        style={{
          marginBottom: 24,
          marginTop: 16,
          borderRadius: 12,
          background: isGroupQuiz
            ? "linear-gradient(135deg, #722ed1 0%, #9254de 60%, #b37feb 100%)"
            : "linear-gradient(135deg, #001529 0%, #3a3f5c 60%, #43cea2 100%)",
        }}
      >
        <div style={{ color: "white" }}>
          <Row gutter={[24, 16]} align="middle">
            <Col xs={24} md={16}>
              <Space direction="vertical" size="small">
                <Title level={4} style={{ color: "white", margin: 0 }}>
                  {isGroupQuiz ? "🏆 Hasil Quiz Kelompok" : "📝 Hasil Quiz"}
                </Title>
                <Text style={{ color: "rgba(255,255,255,0.9)" }}>
                  Quiz "{quiz?.title || quizTitle}" telah diselesaikan
                  {isGroupQuiz ? " oleh tim" : ""}
                </Text>

                <div style={{ marginTop: 12 }}>
                  <Space wrap>
                    <Tag
                      color={
                        attempt?.score >= 85
                          ? "success"
                          : attempt?.score >= 70
                          ? "warning"
                          : "error"
                      }
                      style={{ fontWeight: "bold" }}
                    >
                      {attempt?.score >= 85
                        ? "🌟 Sangat Baik"
                        : attempt?.score >= 70
                        ? "👍 Baik"
                        : "📚 Perlu Perbaikan"}
                    </Tag>
                    {isGroupQuiz && groupData && (
                      <Tag color="purple" icon={<TeamOutlined />}>
                        {groupData.name}
                      </Tag>
                    )}
                    <Tag color="blue">
                      {quiz?.subject_name || "Mata Pelajaran"}
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
                  {attempt?.score?.toFixed(0) || "0"}
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

      {/* Teacher/System Feedback */}
      <Alert
        message={isGroupQuiz ? "Feedback Quiz Kelompok" : "Feedback Quiz"}
        description={
          attempt?.teacher_feedback ? (
            attempt.teacher_feedback
          ) : (
            <div>
              <Text type="secondary" italic>
                {isGroupQuiz
                  ? "Quiz kelompok telah diselesaikan dengan kerja sama tim yang baik."
                  : "Quiz individual telah diselesaikan."}
              </Text>
              <br />
              <Text type="secondary" style={{ fontSize: 12 }}>
                Lihat detail jawaban di bawah untuk analisis lebih lanjut.
              </Text>
            </div>
          )
        }
        type="info"
        showIcon
        icon={<StarOutlined />}
        style={{ marginBottom: 24, borderRadius: 8 }}
      />

      {/* Detail Information - Mirip AssignmentFeedback */}
      <Card style={{ marginBottom: 24, borderRadius: 12 }}>
        <Title level={5} style={{ marginBottom: 16 }}>
          {isGroupQuiz ? "Detail Hasil Quiz Kelompok" : "Detail Hasil Quiz"}
        </Title>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12}>
            <div
              style={{ padding: 16, background: "#f8f9fa", borderRadius: 8 }}
            >
              <Space direction="vertical" style={{ width: "100%" }}>
                <Text strong style={{ color: "#1890ff" }}>
                  📊 Informasi Skor
                </Text>
                <div>
                  <Text type="secondary">Skor Akhir: </Text>
                  <Text
                    strong
                    style={{
                      fontSize: 16,
                      color: getScoreColor(attempt?.score || 0),
                    }}
                  >
                    {attempt?.score?.toFixed(1) || "0.0"}/100
                  </Text>
                </div>
                <div>
                  <Text type="secondary">Grade: </Text>
                  <Tag
                    color={getScoreColor(attempt?.score || 0)}
                    style={{ fontWeight: "bold" }}
                  >
                    {getGradeLetter(attempt?.score || 0)}
                  </Tag>
                </div>
                <div>
                  <Text type="secondary">Status: </Text>
                  <Tag color="success">Selesai</Tag>
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
                  📅 Timeline Quiz
                </Text>
                <div>
                  <Text type="secondary">Diselesaikan: </Text>
                  <br />
                  <Text strong>
                    {attempt?.completed_at
                      ? dayjs(attempt.completed_at).format("DD MMMM YYYY")
                      : "N/A"}
                  </Text>
                </div>
                <div>
                  <Text type="secondary">Durasi: </Text>
                  <br />
                  <Text strong>
                    {attempt?.duration || quiz?.duration || "N/A"} menit
                  </Text>
                </div>
                {isGroupQuiz && groupData && (
                  <div>
                    <Text type="secondary">Kelompok: </Text>
                    <Tag color="purple" icon={<TeamOutlined />}>
                      {groupData.name}
                    </Tag>
                  </div>
                )}
              </Space>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Summary Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card size="small" style={{ textAlign: "center", borderRadius: 8 }}>
            <div style={{ color: "#52c41a", fontSize: 18, fontWeight: "bold" }}>
              {summary.correct_answers || 0}
            </div>
            <div style={{ fontSize: 12, color: "#666" }}>Benar</div>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" style={{ textAlign: "center", borderRadius: 8 }}>
            <div style={{ color: "#ff4d4f", fontSize: 18, fontWeight: "bold" }}>
              {summary.incorrect_answers || 0}
            </div>
            <div style={{ fontSize: 12, color: "#666" }}>Salah</div>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" style={{ textAlign: "center", borderRadius: 8 }}>
            <div style={{ color: "#faad14", fontSize: 18, fontWeight: "bold" }}>
              {summary.unanswered || 0}
            </div>
            <div style={{ fontSize: 12, color: "#666" }}>Tidak Dijawab</div>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" style={{ textAlign: "center", borderRadius: 8 }}>
            <div style={{ color: "#1890ff", fontSize: 18, fontWeight: "bold" }}>
              {questions.length || 0}
            </div>
            <div style={{ fontSize: 12, color: "#666" }}>Total Soal</div>
          </Card>
        </Col>
      </Row>

      {/* Questions Review */}
      {questions && questions.length > 0 ? (
        <>
          <Divider orientation="left">
            <Text strong>
              Review Jawaban ({questions.length} soal)
              {isGroupQuiz && (
                <Tag color="purple" style={{ marginLeft: 8 }}>
                  <TeamOutlined /> Kelompok
                </Tag>
              )}
            </Text>
          </Divider>

          <div style={{ marginBottom: 24 }}>
            {questions.map(renderQuestionReview)}
          </div>
        </>
      ) : (
        // Jika tidak ada detail soal
        <Alert
          message={`Detail Soal ${isGroupQuiz ? "Quiz Kelompok" : "Quiz"}`}
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
                  Detail soal dan jawaban tidak tersedia untuk quiz ini.
                </Text>

                <div style={{ marginTop: 12 }}>
                  <Text strong>Kemungkinan penyebab:</Text>
                  <ul
                    style={{ marginTop: 8, marginBottom: 0, paddingLeft: 20 }}
                  >
                    <li>Quiz sudah selesai dan review dinonaktifkan</li>
                    <li>Quiz tidak menyimpan detail jawaban</li>
                    <li>Data quiz masih dalam proses sinkronisasi</li>
                    {isGroupQuiz && (
                      <li>Quiz kelompok tidak menampilkan review detail</li>
                    )}
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
                    💡 Tips untuk analisis lebih lanjut:
                  </Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {isGroupQuiz
                      ? "Diskusikan hasil quiz dengan anggota kelompok dan guru untuk evaluasi bersama."
                      : "Hubungi guru untuk mendapatkan review detail jawaban dan penjelasan materi."}
                  </Text>
                </div>
              </Space>
            </div>
          }
          type="info"
          showIcon
          style={{ marginBottom: 24, borderRadius: 8 }}
        />
      )}

      {/* Improvement Suggestions - Disesuaikan untuk Quiz & Group */}
      <Card style={{ marginTop: 24, borderRadius: 12 }}>
        <Title level={5} style={{ marginBottom: 16 }}>
          💡 Saran Pengembangan {isGroupQuiz ? "Tim" : ""}
        </Title>

        {attempt?.score >= 90 ? (
          <Alert
            message={`${
              isGroupQuiz ? "Pencapaian Tim" : "Pencapaian"
            } Luar Biasa! 🎉`}
            description={
              <div>
                <p>
                  {isGroupQuiz
                    ? "Selamat! Tim telah menunjukkan kerja sama dan pemahaman yang sangat baik pada quiz ini."
                    : "Selamat! Anda telah menunjukkan pemahaman yang sangat baik pada quiz ini."}
                </p>
                <p>
                  <strong>Saran untuk langkah selanjutnya:</strong>
                </p>
                <ul>
                  {isGroupQuiz ? (
                    <>
                      <li>
                        Pertahankan komunikasi dan kerja sama tim yang solid
                      </li>
                      <li>
                        Berbagi strategi belajar yang efektif antar anggota
                      </li>
                      <li>Bantu kelompok lain yang membutuhkan bantuan</li>
                      <li>Eksplorasi materi tambahan secara bersama-sama</li>
                    </>
                  ) : (
                    <>
                      <li>Pertahankan konsistensi belajar yang sudah baik</li>
                      <li>Bantu teman-teman yang membutuhkan bantuan</li>
                      <li>
                        Eksplorasi materi tambahan untuk memperdalam pemahaman
                      </li>
                      <li>Pertimbangkan untuk mengikuti quiz kelompok</li>
                    </>
                  )}
                </ul>
              </div>
            }
            type="success"
            showIcon
          />
        ) : attempt?.score >= 75 ? (
          <Alert
            message={`Hasil ${isGroupQuiz ? "Tim" : ""} yang Baik! 👍`}
            description={
              <div>
                <p>
                  {isGroupQuiz
                    ? "Tim telah menunjukkan kerja sama dan pemahaman yang cukup baik pada quiz ini."
                    : "Anda telah menunjukkan pemahaman yang cukup baik pada quiz ini."}
                </p>
                <p>
                  <strong>Saran untuk perbaikan:</strong>
                </p>
                <ul>
                  {isGroupQuiz ? (
                    <>
                      <li>Review kembali materi bersama anggota tim</li>
                      <li>Diskusikan strategi menjawab yang lebih efektif</li>
                      <li>
                        Bagi tugas review materi berdasarkan kekuatan
                        masing-masing
                      </li>
                      <li>Konsultasi dengan guru untuk klarifikasi konsep</li>
                    </>
                  ) : (
                    <>
                      <li>Review kembali materi yang terkait dengan quiz</li>
                      <li>
                        Konsultasi dengan guru untuk klarifikasi konsep yang
                        belum jelas
                      </li>
                      <li>Latihan soal tambahan untuk memperkuat pemahaman</li>
                      <li>Pertimbangkan bergabung dalam grup belajar</li>
                    </>
                  )}
                </ul>
              </div>
            }
            type="info"
            showIcon
          />
        ) : (
          <Alert
            message={`${isGroupQuiz ? "Tim" : ""} Perlu Perbaikan 📚`}
            description={
              <div>
                <p>
                  {isGroupQuiz
                    ? "Ada beberapa area yang perlu diperbaiki dalam kerja sama dan pemahaman tim untuk quiz ini."
                    : "Ada beberapa area yang perlu diperbaiki untuk quiz ini."}
                </p>
                <p>
                  <strong>Langkah yang disarankan:</strong>
                </p>
                <ul>
                  {isGroupQuiz ? (
                    <>
                      <li>Evaluasi kembali strategi kerja sama tim</li>
                      <li>Pelajari kembali materi dasar secara bersama-sama</li>
                      <li>Buat jadwal study group yang teratur</li>
                      <li>Diskusikan pembagian peran yang lebih efektif</li>
                      <li>Minta bantuan guru untuk mentoring kelompok</li>
                      <li>
                        Buat catatan ringkasan tim untuk memudahkan review
                      </li>
                    </>
                  ) : (
                    <>
                      <li>Pelajari kembali materi dasar yang terkait</li>
                      <li>
                        Minta bantuan guru atau teman untuk penjelasan lebih
                        detail
                      </li>
                      <li>Buat catatan ringkasan untuk memudahkan review</li>
                      <li>Kerjakan latihan soal tambahan</li>
                      <li>Bergabung dengan kelompok belajar</li>
                      <li>
                        Jangan ragu untuk bertanya jika ada yang tidak dipahami
                      </li>
                    </>
                  )}
                </ul>
              </div>
            }
            type="warning"
            showIcon
          />
        )}
      </Card>

      {/* Group Members Section (khusus untuk Group Quiz) */}
      {isGroupQuiz && groupData && groupData.members && (
        <Card style={{ marginTop: 24, borderRadius: 12 }}>
          <Title level={5} style={{ marginBottom: 16 }}>
            👥 Anggota Kelompok
          </Title>
          <Row gutter={[16, 8]}>
            {groupData.members.map((member, index) => (
              <Col xs={24} sm={12} md={8} key={member.id || index}>
                <Card size="small" style={{ borderRadius: 8 }}>
                  <Space>
                    <UserOutlined style={{ color: "#1890ff" }} />
                    <div>
                      <Text strong>{member.name}</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {member.student_id || member.username}
                      </Text>
                    </div>
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>
        </Card>
      )}

      {/* Contact Teacher Section */}
      <Card
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
            {isGroupQuiz
              ? "Hubungi guru mata pelajaran untuk diskusi strategi kelompok dan review materi"
              : "Hubungi guru mata pelajaran untuk diskusi lebih detail tentang hasil quiz ini"}
          </Text>
          <div style={{ marginTop: 16 }}>
            <Space>
              <Button type="primary" ghost icon={<UserOutlined />}>
                Kontak Guru
              </Button>
              {isGroupQuiz && (
                <Button icon={<TeamOutlined />}>Diskusi Kelompok</Button>
              )}
            </Space>
          </div>
        </div>
      </Card>
    </Modal>
  );
};

export default QuizResultsDetail;
