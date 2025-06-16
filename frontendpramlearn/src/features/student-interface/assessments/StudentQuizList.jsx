import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  List,
  Button,
  Tag,
  Space,
  Typography,
  Empty,
  Spin,
  Alert,
  Row,
  Col,
  Breadcrumb,
  Progress,
  Statistic,
} from "antd";
import {
  PlayCircleOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  TeamOutlined,
  TrophyOutlined,
  BookOutlined,
  HomeOutlined,
  FileTextOutlined,
  DashboardOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import useStudentQuizzes from "./hooks/useStudentQuizzes";
import useStudentGroupQuizzes from "./hooks/useStudentGroupQuizzes";

dayjs.extend(duration);

const { Title, Text } = Typography;

const StudentQuizList = () => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(dayjs());

  // Data fetching hooks
  const {
    availableQuizzes: individualQuizzes,
    loading: individualLoading,
    error: individualError,
  } = useStudentQuizzes();

  const {
    groupQuizzes,
    loading: groupLoading,
    error: groupError,
  } = useStudentGroupQuizzes();

  // Combine all quizzes
  const allQuizzes = [...(individualQuizzes || []), ...(groupQuizzes || [])];

  // Real-time timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(dayjs());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Quiz status logic
  const getQuizStatus = (quiz) => {
    if (quiz.quiz_type === "group" || quiz.is_group_quiz) {
      if (quiz.is_completed) {
        return {
          status: "completed",
          color: "success",
          text: "Selesai",
          icon: <CheckCircleOutlined />,
        };
      }
      return {
        status: "available",
        color: "default",
        text: "Tersedia",
        icon: <PlayCircleOutlined />,
      };
    }

    // Individual quiz logic
    if (quiz.student_attempt?.submitted_at) {
      return {
        status: "completed",
        color: "success",
        text: "Selesai",
        icon: <CheckCircleOutlined />,
      };
    }
    if (quiz.student_attempt?.start_time) {
      return {
        status: "in_progress",
        color: "processing",
        text: "Sedang Dikerjakan",
        icon: <ClockCircleOutlined />,
      };
    }
    return {
      status: "available",
      color: "default",
      text: "Tersedia",
      icon: <PlayCircleOutlined />,
    };
  };

  // Time remaining calculation
  const getTimeRemaining = (endTime) => {
    if (!endTime) return null;
    const end = dayjs(endTime);
    if (currentTime.isAfter(end)) return "EXPIRED";

    const diff = end.diff(currentTime);
    const duration = dayjs.duration(diff);
    const hours = String(Math.floor(duration.asHours())).padStart(2, "0");
    const minutes = String(duration.minutes()).padStart(2, "0");
    const seconds = String(duration.seconds()).padStart(2, "0");

    return `${hours}:${minutes}:${seconds}`;
  };

  // Time color coding
  const getTimeColor = (endTime) => {
    if (!endTime) return "default";
    const end = dayjs(endTime);
    const diff = end.diff(currentTime);
    const totalMinutes = Math.floor(diff / (1000 * 60));

    if (totalMinutes <= 30) return "#ff4d4f"; // Red
    if (totalMinutes <= 60) return "#fa8c16"; // Orange
    if (totalMinutes <= 180) return "#faad14"; // Yellow
    return "#52c41a"; // Green
  };

  // Quiz navigation
  const handleStartQuiz = async (quiz) => {
    if (quiz.quiz_type === "group" || quiz.is_group_quiz) {
      navigate(`/student/group-quiz/${quiz.slug}`);
    } else {
      navigate(`/student/quiz/${quiz.slug}`);
    }
  };

  // Button configuration
  const getButtonAction = (quiz) => {
    const status = getQuizStatus(quiz);

    if (status.status === "completed") {
      return {
        text: "Lihat Hasil",
        type: "default",
        icon: <TrophyOutlined />,
        onClick: () =>
          navigate(
            quiz.is_group_quiz
              ? `/student/group-quiz/${quiz.slug}/results`
              : `/student/quiz/${quiz.slug}/results`
          ),
        // Tambahan style untuk gradient emas
        style: {
          background:
            "linear-gradient(135deg, #ffec3d 0%, #faad14 50%, #ff8c00 100%)",
          borderColor: "transparent",
          color:
            "linear-gradient(135deg, #001529 0%, #3a3f5c 60%, #43cea2 100%)",
          fontWeight: 600,
          boxShadow: "0 4px 12px rgba(255, 173, 20, 0.4)",
          textShadow: "0 1px 2px rgba(0,0,0,0.2)",
        },
      };
    }

    if (status.status === "in_progress") {
      return {
        // tambahka background button gradient yang sama seperti student layout
        style: {
          background:
            "linear-gradient(135deg, #001529 0%, #3a3f5c 60%, #43cea2 100%)",
        },
        text: "Lanjutkan Quiz",
        type: "primary",
        icon: <PlayCircleOutlined />,
        onClick: () => handleStartQuiz(quiz),
      };
    }

    return {
      text: "Mulai Quiz",
      type: "primary",
      icon: <PlayCircleOutlined />,
      onClick: () => handleStartQuiz(quiz),
    };
  };

  // Calculate statistics
  const completedQuizzes = allQuizzes.filter((quiz) => {
    const status = getQuizStatus(quiz);
    return status.status === "completed";
  });

  const inProgressQuizzes = allQuizzes.filter((quiz) => {
    const status = getQuizStatus(quiz);
    return status.status === "in_progress";
  });

  const availableQuizzes = allQuizzes.filter((quiz) => {
    const status = getQuizStatus(quiz);
    return status.status === "available";
  });

  const averageScore =
    completedQuizzes.length > 0
      ? completedQuizzes.reduce(
          (sum, quiz) => sum + (quiz.student_attempt?.score || quiz.score || 0),
          0
        ) / completedQuizzes.length
      : 0;

  if (individualLoading || groupLoading) {
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
          <Spin size="large" tip="Memuat quiz..." />
        </div>
      </div>
    );
  }

  if (individualError || groupError) {
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
          message="Gagal memuat quiz"
          description={
            individualError?.message ||
            groupError?.message ||
            "Terjadi kesalahan saat mengambil data quiz."
          }
          type="error"
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
      {/* Breadcrumb - Konsisten dengan halaman lain */}
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
            title: (
              <Space>
                <FileTextOutlined />
                <span>Assessments</span>
              </Space>
            ),
          },
        ]}
      />

      {/* Header Section - Konsisten dengan subjects */}
      <div
        style={{
          background:
            "linear-gradient(135deg, #001529 0%, #3a3f5c 60%, #43cea2 100%)", // Sama dengan StudentLayout
          borderRadius: 16,
          padding: "32px 24px",
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

        <Row align="middle" style={{ position: "relative", zIndex: 1 }}>
          <Col xs={24} md={18}>
            <Title
              level={2}
              style={{ color: "white", margin: 0, marginBottom: 8 }}
            >
              📝 Quiz & Assessments
            </Title>
            <Text
              style={{
                color: "rgba(255, 255, 255, 0.9)",
                fontSize: 16,
                display: "block",
                marginBottom: 4,
              }}
            >
              Kerjakan quiz untuk mengukur pemahaman Anda
            </Text>
            <Text
              style={{
                color: "rgba(255, 255, 255, 0.8)",
                fontSize: 14,
              }}
            >
              Total {allQuizzes.length} quiz tersedia
            </Text>
          </Col>
          <Col xs={24} md={6} style={{ marginTop: 16, textAlign: "center" }}>
            <div
              style={{
                background: "rgba(255, 255, 255, 0.15)",
                borderRadius: 12,
                padding: 16,
                backdropFilter: "blur(10px)",
              }}
            >
              <FileTextOutlined style={{ fontSize: 32, marginBottom: 8 }} />
              <div style={{ fontSize: 14, opacity: 0.9 }}>
                Assessment Center
              </div>
            </div>
          </Col>
        </Row>
      </div>

      {/* Stats Cards - Konsisten dengan subjects */}
      <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
        <Col xs={12} sm={6} md={6}>
          <Card style={{ borderRadius: 12, textAlign: "center" }}>
            <Statistic
              title="Total Quiz"
              value={allQuizzes.length}
              prefix={<FileTextOutlined style={{ color: "#1890ff" }} />}
              valueStyle={{ color: "#1890ff", fontSize: 24 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6} md={6}>
          <Card style={{ borderRadius: 12, textAlign: "center" }}>
            <Statistic
              title="Selesai"
              value={completedQuizzes.length}
              prefix={<TrophyOutlined style={{ color: "#52c41a" }} />}
              valueStyle={{ color: "#52c41a", fontSize: 24 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6} md={6}>
          <Card style={{ borderRadius: 12, textAlign: "center" }}>
            <Statistic
              title="Sedang Dikerjakan"
              value={inProgressQuizzes.length}
              prefix={<ClockCircleOutlined style={{ color: "#faad14" }} />}
              valueStyle={{ color: "#faad14", fontSize: 24 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6} md={6}>
          <Card style={{ borderRadius: 12, textAlign: "center" }}>
            <Statistic
              title="Rata-rata Skor"
              value={averageScore}
              precision={1}
              suffix="/100"
              prefix={<DashboardOutlined style={{ color: "#722ed1" }} />}
              valueStyle={{ color: "#722ed1", fontSize: 24 }}
            />
          </Card>
        </Col>
      </Row>

      {/* Quiz List */}
      <Card
        title={
          <Space>
            <BookOutlined style={{ color: "#11418b" }} />
            <span>Daftar Quiz & Assessments</span>
          </Space>
        }
        style={{
          borderRadius: 16,
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}
        styles={{
          header: {
            borderBottom: "1px solid #f0f0f0",
            background: "#fafafa",
          },
        }}
      >
        {allQuizzes.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 24px" }}>
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <div>
                  <Text style={{ fontSize: 16, color: "#666" }}>
                    Belum ada quiz tersedia
                  </Text>
                  <div style={{ marginTop: 12 }}>
                    <Text type="secondary" style={{ fontSize: 14 }}>
                      Quiz akan tersedia setelah ditambahkan oleh guru
                    </Text>
                  </div>
                </div>
              }
            />
          </div>
        ) : (
          <List
            grid={{
              gutter: 16,
              xs: 1,
              sm: 1,
              md: 1,
              lg: 2,
              xl: 2,
              xxl: 3,
            }}
            dataSource={allQuizzes}
            renderItem={(quiz) => {
              const status = getQuizStatus(quiz);
              const timeRemaining = getTimeRemaining(quiz.end_time);
              const timeColor = getTimeColor(quiz.end_time);
              const buttonAction = getButtonAction(quiz);

              return (
                <List.Item>
                  <Card
                    style={{
                      borderRadius: 16,
                      overflow: "hidden",
                      boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                      border: "1px solid #f0f0f0",
                      height: "100%",
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      position: "relative",
                    }}
                    bodyStyle={{ padding: 0 }}
                    hoverable
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-6px)";
                      e.currentTarget.style.boxShadow =
                        "0 12px 32px rgba(17, 65, 139, 0.12)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow =
                        "0 4px 16px rgba(0,0,0,0.08)";
                    }}
                  >
                    {/* Status Badge - Top Right Corner */}
                    <div
                      style={{
                        position: "absolute",
                        top: 16,
                        right: 16,
                        zIndex: 2,
                      }}
                    >
                      <Tag
                        icon={status.icon}
                        color={status.color}
                        style={{
                          fontWeight: 600,
                          fontSize: 11,
                          padding: "2px 8px",
                          borderRadius: 6,
                          border: "none",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                        }}
                      >
                        {status.text}
                      </Tag>
                    </div>

                    {/* Header Section */}
                    <div
                      style={{
                        background:
                          quiz.quiz_type === "group" || quiz.is_group_quiz
                            ? "linear-gradient(135deg, #001529 0%, #3a3f5c 60%, #43cea2 100%)" // Tetap purple untuk group quiz
                            : "linear-gradient(135deg, #001529 0%, #3a3f5c 60%, #43cea2 100%)", // Sama dengan StudentLayout untuk individual quiz
                        padding: "24px 20px 20px 20px",
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
                          width: 80,
                          height: 80,
                          borderRadius: "50%",
                          background: "rgba(255, 255, 255, 0.1)",
                        }}
                      />
                      <div
                        style={{
                          position: "absolute",
                          bottom: -30,
                          left: -30,
                          width: 100,
                          height: 100,
                          borderRadius: "50%",
                          background: "rgba(255, 255, 255, 0.05)",
                        }}
                      />

                      {/* Quiz Type Badge */}
                      <div
                        style={{
                          marginBottom: 12,
                          position: "relative",
                          zIndex: 1,
                        }}
                      >
                        {quiz.quiz_type === "group" || quiz.is_group_quiz ? (
                          <Space size={8}>
                            <TeamOutlined style={{ fontSize: 16 }} />
                            <Tag
                              color="rgba(255, 255, 255, 0.2)"
                              style={{
                                color: "white",
                                border: "1px solid rgba(255, 255, 255, 0.3)",
                                background: "rgba(255, 255, 255, 0.15)",
                                fontSize: 11,
                                fontWeight: 500,
                              }}
                            >
                              Kelompok: {quiz.group_name}
                            </Tag>
                          </Space>
                        ) : (
                          <Space size={8}>
                            <FileTextOutlined style={{ fontSize: 16 }} />
                            <Tag
                              color="rgba(255, 255, 255, 0.2)"
                              style={{
                                color: "white",
                                border: "1px solid rgba(255, 255, 255, 0.3)",
                                background: "rgba(255, 255, 255, 0.15)",
                                fontSize: 11,
                                fontWeight: 500,
                              }}
                            >
                              Individual Quiz
                            </Tag>
                          </Space>
                        )}
                      </div>

                      {/* Quiz Title */}
                      <Title
                        level={5}
                        style={{
                          color: "white",
                          margin: 0,
                          fontSize: 15,
                          fontWeight: 600,
                          lineHeight: 1.3,
                          position: "relative",
                          zIndex: 1,
                        }}
                      >
                        {quiz.title.length > 45
                          ? `${quiz.title.substring(0, 45)}...`
                          : quiz.title}
                      </Title>
                    </div>

                    {/* Content Section */}
                    <div style={{ padding: "20px" }}>
                      {/* Quiz Description */}
                      {quiz.content && (
                        <div style={{ marginBottom: 16 }}>
                          <Text
                            type="secondary"
                            style={{
                              fontSize: 14,
                              color: "#666",
                              background: "#f7f7f7",
                              padding: "8px 12px",
                              borderRadius: 8,
                              border: "1px solid #e8e8e8",
                              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
                              marginBottom: 12,
                              wordBreak: "break-word",
                              lineHeight: 1.5,
                              display: "block",
                            }}
                          >
                            {quiz.content.length > 120
                              ? `${quiz.content.substring(0, 120)}...`
                              : quiz.content}
                          </Text>
                        </div>
                      )}

                      {/* Score Display for Completed Quiz */}
                      {status.status === "completed" && (
                        <div
                          style={{
                            background:
                              "linear-gradient(135deg, #f6ffed 0%, #e6fffb 100%)",
                            border: "1px solid #b7eb8f",
                            borderRadius: 12,
                            padding: "16px",
                            marginBottom: 16,
                          }}
                        >
                          <div
                            style={{
                              // icon and text alignment center
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: 12,
                              marginBottom: 8,
                            }}
                          >
                            <div
                              style={{
                                background: "#52c41a",
                                borderRadius: "50%",
                                width: 32,
                                height: 32,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <TrophyOutlined
                                style={{ color: "white", fontSize: 16 }}
                              />
                            </div>
                            <div>
                              <Text
                                strong
                                style={{ fontSize: 15, color: "#52c41a" }}
                              >
                                Quiz Selesai
                              </Text>
                              <div
                                style={{
                                  fontSize: 20,
                                  fontWeight: 700,
                                  color: "#52c41a",
                                }}
                              >
                                {(
                                  quiz.student_attempt?.score ||
                                  quiz.score ||
                                  0
                                ).toFixed(1)}
                                /100
                              </div>
                            </div>
                          </div>
                          <Progress
                            percent={
                              quiz.student_attempt?.score || quiz.score || 0
                            }
                            strokeColor={{
                              "0%": "#52c41a",
                              "100%": "#389e0d",
                            }}
                            showInfo={false}
                            strokeWidth={8}
                            style={{ marginBottom: 0 }}
                          />
                        </div>
                      )}

                      {/* Time Remaining */}
                      {quiz.end_time && (
                        <div
                          style={{
                            background:
                              timeRemaining === "EXPIRED"
                                ? "linear-gradient(135deg, #fff2f0 0%, #ffebe6 100%)"
                                : "linear-gradient(135deg, #f6ffed 0%, #e6fffb 100%)",
                            border: `1px solid ${
                              timeRemaining === "EXPIRED"
                                ? "#ffccc7"
                                : "#b7eb8f"
                            }`,
                            borderRadius: 12,
                            padding: "16px",
                            marginBottom: 16,
                            textAlign: "center",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: 8,
                              marginBottom: 8,
                            }}
                          >
                            <div
                              style={{
                                background:
                                  timeRemaining === "EXPIRED"
                                    ? "#ff4d4f"
                                    : "#52c41a",
                                borderRadius: "50%",
                                width: 24,
                                height: 24,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <ClockCircleOutlined
                                style={{ color: "white", fontSize: 12 }}
                              />
                            </div>
                            <Text
                              style={{
                                fontSize: 13,
                                fontWeight: 600,
                                color: "#666",
                              }}
                            >
                              {timeRemaining === "EXPIRED"
                                ? "Waktu Habis"
                                : "Sisa Waktu"}
                            </Text>
                          </div>

                          <div
                            style={{
                              fontSize: 18,
                              fontWeight: 700,
                              color:
                                timeRemaining === "EXPIRED"
                                  ? "#ff4d4f"
                                  : timeColor,
                              marginBottom: 4,
                            }}
                          >
                            {timeRemaining === "EXPIRED"
                              ? "EXPIRED"
                              : timeRemaining || "Unlimited"}
                          </div>

                          {quiz.end_time && (
                            <Text style={{ fontSize: 12, color: "#999" }}>
                              Deadline:{" "}
                              {dayjs(quiz.end_time).format(
                                "DD MMM YYYY, HH:mm"
                              )}
                            </Text>
                          )}
                        </div>
                      )}

                      {/* Quiz Meta Information */}
                      <div style={{ marginBottom: 16 }}>
                        <Space wrap size={8}>
                          {quiz.questions_count && (
                            <div
                              style={{
                                background: "#f0f8ff",
                                border: "1px solid #d1e9ff",
                                borderRadius: 8,
                                padding: "6px 12px",
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                              }}
                            >
                              <QuestionCircleOutlined
                                style={{ color: "#1890ff", fontSize: 12 }}
                              />
                              <Text
                                style={{
                                  fontSize: 12,
                                  color: "#1890ff",
                                  fontWeight: 500,
                                }}
                              >
                                {quiz.questions_count} Soal
                              </Text>
                            </div>
                          )}
                          {quiz.duration && (
                            <div
                              style={{
                                background: "#fff7e6",
                                border: "1px solid #ffd591",
                                borderRadius: 8,
                                padding: "6px 12px",
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                              }}
                            >
                              <ClockCircleOutlined
                                style={{ color: "#fa8c16", fontSize: 12 }}
                              />
                              <Text
                                style={{
                                  fontSize: 12,
                                  color: "#fa8c16",
                                  fontWeight: 500,
                                }}
                              >
                                {quiz.duration} Menit
                              </Text>
                            </div>
                          )}
                        </Space>
                      </div>

                      {/* Action Button */}
                      <Button
                        type={buttonAction.type}
                        icon={buttonAction.icon}
                        onClick={buttonAction.onClick}
                        disabled={timeRemaining === "EXPIRED"}
                        size="large"
                        style={{
                          width: "100%",
                          height: 48,
                          borderRadius: 10,
                          fontWeight: 600,
                          fontSize: 13,
                          background:
                            timeRemaining === "EXPIRED"
                              ? "#f5f5f5"
                              : buttonAction.style?.background || // Gunakan style custom jika ada
                                (buttonAction.type === "primary"
                                  ? "linear-gradient(135deg, #001529 0%, #3a3f5c 60%, #43cea2 100%)" // Sama dengan StudentLayout
                                  : undefined),
                          border:
                            timeRemaining === "EXPIRED"
                              ? "1px solid #d9d9d9"
                              : buttonAction.style?.borderColor || "none",
                          color:
                            timeRemaining === "EXPIRED"
                              ? "#999"
                              : buttonAction.style?.color || undefined,
                          boxShadow:
                            timeRemaining === "EXPIRED"
                              ? "none"
                              : buttonAction.style?.boxShadow ||
                                "0 4px 12px rgba(0, 21, 41, 0.2)",
                          textShadow:
                            buttonAction.style?.textShadow || undefined,
                          // Hover effects untuk gradient emas
                          transition: "all 0.3s ease",
                        }}
                        onMouseEnter={(e) => {
                          if (
                            buttonAction.style?.background &&
                            timeRemaining !== "EXPIRED"
                          ) {
                            e.currentTarget.style.transform =
                              "translateY(-2px)";
                            e.currentTarget.style.boxShadow =
                              "0 6px 16px rgba(255, 173, 20, 0.5)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (
                            buttonAction.style?.background &&
                            timeRemaining !== "EXPIRED"
                          ) {
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.boxShadow =
                              "0 4px 12px rgba(255, 173, 20, 0.4)";
                          }
                        }}
                      >
                        {timeRemaining === "EXPIRED"
                          ? "Waktu Habis"
                          : buttonAction.text}
                      </Button>
                    </div>
                  </Card>
                </List.Item>
              );
            }}
          />
        )}
      </Card>
    </div>
  );
};

export default StudentQuizList;
