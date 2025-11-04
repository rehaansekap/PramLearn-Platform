import React from "react";
import {
  Card,
  List,
  Typography,
  Row,
  Col,
  Progress,
  Tag,
  Space,
  Grid,
} from "antd";
import { BookOutlined, TrophyOutlined } from "@ant-design/icons";

const { Title } = Typography;
const { useBreakpoint } = Grid;

const SubjectPerformance = ({ subjectPerformance }) => {
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const getGradeColor = (score) => {
    if (score >= 90) return "#52c41a";
    if (score >= 80) return "#1890ff";
    if (score >= 70) return "#faad14";
    if (score >= 60) return "#fa8c16";
    return "#ff4d4f";
  };

  const getPerformanceEmoji = (average) => {
    if (average >= 90) return "🏆";
    if (average >= 80) return "🥇";
    if (average >= 70) return "🥈";
    if (average >= 60) return "🥉";
    return "📚";
  };

  return (
    <Card
      style={{
        borderRadius: isMobile ? 12 : 16,
        marginBottom: 24,
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
      }}
    >
      <Title
        level={4}
        style={{
          marginBottom: 16,
          color: "#11418b",
          fontSize: isMobile ? 16 : 20,
        }}
      >
        <BookOutlined style={{ marginRight: 8 }} />
        📖 Analisis per Mata Pelajaran
      </Title>

      <List
        grid={{
          gutter: isMobile ? 12 : 16,
          xs: 1,
          sm: 2,
          md: 2,
          lg: 3,
        }}
        dataSource={subjectPerformance}
        renderItem={(subject, index) => (
          <List.Item>
            <Card
              size="small"
              style={{
                borderRadius: isMobile ? 8 : 12,
                border: `2px solid ${getGradeColor(subject.average)}30`,
                position: "relative",
                background: `${getGradeColor(subject.average)}05`,
                transition: "all 0.3s ease",
                height: "100%",
              }}
              hoverable={!isMobile}
              onMouseEnter={
                !isMobile
                  ? (e) => {
                      e.currentTarget.style.transform = "translateY(-4px)";
                      e.currentTarget.style.boxShadow = `0 8px 24px ${getGradeColor(
                        subject.average
                      )}30`;
                    }
                  : undefined
              }
              onMouseLeave={
                !isMobile
                  ? (e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow =
                        "0 2px 8px rgba(0,0,0,0.1)";
                    }
                  : undefined
              }
            >
              {/* Best Performance Badge */}
              {index === 0 && (
                <div
                  style={{
                    position: "absolute",
                    top: -8,
                    right: -8,
                    background: "#faad14",
                    borderRadius: "50%",
                    width: isMobile ? 24 : 28,
                    height: isMobile ? 24 : 28,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 1,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                  }}
                >
                  <TrophyOutlined
                    style={{
                      color: "white",
                      fontSize: isMobile ? 12 : 14,
                    }}
                  />
                </div>
              )}

              {/* Subject Header */}
              <div
                style={{
                  textAlign: "center",
                  marginBottom: isMobile ? 12 : 16,
                }}
              >
                <div
                  style={{
                    fontSize: isMobile ? 20 : 24,
                    marginBottom: isMobile ? 6 : 8,
                  }}
                >
                  {getPerformanceEmoji(subject.average)}
                </div>
                <Title
                  level={5}
                  style={{
                    margin: 0,
                    color: getGradeColor(subject.average),
                    fontSize: isMobile ? 14 : 16,
                    fontWeight: 700,
                    lineHeight: 1.2,
                  }}
                >
                  {subject.name}
                </Title>
                <div style={{ marginTop: 4 }}>
                  <Tag
                    color="purple"
                    style={{
                      fontSize: isMobile ? 10 : 11,
                      padding: isMobile ? "1px 6px" : "2px 8px",
                    }}
                  >
                    {subject.totalAssessments} penilaian
                  </Tag>
                </div>
              </div>

              {/* Performance Metrics */}
              <Row
                gutter={8}
                style={{
                  marginBottom: isMobile ? 12 : 16,
                }}
              >
                <Col span={8} style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontSize: isMobile ? 18 : 20,
                      fontWeight: "bold",
                      color: getGradeColor(subject.average),
                    }}
                  >
                    {subject.average}
                  </div>
                  <div
                    style={{
                      fontSize: isMobile ? 10 : 11,
                      color: "#666",
                      fontWeight: 500,
                    }}
                  >
                    Rata-rata
                  </div>
                </Col>
                <Col span={8} style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontSize: isMobile ? 14 : 16,
                      fontWeight: "bold",
                      color: "#52c41a",
                    }}
                  >
                    {subject.highest}
                  </div>
                  <div
                    style={{
                      fontSize: isMobile ? 10 : 11,
                      color: "#666",
                      fontWeight: 500,
                    }}
                  >
                    Tertinggi
                  </div>
                </Col>
                <Col span={8} style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontSize: isMobile ? 14 : 16,
                      fontWeight: "bold",
                      color: "#ff4d4f",
                    }}
                  >
                    {subject.lowest}
                  </div>
                  <div
                    style={{
                      fontSize: isMobile ? 10 : 11,
                      color: "#666",
                      fontWeight: 500,
                    }}
                  >
                    Terendah
                  </div>
                </Col>
              </Row>

              {/* Progress Bar */}
              <Progress
                percent={subject.average}
                strokeColor={{
                  "0%": getGradeColor(subject.average),
                  "100%": getGradeColor(subject.average) + "AA",
                }}
                showInfo={false}
                strokeWidth={isMobile ? 6 : 8}
                style={{ marginBottom: isMobile ? 10 : 12 }}
              />

              {/* Footer Info */}
              <div
                style={{
                  display: "flex",
                  flexDirection: isMobile ? "column" : "row",
                  justifyContent: "space-between",
                  alignItems: isMobile ? "center" : "center",
                  fontSize: isMobile ? 10 : 11,
                  color: "#666",
                  gap: isMobile ? 8 : 0,
                }}
              >
                <span style={{ fontWeight: 500 }}>
                  Konsistensi:{" "}
                  <strong style={{ color: getGradeColor(subject.consistency) }}>
                    {subject.consistency}%
                  </strong>
                </span>
                <Space size={4}>
                  <Tag
                    size="small"
                    color="blue"
                    style={{
                      fontSize: isMobile ? 9 : 10,
                      padding: isMobile ? "1px 4px" : "2px 6px",
                    }}
                  >
                    {subject.quizCount} Kuis
                  </Tag>
                  <Tag
                    size="small"
                    color="green"
                    style={{
                      fontSize: isMobile ? 9 : 10,
                      padding: isMobile ? "1px 4px" : "2px 6px",
                    }}
                  >
                    {subject.assignmentCount} Tugas
                  </Tag>
                </Space>
              </div>
            </Card>
          </List.Item>
        )}
      />
    </Card>
  );
};

export default SubjectPerformance;
