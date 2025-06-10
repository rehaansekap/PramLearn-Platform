import React from "react";
import { Card, Typography, Button, Row, Col, Tag, Space, Empty } from "antd";
import {
  BookOutlined,
  PlayCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  QuestionCircleOutlined,
  TeamOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/id";

// Configure dayjs
dayjs.extend(relativeTime);
dayjs.locale("id");

const { Title, Text } = Typography;

const MaterialQuizList = ({ quizzes }) => {
  const getTimeRemaining = (endTime) => {
    if (!endTime) return null;
    const now = dayjs();
    const end = dayjs(endTime);

    if (now.isAfter(end)) return "Expired";

    const diffMs = end.diff(now);
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(
      (diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffDays > 7) {
      return `${diffDays} hari lagi`;
    } else if (diffDays > 0) {
      return `${diffDays} hari ${diffHours} jam lagi`;
    } else if (diffHours > 0) {
      return `${diffHours} jam ${diffMinutes} menit lagi`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes} menit lagi`;
    } else {
      return "Berakhir segera";
    }
  };

  const getTimeRemainingColor = (endTime) => {
    if (!endTime) return "default";
    const now = dayjs();
    const end = dayjs(endTime);

    if (now.isAfter(end)) return "red";

    const diffHours = end.diff(now, "hour");
    if (diffHours <= 1) return "red";
    if (diffHours <= 24) return "orange";
    if (diffHours <= 72) return "gold";

    return "green";
  };

  const getDueDateStatus = (endTime) => {
    if (!endTime) return { color: "default", text: "Tidak ada deadline" };

    const now = dayjs();
    const end = dayjs(endTime);

    if (now.isAfter(end)) return { color: "red", text: "Waktu Habis" };

    const diffHours = end.diff(now, "hour");
    if (diffHours <= 24) return { color: "orange", text: "Segera Berakhir" };
    if (diffHours <= 72) return { color: "gold", text: "Berakhir Segera" };

    return { color: "green", text: "Masih Ada Waktu" };
  };

  if (!quizzes || quizzes.length === 0) {
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
        {quizzes.map((quiz) => {
          const dueDateStatus = getDueDateStatus(quiz.end_time);
          const timeRemaining = getTimeRemaining(quiz.end_time);
          const timeColor = getTimeRemainingColor(quiz.end_time);
          const isExpired = timeRemaining === "Expired";

          return (
            <Col xs={24} sm={12} lg={8} key={quiz.id}>
              <Card
                hoverable
                style={{
                  borderRadius: 16,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  height: "100%",
                  transition: "all 0.3s ease",
                }}
                bodyStyle={{ padding: "20px" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow =
                    "0 8px 24px rgba(17, 65, 139, 0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
                }}
              >
                {/* Header dengan gradient */}
                <div
                  style={{
                    background:
                      "linear-gradient(135deg, #11418b 0%, #1890ff 100%)",
                    padding: "16px",
                    margin: "-20px -20px 16px -20px",
                    color: "white",
                    borderRadius: "16px 16px 0 0",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: -5,
                      right: -5,
                      width: 30,
                      height: 30,
                      borderRadius: "50%",
                      background: "rgba(255, 255, 255, 0.1)",
                    }}
                  />

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "start",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <BookOutlined style={{ fontSize: 24, marginBottom: 8 }} />
                      <Title
                        level={5}
                        style={{
                          color: "white",
                          margin: 0,
                          fontSize: 16,
                          fontWeight: 600,
                          marginBottom: 8,
                        }}
                      >
                        {quiz.title}
                      </Title>
                    </div>

                    {quiz.end_time && (
                      <Tag
                        color={dueDateStatus.color}
                        style={{
                          fontSize: 10,
                          padding: "2px 6px",
                          marginLeft: 8,
                        }}
                      >
                        {dueDateStatus.text}
                      </Tag>
                    )}
                  </div>

                  {/* Quiz Info */}
                  <Space size={12} style={{ marginTop: 8 }}>
                    {quiz.questions && (
                      <Space size={4}>
                        <QuestionCircleOutlined style={{ fontSize: 12 }} />
                        <Text
                          style={{
                            color: "rgba(255,255,255,0.9)",
                            fontSize: 12,
                          }}
                        >
                          {quiz.questions.length} soal
                        </Text>
                      </Space>
                    )}
                    {quiz.group_name && (
                      <Space size={4}>
                        <TeamOutlined style={{ fontSize: 12 }} />
                        <Text
                          style={{
                            color: "rgba(255,255,255,0.9)",
                            fontSize: 12,
                          }}
                        >
                          {quiz.group_name}
                        </Text>
                      </Space>
                    )}
                  </Space>
                </div>

                {/* Content */}
                <div style={{ marginBottom: 16 }}>
                  {quiz.content && (
                    <Text
                      type="secondary"
                      style={{
                        fontSize: 14,
                        lineHeight: 1.5,
                        display: "block",
                        marginBottom: 12,
                      }}
                    >
                      {quiz.content.length > 100
                        ? `${quiz.content.substring(0, 100)}...`
                        : quiz.content}
                    </Text>
                  )}

                  {/* SISA WAKTU INFO - CENTERED (Same as Assignment) */}
                  {quiz.end_time && (
                    <div
                      style={{
                        textAlign: "center",
                        background: "#f8f9fa",
                        padding: "12px",
                        borderRadius: 8,
                        marginBottom: 12,
                        border: `1px solid ${
                          timeColor === "red" ? "#ffccc7" : "#e8e8e8"
                        }`,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 8,
                        }}
                      >
                        <ClockCircleOutlined
                          style={{ color: "#666", fontSize: 14 }}
                        />
                        <Text
                          style={{
                            fontSize: 13,
                            fontWeight: 500,
                            color: "#333",
                          }}
                        >
                          Sisa Waktu
                        </Text>
                      </div>
                      <Text
                        style={{
                          fontSize: 14,
                          color:
                            timeColor === "red"
                              ? "#ff4d4f"
                              : timeColor === "orange"
                              ? "#fa8c16"
                              : "#52c41a",
                          fontWeight: 600,
                          display: "block",
                          marginTop: 4,
                        }}
                      >
                        {timeRemaining || "Tidak ada batas waktu"}
                      </Text>
                      {quiz.end_time && (
                        <Text
                          style={{
                            fontSize: 12,
                            color: "#666",
                            display: "block",
                            marginTop: 2,
                          }}
                        >
                          Berakhir:{" "}
                          {dayjs(quiz.end_time).format("DD MMM YYYY, HH:mm")}
                        </Text>
                      )}
                    </div>
                  )}

                  {/* Additional Info */}
                  <Space
                    direction="vertical"
                    size="small"
                    style={{ width: "100%" }}
                  >
                    {quiz.is_group_quiz && (
                      <Tag
                        color="blue"
                        style={{ fontSize: 11, padding: "2px 8px" }}
                      >
                        Quiz Kelompok
                      </Tag>
                    )}
                  </Space>
                </div>

                {/* Action Button */}
                <Button
                  type="primary"
                  block
                  icon={<PlayCircleOutlined />}
                  onClick={() =>
                    (window.location.href = `/student/quiz/${
                      quiz.slug || quiz.id
                    }`)
                  }
                  disabled={isExpired}
                  style={{
                    borderRadius: 8,
                    height: 40,
                    fontWeight: 600,
                    background: isExpired
                      ? "#d9d9d9"
                      : "linear-gradient(135deg, #11418b 0%, #1890ff 100%)",
                    border: "none",
                    fontSize: 14,
                  }}
                >
                  {isExpired ? "Waktu Habis" : "Mulai Quiz"}
                </Button>
              </Card>
            </Col>
          );
        })}
      </Row>
    </div>
  );
};

export default MaterialQuizList;
