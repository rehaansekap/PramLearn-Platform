import React, { useState, useEffect } from "react";
import {
  Card,
  Typography,
  Button,
  Row,
  Col,
  Tag,
  Space,
  Empty,
  Progress,
  Spin,
} from "antd";
import {
  BookOutlined,
  PlayCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  QuestionCircleOutlined,
  TeamOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import duration from "dayjs/plugin/duration";
import "dayjs/locale/id";
import api from "../../../../api";

// Configure dayjs
dayjs.extend(relativeTime);
dayjs.extend(duration);
dayjs.locale("id");

const { Title, Text } = Typography;

const MaterialQuizList = ({ quizzes }) => {
  const [currentTime, setCurrentTime] = useState(dayjs());
  const [enrichedQuizzes, setEnrichedQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Real-time timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(dayjs());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Enhance quiz data with group quiz information
  useEffect(() => {
    const enhanceQuizData = async () => {
      if (!quizzes || quizzes.length === 0) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const enhancedQuizzes = await Promise.all(
          quizzes.map(async (quiz) => {
            let enhancedQuiz = {
              ...quiz,
              questions_count: quiz.questions?.length || 0,
              duration: quiz.duration || null,
              end_time: quiz.end_time,
              // Default status untuk individual quiz
              is_completed: false,
              score: null,
              student_attempt: null,
            };

            // Jika ini group quiz, fetch detail dari backend
            if (quiz.is_group_quiz) {
              try {
                console.log(`🔍 Fetching group quiz data for: ${quiz.slug}`);
                const response = await api.get(
                  `/student/group-quiz/${quiz.slug}/`
                );

                // Merge data dari API group quiz
                enhancedQuiz = {
                  ...enhancedQuiz,
                  ...response.data,
                  group: response.data.group,
                  is_completed: response.data.is_completed,
                  time_remaining: response.data.time_remaining,
                  current_answers: response.data.current_answers,
                  // Override questions_count jika ada dari API
                  questions_count:
                    response.data.questions?.length ||
                    quiz.questions?.length ||
                    0,
                };

                console.log(`✅ Enhanced group quiz data:`, enhancedQuiz);
              } catch (error) {
                if (
                  error.response?.status === 404 ||
                  error.response?.status === 403
                ) {
                  console.log(
                    `⚠️ Group quiz ${quiz.slug} not assigned to user or not found`
                  );
                  // Keep original quiz data but mark as not available
                  enhancedQuiz.not_available = true;
                  enhancedQuiz.not_available_reason =
                    error.response?.status === 403
                      ? "Tidak terdaftar dalam kelompok"
                      : "Quiz tidak ditemukan";
                } else {
                  console.error(
                    `❌ Error fetching group quiz ${quiz.slug}:`,
                    error
                  );
                }
              }
            } else {
              // Untuk individual quiz, coba fetch status dari API
              try {
                // Asumsi ada endpoint untuk individual quiz status
                // Jika tidak ada, gunakan data default
                console.log(`📝 Individual quiz: ${quiz.slug}`);
              } catch (error) {
                console.log(
                  `⚠️ Could not fetch individual quiz status for ${quiz.slug}`
                );
              }
            }

            return enhancedQuiz;
          })
        );

        setEnrichedQuizzes(enhancedQuizzes);
        console.log("🎯 All quizzes enhanced:", enhancedQuizzes);
      } catch (error) {
        console.error("❌ Error enhancing quiz data:", error);
      } finally {
        setLoading(false);
      }
    };

    enhanceQuizData();
  }, [quizzes]);

  const getTimeRemaining = (endTime) => {
    if (!endTime) return null;

    const end = dayjs(endTime);
    if (currentTime.isAfter(end)) return "EXPIRED";

    const diff = end.diff(currentTime);
    const duration = dayjs.duration(diff);

    const hours = Math.floor(duration.asHours());
    const minutes = duration.minutes();
    const seconds = duration.seconds();

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const getTimeRemainingColor = (endTime) => {
    if (!endTime) return "#52c41a";
    const now = dayjs();
    const end = dayjs(endTime);

    if (now.isAfter(end)) return "#ff4d4f";

    const diffMinutes = end.diff(now, "minute");
    if (diffMinutes <= 30) return "#ff4d4f"; // Red
    if (diffMinutes <= 60) return "#fa8c16"; // Orange
    if (diffMinutes <= 180) return "#faad14"; // Yellow
    return "#52c41a"; // Green
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "60px 24px" }}>
        <Spin size="large" tip="Memuat quiz..." />
      </div>
    );
  }

  if (!enrichedQuizzes || enrichedQuizzes.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "60px 24px" }}>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <div>
              <Text style={{ fontSize: 16, color: "#666" }}>
                Tidak ada quiz untuk materi ini
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
    );
  }

  return (
    <div>
      {/* Header Section */}
      <div style={{ marginBottom: 24, textAlign: "center" }}>
        <BookOutlined
          style={{
            fontSize: 32,
            color: "#11418b",
            marginBottom: 12,
          }}
        />
        <Title
          level={4}
          style={{
            margin: 0,
            marginBottom: 8,
            color: "#11418b",
            fontSize: "20px",
            fontWeight: 700,
          }}
        >
          Quiz Tersedia
        </Title>
        <Text type="secondary" style={{ fontSize: "14px", color: "#666" }}>
          Kerjakan quiz untuk menguji pemahaman Anda
        </Text>
      </div>

      {/* Quiz Cards */}
      <Row gutter={[16, 16]}>
        {enrichedQuizzes.map((quiz) => {
          // Skip quiz yang tidak tersedia untuk user
          if (quiz.not_available) {
            return (
              <Col xs={24} sm={24} md={12} lg={12} xl={12} key={quiz.id}>
                <Card
                  style={{
                    borderRadius: 16,
                    overflow: "hidden",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                    border: "1px solid #f0f0f0",
                    height: "100%",
                    opacity: 0.6,
                  }}
                  bodyStyle={{ padding: "20px" }}
                >
                  <div style={{ textAlign: "center", padding: "40px 20px" }}>
                    <FileTextOutlined
                      style={{
                        fontSize: 48,
                        color: "#d9d9d9",
                        marginBottom: 16,
                      }}
                    />
                    <Title level={5} style={{ color: "#999", marginBottom: 8 }}>
                      {quiz.title}
                    </Title>
                    <Text type="secondary">{quiz.not_available_reason}</Text>
                    {quiz.is_group_quiz && (
                      <div style={{ marginTop: 12 }}>
                        <Tag icon={<TeamOutlined />} color="orange">
                          Group Quiz
                        </Tag>
                      </div>
                    )}
                  </div>
                </Card>
              </Col>
            );
          }

          const timeRemaining = getTimeRemaining(quiz.end_time);
          const timeColor = getTimeRemainingColor(quiz.end_time);
          const isExpired = timeRemaining === "EXPIRED";

          // Quiz status logic
          const getQuizStatus = () => {
            if (quiz.is_completed || quiz.student_attempt?.submitted_at) {
              return {
                status: "completed",
                color: "success",
                text: "Selesai",
                icon: <CheckCircleOutlined />,
              };
            }
            if (
              quiz.student_attempt?.start_time ||
              (quiz.current_answers &&
                Object.keys(quiz.current_answers).length > 0)
            ) {
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

          const status = getQuizStatus();

          // Button action
          const getButtonAction = () => {
            if (status.status === "completed") {
              return {
                text: "Lihat Hasil",
                type: "default",
                icon: <TrophyOutlined />,
                onClick: () =>
                  (window.location.href = quiz.is_group_quiz
                    ? `/student/group-quiz/${quiz.slug}/results`
                    : `/student/quiz/${quiz.slug}/results`),
                style: {
                  background:
                    "linear-gradient(135deg, #ffec3d 0%, #faad14 50%, #ff8c00 100%)",
                  borderColor: "transparent",
                  color: "#fff",
                  fontWeight: 600,
                  boxShadow: "0 4px 12px rgba(255, 173, 20, 0.4)",
                  textShadow: "0 1px 2px rgba(0,0,0,0.2)",
                },
              };
            }

            if (status.status === "in_progress") {
              return {
                text: "Lanjutkan Quiz",
                type: "primary",
                icon: <PlayCircleOutlined />,
                onClick: () =>
                  (window.location.href = quiz.is_group_quiz
                    ? `/student/group-quiz/${quiz.slug}`
                    : `/student/quiz/${quiz.slug}`),
              };
            }

            return {
              text: "Mulai Quiz",
              type: "primary",
              icon: <PlayCircleOutlined />,
              onClick: () =>
                (window.location.href = quiz.is_group_quiz
                  ? `/student/group-quiz/${quiz.slug}`
                  : `/student/quiz/${quiz.slug}`),
            };
          };

          const buttonAction = getButtonAction();

          return (
            <Col xs={24} sm={24} md={12} lg={12} xl={12} key={quiz.id}>
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
                      "linear-gradient(135deg, #001529 0%, #3a3f5c 60%, #43cea2 100%)",
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
                    <Space size={8}>
                      {quiz.is_group_quiz ? (
                        <>
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
                            Group Quiz
                          </Tag>
                        </>
                      ) : (
                        <>
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
                        </>
                      )}
                    </Space>
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

                  {/* Group Info untuk Group Quiz */}
                  {quiz.is_group_quiz && quiz.group && (
                    <div
                      style={{ marginTop: 8, position: "relative", zIndex: 1 }}
                    >
                      <Text
                        style={{
                          color: "rgba(255, 255, 255, 0.8)",
                          fontSize: 12,
                        }}
                      >
                        Kelompok: {quiz.group.name}
                      </Text>
                    </div>
                  )}
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

                  {/* Score Display untuk Completed Quiz */}
                  {status.status === "completed" && quiz.score !== null && (
                    <div
                      style={{
                        background:
                          "linear-gradient(135deg, #f6ffed 0%, #e6fffb 100%)",
                        border: "2px solid #b7eb8f",
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
                            {quiz.score.toFixed(1)}/100
                          </div>
                        </div>
                      </div>
                      <Progress
                        percent={quiz.score}
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

                  {/* Time Remaining Box */}
                  {quiz.end_time && (
                    <div
                      style={{
                        background: isExpired
                          ? "linear-gradient(135deg, #fff2f0 0%, #ffebe6 100%)"
                          : "linear-gradient(135deg, #f6ffed 0%, #e6fffb 100%)",
                        border: `2px solid ${
                          isExpired ? "#ffccc7" : "#b7eb8f"
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
                            background: isExpired ? "#ff4d4f" : "#52c41a",
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
                          {isExpired ? "Waktu Habis" : "Sisa Waktu"}
                        </Text>
                      </div>

                      <div
                        style={{
                          fontSize: 18,
                          fontWeight: 700,
                          color: isExpired ? "#ff4d4f" : timeColor,
                          marginBottom: 4,
                        }}
                      >
                        {isExpired ? "EXPIRED" : timeRemaining || "Unlimited"}
                      </div>

                      {quiz.end_time && (
                        <Text style={{ fontSize: 12, color: "#999" }}>
                          Deadline:{" "}
                          {dayjs(quiz.end_time).format("DD MMM YYYY, HH:mm")}
                        </Text>
                      )}
                    </div>
                  )}

                  {/* Quiz Meta Information */}
                  <div style={{ marginBottom: 16 }}>
                    <Space wrap size={8}>
                      {quiz.questions_count > 0 && (
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
                    disabled={isExpired}
                    size="large"
                    style={{
                      width: "100%",
                      height: 48,
                      borderRadius: 10,
                      fontWeight: 600,
                      fontSize: 13,
                      background: isExpired
                        ? "#f5f5f5"
                        : buttonAction.style?.background ||
                          (buttonAction.type === "primary"
                            ? "linear-gradient(135deg, #001529 0%, #3a3f5c 60%, #43cea2 100%)"
                            : undefined),
                      border: isExpired
                        ? "1px solid #d9d9d9"
                        : buttonAction.style?.borderColor || "none",
                      color: isExpired
                        ? "#999"
                        : buttonAction.style?.color || undefined,
                      boxShadow: isExpired
                        ? "none"
                        : buttonAction.style?.boxShadow ||
                          "0 4px 12px rgba(0, 21, 41, 0.2)",
                      textShadow: buttonAction.style?.textShadow || undefined,
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      if (buttonAction.style?.background && !isExpired) {
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow =
                          "0 6px 16px rgba(255, 173, 20, 0.5)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (buttonAction.style?.background && !isExpired) {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow =
                          "0 4px 12px rgba(255, 173, 20, 0.4)";
                      }
                    }}
                  >
                    {isExpired ? "Waktu Habis" : buttonAction.text}
                  </Button>
                </div>
              </Card>
            </Col>
          );
        })}
      </Row>
    </div>
  );
};

export default MaterialQuizList;
