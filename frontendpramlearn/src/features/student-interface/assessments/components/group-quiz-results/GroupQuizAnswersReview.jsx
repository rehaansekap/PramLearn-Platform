import React, { useState } from "react";
import { Card, List, Tag, Typography, Space, Grid } from "antd";
import {
  BookOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";

const { Text, Title } = Typography;
const { useBreakpoint } = Grid;

const GroupQuizAnswersReview = ({ results }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const pageSize = isMobile ? 3 : 5;

  return (
    <Card
      title={
        <Space>
          <BookOutlined style={{ color: "#1890ff" }} />
          <span>Review Jawaban Detail</span>
        </Space>
      }
      style={{
        borderRadius: 16,
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      }}
      styles={{
        header: {
          borderBottom: "2px solid #f0f0f0",
          background: "#fafbfc",
        },
      }}
    >
      <List
        itemLayout="vertical"
        dataSource={results.answers || []}
        pagination={{
          pageSize: pageSize,
          showSizeChanger: false,
          style: {
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            marginTop: 24,
            gap: isMobile ? 0 : 0,
            flexWrap: "wrap",
          },
          showTotal: (total, range) => (
            <div
              style={{
                textAlign: "center",
                marginBottom: isMobile ? 8 : 0,
                marginRight: isMobile ? 0 : 16,
                minWidth: isMobile ? "100%" : "auto",
                fontSize: isMobile ? 13 : 14,
                fontWeight: 500,
                color: "#333",
                display: "block",
                order: isMobile ? -1 : 0,
              }}
            >
              {`${range[0]}-${range[1]} dari ${total} soal`}
            </div>
          ),
          current: currentPage,
          onChange: (page) => setCurrentPage(page),
          position: "bottom",
        }}
        renderItem={(answer, index) => (
          <List.Item
            style={{
              padding: "20px",
              marginBottom: "16px",
              borderRadius: 12,
              background: answer.is_correct
                ? "linear-gradient(135deg, #f6ffed 0%, #e6fffb 100%)"
                : "linear-gradient(135deg, #fff2f0 0%, #fff1f0 100%)",
              border: `2px solid ${answer.is_correct ? "#b7eb8f" : "#ffccc7"}`,
              boxShadow: answer.is_correct
                ? "0 4px 12px rgba(82, 196, 26, 0.15)"
                : "0 4px 12px rgba(255, 77, 79, 0.15)",
            }}
          >
            {/* Question Header */}
            <div style={{ marginBottom: 16 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 12,
                  flexWrap: "wrap",
                }}
              >
                <Tag
                  color={answer.is_correct ? "success" : "error"}
                  style={{
                    fontSize: 13,
                    padding: "6px 12px",
                    fontWeight: 600,
                    borderRadius: 8,
                  }}
                >
                  Soal {index + 1}
                </Tag>
                <div
                  style={{
                    background: answer.is_correct ? "#52c41a" : "#ff4d4f",
                    borderRadius: "50%",
                    width: 28,
                    height: 28,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {answer.is_correct ? (
                    <CheckCircleOutlined
                      style={{ color: "white", fontSize: 16 }}
                    />
                  ) : (
                    <CloseCircleOutlined
                      style={{ color: "white", fontSize: 16 }}
                    />
                  )}
                </div>
                <Text
                  strong
                  style={{
                    color: answer.is_correct ? "#389e0d" : "#cf1322",
                    fontSize: 14,
                  }}
                >
                  {answer.is_correct ? "Benar" : "Salah"}
                </Text>
              </div>

              {/* Question Text */}
              <div
                style={{
                  background: "rgba(255, 255, 255, 0.8)",
                  padding: "16px 20px",
                  borderRadius: 10,
                  border: "1px solid rgba(0, 0, 0, 0.06)",
                }}
              >
                <Title
                  level={5}
                  style={{
                    margin: 0,
                    fontSize: 16,
                    lineHeight: 1.5,
                    color: "#2c3e50",
                  }}
                >
                  {answer.question_text}
                </Title>
              </div>
            </div>

            {/* Answer Section */}
            <Space direction="vertical" style={{ width: "100%" }} size={12}>
              {/* Your Answer */}
              <div
                style={{
                  background: "rgba(255, 255, 255, 0.7)",
                  padding: "12px 16px",
                  borderRadius: 8,
                  border: `1px solid ${
                    answer.is_correct ? "#d9f7be" : "#ffccc7"
                  }`,
                }}
              >
                <Text strong style={{ color: "#666", fontSize: 14 }}>
                  Jawaban Kelompok Anda:{" "}
                </Text>
                <Tag
                  color={answer.is_correct ? "success" : "error"}
                  style={{
                    fontSize: 13,
                    padding: "4px 12px",
                    fontWeight: 600,
                    borderRadius: 6,
                  }}
                >
                  {answer.selected_answer}. {answer.selected_answer_text}
                </Tag>
              </div>

              {/* Correct Answer (if wrong) */}
              {!answer.is_correct && (
                <div
                  style={{
                    background: "rgba(255, 255, 255, 0.7)",
                    padding: "12px 16px",
                    borderRadius: 8,
                    border: "1px solid #b7eb8f",
                  }}
                >
                  <Text strong style={{ color: "#666", fontSize: 14 }}>
                    Jawaban Yang Benar:{" "}
                  </Text>
                  <Tag
                    color="success"
                    style={{
                      fontSize: 13,
                      padding: "4px 12px",
                      fontWeight: 600,
                      borderRadius: 6,
                    }}
                  >
                    {answer.correct_answer}. {answer.correct_answer_text}
                  </Tag>
                </div>
              )}

              {/* Explanation (if available) */}
              {answer.explanation && (
                <div
                  style={{
                    background: "#f0f8ff",
                    padding: "12px 16px",
                    borderRadius: 8,
                    border: "1px solid #d1e9ff",
                  }}
                >
                  <Text strong style={{ color: "#1890ff", fontSize: 14 }}>
                    💡 Penjelasan:{" "}
                  </Text>
                  <Text style={{ color: "#666", fontSize: 14 }}>
                    {answer.explanation}
                  </Text>
                </div>
              )}
            </Space>
          </List.Item>
        )}
      />
    </Card>
  );
};

export default GroupQuizAnswersReview;
