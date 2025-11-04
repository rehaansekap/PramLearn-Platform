import React from "react";
import { Card, Space, Typography, Tag, Button, Alert } from "antd";
import { FileTextOutlined, CommentOutlined } from "@ant-design/icons";

const { Text, Paragraph } = Typography;

const getGradeColor = (grade) => {
  if (grade >= 90) return "#52c41a";
  if (grade >= 80) return "#1890ff";
  if (grade >= 70) return "#faad14";
  if (grade >= 60) return "#fa8c16";
  return "#ff4d4f";
};

const AssignmentAnswerItem = ({ answer, index }) => (
  <Card size="small" style={{ marginBottom: 16, borderRadius: 8 }}>
    <Space direction="vertical" style={{ width: "100%" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text strong>Soal {index + 1}</Text>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {answer.points_earned !== null && (
            <Tag
              color={getGradeColor(
                (answer.points_earned / answer.max_points) * 100
              )}
            >
              {answer.points_earned}/{answer.max_points} poin
            </Tag>
          )}
          <Tag color={answer.is_correct ? "success" : "error"}>
            {answer.is_correct ? "Benar" : "Salah"}
          </Tag>
        </div>
      </div>
      <div
        style={{
          background: "#f8f9fa",
          padding: "12px 16px",
          borderRadius: 8,
          border: "1px solid #e9ecef",
        }}
      >
        <Text strong style={{ color: "#2c3e50" }}>
          Pertanyaan:
        </Text>
        <Paragraph style={{ marginTop: 8, marginBottom: 0 }}>
          {answer.question_text}
        </Paragraph>
      </div>
      <Card size="small" style={{ background: "#f9f9f9" }}>
        <Text strong>Jawaban Anda:</Text>
        <div style={{ marginTop: 8 }}>
          {answer.answer_type === "multiple_choice" ? (
            <div>
              {answer.selected_choice ? (
                <Tag
                  color={answer.is_correct ? "success" : "error"}
                  style={{
                    fontSize: 14,
                    padding: "4px 12px",
                    fontWeight: "bold",
                  }}
                >
                  Pilihan {answer.selected_choice}
                </Tag>
              ) : (
                <Text type="secondary" italic>
                  Tidak ada jawaban dipilih
                </Text>
              )}
            </div>
          ) : (
            <div>
              {answer.answer_text ? (
                <Paragraph
                  style={{
                    background: "white",
                    padding: "12px",
                    borderRadius: 6,
                    border: "1px solid #d9d9d9",
                    marginBottom: 0,
                  }}
                >
                  {answer.answer_text}
                </Paragraph>
              ) : (
                <Text type="secondary" italic>
                  Tidak ada jawaban essay
                </Text>
              )}
            </div>
          )}
        </div>
        {answer.attachment && (
          <div style={{ marginTop: 8 }}>
            <Button
              size="small"
              icon={<FileTextOutlined />}
              onClick={() => window.open(answer.attachment, "_blank")}
            >
              Lihat Lampiran
            </Button>
          </div>
        )}
      </Card>
      {answer.teacher_feedback && answer.teacher_feedback.trim() !== "" && (
        <Alert
          message="Komentar Guru"
          description={answer.teacher_feedback}
          type="info"
          showIcon
          icon={<CommentOutlined />}
          style={{ borderRadius: 6 }}
        />
      )}
      {answer.answer_type === "multiple_choice" && !answer.is_correct && (
        <Alert
          message="Jawaban yang Benar"
          description="Informasi jawaban yang benar tidak tersedia dalam feedback ini."
          type="warning"
          showIcon
          style={{ borderRadius: 6 }}
        />
      )}
    </Space>
  </Card>
);

export default AssignmentAnswerItem;
