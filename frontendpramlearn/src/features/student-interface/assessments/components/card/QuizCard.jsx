import React from "react";
import { Card, Tag, Space, Typography, List } from "antd";
import { TeamOutlined, FileTextOutlined } from "@ant-design/icons";
import { getSubjectName, getMaterialName } from "../../utils/quizUtils";
import QuizMetaInfo from "./QuizMetaInfo";
import QuizScoreDisplay from "./QuizScoreDisplay";
import TimeRemaining from "./TimeRemaining";
import QuizActionButton from "./QuizActionButton";

const { Title, Text } = Typography;

const QuizCard = ({ quiz, status, timeRemaining, timeColor, onStartQuiz }) => {
  const isMobile = window.innerWidth <= 768;
  const subjectName = getSubjectName(quiz);
  const materialName = getMaterialName(quiz);
  const isGroupQuiz = quiz.quiz_type === "group" || quiz.is_group_quiz;

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
          e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)";
        }}
      >
        {/* Status Badge */}
        <div
          style={{
            marginTop: isMobile ? 5 : 0,
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
            {isGroupQuiz ? (
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
                  Kuis Individual
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

            {materialName && (
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
            )}
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
          {status.status === "completed" && <QuizScoreDisplay quiz={quiz} />}

          {/* Time Remaining */}
          <TimeRemaining
            quiz={quiz}
            timeRemaining={timeRemaining}
            timeColor={timeColor}
          />

          {/* Quiz Meta Information */}
          <QuizMetaInfo quiz={quiz} subjectName={subjectName} />

          {/* Action Button */}
          <QuizActionButton
            quiz={quiz}
            status={status}
            timeRemaining={timeRemaining}
            onStartQuiz={onStartQuiz}
          />
        </div>
      </Card>
    </List.Item>
  );
};

export default QuizCard;
