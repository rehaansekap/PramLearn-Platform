import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, Typography, Tag, Button, Space, Progress } from "antd";
import {
  FileTextOutlined,
  ClockCircleOutlined,
  TrophyOutlined,
  BookOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import {
  getStatusIcon,
  getStatusColor,
  getButtonText,
  getAssignmentSlug,
} from "../../utils/assignmentUtils";

const { Title, Text } = Typography;

const AssignmentCard = ({ assignment, status, timeRemaining, isMobile }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    // Use the status prop that's already passed to the component
    if (status.status === "submitted" || status.status === "graded") {
      navigate(
        `/student/assignments/${assignment.slug || assignment.id}/results`
      );
    } else {
      navigate(`/student/assignments/${assignment.slug || assignment.id}`);
    }
  };

  return (
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
        e.currentTarget.style.boxShadow = "0 12px 32px rgba(17, 65, 139, 0.12)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)";
      }}
    >
      {/* Status Badge */}
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
          icon={getStatusIcon(status)}
          color={getStatusColor(status)}
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

        {/* Assignment Type Badge */}
        <div
          style={{
            marginTop: isMobile ? 30 : 0,
            marginBottom: 12,
            position: "relative",
            zIndex: 1,
          }}
        >
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
              Tugas
            </Tag>
          </Space>
        </div>

        {/* Assignment Title */}
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
          {assignment.title.length > 45
            ? `${assignment.title.substring(0, 45)}...`
            : assignment.title}
        </Title>

        {/* Subject Info */}
        {assignment.subject_name && (
          <div
            style={{
              marginTop: 8,
              position: "relative",
              zIndex: 1,
            }}
          >
            <Text
              style={{
                color: "rgba(255, 255, 255, 0.8)",
                fontSize: 12,
              }}
            >
              Mata Pelajaran: {assignment.subject_name}
            </Text>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div style={{ padding: "20px" }}>
        {/* Assignment Description */}
        {assignment.description && (
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
              {assignment.description.length > 120
                ? `${assignment.description.substring(0, 120)}...`
                : assignment.description}
            </Text>
          </div>
        )}

        {/* Grade Display untuk Graded Assignment */}
        {status.status === "graded" &&
          assignment.grade !== null &&
          assignment.grade !== undefined && (
            <div
              style={{
                background: "linear-gradient(135deg, #f6ffed 0%, #e6fffb 100%)",
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
                  <TrophyOutlined style={{ color: "white", fontSize: 16 }} />
                </div>
                <div>
                  <Text strong style={{ fontSize: 15, color: "#52c41a" }}>
                    Tugas Dinilai
                  </Text>
                  <div
                    style={{
                      fontSize: 20,
                      fontWeight: 700,
                      color: "#52c41a",
                    }}
                  >
                    {typeof assignment.grade === "number"
                      ? assignment.grade.toFixed(1)
                      : "0.0"}
                    /100
                  </div>
                </div>
              </div>
              <Progress
                percent={
                  typeof assignment.grade === "number" ? assignment.grade : 0
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

        {/* Due Date Countdown */}
        <div
          style={{
            background: timeRemaining.expired
              ? "linear-gradient(135deg, #fff2f0 0%, #ffebe6 100%)"
              : "linear-gradient(135deg, #f6ffed 0%, #e6fffb 100%)",
            border: `2px solid ${
              timeRemaining.expired ? "#ffccc7" : "#b7eb8f"
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
                background: timeRemaining.expired ? "#ff4d4f" : "#52c41a",
                borderRadius: "50%",
                width: 24,
                height: 24,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ClockCircleOutlined style={{ color: "white", fontSize: 12 }} />
            </div>
            <Text
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "#666",
              }}
            >
              {timeRemaining.expired ? "Terlambat" : "Batas Waktu"}
            </Text>
          </div>

          <div
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: timeRemaining.color,
              marginBottom: 4,
            }}
          >
            {timeRemaining.text}
          </div>

          <Text style={{ fontSize: 12, color: "#999" }}>
            Batas: {dayjs(assignment.due_date).format("DD MMM YYYY, HH:mm")}
          </Text>
        </div>

        {/* Assignment Meta Information */}
        <div style={{ marginBottom: 16 }}>
          <Space wrap size={8}>
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
              <FileTextOutlined style={{ color: "#1890ff", fontSize: 12 }} />
              <Text
                style={{
                  fontSize: 12,
                  color: "#1890ff",
                  fontWeight: 500,
                }}
              >
                {assignment.questions?.length || 0} Soal
              </Text>
            </div>
            {assignment.subject_name && (
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
                <BookOutlined style={{ color: "#fa8c16", fontSize: 12 }} />
                <Text
                  style={{
                    fontSize: 12,
                    color: "#fa8c16",
                    fontWeight: 500,
                  }}
                >
                  {assignment.subject_name}
                </Text>
              </div>
            )}
          </Space>
        </div>

        {/* Action Button */}
        <Button
          type="primary"
          icon={getStatusIcon(status)}
          onClick={handleCardClick}
          disabled={
            assignment.is_active === false ||
            (status.status === "overdue" &&
              !assignment.allow_late_submission) ||
            status.status === "expired"
          }
          size="large"
          style={{
            width: "100%",
            height: 48,
            borderRadius: 10,
            fontWeight: 600,
            fontSize: 13,
            background:
              status.status === "graded"
                ? "linear-gradient(135deg, #ffec3d 0%, #faad14 50%, #ff8c00 100%)"
                : "linear-gradient(135deg, #001529 0%, #3a3f5c 60%, #43cea2 100%)",
            border: "none",
            boxShadow:
              status.status === "graded"
                ? "0 4px 12px rgba(255, 173, 20, 0.4)"
                : "0 4px 12px rgba(0, 21, 41, 0.2)",
            transition: "all 0.3s ease",
            opacity:
              assignment.is_active === false ||
              (status.status === "overdue" &&
                !assignment.allow_late_submission) ||
              status.status === "expired"
                ? 0.6
                : 1,
            cursor:
              assignment.is_active === false ||
              (status.status === "overdue" &&
                !assignment.allow_late_submission) ||
              status.status === "expired"
                ? "not-allowed"
                : "pointer",
            color:
              assignment.is_active === false ||
              (status.status === "overdue" &&
                !assignment.allow_late_submission) ||
              status.status === "expired"
                ? "#999"
                : "#fff",
          }}
          onMouseEnter={(e) => {
            if (
              assignment.is_active === false ||
              (status.status === "overdue" &&
                !assignment.allow_late_submission) ||
              status.status === "expired"
            )
              return;
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow =
              status.status === "graded"
                ? "0 6px 16px rgba(255, 173, 20, 0.5)"
                : "0 6px 16px rgba(0, 21, 41, 0.3)";
          }}
          onMouseLeave={(e) => {
            if (
              assignment.is_active === false ||
              (status.status === "overdue" &&
                !assignment.allow_late_submission) ||
              status.status === "expired"
            )
              return;
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow =
              status.status === "graded"
                ? "0 4px 12px rgba(255, 173, 20, 0.4)"
                : "0 4px 12px rgba(0, 21, 41, 0.2)";
          }}
        >
          {getButtonText(status, assignment)}
        </Button>

        {/* Submission timestamp */}
        {assignment.submitted_at && (
          <Text
            type="secondary"
            style={{
              display: "block",
              textAlign: "center",
              marginTop: 8,
              fontSize: 12,
            }}
          >
            Dikirim:{" "}
            {dayjs(assignment.submitted_at).format("DD MMM YYYY, HH:mm")}
          </Text>
        )}
      </div>
    </Card>
  );
};

export default AssignmentCard;
