import React, { useState, useEffect } from "react";
import {
  Modal,
  Typography,
  Card,
  Row,
  Col,
  Collapse,
  Tag,
  Space,
  Table,
  Progress,
  Statistic,
  Avatar,
  Tooltip,
  Button,
  Spin,
  Alert,
  Descriptions,
} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  UserOutlined,
  TeamOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
  BarChartOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import moment from "moment";

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

const SessionsQuizResultsModal = ({
  open,
  onClose,
  quiz,
  materialSlug,
  onGetQuizDetail,
}) => {
  const [quizDetail, setQuizDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch quiz detail when modal opens
  useEffect(() => {
    if (open && quiz?.id && materialSlug) {
      fetchQuizDetail();
    }
  }, [open, quiz?.id, materialSlug]);

  const fetchQuizDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const detail = await onGetQuizDetail(quiz.id);
      setQuizDetail(detail);
    } catch (error) {
      setError("Gagal memuat detail hasil quiz");
      console.error("Error fetching quiz detail:", error);
    } finally {
      setLoading(false);
    }
  };

  // Get choice color based on correctness
  const getChoiceColor = (isCorrect, isSelected) => {
    if (isSelected && isCorrect) return "#52c41a"; // Green for correct selection
    if (isSelected && !isCorrect) return "#ff4d4f"; // Red for wrong selection
    if (!isSelected && isCorrect) return "#1890ff"; // Blue for correct answer not selected
    return "#d9d9d9"; // Gray for other choices
  };

  // Get choice icon
  const getChoiceIcon = (isCorrect, isSelected) => {
    if (isSelected && isCorrect) return <CheckCircleOutlined />;
    if (isSelected && !isCorrect) return <CloseCircleOutlined />;
    return null;
  };

  // Question analysis table columns
  const questionColumns = [
    {
      title: "No",
      dataIndex: "question_id",
      key: "question_id",
      render: (_, record, index) => index + 1,
      width: 50,
      align: "center",
    },
    {
      title: "Soal",
      dataIndex: "question_text",
      key: "question_text",
      render: (text) => (
        <div style={{ maxWidth: 300 }}>
          <Paragraph ellipsis={{ rows: 2, expandable: true }}>{text}</Paragraph>
        </div>
      ),
    },
    {
      title: "Jawaban Benar",
      dataIndex: "correct_choice",
      key: "correct_choice",
      render: (choice) => (
        <Tag color="green" style={{ fontSize: 14, fontWeight: "bold" }}>
          {choice}
        </Tag>
      ),
      width: 100,
      align: "center",
    },
    {
      title: "Dipilih",
      dataIndex: "selected_choice",
      key: "selected_choice",
      render: (choice, record) => (
        <Tag
          color={record.is_correct ? "green" : "red"}
          style={{ fontSize: 14, fontWeight: "bold" }}
          icon={
            record.is_correct ? (
              <CheckCircleOutlined />
            ) : (
              <CloseCircleOutlined />
            )
          }
        >
          {choice}
        </Tag>
      ),
      width: 100,
      align: "center",
    },
    {
      title: "Dijawab Oleh",
      dataIndex: "answered_by",
      key: "answered_by",
      render: (answeredBy) => (
        <Space>
          <Avatar size="small" icon={<UserOutlined />} />
          <Text>
            {answeredBy.first_name && answeredBy.last_name
              ? `${answeredBy.first_name} ${answeredBy.last_name}`
              : answeredBy.username || "-"}
          </Text>
        </Space>
      ),
      width: 150,
    },
    {
      title: "Status",
      dataIndex: "is_correct",
      key: "is_correct",
      render: (isCorrect) => (
        <Tag
          color={isCorrect ? "success" : "error"}
          icon={isCorrect ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
        >
          {isCorrect ? "Benar" : "Salah"}
        </Tag>
      ),
      width: 100,
      align: "center",
      filters: [
        { text: "Benar", value: true },
        { text: "Salah", value: false },
      ],
      onFilter: (value, record) => record.is_correct === value,
    },
  ];

  if (!quizDetail && !loading) {
    return null;
  }

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width="95%"
      style={{ maxWidth: 1600, top: 20 }}
      title={
        <div style={{ borderBottom: "2px solid #f0f0f0", paddingBottom: 16 }}>
          <Space>
            <BarChartOutlined style={{ color: "#1890ff", fontSize: 24 }} />
            <Title level={3} style={{ margin: 0 }}>
              Hasil Quiz: {quiz?.title}
            </Title>
          </Space>
        </div>
      }
      destroyOnClose
    >
      <Spin spinning={loading}>
        {error && (
          <Alert
            message="Error"
            description={error}
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
            action={
              <Button size="small" onClick={fetchQuizDetail}>
                Coba Lagi
              </Button>
            }
          />
        )}

        {quizDetail && (
          <div>
            {/* Quiz Overview */}
            <Card title="📊 Ringkasan Quiz" style={{ marginBottom: 24 }}>
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="Judul">
                      {quizDetail.quiz.title}
                    </Descriptions.Item>
                    <Descriptions.Item label="Deskripsi">
                      {quizDetail.quiz.content}
                    </Descriptions.Item>
                    <Descriptions.Item label="Dibuat">
                      {moment(quizDetail.quiz.created_at).format(
                        "DD/MM/YYYY HH:mm"
                      )}
                    </Descriptions.Item>
                    <Descriptions.Item label="Total Soal">
                      {quizDetail.quiz.questions.length} soal
                    </Descriptions.Item>
                  </Descriptions>
                </Col>
                <Col xs={24} md={12}>
                  <Row gutter={16}>
                    <Col xs={12}>
                      <Statistic
                        title="Kelompok Mengerjakan"
                        value={quizDetail.results.length}
                        prefix={<TeamOutlined />}
                        valueStyle={{ color: "#1890ff" }}
                      />
                    </Col>
                    <Col xs={12}>
                      <Statistic
                        title="Rata-rata Skor"
                        value={
                          quizDetail.results.length > 0
                            ? (
                                quizDetail.results.reduce(
                                  (sum, r) =>
                                    sum +
                                    (r.performance &&
                                    typeof r.performance.score === "number"
                                      ? r.performance.score
                                      : 0),
                                  0
                                ) / quizDetail.results.length
                              ).toFixed(1)
                            : 0
                        }
                        suffix="%"
                        prefix={<TrophyOutlined />}
                        valueStyle={{ color: "#faad14" }}
                      />
                    </Col>
                  </Row>
                </Col>
              </Row>
            </Card>

            {/* Group Results */}
            <Card title="👥 Hasil per Kelompok" style={{ marginBottom: 24 }}>
              <Collapse
                size="small"
                ghost
                // expandIcon={({ isActive }) => (
                //   <div
                //     style={{
                //       transform: `rotate(${isActive ? 90 : 0}deg)`,
                //       fontSize: 16,
                //       color: "#1890ff",
                //     }}
                //   >
                //     ▶
                //   </div>
                // )}
              >
                {quizDetail.results.map((result, index) => (
                  <Panel
                    key={result.group_id}
                    header={
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          paddingRight: 24,
                        }}
                      >
                        <Space>
                          <Text strong style={{ fontSize: 16 }}>
                            {result.group_name || "Nama grup tidak tersedia"}
                          </Text>
                          <Text type="secondary">
                            ({result.group_code || "Kode grup tidak tersedia"})
                          </Text>
                          <Tag color="blue">
                            {(result.members && result.members.length) || 0}{" "}
                            anggota
                          </Tag>
                          {/* Status badge */}
                          {result.is_completed ? (
                            <Tag color="green">Sudah Selesai</Tag>
                          ) : (
                            <Tag color="orange">Belum Selesai</Tag>
                          )}
                        </Space>
                        <Space>
                          <Progress
                            percent={result.score || 0}
                            size="small"
                            style={{ width: 100 }}
                            strokeColor={
                              result.score >= 80
                                ? "#52c41a"
                                : result.score >= 60
                                ? "#faad14"
                                : "#ff4d4f"
                            }
                          />
                        </Space>
                      </div>
                    }
                  >
                    <Row gutter={16} style={{ marginBottom: 16 }}>
                      {/* Group Info */}
                      <Col xs={24} md={8}>
                        <Card size="small" title="Informasi Kelompok">
                          <Space direction="vertical" style={{ width: "100%" }}>
                            <div>
                              <Text strong>Anggota:</Text>
                              <div style={{ marginBottom: 12 }}>
                                <Text strong>Anggota:</Text>
                                {result.members && result.members.length > 0 ? (
                                  <ul style={{ margin: 0, paddingLeft: 20 }}>
                                    {result.members.map((m) => (
                                      <li key={m.id}>
                                        {m.first_name} {m.last_name}{" "}
                                        <span style={{ color: "#888" }}>
                                          ({m.username})
                                        </span>
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <Text type="secondary">
                                    Tidak ada anggota
                                  </Text>
                                )}
                              </div>
                              {/* Info waktu submit */}
                              {result.is_completed && result.submitted_at && (
                                <div style={{ marginBottom: 8 }}>
                                  <Text type="success">
                                    <ClockCircleOutlined /> Submit:{" "}
                                    {moment(result.submitted_at).format(
                                      "DD/MM/YYYY HH:mm"
                                    )}
                                  </Text>
                                </div>
                              )}
                            </div>
                            <div>
                              <Text strong>Waktu:</Text>
                              <div style={{ marginTop: 4 }}>
                                <div>
                                  <ClockCircleOutlined /> Mulai:{" "}
                                  {moment(result.start_time).format(
                                    "DD/MM/YYYY HH:mm"
                                  )}
                                </div>
                                {result.submitted_at && (
                                  <div>
                                    <CheckCircleOutlined
                                      style={{ color: "#52c41a" }}
                                    />{" "}
                                    Submit:{" "}
                                    {moment(result.submitted_at).format(
                                      "DD/MM/YYYY HH:mm"
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </Space>
                        </Card>
                      </Col>

                      {/* Performance Stats */}
                      <Col xs={24} md={8}>
                        <Card size="small" title="Statistik Kinerja">
                          <Row gutter={8}>
                            <Col xs={12}>
                              <Statistic
                                title="Skor"
                                value={result.score || 0}
                                suffix="%"
                                valueStyle={{
                                  color:
                                    result.score >= 80
                                      ? "#52c41a"
                                      : result.score >= 60
                                      ? "#faad14"
                                      : "#ff4d4f",
                                }}
                              />
                            </Col>
                            <Col xs={12}>
                              <Statistic
                                title="Akurasi"
                                value={
                                  result.total_questions > 0
                                    ? (
                                        (result.correct_answers /
                                          result.total_questions) *
                                        100
                                      ).toFixed(1)
                                    : 0
                                }
                                suffix="%"
                                valueStyle={{ color: "#1890ff" }}
                              />
                            </Col>
                            <Col xs={12}>
                              <Statistic
                                title="Benar"
                                value={result.correct_answers || 0}
                                suffix={`/${result.total_questions || 0}`}
                                valueStyle={{ color: "#52c41a" }}
                              />
                            </Col>
                            <Col xs={12}>
                              <Statistic
                                title="Status"
                                value={
                                  result.is_completed ? "Selesai" : "Belum"
                                }
                                valueStyle={{
                                  color: result.is_completed
                                    ? "#52c41a"
                                    : "#faad14",
                                }}
                              />
                            </Col>
                          </Row>
                        </Card>
                      </Col>

                      {/* Quick Analysis */}
                      <Col xs={24} md={8}>
                        <Card size="small" title="Analisis Cepat">
                          <div>
                            {result.performance ? (
                              <>
                                {result.performance_score >= 80 && (
                                  <Tag
                                    color="success"
                                    style={{ marginBottom: 8 }}
                                  >
                                    ✅ Excellent Performance
                                  </Tag>
                                )}
                                {result.performance_score >= 60 &&
                                  result.performance_score < 80 && (
                                    <Tag
                                      color="warning"
                                      style={{ marginBottom: 8 }}
                                    >
                                      ⚠️ Good Performance
                                    </Tag>
                                  )}
                                {result.performance_score < 60 && (
                                  <Tag
                                    color="error"
                                    style={{ marginBottom: 8 }}
                                  >
                                    ❌ Need Improvement
                                  </Tag>
                                )}
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                  Tingkat akurasi:{" "}
                                  {result.performance_accuracy || 0}%
                                </Text>
                              </>
                            ) : (
                              <Text type="secondary" style={{ fontSize: 12 }}>
                                Data kinerja belum tersedia
                              </Text>
                            )}
                          </div>
                        </Card>
                      </Col>
                    </Row>

                    {/* Detailed Answers */}
                    <Card size="small" title="📝 Detail Jawaban">
                      <Table
                        columns={questionColumns}
                        dataSource={result.answers}
                        rowKey="question_id"
                        pagination={false}
                        size="small"
                        scroll={{ x: 800 }}
                        rowClassName={(record) =>
                          record.is_correct
                            ? "correct-answer"
                            : "incorrect-answer"
                        }
                      />
                    </Card>
                  </Panel>
                ))}
              </Collapse>
            </Card>

            {/* Questions Analysis */}
            <Card title="📊 Analisis Soal" style={{ marginBottom: 24 }}>
              <div style={{ marginBottom: 16 }}>
                <Text type="secondary">
                  Berikut adalah analisis tingkat kesulitan setiap soal
                  berdasarkan persentase jawaban benar:
                </Text>
              </div>

              <Row gutter={16}>
                {quizDetail.quiz.questions.map((question, index) => {
                  // Calculate correct answer percentage for this question
                  const totalAnswers = quizDetail.results.length;
                  const correctAnswers = quizDetail.results.reduce(
                    (count, result) => {
                      if (Array.isArray(result.answers)) {
                        const answer = result.answers.find(
                          (a) => a.question_id === question.id
                        );
                        return count + (answer?.is_correct ? 1 : 0);
                      }
                      return count;
                    },
                    0
                  );
                  const correctPercentage =
                    totalAnswers > 0
                      ? (correctAnswers / totalAnswers) * 100
                      : 0;

                  return (
                    <Col
                      xs={24}
                      sm={12}
                      md={8}
                      key={question.id}
                      style={{ marginBottom: 16 }}
                    >
                      <Card size="small">
                        <div style={{ marginBottom: 8 }}>
                          <Text strong>Soal {index + 1}</Text>
                          <div style={{ marginTop: 4 }}>
                            <Text
                              ellipsis
                              style={{ fontSize: 12, color: "#666" }}
                            >
                              {question.text}
                            </Text>
                          </div>
                        </div>

                        <Progress
                          percent={Number(correctPercentage.toFixed(1))}
                          size="small"
                          strokeColor={
                            correctPercentage >= 80
                              ? "#52c41a"
                              : correctPercentage >= 60
                              ? "#faad14"
                              : "#ff4d4f"
                          }
                        />

                        <div
                          style={{
                            marginTop: 8,
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <Text style={{ fontSize: 12 }}>
                            {correctAnswers}/{totalAnswers} benar (
                            {correctPercentage.toFixed(1)}%)
                          </Text>
                          <Text style={{ fontSize: 12 }}>
                            {correctPercentage >= 80
                              ? "Mudah"
                              : correctPercentage >= 60
                              ? "Sedang"
                              : "Sulit"}
                          </Text>
                        </div>

                        <div
                          style={{ marginTop: 4, fontSize: 11, color: "#999" }}
                        >
                          Jawaban: {question.correct_choice}
                        </div>
                      </Card>
                    </Col>
                  );
                })}
              </Row>
            </Card>
          </div>
        )}
      </Spin>

      <style>{`
        .correct-answer {
          background-color: #f6ffed;
          border-left: 3px solid #52c41a;
        }
        .incorrect-answer {
          background-color: #fff2f0;
          border-left: 3px solid #ff4d4f;
        }
      `}</style>
    </Modal>
  );
};

export default SessionsQuizResultsModal;
