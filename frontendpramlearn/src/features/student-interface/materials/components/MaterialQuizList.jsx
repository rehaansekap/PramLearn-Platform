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

const MaterialQuizList = ({ quizzes, material }) => {
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

              // PERBAIKAN: Gunakan data dari material parent
              subject_name: material?.subject_name || quiz.subject_name,
              subject_id: material?.subject || quiz.subject_id,
              material_name: material?.title || quiz.material_name,
              material_id: material?.id || quiz.material_id,
              material_slug: material?.slug || quiz.material_slug,

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

                enhancedQuiz = {
                  ...enhancedQuiz,
                  ...response.data,
                  // Pastikan subject dan material info tetap ada
                  subject_name:
                    enhancedQuiz.subject_name || response.data.subject_name,
                  material_name:
                    enhancedQuiz.material_name || response.data.material_name,
                  // Ensure these critical fields are properly set
                  is_completed: response.data.is_completed || false,
                  score: response.data.score || null,
                  completed_at: response.data.completed_at || null,
                  group: response.data.group,
                  time_remaining: response.data.time_remaining,
                  current_answers: response.data.current_answers || {},
                  questions_count:
                    response.data.questions?.length ||
                    response.data.questions_count ||
                    quiz.questions?.length ||
                    0,
                };

                console.log(`✅ Enhanced group quiz data:`, {
                  slug: quiz.slug,
                  subject_name: enhancedQuiz.subject_name,
                  material_name: enhancedQuiz.material_name,
                  is_completed: enhancedQuiz.is_completed,
                  score: enhancedQuiz.score,
                });
              } catch (error) {
                // ...existing error handling...
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
  }, [quizzes, material]); // Tambahkan material sebagai dependency

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

      {/* Quiz Cards - Updated to match StudentQuizList design */}
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
          const isMobile = window.innerWidth <= 768;

          // Quiz status logic - SAMA DENGAN StudentQuizList
          const getQuizStatus = () => {
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

          const status = getQuizStatus();

          // Button action - SAMA DENGAN StudentQuizList
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
                style: {
                  background:
                    "linear-gradient(135deg, #001529 0%, #3a3f5c 60%, #43cea2 100%)",
                },
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
                {/* Status Badge - POSISI SAMA DENGAN StudentQuizList */}
                <div
                  style={{
                    position: "absolute",
                    top: isMobile ? 8 : 12,
                    left: isMobile ? "50%" : "auto",
                    right: isMobile ? "auto" : 12,
                    transform: isMobile ? "translateX(-50%)" : "none",
                    zIndex: 3,
                  }}
                >
                  <Tag
                    icon={status.icon}
                    color={status.color}
                    style={{
                      fontWeight: 600,
                      fontSize: isMobile ? 10 : 11,
                      padding: isMobile ? "3px 4px" : "5px 8px",
                      borderRadius: 6,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    }}
                  >
                    {status.text}
                  </Tag>
                </div>

                {/* Header Section - SAMA DENGAN StudentQuizList */}
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
                      marginTop: isMobile ? 30 : 0,
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
                          Kelompok: {quiz.group?.name || "Group Quiz"}
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

                  {/* Subject & Material Info - TAMBAHKAN SEPERTI StudentQuizList */}
                  <div style={{ position: "relative", zIndex: 1 }}>
                    {(() => {
                      const subjectName =
                        quiz.subject_name ||
                        quiz.subject?.name ||
                        quiz.material?.subject?.name ||
                        quiz.material_subject_name ||
                        quiz.class_subject_name ||
                        quiz.course_name ||
                        quiz.course?.name ||
                        "Mata Pelajaran";

                      return (
                        <div style={{ marginTop: 8 }}>
                          <Text
                            style={{
                              color: "rgba(255, 255, 255, 0.8)",
                              fontSize: 12,
                            }}
                          >
                            Mata Pelajaran: {subjectName}
                          </Text>
                        </div>
                      );
                    })()}

                    {/* Material Name */}
                    {(() => {
                      const materialName =
                        quiz.material_name ||
                        quiz.material_title ||
                        quiz.material?.title ||
                        quiz.material?.name ||
                        quiz.chapter_name ||
                        quiz.lesson_name;

                      if (materialName) {
                        return (
                          <div style={{ marginTop: 4 }}>
                            <Text
                              style={{
                                color: "rgba(255, 255, 255, 0.7)",
                                fontSize: 11,
                              }}
                            >
                              Materi: {materialName}
                            </Text>
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </div>
                </div>

                {/* Content Section - SAMA DENGAN StudentQuizList */}
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

                  {/* Score Display for Completed Quiz - SAMA DENGAN StudentQuizList */}
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
                        percent={quiz.student_attempt?.score || quiz.score || 0}
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

                  {/* Time Remaining - SAMA DENGAN StudentQuizList */}
                  {quiz.end_time && (
                    <div
                      style={{
                        background:
                          timeRemaining === "EXPIRED"
                            ? "linear-gradient(135deg, #fff2f0 0%, #ffebe6 100%)"
                            : "linear-gradient(135deg, #f6ffed 0%, #e6fffb 100%)",
                        border: `1px solid ${
                          timeRemaining === "EXPIRED" ? "#ffccc7" : "#b7eb8f"
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
                            timeRemaining === "EXPIRED" ? "#ff4d4f" : timeColor,
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
                          {dayjs(quiz.end_time).format("DD MMM YYYY, HH:mm")}
                        </Text>
                      )}
                    </div>
                  )}

                  {/* Quiz Meta Information - SAMA DENGAN StudentQuizList */}
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
                      {/* TAMBAHKAN TAG MATA PELAJARAN - SAMA DENGAN StudentQuizList */}
                      {quiz.subject_name && (
                        <div
                          style={{
                            background: "#f6ffed",
                            border: "1px solid #b7eb8f",
                            borderRadius: 8,
                            padding: "6px 12px",
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          <BookOutlined
                            style={{ color: "#52c41a", fontSize: 12 }}
                          />
                          <Text
                            style={{
                              fontSize: 12,
                              color: "#52c41a",
                              fontWeight: 500,
                            }}
                          >
                            {quiz.subject_name}
                          </Text>
                        </div>
                      )}
                    </Space>
                  </div>

                  {/* Action Button - SAMA DENGAN StudentQuizList */}
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
                          : buttonAction.style?.background ||
                            (buttonAction.type === "primary"
                              ? "linear-gradient(135deg, #001529 0%, #3a3f5c 60%, #43cea2 100%)"
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
                      textShadow: buttonAction.style?.textShadow || undefined,
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      if (
                        buttonAction.style?.background &&
                        timeRemaining !== "EXPIRED"
                      ) {
                        e.currentTarget.style.transform = "translateY(-2px)";
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
            </Col>
          );
        })}
      </Row>
    </div>
  );
};

export default MaterialQuizList;
