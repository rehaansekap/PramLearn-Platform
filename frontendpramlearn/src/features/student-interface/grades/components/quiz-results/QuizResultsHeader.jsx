import React from "react";
import { Card, Row, Col, Typography, Space, Tag } from "antd";
import { TeamOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const QuizResultsHeader = ({
  quiz,
  attempt,
  quizTitle,
  isGroupQuiz,
  groupData,
}) => {
  return (
    <Card
      style={{
        marginBottom: 24,
        marginTop: 16,
        borderRadius: 16,
        background: isGroupQuiz
          ? "linear-gradient(135deg, #001529 0%, #3a3f5c 60%, #43cea2 100%)"
          : "linear-gradient(135deg, #001529 0%, #3a3f5c 60%, #43cea2 100%)",
        border: "none",
        boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
      }}
    >
      <div style={{ color: "white", position: "relative", overflow: "hidden" }}>
        {/* Decorative Elements */}
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

        <Row
          gutter={[24, 16]}
          align="middle"
          style={{ position: "relative", zIndex: 1 }}
        >
          <Col xs={24} md={16}>
            <Space direction="vertical" size="small">
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    background: "rgba(255, 255, 255, 0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 20,
                  }}
                >
                  {isGroupQuiz ? "🏆" : "📝"}
                </div>
                <Title level={4} style={{ color: "white", margin: 0 }}>
                  {isGroupQuiz ? "Hasil Quiz Kelompok" : "Hasil Quiz"}
                </Title>
              </div>

              <Text
                style={{
                  color: "rgba(255,255,255,0.9)",
                  fontSize: 15,
                  lineHeight: 1.4,
                }}
              >
                Quiz "{quiz?.title || quizTitle}" telah diselesaikan
                {isGroupQuiz ? " oleh tim" : ""}
              </Text>

              <div style={{ marginTop: 12 }}>
                <Space wrap size={[8, 8]}>
                  <Tag
                    color={
                      attempt?.score >= 85
                        ? "success"
                        : attempt?.score >= 70
                        ? "warning"
                        : "error"
                    }
                    style={{
                      fontWeight: "bold",
                      fontSize: 12,
                      padding: "4px 12px",
                      borderRadius: 16,
                      border: "none",
                    }}
                  >
                    {attempt?.score >= 85
                      ? "🌟 Sangat Baik"
                      : attempt?.score >= 70
                      ? "👍 Baik"
                      : "📚 Perlu Perbaikan"}
                  </Tag>
                  {isGroupQuiz && groupData && (
                    <Tag
                      style={{
                        background: "rgba(255, 255, 255, 0.2)",
                        color: "white",
                        border: "1px solid rgba(255, 255, 255, 0.3)",
                        fontWeight: "bold",
                        fontSize: 12,
                        padding: "4px 12px",
                        borderRadius: 16,
                      }}
                    >
                      <TeamOutlined style={{ marginRight: 4 }} />
                      {groupData.name}
                    </Tag>
                  )}
                  <Tag
                    style={{
                      background: "rgba(255, 255, 255, 0.15)",
                      color: "white",
                      border: "1px solid rgba(255, 255, 255, 0.25)",
                      fontWeight: 500,
                      fontSize: 11,
                      padding: "2px 8px",
                      borderRadius: 12,
                    }}
                  >
                    {quiz?.subject_name || "Mata Pelajaran"}
                  </Tag>
                </Space>
              </div>
            </Space>
          </Col>

          <Col xs={24} md={8}>
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  background: "rgba(255, 255, 255, 0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 12px",
                  border: "3px solid rgba(255, 255, 255, 0.3)",
                }}
              >
                <div
                  style={{
                    fontSize: 24,
                    fontWeight: "bold",
                    textShadow: "0 2px 4px rgba(0,0,0,0.3)",
                  }}
                >
                  {attempt?.score?.toFixed(0) || "0"}
                </div>
              </div>
              <div
                style={{
                  fontSize: 14,
                  opacity: 0.9,
                  textShadow: "0 1px 2px rgba(0,0,0,0.3)",
                  fontWeight: 500,
                }}
              >
                dari 100 poin
              </div>
            </div>
          </Col>
        </Row>
      </div>
    </Card>
  );
};

export default QuizResultsHeader;
