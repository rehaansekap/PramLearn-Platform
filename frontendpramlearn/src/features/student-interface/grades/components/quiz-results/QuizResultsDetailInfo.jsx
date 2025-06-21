import React from "react";
import { Card, Row, Col, Typography, Space, Tag, Alert } from "antd";
import { TeamOutlined, StarOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { Title, Text } = Typography;

const getScoreColor = (score) => {
  if (score >= 90) return "#52c41a";
  if (score >= 80) return "#1890ff";
  if (score >= 70) return "#faad14";
  if (score >= 60) return "#fa8c16";
  return "#ff4d4f";
};

const getGradeLetter = (score) => {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "E";
};

const QuizResultsDetailInfo = ({ quiz, attempt, isGroupQuiz, groupData }) => {
  return (
    <>
      {/* Teacher/System Feedback */}
      <Alert
        message={isGroupQuiz ? "Feedback Quiz Kelompok" : "Feedback Quiz"}
        description={
          attempt?.teacher_feedback ? (
            attempt.teacher_feedback
          ) : (
            <div>
              <Text type="secondary" italic>
                {isGroupQuiz
                  ? "Quiz kelompok telah diselesaikan dengan kerja sama tim yang baik."
                  : "Quiz individual telah diselesaikan dengan baik."}
              </Text>
              <br />
              <Text type="secondary" style={{ fontSize: 12 }}>
                Lihat detail jawaban di bawah untuk analisis lebih lanjut.
              </Text>
            </div>
          )
        }
        type="info"
        showIcon
        icon={<StarOutlined />}
        style={{
          marginBottom: 24,
          borderRadius: 12,
          border: "1px solid #91d5ff",
          background: "#f6ffed",
        }}
      />

      {/* Detail Information */}
      <Card
        style={{
          marginBottom: 24,
          borderRadius: 16,
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        }}
      >
        <Title level={5} style={{ marginBottom: 20, color: "#11418b" }}>
          📊 {isGroupQuiz ? "Detail Hasil Quiz Kelompok" : "Detail Hasil Quiz"}
        </Title>

        <Row gutter={[24, 16]}>
          <Col xs={24} sm={12}>
            <div
              style={{
                padding: 20,
                background: "linear-gradient(135deg, #f6faff 0%, #e6f7ff 100%)",
                borderRadius: 12,
                border: "1px solid #91d5ff",
              }}
            >
              <Space direction="vertical" style={{ width: "100%" }} size={12}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      background: "#1890ff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 14,
                      color: "white",
                    }}
                  >
                    📊
                  </div>
                  <Text strong style={{ color: "#1890ff", fontSize: 16 }}>
                    Informasi Skor
                  </Text>
                </div>

                <div style={{ marginLeft: 40 }}>
                  <div style={{ marginBottom: 8 }}>
                    <Text type="secondary">Skor Akhir: </Text>
                    <Text
                      strong
                      style={{
                        fontSize: 18,
                        color: getScoreColor(attempt?.score || 0),
                        marginLeft: 8,
                      }}
                    >
                      {attempt?.score?.toFixed(1) || "0.0"}/100
                    </Text>
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <Text type="secondary">Grade: </Text>
                    <Tag
                      color={getScoreColor(attempt?.score || 0)}
                      style={{
                        fontWeight: "bold",
                        fontSize: 14,
                        padding: "4px 12px",
                        borderRadius: 8,
                      }}
                    >
                      {getGradeLetter(attempt?.score || 0)}
                    </Tag>
                  </div>
                  <div>
                    <Text type="secondary">Status: </Text>
                    <Tag
                      color="success"
                      style={{
                        fontWeight: "bold",
                        fontSize: 12,
                        padding: "4px 8px",
                      }}
                    >
                      ✅ Selesai
                    </Tag>
                  </div>
                </div>
              </Space>
            </div>
          </Col>

          <Col xs={24} sm={12}>
            <div
              style={{
                padding: 20,
                background: "linear-gradient(135deg, #f9f0ff 0%, #efdbff 100%)",
                borderRadius: 12,
                border: "1px solid #d3adf7",
              }}
            >
              <Space direction="vertical" style={{ width: "100%" }} size={12}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      background: "#722ed1",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 14,
                      color: "white",
                    }}
                  >
                    📅
                  </div>
                  <Text strong style={{ color: "#722ed1", fontSize: 16 }}>
                    Timeline Quiz
                  </Text>
                </div>

                <div style={{ marginLeft: 40 }}>
                  <div style={{ marginBottom: 8 }}>
                    <Text type="secondary">Diselesaikan: </Text>
                    <br />
                    <Text strong style={{ fontSize: 14 }}>
                      {attempt?.completed_at
                        ? dayjs(attempt.completed_at).format(
                            "DD MMMM YYYY, HH:mm"
                          )
                        : "Tidak tersedia"}
                    </Text>
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <Text type="secondary">Durasi: </Text>
                    <br />
                    <Text strong style={{ fontSize: 14 }}>
                      {attempt?.duration || quiz?.duration || "Tidak tersedia"}{" "}
                      menit
                    </Text>
                  </div>
                  {isGroupQuiz && groupData && (
                    <div>
                      <Text type="secondary">Kelompok: </Text>
                      <br />
                      <Tag
                        color="purple"
                        icon={<TeamOutlined />}
                        style={{
                          fontWeight: "bold",
                          fontSize: 12,
                          padding: "4px 8px",
                        }}
                      >
                        {groupData.name}
                      </Tag>
                    </div>
                  )}
                </div>
              </Space>
            </div>
          </Col>
        </Row>
      </Card>
    </>
  );
};

export default QuizResultsDetailInfo;
