import React from "react";
import {
  Modal,
  Table,
  Typography,
  Space,
  Tag,
  Card,
  Row,
  Col,
  Statistic,
  Avatar,
  Divider,
  Empty,
} from "antd";
import {
  UserOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
  StarOutlined,
  BookOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Title, Text } = Typography;

const SubmissionDetailModal = ({
  open,
  onClose,
  submission,
  questions,
  isMobile = false,
}) => {
  if (!submission) return null;

  const getGradeColor = (grade) => {
    if (grade >= 85) return "#52c41a";
    if (grade >= 70) return "#faad14";
    if (grade >= 60) return "#ff7a45";
    return "#ff4d4f";
  };

  const getGradeText = (grade) => {
    if (grade >= 90) return "A";
    if (grade >= 80) return "B";
    if (grade >= 70) return "C";
    if (grade >= 60) return "D";
    return "E";
  };

  // Create question map for easy lookup
  const questionMap = {};
  questions.forEach((q) => {
    questionMap[q.id] = q;
  });

  const columns = [
    {
      title: "#",
      key: "index",
      render: (_, __, index) => (
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          {index + 1}
        </div>
      ),
      width: 50,
      align: "center",
    },
    {
      title: "Soal & Jawaban",
      key: "question_answer",
      render: (_, answer) => {
        const question = questionMap[answer.question_id];
        const isCorrect = answer.is_correct;

        return (
          <div>
            {/* Question */}
            <div style={{ marginBottom: 16 }}>
              <Text strong style={{ fontSize: 14, display: "block" }}>
                {answer.question_text || question?.text}
              </Text>
            </div>

            {/* Student Answer */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ marginBottom: 8 }}>
                <Text strong style={{ color: "#1890ff", fontSize: 13 }}>
                  Jawaban Siswa:
                </Text>
              </div>
              <div
                style={{
                  background: isCorrect ? "#f6ffed" : "#fff2f0",
                  border: `2px solid ${isCorrect ? "#b7eb8f" : "#ffccc7"}`,
                  borderRadius: 8,
                  padding: "8px 12px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {isCorrect ? (
                    <CheckCircleOutlined style={{ color: "#52c41a" }} />
                  ) : (
                    <CloseCircleOutlined style={{ color: "#ff4d4f" }} />
                  )}
                  <div>
                    {answer.selected_choice && (
                      <Tag
                        color={isCorrect ? "success" : "error"}
                        style={{ marginRight: 8 }}
                      >
                        {answer.selected_choice}
                      </Tag>
                    )}
                    <Text style={{ fontSize: 13 }}>
                      {answer.selected_answer_text ||
                        answer.essay_answer ||
                        "Tidak ada jawaban"}
                    </Text>
                  </div>
                </div>
              </div>
            </div>

            {/* Correct Answer (if wrong) */}
            {!isCorrect && answer.correct_answer && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ marginBottom: 8 }}>
                  <Text strong style={{ color: "#52c41a", fontSize: 13 }}>
                    Jawaban Benar:
                  </Text>
                </div>
                <div
                  style={{
                    background: "#f6ffed",
                    border: "2px solid #b7eb8f",
                    borderRadius: 8,
                    padding: "8px 12px",
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <CheckCircleOutlined style={{ color: "#52c41a" }} />
                    <div>
                      <Tag color="success" style={{ marginRight: 8 }}>
                        {answer.correct_answer}
                      </Tag>
                      <Text style={{ fontSize: 13 }}>
                        {answer.correct_answer_text}
                      </Text>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Explanation */}
            {answer.explanation && (
              <div
                style={{
                  background: "#fff7e6",
                  border: "1px solid #ffd591",
                  borderRadius: 8,
                  padding: "8px 12px",
                  marginTop: 8,
                }}
              >
                <Text style={{ fontSize: 12, color: "#d46b08" }}>
                  💡 <strong>Penjelasan:</strong> {answer.explanation}
                </Text>
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: "Status",
      key: "status",
      render: (_, answer) => (
        <div style={{ textAlign: "center" }}>
          {answer.is_correct ? (
            <Tag
              color="success"
              icon={<CheckCircleOutlined />}
              style={{ borderRadius: 16, padding: "4px 12px" }}
            >
              Benar
            </Tag>
          ) : (
            <Tag
              color="error"
              icon={<CloseCircleOutlined />}
              style={{ borderRadius: 16, padding: "4px 12px" }}
            >
              Salah
            </Tag>
          )}
        </div>
      ),
      width: 80,
      align: "center",
    },
  ];

  // Calculate statistics
  const totalQuestions = submission.answers?.length || 0;
  const correctAnswers =
    submission.answers?.filter((a) => a.is_correct)?.length || 0;
  const accuracy =
    totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={isMobile ? "95%" : "90%"}
      style={{ maxWidth: 1000 }}
      centered
      destroyOnClose
      title={
        <div
          style={{
            background: "linear-gradient(135deg, #52c41a 0%, #73d13d 100%)",
            margin: "-24px -24px 0",
            padding: "20px 24px",
            borderRadius: "8px 8px 0 0",
            color: "white",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Avatar
              size={48}
              icon={<UserOutlined />}
              style={{
                background: "rgba(255, 255, 255, 0.2)",
                border: "2px solid rgba(255, 255, 255, 0.3)",
              }}
            />
            <div>
              <Title level={4} style={{ margin: 0, color: "white" }}>
                Detail Jawaban - {submission.student?.full_name}
              </Title>
              <Text style={{ color: "rgba(255,255,255,0.9)", fontSize: 14 }}>
                {submission.student?.username} • Submitted on{" "}
                {dayjs(submission.submission_date).format("DD MMM YYYY, HH:mm")}
              </Text>
            </div>
          </div>
        </div>
      }
    >
      <div style={{ padding: "20px 0" }}>
        {/* Summary Statistics */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={12} sm={6}>
            <Card
              size="small"
              style={{ textAlign: "center", borderRadius: 12 }}
            >
              <Statistic
                title="Nilai"
                value={submission.grade?.toFixed(1) || 0}
                suffix="/100"
                prefix={
                  <TrophyOutlined
                    style={{ color: getGradeColor(submission.grade) }}
                  />
                }
                valueStyle={{
                  color: getGradeColor(submission.grade),
                  fontSize: isMobile ? 16 : 20,
                }}
                titleStyle={{ fontSize: isMobile ? 10 : 12 }}
              />
              <Tag
                color={getGradeColor(submission.grade)}
                style={{ marginTop: 8, borderRadius: 12 }}
              >
                Grade {getGradeText(submission.grade)}
              </Tag>
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card
              size="small"
              style={{ textAlign: "center", borderRadius: 12 }}
            >
              <Statistic
                title="Jawaban Benar"
                value={correctAnswers}
                suffix={`/${totalQuestions}`}
                prefix={<CheckCircleOutlined style={{ color: "#52c41a" }} />}
                valueStyle={{ color: "#52c41a", fontSize: isMobile ? 16 : 20 }}
                titleStyle={{ fontSize: isMobile ? 10 : 12 }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card
              size="small"
              style={{ textAlign: "center", borderRadius: 12 }}
            >
              <Statistic
                title="Akurasi"
                value={accuracy.toFixed(1)}
                suffix="%"
                prefix={<StarOutlined style={{ color: "#faad14" }} />}
                valueStyle={{ color: "#faad14", fontSize: isMobile ? 16 : 20 }}
                titleStyle={{ fontSize: isMobile ? 10 : 12 }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card
              size="small"
              style={{ textAlign: "center", borderRadius: 12 }}
            >
              <Statistic
                title="Status"
                value={submission.is_late ? "Terlambat" : "Tepat Waktu"}
                prefix={
                  <ClockCircleOutlined
                    style={{
                      color: submission.is_late ? "#ff4d4f" : "#52c41a",
                    }}
                  />
                }
                valueStyle={{
                  color: submission.is_late ? "#ff4d4f" : "#52c41a",
                  fontSize: isMobile ? 12 : 14,
                }}
                titleStyle={{ fontSize: isMobile ? 10 : 12 }}
              />
            </Card>
          </Col>
        </Row>

        {/* Teacher Feedback */}
        {submission.teacher_feedback && (
          <>
            <Card
              style={{
                marginBottom: 24,
                borderRadius: 12,
                background: "linear-gradient(135deg, #f0f8ff 0%, #e6f3ff 100%)",
                border: "1px solid #d1e9ff",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 12,
                }}
              >
                <BookOutlined style={{ color: "#1890ff" }} />
                <Text strong style={{ color: "#1890ff" }}>
                  Feedback dari Guru
                </Text>
              </div>
              <Text style={{ fontSize: 14, lineHeight: 1.6 }}>
                {submission.teacher_feedback}
              </Text>
              {submission.graded_at && (
                <div
                  style={{
                    marginTop: 12,
                    paddingTop: 12,
                    borderTop: "1px solid #e6f7ff",
                  }}
                >
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Dinilai pada:{" "}
                    {dayjs(submission.graded_at).format("DD MMM YYYY, HH:mm")}
                  </Text>
                </div>
              )}
            </Card>
          </>
        )}

        {/* Answers Detail */}
        <Card
          title={
            <Space>
              <BookOutlined style={{ color: "#667eea" }} />
              <span>Detail Jawaban ({totalQuestions} soal)</span>
            </Space>
          }
          style={{
            borderRadius: 16,
            border: "none",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          }}
          bodyStyle={{ padding: 0 }}
        >
          {submission.answers && submission.answers.length > 0 ? (
            <Table
              columns={columns}
              dataSource={submission.answers.map((answer, index) => ({
                ...answer,
                key: answer.id || index,
              }))}
              pagination={false}
              scroll={{ x: isMobile ? 600 : undefined }}
              size={isMobile ? "small" : "middle"}
            />
          ) : (
            <div style={{ padding: 40, textAlign: "center" }}>
              <Empty
                description="Tidak ada detail jawaban"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            </div>
          )}
        </Card>
      </div>
    </Modal>
  );
};

export default SubmissionDetailModal;
