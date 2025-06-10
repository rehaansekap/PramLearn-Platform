import React from "react";
import { Card, Typography, Button, Row, Col, Tag, Space, Empty } from "antd";
import {
  FileTextOutlined,
  EditOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  QuestionCircleOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Title, Text } = Typography;

const MaterialAssignmentList = ({ assignments }) => {
  const getDaysUntilDue = (dueDate) => {
    if (!dueDate) return null;
    const now = dayjs();
    const due = dayjs(dueDate);
    const diffTime = due.diff(now);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getDueDateStatus = (dueDate) => {
    if (!dueDate) return { color: "default", text: "Tidak ada deadline" };

    const now = dayjs();
    const due = dayjs(dueDate);

    if (now.isAfter(due)) return { color: "red", text: "Terlambat" };

    const diffHours = due.diff(now, "hour");
    if (diffHours <= 24) return { color: "orange", text: "Hari ini" };
    if (diffHours <= 72) return { color: "gold", text: "Segera" };

    const days = Math.ceil(diffHours / 24);
    return { color: "green", text: `${days} hari lagi` };
  };

  const getTimeRemaining = (dueDate) => {
    if (!dueDate) return null;
    const now = dayjs();
    const due = dayjs(dueDate);
    if (now.isAfter(due)) return "Expired";
    return due.fromNow();
  };

  if (!assignments || assignments.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "60px 24px" }}>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <div>
              <Text style={{ fontSize: 16, color: "#666" }}>
                Tidak ada assignment untuk materi ini
              </Text>
              <div style={{ marginTop: 12 }}>
                <Text type="secondary" style={{ fontSize: 14 }}>
                  Assignment akan tersedia setelah ditambahkan oleh guru
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
        <FileTextOutlined
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
          Assignment Tersedia
        </Title>
        <Text type="secondary" style={{ fontSize: "14px", color: "#666" }}>
          Kerjakan assignment untuk mengasah kemampuan Anda
        </Text>
      </div>

      {/* Assignment Cards */}
      <Row gutter={[16, 16]}>
        {assignments.map((assignment) => {
          const dueDateStatus = getDueDateStatus(assignment.due_date);
          const timeRemaining = getTimeRemaining(assignment.due_date);

          return (
            <Col xs={24} sm={12} lg={8} key={assignment.id}>
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
                      "linear-gradient(135deg, #52c41a 0%, #73d13d 100%)",
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
                      <FileTextOutlined
                        style={{ fontSize: 24, marginBottom: 8 }}
                      />
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
                        {assignment.title}
                      </Title>
                      {assignment.due_date && (
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
                  </div>

                  {/* Assignment Info */}
                  <Space size={12} style={{ marginTop: 8 }}>
                    {assignment.questions && (
                      <Space size={4}>
                        <QuestionCircleOutlined style={{ fontSize: 12 }} />
                        <Text
                          style={{
                            color: "rgba(255,255,255,0.9)",
                            fontSize: 12,
                          }}
                        >
                          {assignment.questions.length} pertanyaan
                        </Text>
                      </Space>
                    )}
                    {assignment.group_name && (
                      <Space size={4}>
                        <TeamOutlined style={{ fontSize: 12 }} />
                        <Text
                          style={{
                            color: "rgba(255,255,255,0.9)",
                            fontSize: 12,
                          }}
                        >
                          {assignment.group_name}
                        </Text>
                      </Space>
                    )}
                  </Space>
                </div>

                {/* Content */}
                <div style={{ marginBottom: 16 }}>
                  {assignment.description && (
                    <Text
                      type="secondary"
                      style={{
                        fontSize: 14,
                        lineHeight: 1.5,
                        display: "block",
                        marginBottom: 12,
                      }}
                    >
                      {assignment.description.length > 120
                        ? `${assignment.description.substring(0, 120)}...`
                        : assignment.description}
                    </Text>
                  )}

                  {/* Deadline Info - CENTERED */}
                  {assignment.due_date && (
                    <div
                      style={{
                        textAlign: "center",
                        background: "#f8f9fa",
                        padding: "12px",
                        borderRadius: 8,
                        marginBottom: 12,
                        border: `1px solid ${
                          dueDateStatus.color === "red" ? "#ffccc7" : "#e8e8e8"
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
                        <CalendarOutlined
                          style={{ color: "#666", fontSize: 14 }}
                        />
                        <Text
                          style={{
                            fontSize: 13,
                            fontWeight: 500,
                            color: "#333",
                          }}
                        >
                          Deadline
                        </Text>
                      </div>
                      <Text
                        style={{
                          fontSize: 14,
                          color:
                            dueDateStatus.color === "red" ? "#ff4d4f" : "#333",
                          fontWeight: 600,
                          display: "block",
                          marginTop: 4,
                        }}
                      >
                        {dayjs(assignment.due_date).format(
                          "DD MMM YYYY, HH:mm"
                        )}
                      </Text>
                      {timeRemaining && timeRemaining !== "Expired" && (
                        <Text
                          style={{
                            fontSize: 12,
                            color: "#666",
                            display: "block",
                            marginTop: 2,
                          }}
                        >
                          {timeRemaining}
                        </Text>
                      )}
                    </div>
                  )}
                </div>

                {/* Action Button */}
                <Button
                  type="primary"
                  block
                  icon={<EditOutlined />}
                  onClick={() =>
                    (window.location.href = `/student/assignments/${
                      assignment.slug || assignment.id
                    }`)
                  }
                  disabled={timeRemaining === "Expired"}
                  style={{
                    borderRadius: 8,
                    height: 40,
                    fontWeight: 600,
                    background:
                      timeRemaining === "Expired"
                        ? "#d9d9d9"
                        : "linear-gradient(135deg, #52c41a 0%, #73d13d 100%)",
                    border: "none",
                    fontSize: 14,
                  }}
                >
                  {timeRemaining === "Expired"
                    ? "Waktu Habis"
                    : "Kerjakan Assignment"}
                </Button>
              </Card>
            </Col>
          );
        })}
      </Row>
    </div>
  );
};

export default MaterialAssignmentList;
