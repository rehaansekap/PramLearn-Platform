import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Typography,
  Alert,
  Spin,
  Button,
  Space,
  Progress,
  Tag,
  List,
  Row,
  Col,
  Statistic,
  Result,
  Breadcrumb,
  Grid,
  Avatar,
  Table,
} from "antd";
import {
  ArrowLeftOutlined,
  TrophyOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  BookOutlined,
  ReloadOutlined,
  HomeOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  StarOutlined,
  CrownOutlined,
  UserOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import api from "../../../../api";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

const QuizResultsPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const { quizSlug } = useParams();
  const navigate = useNavigate();

  const [results, setResults] = useState(null);
  const [quizDetails, setQuizDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const pageSize = isMobile ? 3 : 5;

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch quiz results
        const resultsResponse = await api.get(
          `student/group-quiz/${quizSlug}/results/`
        );
        setResults(resultsResponse.data);

        // Fetch quiz details for additional info
      } catch (err) {
        setError(err);
        console.error("Error fetching quiz results:", err);
      } finally {
        setLoading(false);
      }
    };

    if (quizSlug) {
      fetchResults();
    }
  }, [quizSlug]);

  const getScoreColor = (score) => {
    if (score >= 80) return "#52c41a"; // Green
    if (score >= 60) return "#faad14"; // Orange
    return "#ff4d4f"; // Red
  };

  const getScoreStatus = (score) => {
    if (score >= 80) return "success";
    if (score >= 60) return "normal";
    return "exception";
  };

  const getGradeText = (score) => {
    if (score >= 90) return "A";
    if (score >= 80) return "B";
    if (score >= 70) return "C";
    if (score >= 60) return "D";
    return "E";
  };

  const getGradeIcon = (score) => {
    if (score >= 90) return <CrownOutlined />;
    if (score >= 80) return <TrophyOutlined />;
    if (score >= 70) return <StarOutlined />;
    return <ClockCircleOutlined />;
  };

  if (loading) {
    return (
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "24px 16px",
          minHeight: "calc(100vh - 64px)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "60vh",
          }}
        >
          <Spin size="large" tip="Memuat hasil quiz..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "24px 16px",
          minHeight: "calc(100vh - 64px)",
        }}
      >
        <Alert
          message="Gagal memuat hasil quiz"
          description={error.message}
          type="error"
          showIcon
          style={{ borderRadius: 12 }}
          action={
            <Space>
              <Button
                size="small"
                icon={<ReloadOutlined />}
                onClick={() => window.location.reload()}
              >
                Coba Lagi
              </Button>
              <Button
                size="small"
                onClick={() => navigate("/student/assessments")}
              >
                Kembali
              </Button>
            </Space>
          }
        />
      </div>
    );
  }

  if (!results) {
    return (
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "24px 16px",
          minHeight: "calc(100vh - 64px)",
        }}
      >
        <Alert
          message="Hasil quiz tidak ditemukan"
          description="Belum ada hasil quiz untuk ditampilkan."
          type="warning"
          showIcon
          style={{ borderRadius: 12 }}
        />
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "24px 16px",
        minHeight: "calc(100vh - 64px)",
      }}
    >
      {/* Breadcrumb */}
      <Breadcrumb
        style={{ marginBottom: 24 }}
        items={[
          {
            href: "/student",
            title: (
              <Space>
                <HomeOutlined />
                <span>Dashboard</span>
              </Space>
            ),
          },
          {
            href: "/student/assessments",
            title: (
              <Space>
                <FileTextOutlined />
                <span>Assessments</span>
              </Space>
            ),
          },
          {
            title: (
              <Space>
                <TrophyOutlined />
                <span>Hasil Quiz</span>
              </Space>
            ),
          },
        ]}
      />

      {/* Header Section */}
      <div
        style={{
          background:
            "linear-gradient(135deg, #001529 0%, #3a3f5c 60%, #43cea2 100%)",
          borderRadius: 16,
          padding: "32px 24px",
          marginBottom: 32,
          color: "white",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background Pattern */}
        <div
          style={{
            position: "absolute",
            top: -20,
            right: -20,
            width: 100,
            height: 100,
            borderRadius: "50%",
            background: "rgba(255, 255, 255, 0.1)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -30,
            left: -30,
            width: 120,
            height: 120,
            borderRadius: "50%",
            background: "rgba(255, 255, 255, 0.05)",
          }}
        />

        <div style={{ position: "relative", zIndex: 1 }}>
          <Space direction="vertical" size="small">
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/student/assessments")}
              style={{
                background: "rgba(255, 255, 255, 0.2)",
                borderColor: "rgba(255, 255, 255, 0.3)",
                color: "white",
                backdropFilter: "blur(10px)",
              }}
            >
              Kembali ke Assessments
            </Button>
            <Title
              level={2}
              style={{ color: "white", margin: 0, marginBottom: 8 }}
            >
              🏆 Hasil Quiz: {results?.title || "Quiz"}
            </Title>
            <Text style={{ color: "rgba(255, 255, 255, 0.9)", fontSize: 16 }}>
              Diselesaikan pada:{" "}
              {dayjs(results.submitted_at).format("DD MMMM YYYY, HH:mm")}
            </Text>
          </Space>
        </div>
      </div>

      {/* Main Content - Two Panel Layout */}
      <Row gutter={[24, 24]}>
        {/* Left Panel - Score & Stats */}
        <Col xs={24} lg={10}>
          <Space direction="vertical" size={24} style={{ width: "100%" }}>
            {/* Overall Result Card */}
            <Card
              style={{
                borderRadius: 16,
                background: `linear-gradient(135deg, ${getScoreColor(
                  results.score
                )}10, #ffffff)`,
                border: `3px solid ${getScoreColor(results.score)}`,
                boxShadow: `0 8px 24px ${getScoreColor(results.score)}20`,
                textAlign: "center",
              }}
            >
              <Result
                icon={
                  <div
                    style={{
                      background: `linear-gradient(135deg, ${getScoreColor(
                        results.score
                      )} 0%, ${getScoreColor(results.score)}80 100%)`,
                      borderRadius: "50%",
                      width: 120,
                      height: 120,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 16px",
                      boxShadow: `0 8px 24px ${getScoreColor(results.score)}30`,
                    }}
                  >
                    <TrophyOutlined style={{ color: "white", fontSize: 48 }} />
                  </div>
                }
                title={
                  <Space direction="vertical" size="small">
                    <div
                      style={{
                        fontSize: 36,
                        fontWeight: 700,
                        color: getScoreColor(results.score),
                      }}
                    >
                      {results.score.toFixed(1)}
                    </div>
                    <Tag
                      style={{
                        fontSize: 18,
                        padding: "8px 16px",
                        fontWeight: 700,
                        borderRadius: 12,
                        background: getScoreColor(results.score),
                        color: "white",
                        border: "none",
                      }}
                    >
                      Grade: {getGradeText(results.score)}
                    </Tag>
                  </Space>
                }
                subTitle={
                  <div style={{ marginTop: 16 }}>
                    <Text style={{ fontSize: 16, color: "#666" }}>
                      {results.correct_answers} dari {results.total_questions}{" "}
                      soal benar
                    </Text>
                    <Progress
                      percent={results.score}
                      strokeColor={getScoreColor(results.score)}
                      style={{
                        marginTop: 12,
                        maxWidth: 300,
                        margin: "12px auto 0",
                      }}
                      strokeWidth={8}
                    />
                  </div>
                }
              />
            </Card>

            {/* Statistics Cards */}
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12}>
                <Card style={{ borderRadius: 12, textAlign: "center" }}>
                  <Statistic
                    title="Waktu Pengerjaan"
                    value={results.time_taken || 0}
                    suffix="menit"
                    prefix={
                      <ClockCircleOutlined style={{ color: "#1890ff" }} />
                    }
                    valueStyle={{ color: "#1890ff", fontSize: 20 }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12}>
                <Card style={{ borderRadius: 12, textAlign: "center" }}>
                  <Statistic
                    title="Ranking"
                    value={results.rank || "-"}
                    suffix={
                      results.total_participants
                        ? `/ ${results.total_participants}`
                        : ""
                    }
                    prefix={<CrownOutlined style={{ color: "#faad14" }} />}
                    valueStyle={{ color: "#faad14", fontSize: 20 }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12}>
                <Card style={{ borderRadius: 12, textAlign: "center" }}>
                  <Statistic
                    title="Jawaban Benar"
                    value={results.correct_answers}
                    suffix={`/ ${results.total_questions}`}
                    prefix={
                      <CheckCircleOutlined style={{ color: "#52c41a" }} />
                    }
                    valueStyle={{ color: "#52c41a", fontSize: 20 }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12}>
                <Card style={{ borderRadius: 12, textAlign: "center" }}>
                  <Statistic
                    title="Persentase Benar"
                    value={(
                      (results.correct_answers / results.total_questions) *
                      100
                    ).toFixed(1)}
                    suffix="%"
                    prefix={getGradeIcon(results.score)}
                    valueStyle={{
                      color: getScoreColor(results.score),
                      fontSize: 20,
                    }}
                  />
                </Card>
              </Col>
            </Row>

            {/* Add Group Members Section here */}
            <Card
              title={
                <Space>
                  <TeamOutlined style={{ color: "#722ed1" }} />
                  <span>Kontribusi Anggota Kelompok</span>
                </Space>
              }
              style={{
                borderRadius: 16,
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                marginBottom: 16,
              }}
            >
              <Table
                dataSource={
                  results?.group_members?.map((member, index) => ({
                    key: member.id || index,
                    ...member,
                  })) || []
                }
                columns={[
                  {
                    title: "No",
                    key: "index",
                    render: (_, __, index) => (
                      <div
                        style={{
                          textAlign: "center",
                          fontWeight: 600,
                          color: "#8c8c8c",
                          fontSize: isMobile ? 12 : 14,
                        }}
                      >
                        {index + 1}
                      </div>
                    ),
                    width: isMobile ? 40 : 50,
                    align: "center",
                  },
                  {
                    title: "Nama Anggota",
                    key: "name",
                    render: (_, record) => (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: isMobile ? 8 : 12,
                          padding: isMobile ? "4px 0" : "8px 0",
                        }}
                      >
                        <Avatar
                          icon={<UserOutlined />}
                          size={isMobile ? 32 : 40}
                          style={{
                            backgroundColor: "#1890ff",
                            flexShrink: 0,
                            fontSize: isMobile ? 14 : 16,
                          }}
                        />
                        <div
                          style={{
                            flex: 1,
                            minWidth: 0, // Untuk text truncation
                          }}
                        >
                          <div
                            style={{
                              fontWeight: 600,
                              fontSize: isMobile ? 13 : 15,
                              lineHeight: 1.3,
                              color: "#262626",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              marginBottom: record.is_current_user ? 2 : 0,
                            }}
                          >
                            {record.full_name || record.username}
                          </div>
                          {record.is_current_user && (
                            <Tag
                              color="blue"
                              size="small"
                              style={{
                                fontSize: 10,
                                lineHeight: "16px",
                                padding: "0 6px",
                                height: 16,
                                borderRadius: 8,
                                margin: 0,
                              }}
                            >
                              Anda
                            </Tag>
                          )}
                        </div>
                      </div>
                    ),
                    width: isMobile ? 160 : 200,
                  },
                  {
                    title: (
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontWeight: 600 }}>Soal</div>
                        <div style={{ fontWeight: 600 }}>Dijawab</div>
                      </div>
                    ),
                    key: "answered_count",
                    render: (_, record) => {
                      const answeredCount =
                        record.answered_count !== undefined
                          ? record.answered_count
                          : results?.answers?.filter(
                              (answer) => answer.answered_by_id === record.id
                            ).length || 0;

                      const percentage =
                        results?.total_questions > 0
                          ? (answeredCount / results.total_questions) * 100
                          : 0;

                      return (
                        <div
                          style={{
                            textAlign: "center",
                            padding: isMobile ? "8px 4px" : "12px 8px",
                          }}
                        >
                          <div
                            style={{
                              fontSize: isMobile ? 20 : 24,
                              fontWeight: 700,
                              color: "#1890ff",
                              lineHeight: 1,
                              marginBottom: 4,
                            }}
                          >
                            {answeredCount}
                          </div>
                          <div
                            style={{
                              fontSize: isMobile ? 10 : 11,
                              color: "#8c8c8c",
                              marginBottom: 8,
                              lineHeight: 1.2,
                            }}
                          >
                            dari {results?.total_questions || 0}
                          </div>
                          <Progress
                            percent={Math.round(percentage)}
                            size="small"
                            strokeColor="#1890ff"
                            showInfo={false}
                            style={{
                              maxWidth: isMobile ? 50 : 70,
                              margin: "0 auto",
                            }}
                            strokeWidth={isMobile ? 6 : 8}
                          />
                        </div>
                      );
                    },
                    width: isMobile ? 80 : 100,
                    align: "center",
                  },
                  {
                    title: (
                      <div style={{ textAlign: "center", fontWeight: 600 }}>
                        Kontribusi
                      </div>
                    ),
                    key: "contribution",
                    render: (_, record) => {
                      const answeredCount =
                        record.answered_count !== undefined
                          ? record.answered_count
                          : results?.answers?.filter(
                              (answer) => answer.answered_by_id === record.id
                            ).length || 0;

                      const percentage =
                        results?.total_questions > 0
                          ? (answeredCount / results.total_questions) * 100
                          : 0;

                      let color, label, bgColor;

                      if (percentage === 0) {
                        color = "#ff4d4f";
                        label = "Tidak Aktif";
                        bgColor = "#fff2f0";
                      } else if (percentage < 25) {
                        color = "#ff7a45";
                        label = "Kurang Aktif";
                        bgColor = "#fff2e8";
                      } else if (percentage < 50) {
                        color = "#faad14";
                        label = "Cukup Aktif";
                        bgColor = "#fffbe6";
                      } else if (percentage < 75) {
                        color = "#1890ff";
                        label = "Aktif";
                        bgColor = "#e6f7ff";
                      } else {
                        color = "#52c41a";
                        label = "Sangat Aktif";
                        bgColor = "#f6ffed";
                      }

                      return (
                        <div style={{ textAlign: "center", padding: "4px" }}>
                          <div
                            style={{
                              background: bgColor,
                              color: color,
                              fontWeight: 600,
                              fontSize: isMobile ? 10 : 12,
                              padding: isMobile ? "6px 8px" : "8px 12px",
                              borderRadius: 12,
                              border: `1px solid ${color}20`,
                              lineHeight: 1.2,
                              minWidth: isMobile ? 70 : 90,
                              margin: "0 auto",
                            }}
                          >
                            {isMobile ? (
                              <>
                                <div style={{ fontSize: 9, marginBottom: 2 }}>
                                  {percentage === 0
                                    ? "Tidak"
                                    : percentage < 25
                                    ? "Kurang"
                                    : percentage < 50
                                    ? "Cukup"
                                    : percentage < 75
                                    ? "Aktif"
                                    : "Sangat"}
                                </div>
                                <div style={{ fontSize: 11, fontWeight: 700 }}>
                                  {Math.round(percentage)}%
                                </div>
                              </>
                            ) : (
                              <>
                                <div style={{ marginBottom: 2 }}>{label}</div>
                                <div style={{ fontSize: 11, fontWeight: 700 }}>
                                  ({Math.round(percentage)}%)
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    },
                    width: isMobile ? 80 : 120,
                    align: "center",
                  },
                ]}
                pagination={false}
                size="small"
                scroll={{
                  x: isMobile ? 400 : undefined,
                }}
                style={{
                  // Custom table styles
                  ".ant-table": {
                    fontSize: isMobile ? 12 : 14,
                  },
                  ".ant-table-thead > tr > th": {
                    backgroundColor: "#fafafa",
                    borderBottom: "2px solid #f0f0f0",
                    fontWeight: 600,
                    fontSize: isMobile ? 11 : 13,
                    padding: isMobile ? "8px 4px" : "12px 8px",
                    textAlign: "center",
                  },
                  ".ant-table-tbody > tr > td": {
                    borderBottom: "1px solid #f5f5f5",
                    padding: isMobile ? "8px 4px" : "12px 8px",
                    verticalAlign: "middle",
                  },
                  ".ant-table-tbody > tr:hover > td": {
                    backgroundColor: "#fafafa",
                  },
                }}
                locale={{
                  emptyText: (
                    <div style={{ padding: isMobile ? "24px 0" : "32px 0" }}>
                      <UserOutlined
                        style={{
                          fontSize: isMobile ? 32 : 48,
                          color: "#d9d9d9",
                          marginBottom: 8,
                        }}
                      />
                      <div
                        style={{
                          color: "#8c8c8c",
                          fontSize: isMobile ? 12 : 14,
                        }}
                      >
                        Tidak ada data anggota kelompok
                      </div>
                    </div>
                  ),
                }}
              />

              {/* Summary Info */}
              <div
                style={{
                  marginTop: 16,
                  padding: isMobile ? 12 : 16,
                  background:
                    "linear-gradient(135deg, #f0f7ff 0%, #e6f7ff 100%)",
                  borderRadius: 12,
                  border: "1px solid #d6e4ff",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: 8,
                  }}
                >
                  <span style={{ fontSize: 16, marginRight: 8 }}>💡</span>
                  <Text
                    strong
                    style={{
                      color: "#1890ff",
                      fontSize: isMobile ? 13 : 14,
                    }}
                  >
                    Informasi Kontribusi
                  </Text>
                </div>
                <Text
                  type="secondary"
                  style={{
                    fontSize: isMobile ? 11 : 12,
                    lineHeight: 1.5,
                  }}
                >
                  Anggota yang menjawab lebih banyak soal menunjukkan
                  partisipasi yang lebih aktif dalam kerja kelompok. Tingkatkan
                  kolaborasi untuk hasil yang optimal!
                </Text>
              </div>
            </Card>
          </Space>
        </Col>

        {/* Right Panel - Detailed Answers Review */}
        <Col xs={24} lg={14}>
          <Card
            title={
              <Space>
                <BookOutlined style={{ color: "#1890ff" }} />
                <span>Review Jawaban Detail</span>
              </Space>
            }
            style={{
              borderRadius: 16,
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
            styles={{
              header: {
                borderBottom: "2px solid #f0f0f0",
                background: "#fafbfc",
              },
            }}
          >
            <List
              itemLayout="vertical"
              dataSource={results.answers || []}
              pagination={{
                pageSize: pageSize,
                showSizeChanger: false,
                style: {
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: 24,
                  gap: isMobile ? 0 : 0,
                  flexWrap: "wrap",
                },
                showTotal: (total, range) => (
                  <div
                    style={{
                      textAlign: "center",
                      marginBottom: isMobile ? 8 : 0,
                      marginRight: isMobile ? 0 : 16, // Margin kanan untuk desktop
                      minWidth: isMobile ? "100%" : "auto",
                      fontSize: isMobile ? 13 : 14,
                      fontWeight: 500,
                      color: "#333",
                      display: "block",
                      order: isMobile ? -1 : 0, // Tampil di atas pada mobile
                    }}
                  >
                    {`${range[0]}-${range[1]} dari ${total} soal`}
                  </div>
                ),
                current: currentPage,
                onChange: (page) => setCurrentPage(page),
                position: "bottom",
                itemRender: (page, type, originalElement) => {
                  return originalElement;
                },
              }}
              renderItem={(answer, index) => (
                <List.Item
                  style={{
                    padding: "20px",
                    marginBottom: "16px",
                    borderRadius: 12,
                    background: answer.is_correct
                      ? "linear-gradient(135deg, #f6ffed 0%, #e6fffb 100%)"
                      : "linear-gradient(135deg, #fff2f0 0%, #fff1f0 100%)",
                    border: `2px solid ${
                      answer.is_correct ? "#b7eb8f" : "#ffccc7"
                    }`,
                    boxShadow: answer.is_correct
                      ? "0 4px 12px rgba(82, 196, 26, 0.15)"
                      : "0 4px 12px rgba(255, 77, 79, 0.15)",
                  }}
                >
                  {/* Question Header */}
                  <div style={{ marginBottom: 16 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        marginBottom: 12,
                        flexWrap: "wrap",
                      }}
                    >
                      <Tag
                        color={answer.is_correct ? "success" : "error"}
                        style={{
                          fontSize: 13,
                          padding: "6px 12px",
                          fontWeight: 600,
                          borderRadius: 8,
                        }}
                      >
                        Soal {index + 1}
                      </Tag>
                      <div
                        style={{
                          background: answer.is_correct ? "#52c41a" : "#ff4d4f",
                          borderRadius: "50%",
                          width: 28,
                          height: 28,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {answer.is_correct ? (
                          <CheckCircleOutlined
                            style={{ color: "white", fontSize: 16 }}
                          />
                        ) : (
                          <CloseCircleOutlined
                            style={{ color: "white", fontSize: 16 }}
                          />
                        )}
                      </div>
                      <Text
                        strong
                        style={{
                          color: answer.is_correct ? "#389e0d" : "#cf1322",
                          fontSize: 14,
                        }}
                      >
                        {answer.is_correct ? "Benar" : "Salah"}
                      </Text>
                    </div>

                    {/* Question Text */}
                    <div
                      style={{
                        background: "rgba(255, 255, 255, 0.8)",
                        padding: "16px 20px",
                        borderRadius: 10,
                        border: "1px solid rgba(0, 0, 0, 0.06)",
                      }}
                    >
                      <Title
                        level={5}
                        style={{
                          margin: 0,
                          fontSize: 16,
                          lineHeight: 1.5,
                          color: "#2c3e50",
                        }}
                      >
                        {answer.question_text}
                      </Title>
                    </div>
                  </div>

                  {/* Answer Section */}
                  <Space
                    direction="vertical"
                    style={{ width: "100%" }}
                    size={12}
                  >
                    {/* Your Answer */}
                    <div
                      style={{
                        background: "rgba(255, 255, 255, 0.7)",
                        padding: "12px 16px",
                        borderRadius: 8,
                        border: `1px solid ${
                          answer.is_correct ? "#d9f7be" : "#ffccc7"
                        }`,
                      }}
                    >
                      <Text strong style={{ color: "#666", fontSize: 14 }}>
                        Jawaban Anda:{" "}
                      </Text>
                      <Tag
                        color={answer.is_correct ? "success" : "error"}
                        style={{
                          fontSize: 13,
                          padding: "4px 12px",
                          fontWeight: 600,
                          borderRadius: 6,
                        }}
                      >
                        {answer.selected_answer}. {answer.selected_answer_text}
                      </Tag>
                    </div>

                    {/* Correct Answer (if wrong) */}
                    {!answer.is_correct && (
                      <div
                        style={{
                          background: "rgba(255, 255, 255, 0.7)",
                          padding: "12px 16px",
                          borderRadius: 8,
                          border: "1px solid #b7eb8f",
                        }}
                      >
                        <Text strong style={{ color: "#666", fontSize: 14 }}>
                          Jawaban Benar:{" "}
                        </Text>
                        <Tag
                          color="success"
                          style={{
                            fontSize: 13,
                            padding: "4px 12px",
                            fontWeight: 600,
                            borderRadius: 6,
                          }}
                        >
                          {answer.correct_answer}. {answer.correct_answer_text}
                        </Tag>
                      </div>
                    )}

                    {/* Explanation (if available) */}
                    {answer.explanation && (
                      <div
                        style={{
                          background: "#f0f8ff",
                          padding: "12px 16px",
                          borderRadius: 8,
                          border: "1px solid #d1e9ff",
                        }}
                      >
                        <Text strong style={{ color: "#1890ff", fontSize: 14 }}>
                          💡 Penjelasan:{" "}
                        </Text>
                        <Text style={{ color: "#666", fontSize: 14 }}>
                          {answer.explanation}
                        </Text>
                      </div>
                    )}
                  </Space>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      {/* Action Buttons */}
      <div
        style={{
          textAlign: "center",
          marginTop: 32,
          paddingTop: 24,
          borderTop: "2px solid #f0f0f0",
        }}
      >
        <Space
          direction={isMobile ? "vertical" : "horizontal"}
          size={16}
          style={{
            width: "100%",
            justifyContent: "center",
            display: "flex",
            flexWrap: "wrap",
            gap: isMobile ? 12 : 16,
          }}
        >
          <Button
            type="primary"
            icon={<BookOutlined />}
            onClick={() =>
              navigate(
                `/student/materials/${results.material_slug || "unknown"}`
              )
            }
            style={{
              background:
                "linear-gradient(135deg, #001529 0%, #3a3f5c 60%, #43cea2 100%)",
              borderColor: "#d9d9d9",
              borderRadius: 12,
              fontWeight: 600,
              height: 48,
              padding: "0 24px",
              fontSize: 14,
              boxShadow: "0 4px 16px rgba(0, 21, 41, 0.3)",
              minWidth: isMobile ? "200px" : "auto", // Consistent width pada mobile
              width: isMobile ? "100%" : "auto", // Full width pada mobile untuk konsistensi
              maxWidth: isMobile ? "280px" : "none", // Max width untuk mencegah terlalu lebar
              margin: isMobile ? "0 auto" : 0, // Center alignment
            }}
          >
            Kembali ke Mata Pelajaran
          </Button>

          <Button
            type="primary"
            icon={<FileTextOutlined />}
            onClick={() => navigate("/student/assessments")}
            style={{
              background:
                "linear-gradient(135deg, #001529 0%, #3a3f5c 60%, #43cea2 100%)",
              borderRadius: 12,
              fontWeight: 600,
              height: 48,
              padding: "0 24px",
              fontSize: 14,
              minWidth: isMobile ? "200px" : "auto",
              width: isMobile ? "100%" : "auto",
              maxWidth: isMobile ? "280px" : "none",
              margin: isMobile ? "0 auto" : 0,
              borderColor: "#d9d9d9",
            }}
          >
            Lihat Quiz Lainnya
          </Button>
        </Space>
      </div>
    </div>
  );
};

export default QuizResultsPage;
