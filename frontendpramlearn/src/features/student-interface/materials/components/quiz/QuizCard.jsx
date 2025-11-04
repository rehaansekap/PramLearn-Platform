import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, Typography, Button, Tag, Space, Progress } from "antd";
import {
  BookOutlined,
  FileTextOutlined,
  QuestionCircleOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { getQuizStatus, getButtonAction } from "../../utils/quizStatusUtils";

const { Title, Text } = Typography;

const QuizCard = ({ quiz, timeRemaining, timeColor }) => {
  const navigate = useNavigate();
  const status = getQuizStatus(quiz);
  const buttonAction = getButtonAction(quiz, status, navigate);
  const isExpired = timeRemaining === "EXPIRED";
  const isInactive = quiz.is_active === false;
  const isMobile = window.innerWidth <= 768;

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

        {/* Subject & Material Info */}
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
              background: "linear-gradient(135deg, #f6ffed 0%, #e6fffb 100%)",
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
                <TrophyOutlined style={{ color: "white", fontSize: 16 }} />
              </div>
              <div>
                <Text strong style={{ fontSize: 15, color: "#52c41a" }}>
                  Quiz Selesai
                </Text>
                <div
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    color: "#52c41a",
                  }}
                >
                  {(quiz.student_attempt?.score || quiz.score || 0).toFixed(1)}
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

        {/* Time Remaining */}
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
                    timeRemaining === "EXPIRED" ? "#ff4d4f" : "#52c41a",
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
                {timeRemaining === "EXPIRED" ? "Waktu Habis" : "Sisa Waktu"}
              </Text>
            </div>

            <div
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: timeRemaining === "EXPIRED" ? "#ff4d4f" : timeColor,
                marginBottom: 4,
              }}
            >
              {timeRemaining === "EXPIRED"
                ? "EXPIRED"
                : timeRemaining || "Unlimited"}
            </div>

            {quiz.end_time && (
              <Text style={{ fontSize: 12, color: "#999" }}>
                Deadline: {dayjs(quiz.end_time).format("DD MMM YYYY, HH:mm")}
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
                <BookOutlined style={{ color: "#52c41a", fontSize: 12 }} />
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

        {/* Action Button */}
        <Button
          type={buttonAction.type}
          icon={buttonAction.icon}
          onClick={buttonAction.onClick}
          disabled={isExpired || isInactive}
          size="large"
          style={{
            width: "100%",
            height: 48,
            borderRadius: 10,
            fontWeight: 600,
            fontSize: 13,
            background:
              isExpired || isInactive
                ? "#f5f5f5"
                : buttonAction.style?.background ||
                  (buttonAction.type === "primary"
                    ? "linear-gradient(135deg, #001529 0%, #3a3f5c 60%, #43cea2 100%)"
                    : undefined),
            border:
              isExpired || isInactive
                ? "1px solid #d9d9d9"
                : buttonAction.style?.borderColor || "none",
            color:
              isExpired || isInactive
                ? "#999"
                : buttonAction.style?.color || undefined,
            boxShadow:
              isExpired || isInactive
                ? "none"
                : buttonAction.style?.boxShadow ||
                  "0 4px 12px rgba(0, 21, 41, 0.2)",
            textShadow: buttonAction.style?.textShadow || undefined,
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            if (buttonAction.style?.background && !isExpired && !isInactive) {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow =
                "0 6px 16px rgba(255, 173, 20, 0.5)";
            }
          }}
          onMouseLeave={(e) => {
            if (buttonAction.style?.background && !isExpired && !isInactive) {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow =
                "0 4px 12px rgba(255, 173, 20, 0.4)";
            }
          }}
        >
          {isInactive
            ? "Tidak Aktif"
            : isExpired
            ? "Waktu Habis"
            : buttonAction.text}
        </Button>
      </div>
    </Card>
  );
};

export default QuizCard;
