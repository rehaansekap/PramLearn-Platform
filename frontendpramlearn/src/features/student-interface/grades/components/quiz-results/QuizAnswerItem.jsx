import React from "react";
import { Card, Row, Col, Typography, Space, Tag, Alert } from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  QuestionCircleOutlined,
  UserOutlined,
} from "@ant-design/icons";

const { Text, Paragraph } = Typography;

const QuizAnswerItem = ({ question, index, isGroupQuiz }) => {
  const isCorrect = question.is_correct;
  const userAnswer = question.user_answer;
  const correctAnswer = question.correct_answer;
  const answeredBy = question.answered_by_name || "Tim";

  return (
    <Card
      style={{
        marginBottom: 20,
        borderRadius: 16,
        border: `2px solid ${isCorrect ? "#52c41a" : "#ff4d4f"}`,
        boxShadow: isCorrect
          ? "0 4px 12px rgba(82, 196, 26, 0.15)"
          : "0 4px 12px rgba(255, 77, 79, 0.15)",
        background: isCorrect ? "#fafffe" : "#fffafa",
        transition: "all 0.3s ease",
      }}
      bodyStyle={{ padding: "20px" }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = isCorrect
          ? "0 8px 24px rgba(82, 196, 26, 0.2)"
          : "0 8px 24px rgba(255, 77, 79, 0.2)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = isCorrect
          ? "0 4px 12px rgba(82, 196, 26, 0.15)"
          : "0 4px 12px rgba(255, 77, 79, 0.15)";
      }}
    >
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <div style={{ flex: 1 }}>
              <Space style={{ marginBottom: 12 }} wrap>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: isCorrect ? "#52c41a" : "#ff4d4f",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontSize: 14,
                    fontWeight: "bold",
                  }}
                >
                  {index + 1}
                </div>
                <Tag
                  color={isCorrect ? "success" : "error"}
                  style={{
                    fontWeight: "bold",
                    fontSize: 12,
                    padding: "4px 12px",
                    borderRadius: 16,
                  }}
                >
                  {isCorrect ? "✅ Benar" : "❌ Salah"}
                </Tag>
                {question.points && (
                  <Tag
                    color="blue"
                    style={{
                      fontWeight: "bold",
                      fontSize: 12,
                      padding: "4px 8px",
                    }}
                  >
                    {question.points} poin
                  </Tag>
                )}
                {isGroupQuiz && (
                  <Tag
                    color="purple"
                    icon={<UserOutlined />}
                    style={{
                      fontWeight: "bold",
                      fontSize: 11,
                      padding: "4px 8px",
                    }}
                  >
                    {answeredBy}
                  </Tag>
                )}
              </Space>

              <div
                style={{
                  background: "#f8f9fa",
                  padding: "16px",
                  borderRadius: 12,
                  border: "1px solid #e9ecef",
                  marginBottom: 16,
                }}
              >
                <Text strong style={{ color: "#2c3e50", fontSize: 14 }}>
                  📝 Pertanyaan:
                </Text>
                <Paragraph
                  style={{ marginTop: 8, marginBottom: 0, fontSize: 14 }}
                >
                  {question.question_text}
                </Paragraph>
              </div>

              {/* Question Image if exists */}
              {question.question_image && (
                <div style={{ marginBottom: 16, textAlign: "center" }}>
                  <img
                    src={question.question_image}
                    alt="Soal"
                    style={{
                      maxWidth: "100%",
                      height: "auto",
                      borderRadius: 8,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    }}
                  />
                </div>
              )}
            </div>

            <div
              style={{
                fontSize: 32,
                color: isCorrect ? "#52c41a" : "#ff4d4f",
                marginLeft: 16,
              }}
            >
              {isCorrect ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
            </div>
          </div>
        </Col>

        <Col span={24}>
          <Row gutter={[16, 12]}>
            {/* Team/User Answer */}
            <Col xs={24} md={isCorrect ? 24 : 12}>
              <Card
                size="small"
                style={{
                  background: isCorrect
                    ? "linear-gradient(135deg, #f6ffed 0%, #f0f9f0 100%)"
                    : "linear-gradient(135deg, #fff2f0 0%, #fef1f0 100%)",
                  border: `1px solid ${isCorrect ? "#b7eb8f" : "#ffccc7"}`,
                  borderRadius: 8,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 8,
                  }}
                >
                  <div
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      background: isCorrect ? "#52c41a" : "#ff4d4f",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 10,
                      color: "white",
                    }}
                  >
                    {isGroupQuiz ? "👥" : "👤"}
                  </div>
                  <Text
                    strong
                    style={{
                      color: isCorrect ? "#52c41a" : "#ff4d4f",
                      fontSize: 13,
                    }}
                  >
                    {isGroupQuiz ? "Jawaban Tim:" : "Jawaban Anda:"}
                  </Text>
                </div>
                <div style={{ marginLeft: 28 }}>
                  {userAnswer ? (
                    <Text style={{ fontSize: 13, lineHeight: 1.4 }}>
                      {userAnswer}
                    </Text>
                  ) : (
                    <Text type="secondary" italic style={{ fontSize: 13 }}>
                      Tidak dijawab
                    </Text>
                  )}
                </div>
              </Card>
            </Col>

            {/* Correct Answer */}
            {!isCorrect && (
              <Col xs={24} md={12}>
                <Card
                  size="small"
                  style={{
                    background:
                      "linear-gradient(135deg, #f6ffed 0%, #f0f9f0 100%)",
                    border: "1px solid #b7eb8f",
                    borderRadius: 8,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 8,
                    }}
                  >
                    <div
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        background: "#52c41a",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 10,
                        color: "white",
                      }}
                    >
                      ✓
                    </div>
                    <Text strong style={{ color: "#52c41a", fontSize: 13 }}>
                      Jawaban Benar:
                    </Text>
                  </div>
                  <div style={{ marginLeft: 28 }}>
                    <Text style={{ fontSize: 13, lineHeight: 1.4 }}>
                      {correctAnswer}
                    </Text>
                  </div>
                </Card>
              </Col>
            )}
          </Row>
        </Col>

        {/* Explanation */}
        {question.explanation && (
          <Col span={24}>
            <Alert
              message="💡 Penjelasan"
              description={question.explanation}
              type="info"
              showIcon
              icon={<QuestionCircleOutlined />}
              style={{
                borderRadius: 8,
                border: "1px solid #91d5ff",
                background: "#f6faff",
              }}
            />
          </Col>
        )}
      </Row>
    </Card>
  );
};

export default QuizAnswerItem;
