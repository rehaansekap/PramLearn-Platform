import React from "react";
import { Card, List, Tag, Typography, Space } from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  BookOutlined,
  BulbOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const QuizAnswersReview = ({ answers }) => {
  if (!answers || answers.length === 0) {
    return (
      <Card
        title={
          <Space>
            <BookOutlined style={{ color: "#11418b" }} />
            <span>Review Jawaban</span>
          </Space>
        }
        style={{ borderRadius: 16, marginBottom: 24 }}
      >
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <Text type="secondary">
            Tidak ada detail jawaban untuk ditampilkan.
          </Text>
        </div>
      </Card>
    );
  }

  return (
    <Card
      title={
        <Space>
          <BookOutlined style={{ color: "#11418b" }} />
          <span>Review Jawaban Detail</span>
          <Tag color="blue">{answers.length} Soal</Tag>
        </Space>
      }
      style={{ borderRadius: 16, marginBottom: 24 }}
      bodyStyle={{ padding: "24px" }}
    >
      <List
        itemLayout="vertical"
        dataSource={answers}
        renderItem={(answer, index) => (
          <List.Item
            style={{
              padding: "20px",
              marginBottom: "16px",
              borderRadius: "12px",
              background: answer.is_correct
                ? "linear-gradient(135deg, #f6ffed 0%, #e6fffb 100%)"
                : "linear-gradient(135deg, #fff2f0 0%, #ffebe6 100%)",
              border: `2px solid ${answer.is_correct ? "#b7eb8f" : "#ffccc7"}`,
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            }}
          >
            {/* Header Soal */}
            <div style={{ marginBottom: 16 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    background: answer.is_correct ? "#52c41a" : "#ff4d4f",
                    borderRadius: "50%",
                    width: 32,
                    height: 32,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontWeight: "bold",
                    fontSize: 14,
                  }}
                >
                  {index + 1}
                </div>

                <Tag
                  color={answer.is_correct ? "success" : "error"}
                  style={{
                    fontSize: 12,
                    padding: "4px 8px",
                    fontWeight: 600,
                  }}
                >
                  {answer.is_correct ? (
                    <>
                      <CheckCircleOutlined /> Benar
                    </>
                  ) : (
                    <>
                      <CloseCircleOutlined /> Salah
                    </>
                  )}
                </Tag>
              </div>

              <div
                style={{
                  background: "white",
                  padding: "16px",
                  borderRadius: "8px",
                  border: "1px solid #f0f0f0",
                }}
              >
                <Title level={5} style={{ margin: 0, color: "#2c3e50" }}>
                  {answer.question_text}
                </Title>
              </div>
            </div>

            {/* Jawaban */}
            <Space direction="vertical" style={{ width: "100%" }} size="middle">
              <div
                style={{
                  background: "white",
                  padding: "16px",
                  borderRadius: "8px",
                  border: `2px solid ${
                    answer.is_correct ? "#52c41a" : "#ff4d4f"
                  }`,
                }}
              >
                <Text strong style={{ color: "#2c3e50" }}>
                  Jawaban Anda:
                </Text>
                <div style={{ marginTop: 8 }}>
                  <Tag
                    color={answer.is_correct ? "success" : "error"}
                    style={{
                      fontSize: 14,
                      padding: "6px 12px",
                      fontWeight: 600,
                    }}
                  >
                    {answer.selected_answer}. {answer.selected_answer_text}
                  </Tag>
                </div>
              </div>

              {!answer.is_correct && (
                <div
                  style={{
                    background: "white",
                    padding: "16px",
                    borderRadius: "8px",
                    border: "2px solid #52c41a",
                  }}
                >
                  <Text strong style={{ color: "#2c3e50" }}>
                    Jawaban Yang Benar:
                  </Text>
                  <div style={{ marginTop: 8 }}>
                    <Tag
                      color="success"
                      style={{
                        fontSize: 14,
                        padding: "6px 12px",
                        fontWeight: 600,
                      }}
                    >
                      {answer.correct_answer}. {answer.correct_answer_text}
                    </Tag>
                  </div>
                </div>
              )}

              {answer.explanation && (
                <div
                  style={{
                    background:
                      "linear-gradient(135deg, #f0f8ff 0%, #e6f7ff 100%)",
                    padding: "16px",
                    borderRadius: "8px",
                    border: "1px solid #d1e9ff",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 8,
                    }}
                  >
                    <BulbOutlined
                      style={{ color: "#1890ff", fontSize: 16, marginTop: 2 }}
                    />
                    <div>
                      <Text strong style={{ color: "#1890ff", fontSize: 14 }}>
                        Penjelasan:
                      </Text>
                      <div style={{ marginTop: 4 }}>
                        <Text
                          style={{
                            color: "#2c3e50",
                            fontSize: 14,
                            lineHeight: 1.6,
                          }}
                        >
                          {answer.explanation}
                        </Text>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </Space>
          </List.Item>
        )}
      />
    </Card>
  );
};

export default QuizAnswersReview;
