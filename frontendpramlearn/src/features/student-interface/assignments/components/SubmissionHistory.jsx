import React, { useState, useEffect } from "react";
import {
  Card,
  List,
  Typography,
  Space,
  Tag,
  Button,
  Modal,
  Divider,
  Empty,
  Timeline,
  Progress,
  Tooltip,
  Result,
  Statistic,
  Row,
  Col,
  Alert,
  Breadcrumb,
  Spin,
  message,
} from "antd";
import {
  HistoryOutlined,
  TrophyOutlined,
  FileTextOutlined,
  DownloadOutlined,
  EyeOutlined,
  ClockCircleOutlined,
  UserOutlined,
  StarOutlined,
  ArrowLeftOutlined,
  CheckCircleOutlined,
  BookOutlined,
  HomeOutlined,
  ReloadOutlined,
  SendOutlined,
  CalendarOutlined,
  MessageOutlined,
  CloseCircleOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import duration from "dayjs/plugin/duration";
import "dayjs/locale/id";
import api from "../../../../api";
import { useParams, useNavigate } from "react-router-dom";

dayjs.extend(relativeTime);
dayjs.extend(duration);
dayjs.locale("id");

const { Title, Text, Paragraph } = Typography;

const SubmissionHistory = ({ onBack, assignment, submissions }) => {
  const { assignmentSlug } = useParams();
  const [assignmentState, setAssignment] = useState(assignment);
  const [submissionsState, setSubmissions] = useState(submissions || []);
  const [loading, setLoading] = useState(!assignment || !submissions);
  // Setelah loading state
  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "60px 0" }}>
        <Spin size="large" tip="Memuat riwayat assignment..." />
      </div>
    );
  }
  const navigate = useNavigate(); // Tambahkan hook navigate
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [submissionDetails, setSubmissionDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = isMobile ? 3 : 3;

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch assignment dan submissions jika diakses langsung via route
  useEffect(() => {
    if (assignmentSlug && (!assignment || !submissions)) {
      fetchAssignmentData();
    }
  }, [assignmentSlug, assignment, submissions]);

  // In fetchAssignmentData function:
  const fetchAssignmentData = async () => {
    try {
      setLoading(true);

      // Coba endpoint yang sudah ada
      const response = await api.get(
        `/student/assignments/${assignmentSlug}/results/`
      );

      if (response.data.assignment && response.data.submissions) {
        setAssignment(response.data.assignment);
        setSubmissions(response.data.submissions);
        console.log("✅ Data loaded successfully from results endpoint");
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Error fetching assignment data:", error);

      if (error.response?.status === 404) {
        console.log("Using fallback method to fetch assignment data");

        try {
          // Fallback: ambil dari assignment list
          const assignmentsResponse = await api.get(
            "/student/assignments/available/"
          );
          const foundAssignment = assignmentsResponse.data.find((a) => {
            // Match dengan slug atau title yang di-slugify
            const titleSlug = a.title.toLowerCase().replace(/\s+/g, "-");
            return a.slug === assignmentSlug || titleSlug === assignmentSlug;
          });

          if (foundAssignment) {
            console.log("✅ Found assignment:", foundAssignment.title);
            setAssignment(foundAssignment);

            // Ambil submissions untuk assignment ini
            try {
              const submissionsResponse = await api.get(
                `/student/assignment/${foundAssignment.id}/submissions/`
              );
              setSubmissions(submissionsResponse.data || []);
              console.log(
                "✅ Submissions loaded:",
                submissionsResponse.data?.length || 0
              );
            } catch (submissionError) {
              console.log(
                "⚠️ Could not load submissions:",
                submissionError.message
              );
              setSubmissions([]);
            }
          } else {
            console.log("❌ Assignment not found in available assignments");
            // Set empty data dengan message
            setAssignment(null);
            setSubmissions([]);
          }
        } catch (fallbackError) {
          console.error("Fallback method also failed:", fallbackError);
          setAssignment(null);
          setSubmissions([]);
        }
      } else {
        setAssignment(null);
        setSubmissions([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Update useEffect to check submissionsState instead of submissions
  useEffect(() => {
    if (submissionsState.length > 0 && !selectedSubmission) {
      fetchSubmissionDetails(submissionsState[0].id);
    }
  }, [submissionsState]);

  // Handle back navigation
  const handleBack = () => {
    if (onBack) {
      onBack(); // Jika dipanggil dari component parent
    } else {
      navigate("/student/assignments"); // Jika diakses langsung via route
    }
  };

  // Fetch detailed submission data with ranking
  const fetchSubmissionDetails = async (submissionId) => {
    setLoadingDetails(true);
    try {
      const response = await api.get(
        `/student/assignment-submission/${submissionId}/details/`
      );
      setSubmissionDetails(response.data);
    } catch (error) {
      console.error("Error fetching submission details:", error);
      setSubmissionDetails(null);
    } finally {
      setLoadingDetails(false);
    }
  };

  // Load submission details when selected
  useEffect(() => {
    if (selectedSubmission) {
      fetchSubmissionDetails(selectedSubmission.id);
    }
  }, [selectedSubmission]);

  useEffect(() => {
    if (assignmentState?.length > 0 && !selectedSubmission) {
      // Otomatis load detail untuk submission terbaru
      fetchSubmissionDetails(submissionsState[0].id);
    }
    // eslint-disable-next-line
  }, [submissionsState]);

  const getGradeColor = (grade) => {
    if (grade >= 90) return "#52c41a"; // Green
    if (grade >= 80) return "#1890ff"; // Blue
    if (grade >= 70) return "#faad14"; // Orange
    if (grade >= 60) return "#fa8c16"; // Dark Orange
    return "#ff4d4f"; // Red
  };

  const getGradeText = (grade) => {
    if (grade >= 90) return "A - Excellent";
    if (grade >= 80) return "B - Good";
    if (grade >= 70) return "C - Fair";
    if (grade >= 60) return "D - Pass";
    return "E - Needs Improvement";
  };

  const getGradeIcon = (grade) => {
    if (grade >= 90) return <TrophyOutlined style={{ color: "#52c41a" }} />;
    if (grade >= 80) return <StarOutlined style={{ color: "#1890ff" }} />;
    if (grade >= 70)
      return <CheckCircleOutlined style={{ color: "#faad14" }} />;
    return <ClockCircleOutlined style={{ color: "#ff4d4f" }} />;
  };

  const showSubmissionDetail = (submission) => {
    setSelectedSubmission(submission);
    setDetailModalVisible(true);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Calculate work duration
  const getWorkDuration = (startTime, submitTime) => {
    if (!startTime || !submitTime) return "N/A";

    const start = dayjs(startTime);
    const submit = dayjs(submitTime);
    const duration = dayjs.duration(submit.diff(start));

    const hours = duration.hours();
    const minutes = duration.minutes();

    if (hours > 0) {
      return `${hours} jam ${minutes} menit`;
    }
    return `${minutes} menit`;
  };

  // Get latest submission for main result display
  const latestSubmission =
    submissionsState.length > 0 ? submissionsState[0] : null;
  const isGraded = latestSubmission && latestSubmission.grade !== null;

  // Tampilkan error jika assignment/submissions tidak ditemukan
  if (!assignmentState || submissionsState.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "60px 0" }}>
        <Alert
          message="Assignment atau riwayat submission tidak ditemukan"
          description="Assignment yang Anda cari tidak tersedia atau belum pernah dikerjakan."
          type="warning"
          showIcon
          style={{ borderRadius: 12, maxWidth: 500, margin: "0 auto" }}
          action={
            <Button
              type="primary"
              onClick={() => navigate("/student/assignments")}
            >
              Kembali ke Daftar Assignment
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: 1400,
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
            href: "/student/assignments",
            title: (
              <Space>
                <FileTextOutlined />
                <span>Assignments</span>
              </Space>
            ),
          },
          {
            title: (
              <Space>
                <HistoryOutlined />
                <span>Submission History</span>
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
          padding: isMobile ? "24px 16px" : "32px 24px",
          marginBottom: 32,
          color: "white",
          position: "relative",
          overflow: "hidden",
        }}
      >
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
          <Space direction="vertical" size={4}>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/student/assignments")}
              style={{
                background: "rgba(255, 255, 255, 0.2)",
                borderColor: "rgba(255, 255, 255, 0.3)",
                color: "white",
                backdropFilter: "blur(10px)",
              }}
            >
              Kembali ke Assignment
            </Button>
            <Title
              level={isMobile ? 3 : 2}
              style={{ color: "white", margin: 0, marginBottom: 8 }}
            >
              📊 Assignment Results
            </Title>
            <Text style={{ color: "rgba(255, 255, 255, 0.9)", fontSize: 16 }}>
              {assignmentState?.title || "Assignment"}{" "}
            </Text>
            <Text style={{ color: "rgba(255, 255, 255, 0.8)", fontSize: 14 }}>
              Diselesaikan pada:{" "}
              {latestSubmission
                ? dayjs(latestSubmission.submission_date).format(
                    "DD MMMM YYYY, HH:mm"
                  )
                : "N/A"}
            </Text>
          </Space>
        </div>
      </div>

      {/* 2 Column Layout */}
      <Row gutter={[24, 24]}>
        {/* Left Column - Statistics & Info */}
        <Col xs={24} lg={10}>
          {/* Main Result Display - Jika ada submission yang sudah dinilai */}
          {isGraded && (
            <Card
              style={{
                marginBottom: 32,
                borderRadius: 16,
                background: `linear-gradient(135deg, ${getGradeColor(
                  latestSubmission.grade
                )}15, #fff)`,
                border: `2px solid ${getGradeColor(latestSubmission.grade)}`,
                boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
              }}
            >
              <Result
                icon={
                  <TrophyOutlined
                    style={{
                      color: getGradeColor(latestSubmission.grade),
                      fontSize: isMobile ? 56 : 72,
                    }}
                  />
                }
                title={
                  <Space direction="vertical" size="small">
                    <Title
                      level={2}
                      style={{
                        margin: 0,
                        color: getGradeColor(latestSubmission.grade),
                        fontSize: isMobile ? 24 : 32,
                      }}
                    >
                      Nilai Anda: {latestSubmission.grade.toFixed(1)}/100
                    </Title>
                    <Tag
                      color={getGradeColor(latestSubmission.grade)}
                      style={{
                        fontSize: isMobile ? 12 : 14,
                        padding: "4px 12px",
                        fontWeight: "bold",
                      }}
                    >
                      Grade: {getGradeText(latestSubmission.grade)}
                    </Tag>
                  </Space>
                }
                subTitle={
                  <div style={{ marginTop: 16 }}>
                    <Text
                      style={{ fontSize: 16, color: "#666", marginRight: 12 }}
                    >
                      {submissionDetails?.correct_answers || 0} dari{" "}
                      {submissionDetails?.total_questions ||
                        assignmentState.questions?.length ||
                        0}{" "}
                      soal benar
                    </Text>
                    <Progress
                      percent={latestSubmission.grade.toFixed(1)}
                      strokeColor={getGradeColor(
                        latestSubmission.grade.toFixed(1)
                      )}
                      style={{
                        maxWidth: 300,
                        margin: "12px auto 0",
                      }}
                      strokeWidth={8}
                    />
                  </div>
                }
              />
            </Card>
          )}
          <Space direction="vertical" style={{ width: "100%" }} size={24}>
            {/* Statistics Cards */}
            <Row gutter={[16, 16]}>
              <Col xs={12} sm={12}>
                <Card style={{ borderRadius: 12, textAlign: "center" }}>
                  <Statistic
                    title="Waktu Pengerjaan"
                    value={
                      submissionDetails?.work_duration ||
                      getWorkDuration(
                        latestSubmission?.start_time,
                        latestSubmission?.submission_date
                      ) ||
                      "N/A"
                    }
                    prefix={
                      <ClockCircleOutlined style={{ color: "#1890ff" }} />
                    }
                    valueStyle={{
                      color: "#1890ff",
                      fontSize: isMobile ? 16 : 20,
                    }}
                  />
                </Card>
              </Col>
              <Col xs={12} sm={12}>
                <Card style={{ borderRadius: 12, textAlign: "center" }}>
                  <Statistic
                    title="Ranking"
                    value={submissionDetails?.rank || "-"}
                    suffix={
                      submissionDetails?.total_participants
                        ? `/ ${submissionDetails.total_participants}`
                        : ""
                    }
                    prefix={<TrophyOutlined style={{ color: "#52c41a" }} />}
                    valueStyle={{
                      color: "#52c41a",
                      fontSize: isMobile ? 16 : 20,
                    }}
                  />
                </Card>
              </Col>
              <Col xs={12} sm={12}>
                <Card style={{ borderRadius: 12, textAlign: "center" }}>
                  <Statistic
                    title="Jawaban Benar"
                    value={submissionDetails?.correct_answers || 0}
                    suffix={`/ ${
                      submissionDetails?.total_questions ||
                      assignmentState?.questions?.length ||
                      0
                    }`}
                    prefix={
                      <CheckCircleOutlined style={{ color: "#faad14" }} />
                    }
                    valueStyle={{
                      color: "#faad14",
                      fontSize: isMobile ? 16 : 20,
                    }}
                  />
                </Card>
              </Col>
              <Col xs={12} sm={12}>
                <Card style={{ borderRadius: 12, textAlign: "center" }}>
                  <Statistic
                    title="Persentase Benar"
                    value={
                      submissionDetails?.correct_answers &&
                      submissionDetails?.total_questions
                        ? (
                            (submissionDetails.correct_answers /
                              submissionDetails.total_questions) *
                            100
                          ).toFixed(1)
                        : "0.0"
                    }
                    suffix="%"
                    prefix={<StarOutlined style={{ color: "#722ed1" }} />}
                    valueStyle={{
                      color: "#722ed1",
                      fontSize: isMobile ? 16 : 20,
                    }}
                  />
                </Card>
              </Col>
            </Row>

            {/* Submission Timeline */}
            {/* <Card
              title={
                <Space>
                  <HistoryOutlined style={{ color: "#1890ff" }} />
                  <span>Submission Timeline</span>
                </Space>
              }
              style={{
                borderRadius: 16,
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
            >
              {submissions.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 24px" }}>
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="Belum ada submission"
                  />
                </div>
              ) : (
                <Timeline style={{ padding: "16px 0" }}>
                  {submissionsState.slice(0, 3).map((submission, index) => (
                    <Timeline.Item
                      key={submission.id}
                      dot={
                        submission.grade !== null ? (
                          getGradeIcon(submission.grade)
                        ) : (
                          <ClockCircleOutlined style={{ color: "#1890ff" }} />
                        )
                      }
                      color={
                        submission.grade !== null
                          ? getGradeColor(submission.grade)
                          : "#1890ff"
                      }
                    >
                      <Card
                        size="small"
                        hoverable
                        onClick={() => showSubmissionDetail(submission)}
                        style={{
                          marginBottom: 8,
                          border:
                            index === 0
                              ? "2px solid #1890ff"
                              : "1px solid #d9d9d9",
                          borderRadius: 8,
                          cursor: "pointer",
                        }}
                      >
                        <Space
                          direction="vertical"
                          size={4}
                          style={{ width: "100%" }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <Text strong>
                              Submission #{submissions.length - index}
                            </Text>
                            {index === 0 && (
                              <Tag color="blue" size="small">
                                Latest
                              </Tag>
                            )}
                          </div>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {dayjs(submission.submission_date).format(
                              "DD MMM YYYY, HH:mm"
                            )}
                          </Text>
                          {submission.grade !== null && (
                            <Tag
                              color={getGradeColor(submission.grade)}
                              size="small"
                            >
                              Grade: {submission.grade.toFixed(1)}
                            </Tag>
                          )}
                        </Space>
                      </Card>
                    </Timeline.Item>
                  ))}
                </Timeline>
              )}
            </Card> */}

            {/* Teacher Feedback (if available) */}
            {latestSubmission?.teacher_feedback && (
              <Card
                title={
                  <Space>
                    <MessageOutlined style={{ color: "#52c41a" }} />
                    <span>Teacher Feedback</span>
                  </Space>
                }
                style={{ borderRadius: 12 }}
              >
                <div
                  style={{
                    background: "#f6ffed",
                    padding: "16px",
                    borderRadius: 8,
                    border: "1px solid #b7eb8f",
                  }}
                >
                  <Paragraph
                    style={{
                      margin: 0,
                      fontStyle: "italic",
                      color: "#555",
                      fontSize: 14,
                    }}
                  >
                    "{latestSubmission.teacher_feedback}"
                  </Paragraph>
                </div>
              </Card>
            )}
          </Space>
        </Col>

        {/* Right Column - Review Jawaban Detail */}
        <Col xs={24} lg={14}>
          <Card
            title={
              <Space>
                <BookOutlined style={{ color: "#1890ff" }} />
                <span>📋 Review Jawaban Detail</span>
              </Space>
            }
            style={{
              borderRadius: 16,
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              height: "fit-content",
            }}
            styles={{
              header: {
                borderBottom: "2px solid #f0f0f0",
                background: "#fafbfc",
              },
            }}
          >
            {loadingDetails ? (
              <div style={{ textAlign: "center", padding: "60px 0" }}>
                <Spin size="large" tip="Memuat detail jawaban..." />
              </div>
            ) : submissionDetails?.answers &&
              submissionDetails.answers.length > 0 ? (
              <List
                itemLayout="vertical"
                dataSource={submissionDetails.answers || []}
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
                renderItem={(answer, index) => {
                  // Hitung nomor soal global berdasarkan currentPage
                  const globalIndex = (currentPage - 1) * pageSize + index + 1;

                  return (
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
                          }}
                        >
                          <div
                            style={{
                              background: answer.is_correct
                                ? "#52c41a"
                                : "#ff4d4f",
                              borderRadius: "50%",
                              width: 32,
                              height: 32,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
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
                          <div style={{ flex: 1 }}>
                            <Space>
                              <Tag
                                color={answer.is_correct ? "success" : "error"}
                                style={{ fontWeight: 600 }}
                              >
                                Soal {globalIndex}
                              </Tag>
                              <Tag
                                color={answer.is_correct ? "success" : "error"}
                              >
                                {answer.is_correct ? "Benar" : "Salah"}
                              </Tag>
                            </Space>
                          </div>
                        </div>

                        {/* Question Text */}
                        <div
                          style={{
                            background: "rgba(255, 255, 255, 0.7)",
                            padding: "16px 20px",
                            borderRadius: 8,
                            border: "1px solid rgba(0,0,0,0.1)",
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
                              fontWeight: 600,
                              padding: "2px 8px",
                            }}
                          >
                            {answer.selected_choice}.{" "}
                            {answer.selected_answer_text ||
                              answer.essay_answer ||
                              "No answer"}
                          </Tag>
                        </div>

                        {/* Correct Answer (if wrong) */}
                        {!answer.is_correct && answer.correct_answer && (
                          <div
                            style={{
                              background: "#f6ffed",
                              padding: "12px 16px",
                              borderRadius: 8,
                              border: "1px solid #b7eb8f",
                            }}
                          >
                            <Text
                              strong
                              style={{ color: "#52c41a", fontSize: 14 }}
                            >
                              Jawaban Benar:{" "}
                            </Text>
                            <Tag
                              color="success"
                              style={{
                                fontSize: 13,
                                fontWeight: 600,
                                padding: "2px 8px",
                              }}
                            >
                              {answer.correct_answer}.{" "}
                              {answer.correct_answer_text}
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
                            <Text
                              strong
                              style={{ color: "#1890ff", fontSize: 14 }}
                            >
                              💡 Penjelasan:{" "}
                            </Text>
                            <Text style={{ color: "#666", fontSize: 14 }}>
                              {answer.explanation}
                            </Text>
                          </div>
                        )}
                      </Space>
                    </List.Item>
                  );
                }}
                responsive={true}
              />
            ) : (
              <div style={{ textAlign: "center", padding: "60px 24px" }}>
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    <div>
                      <Text style={{ fontSize: 16, color: "#666" }}>
                        Belum ada detail jawaban tersedia
                      </Text>
                      <div style={{ marginTop: 12 }}>
                        <Text type="secondary" style={{ fontSize: 14 }}>
                          Pilih submission dari timeline untuk melihat detail
                          jawaban
                        </Text>
                      </div>
                    </div>
                  }
                />
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* Action Buttons */}
      <div
        style={{
          textAlign: "center",
          marginTop: 32,
          paddingTop: 24,
          borderTop: "1px solid #f0f0f0",
        }}
      >
        <Space
          direction={isMobile ? "vertical" : "horizontal"}
          size="large"
          wrap
          style={{
            width: isMobile ? "100%" : "auto",
            justifyContent: "center",
            display: "flex",
            gap: isMobile ? 16 : 24,
          }}
        >
          <Button
            icon={<BookOutlined />}
            onClick={() => navigate("/student/subjects")} // Ubah dari window.location.href
            size="large"
            style={{
              borderRadius: 12,
              fontWeight: 600,
              height: 48,
              padding: "0 24px",
              boxShadow: "0 4px 16px rgba(0, 21, 41, 0.3)",
              minWidth: isMobile ? "100%" : "200px",
              width: isMobile ? "100%" : "auto",
              maxWidth: isMobile ? "100%" : "280px",
              margin: isMobile ? "0" : undefined,
              display: "block",
            }}
            block={isMobile}
          >
            Kembali ke Mata Pelajaran
          </Button>

          <Button
            type="primary"
            icon={<FileTextOutlined />}
            onClick={() => navigate("/student/assignments")}
            size="large"
            style={{
              background:
                "linear-gradient(135deg, #001529 0%, #3a3f5c 60%, #43cea2 100%)",
              borderColor: "#d9d9d9",
              borderRadius: 12,
              fontWeight: 600,
              height: 48,
              padding: "0 24px",
              boxShadow: "0 4px 16px rgba(0, 21, 41, 0.3)",
              minWidth: isMobile ? "100%" : "200px",
              width: isMobile ? "100%" : "auto",
              maxWidth: isMobile ? "100%" : "280px",
              margin: isMobile ? "0" : undefined,
              display: "block",
            }}
            block={isMobile}
          >
            Lihat Assignment Lainnya
          </Button>
        </Space>
      </div>

      {/* Submission Detail Modal - Simplified */}
      <Modal
        title={
          <Space>
            <FileTextOutlined style={{ color: "#1890ff" }} />
            <span>
              Submission Overview -{" "}
              {selectedSubmission
                ? dayjs(selectedSubmission.submission_date).format(
                    "DD MMM YYYY, HH:mm"
                  )
                : ""}
            </span>
          </Space>
        }
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={isMobile ? "95%" : 600}
        centered
      >
        {selectedSubmission && (
          <div>
            {/* Basic Info */}
            <Space direction="vertical" style={{ width: "100%" }} size={16}>
              <div
                style={{
                  background: "#f8fafc",
                  padding: "16px",
                  borderRadius: 8,
                  border: "1px solid #e2e8f0",
                }}
              >
                <Row gutter={16}>
                  <Col span={12}>
                    <Text type="secondary">Submitted:</Text>
                    <div>
                      <Text strong>
                        {dayjs(selectedSubmission.submission_date).format(
                          "DD MMM YYYY, HH:mm"
                        )}
                      </Text>
                    </div>
                  </Col>
                  <Col span={12}>
                    <Text type="secondary">Grade:</Text>
                    <div>
                      {selectedSubmission.grade !== null ? (
                        <Tag color={getGradeColor(selectedSubmission.grade)}>
                          {selectedSubmission.grade.toFixed(1)}/100
                        </Tag>
                      ) : (
                        <Tag color="gray">Pending</Tag>
                      )}
                    </div>
                  </Col>
                </Row>
              </div>

              <Alert
                message="Tip"
                description="Detail jawaban akan ditampilkan di panel Review Jawaban Detail di sebelah kanan saat Anda memilih submission ini."
                type="info"
                showIcon
              />
            </Space>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SubmissionHistory;
