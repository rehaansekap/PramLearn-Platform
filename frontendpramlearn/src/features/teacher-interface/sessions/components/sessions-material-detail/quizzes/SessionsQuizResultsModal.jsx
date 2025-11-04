import React, { useState, useEffect } from "react";
import {
  Modal,
  Table,
  Typography,
  Spin,
  Card,
  Row,
  Col,
  Statistic,
  Progress,
  Tag,
  Collapse,
  Alert,
  Button,
  Space,
  Divider,
  Empty,
} from "antd";
import {
  BarChartOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  QuestionCircleOutlined,
  ReloadOutlined,
  TrophyOutlined,
  UserOutlined,
  PieChartOutlined,
  LineChartOutlined,
  TeamOutlined,
} from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

const SessionsQuizResultsModal = ({
  open,
  onClose,
  quiz,
  materialSlug,
  onGetQuizDetail,
  isMobile = false,
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
    setLoading(true);
    setError(null);
    try {
      const detail = await onGetQuizDetail(quiz.id);
      console.log("Raw quiz detail:", detail); // Debug log
      setQuizDetail(detail);
    } catch (err) {
      console.error("Error fetching quiz detail:", err);
      setError("Gagal memuat detail quiz");
    } finally {
      setLoading(false);
    }
  };

  // Transform API data to expected format
  const transformQuizData = (data) => {
    if (!data || !data.quiz) return null;

    const quiz = data.quiz;
    const results = data.results || [];

    // Get completed submissions only
    const completedSubmissions = results.filter(
      (result) => result.is_completed
    );

    // Transform questions with submission data
    const questionsWithSubmissions = quiz.questions.map((question) => {
      // Get submissions for this question from all completed groups
      const questionSubmissions = [];

      completedSubmissions.forEach((groupResult) => {
        const answer = groupResult.answers.find(
          (ans) => ans.question_id === question.id
        );
        if (answer) {
          questionSubmissions.push({
            group_id: groupResult.group_id,
            group_name: groupResult.group_name,
            selected_choice: answer.selected_choice,
            is_correct: answer.is_correct,
            answered_by: answer.answered_by,
          });
        }
      });

      return {
        ...question,
        submissions: questionSubmissions,
      };
    });

    // Transform group results to submissions format
    const transformedSubmissions = results.map((result) => ({
      id: result.group_id,
      group_name: result.group_name,
      group_code: result.group_code,
      status: result.is_completed ? "completed" : "in_progress",
      score: result.score || 0,
      start_time: result.start_time,
      end_time: result.end_time,
      submitted_at: result.submitted_at,
      members: result.members,
      question_submissions:
        result.answers?.map((answer) => ({
          question_id: answer.question_id,
          question_text: answer.question_text,
          selected_choice: answer.selected_choice,
          correct_choice: answer.correct_choice,
          is_correct: answer.is_correct,
          answered_by: answer.answered_by,
          choice_a: quiz.questions.find((q) => q.id === answer.question_id)
            ?.choice_a,
          choice_b: quiz.questions.find((q) => q.id === answer.question_id)
            ?.choice_b,
          choice_c: quiz.questions.find((q) => q.id === answer.question_id)
            ?.choice_c,
          choice_d: quiz.questions.find((q) => q.id === answer.question_id)
            ?.choice_d,
        })) || [],
    }));

    return {
      quiz: quiz,
      questions: questionsWithSubmissions,
      submissions: transformedSubmissions,
    };
  };

  // Get choice color based on correctness
  const getChoiceColor = (isCorrect, isSelected) => {
    if (isCorrect) return "#52c41a";
    if (isSelected && !isCorrect) return "#ff4d4f";
    return "#d9d9d9";
  };

  // Get choice icon
  const getChoiceIcon = (isCorrect, isSelected) => {
    if (isCorrect) return <CheckCircleOutlined style={{ color: "#52c41a" }} />;
    if (isSelected && !isCorrect)
      return <CloseCircleOutlined style={{ color: "#ff4d4f" }} />;
    return null;
  };

  // Calculate question statistics
  const getQuestionStats = (question) => {
    if (!question.submissions || question.submissions.length === 0) {
      return {
        totalAnswers: 0,
        correctAnswers: 0,
        accuracy: 0,
        choiceDistribution: { A: 0, B: 0, C: 0, D: 0 },
      };
    }

    const totalAnswers = question.submissions.length;
    const correctAnswers = question.submissions.filter(
      (sub) => sub.selected_choice === question.correct_choice
    ).length;
    const accuracy = (correctAnswers / totalAnswers) * 100;

    const choiceDistribution = { A: 0, B: 0, C: 0, D: 0 };
    question.submissions.forEach((sub) => {
      if (
        sub.selected_choice &&
        choiceDistribution.hasOwnProperty(sub.selected_choice)
      ) {
        choiceDistribution[sub.selected_choice]++;
      }
    });

    return { totalAnswers, correctAnswers, accuracy, choiceDistribution };
  };

  // Question analysis table columns
  const questionColumns = [
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
      title: "Soal",
      key: "question",
      render: (_, record) => (
        <div>
          <Text
            strong
            style={{
              display: "block",
              marginBottom: 8,
              fontSize: isMobile ? 12 : 14,
            }}
          >
            {record.text}
          </Text>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {["A", "B", "C", "D"].map((choice) => {
              const isCorrect = choice === record.correct_choice;
              const choiceText = record[`choice_${choice.toLowerCase()}`];
              const stats = getQuestionStats(record);
              const count = stats.choiceDistribution[choice];
              const percentage =
                stats.totalAnswers > 0 ? (count / stats.totalAnswers) * 100 : 0;

              return (
                <div
                  key={choice}
                  style={{
                    border: `2px solid ${isCorrect ? "#52c41a" : "#f0f0f0"}`,
                    borderRadius: 8,
                    padding: "4px 8px",
                    margin: "2px 0",
                    background: isCorrect ? "#f6ffed" : "#fafafa",
                    minWidth: "45%",
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 4 }}
                  >
                    <div
                      style={{
                        background: isCorrect ? "#52c41a" : "#d9d9d9",
                        color: "white",
                        borderRadius: "50%",
                        width: 16,
                        height: 16,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 10,
                        fontWeight: "bold",
                      }}
                    >
                      {choice}
                    </div>
                    <Text style={{ fontSize: 11, flex: 1 }} ellipsis>
                      {choiceText}
                    </Text>
                    {isCorrect && (
                      <CheckCircleOutlined
                        style={{ color: "#52c41a", fontSize: 12 }}
                      />
                    )}
                  </div>
                  <div style={{ marginTop: 4, fontSize: 10, color: "#666" }}>
                    {count} jawaban ({percentage.toFixed(0)}%)
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ),
      width: isMobile ? 250 : 400,
    },
    {
      title: "Akurasi",
      key: "accuracy",
      render: (_, record) => {
        const stats = getQuestionStats(record);
        const color =
          stats.accuracy >= 80
            ? "#52c41a"
            : stats.accuracy >= 60
            ? "#faad14"
            : "#ff4d4f";

        return (
          <div style={{ textAlign: "center" }}>
            <Progress
              type="circle"
              percent={Math.round(stats.accuracy)}
              width={isMobile ? 60 : 80}
              strokeColor={color}
              strokeWidth={8}
              format={(percent) => (
                <span style={{ fontSize: isMobile ? 10 : 12, fontWeight: 600 }}>
                  {percent}%
                </span>
              )}
            />
            <div style={{ marginTop: 8, fontSize: 11, color: "#666" }}>
              {stats.correctAnswers}/{stats.totalAnswers} benar
            </div>
          </div>
        );
      },
      width: isMobile ? 100 : 120,
      align: "center",
    },
    {
      title: "Tingkat Kesulitan",
      key: "difficulty",
      render: (_, record) => {
        const stats = getQuestionStats(record);
        let difficulty, color;

        if (stats.accuracy >= 80) {
          difficulty = "Mudah";
          color = "green";
        } else if (stats.accuracy >= 60) {
          difficulty = "Sedang";
          color = "orange";
        } else {
          difficulty = "Sulit";
          color = "red";
        }

        return (
          <div style={{ textAlign: "center" }}>
            <Tag color={color} style={{ marginBottom: 4 }}>
              {difficulty}
            </Tag>
            <div style={{ fontSize: 10, color: "#666" }}>
              {stats.accuracy.toFixed(1)}% akurasi
            </div>
          </div>
        );
      },
      width: 100,
      align: "center",
      responsive: ["md"],
    },
  ];

  if (!quiz) return null;

  // Transform the data
  const transformedData = quizDetail ? transformQuizData(quizDetail) : null;

  const renderOverallStats = () => {
    if (
      !transformedData?.submissions ||
      transformedData.submissions.length === 0
    ) {
      return (
        <Alert
          message="Belum Ada Peserta"
          description="Belum ada kelompok yang mengerjakan quiz ini."
          type="info"
          showIcon
          style={{ marginBottom: 24, borderRadius: 12 }}
        />
      );
    }

    const totalSubmissions = transformedData.submissions.length;
    const completedSubmissions = transformedData.submissions.filter(
      (s) => s.status === "completed"
    ).length;
    const averageScore =
      completedSubmissions > 0
        ? transformedData.submissions
            .filter((s) => s.status === "completed")
            .reduce((sum, s) => sum + (s.score || 0), 0) / completedSubmissions
        : 0;
    const highestScore =
      completedSubmissions > 0
        ? Math.max(
            ...transformedData.submissions
              .filter((s) => s.status === "completed")
              .map((s) => s.score || 0)
          )
        : 0;

    return (
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card size="small" style={{ textAlign: "center", borderRadius: 12 }}>
            <Statistic
              title="Total Kelompok"
              value={totalSubmissions}
              prefix={<TeamOutlined style={{ color: "#1890ff" }} />}
              valueStyle={{ color: "#1890ff", fontSize: isMobile ? 16 : 20 }}
              titleStyle={{ fontSize: isMobile ? 10 : 12 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" style={{ textAlign: "center", borderRadius: 12 }}>
            <Statistic
              title="Selesai"
              value={completedSubmissions}
              prefix={<CheckCircleOutlined style={{ color: "#52c41a" }} />}
              valueStyle={{ color: "#52c41a", fontSize: isMobile ? 16 : 20 }}
              titleStyle={{ fontSize: isMobile ? 10 : 12 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" style={{ textAlign: "center", borderRadius: 12 }}>
            <Statistic
              title="Rata-rata"
              value={averageScore.toFixed(1)}
              suffix="%"
              prefix={<BarChartOutlined style={{ color: "#faad14" }} />}
              valueStyle={{ color: "#faad14", fontSize: isMobile ? 16 : 20 }}
              titleStyle={{ fontSize: isMobile ? 10 : 12 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" style={{ textAlign: "center", borderRadius: 12 }}>
            <Statistic
              title="Tertinggi"
              value={highestScore}
              suffix="%"
              prefix={<TrophyOutlined style={{ color: "#722ed1" }} />}
              valueStyle={{ color: "#722ed1", fontSize: isMobile ? 16 : 20 }}
              titleStyle={{ fontSize: isMobile ? 10 : 12 }}
            />
          </Card>
        </Col>
      </Row>
    );
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={isMobile ? "95%" : "95%"}
      style={{ maxWidth: 1200 }}
      centered
      destroyOnClose
      title={
        <div
          style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            margin: "-24px -24px 0",
            padding: "20px 24px",
            borderRadius: "8px 8px 0 0",
            color: "white",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
            }}
          >
            {/* <BarChartOutlined style={{ fontSize: 24 }} /> */}
            <div>
              <Title level={4} style={{ margin: 0, color: "white" }}>
                📊 Analisis Hasil Quiz
              </Title>
              <Text style={{ color: "rgba(255,255,255,0.9)", fontSize: 14 }}>
                {quiz.title}
              </Text>
            </div>
          </div>
        </div>
      }
    >
      <div style={{ padding: "20px 0" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <Spin size="large" />
            <p style={{ marginTop: 16, color: "#666" }}>
              Memuat analisis hasil quiz...
            </p>
          </div>
        ) : error ? (
          <Alert
            message="Error"
            description={error}
            type="error"
            showIcon
            style={{ borderRadius: 8 }}
            action={
              <Button
                type="primary"
                danger
                onClick={fetchQuizDetail}
                icon={<ReloadOutlined />}
                style={{ borderRadius: 6 }}
              >
                Coba Lagi
              </Button>
            }
          />
        ) : !transformedData ? (
          <Empty
            description="Tidak ada data quiz"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <>
            {/* Overall Statistics */}
            {renderOverallStats()}

            {/* Detailed Submissions */}
            {transformedData.submissions &&
              transformedData.submissions.length > 0 && (
                <Card
                  title={
                    <Space>
                      <span>👥 Detail Submission Kelompok</span>
                    </Space>
                  }
                  style={{ marginTop: 24, borderRadius: 16 }}
                  headStyle={{
                    background:
                      "linear-gradient(135deg, #f6ffed 0%, #e6f7ff 100%)",
                    borderRadius: "16px 16px 0 0",
                  }}
                >
                  <Collapse ghost>
                    {transformedData.submissions.map((submission, index) => (
                      <Panel
                        header={
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 12,
                            }}
                          >
                            <div
                              style={{
                                background:
                                  submission.status === "completed"
                                    ? "linear-gradient(135deg, #52c41a 0%, #73d13d 100%)"
                                    : "linear-gradient(135deg, #faad14 0%, #ffc53d 100%)",
                                borderRadius: "50%",
                                width: 32,
                                height: 32,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "white",
                                fontWeight: "bold",
                                fontSize: 12,
                              }}
                            >
                              {submission.group_name?.charAt(0)?.toUpperCase()}
                            </div>
                            <div style={{ flex: 1 }}>
                              <Text strong>{submission.group_name}</Text>
                              <div
                                style={{
                                  display: "flex",
                                  gap: 8,
                                  marginTop: 4,
                                }}
                              >
                                <Tag
                                  color={
                                    submission.status === "completed"
                                      ? "success"
                                      : "processing"
                                  }
                                  size="small"
                                >
                                  {submission.status === "completed"
                                    ? "Selesai"
                                    : "Sedang Mengerjakan"}
                                </Tag>
                                {submission.status === "completed" && (
                                  <Tag color="blue" size="small">
                                    Skor: {Math.round(submission.score)}%
                                  </Tag>
                                )}
                                <Tag color="cyan" size="small">
                                  {submission.members?.length || 0} anggota
                                </Tag>
                              </div>
                            </div>
                          </div>
                        }
                        key={submission.id || index}
                      >
                        <div style={{ padding: "16px 0" }}>
                          {submission.question_submissions &&
                          submission.question_submissions.length > 0 ? (
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 16,
                              }}
                            >
                              {submission.question_submissions.map(
                                (qSub, qIndex) => (
                                  <Card
                                    key={qIndex}
                                    size="small"
                                    style={{ background: "#fafafa" }}
                                    title={`Soal ${qIndex + 1}`}
                                  >
                                    <Text
                                      style={{
                                        fontSize: 12,
                                        color: "#666",
                                        marginBottom: 8,
                                        display: "block",
                                      }}
                                    >
                                      {qSub.question_text}
                                    </Text>
                                    <div
                                      style={{
                                        display: "flex",
                                        flexWrap: "wrap",
                                        gap: 8,
                                      }}
                                    >
                                      {["A", "B", "C", "D"].map((choice) => {
                                        const isCorrect =
                                          choice === qSub.correct_choice;
                                        const isSelected =
                                          choice === qSub.selected_choice;

                                        return (
                                          <div
                                            key={choice}
                                            style={{
                                              border: `2px solid ${getChoiceColor(
                                                isCorrect,
                                                isSelected
                                              )}`,
                                              borderRadius: 8,
                                              padding: "4px 8px",
                                              background: isCorrect
                                                ? "#f6ffed"
                                                : isSelected
                                                ? "#fff2f0"
                                                : "white",
                                              minWidth: "45%",
                                            }}
                                          >
                                            <div
                                              style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 4,
                                              }}
                                            >
                                              <div
                                                style={{
                                                  background: getChoiceColor(
                                                    isCorrect,
                                                    isSelected
                                                  ),
                                                  color: "white",
                                                  borderRadius: "50%",
                                                  width: 16,
                                                  height: 16,
                                                  display: "flex",
                                                  alignItems: "center",
                                                  justifyContent: "center",
                                                  fontSize: 10,
                                                  fontWeight: "bold",
                                                }}
                                              >
                                                {choice}
                                              </div>
                                              <Text
                                                style={{
                                                  fontSize: 11,
                                                  flex: 1,
                                                }}
                                              >
                                                {
                                                  qSub[
                                                    `choice_${choice.toLowerCase()}`
                                                  ]
                                                }
                                              </Text>
                                              {getChoiceIcon(
                                                isCorrect,
                                                isSelected
                                              )}
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                    {qSub.answered_by && (
                                      <div
                                        style={{
                                          marginTop: 8,
                                          fontSize: 10,
                                          color: "#666",
                                        }}
                                      >
                                        Dijawab oleh:{" "}
                                        {qSub.answered_by.first_name}{" "}
                                        {qSub.answered_by.last_name}
                                      </div>
                                    )}
                                  </Card>
                                )
                              )}
                            </div>
                          ) : (
                            <Text type="secondary">Belum ada jawaban</Text>
                          )}
                        </div>
                      </Panel>
                    ))}
                  </Collapse>
                </Card>
              )}

            {/* Question Analysis */}
            <Card
              title={
                <Space>
                  <span>📈 Analisis Per Soal</span>
                </Space>
              }
              style={{ borderRadius: 16 }}
              headStyle={{
                background: "linear-gradient(135deg, #f8fafc 0%, #e6f3ff 100%)",
                borderRadius: "16px 16px 0 0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {transformedData.questions &&
              transformedData.questions.length > 0 ? (
                <Table
                  dataSource={transformedData.questions.map(
                    (question, index) => ({
                      ...question,
                      key: question.id || index,
                    })
                  )}
                  columns={questionColumns}
                  pagination={false}
                  scroll={{ x: isMobile ? 600 : undefined }}
                  size={isMobile ? "small" : "middle"}
                />
              ) : (
                <Empty
                  description="Tidak ada data soal"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              )}
            </Card>
          </>
        )}
      </div>
    </Modal>
  );
};

export default SessionsQuizResultsModal;
