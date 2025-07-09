import React from "react";
import { Card, Row, Col, Statistic, Progress, Space, Typography } from "antd";
import {
  TrophyOutlined,
  FileTextOutlined,
  QuestionCircleOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

const PerformanceOverviewCard = ({ performance, loading }) => {
  const getGradeColor = (grade) => {
    if (grade >= 85) return "#52c41a";
    if (grade >= 70) return "#1890ff";
    if (grade >= 60) return "#faad14";
    return "#ff4d4f";
  };

  const getCompletionColor = (rate) => {
    if (rate >= 90) return "#52c41a";
    if (rate >= 75) return "#1890ff";
    if (rate >= 50) return "#faad14";
    return "#ff4d4f";
  };

  return (
    <Card
      title={
        <Space>
          <TrophyOutlined style={{ color: "#11418b" }} />
          <Text strong>Ringkasan Performa Kelas</Text>
        </Space>
      }
      style={{ borderRadius: 12, marginBottom: 16 }}
      loading={loading}
    >
      <Row gutter={[24, 24]}>
        <Col xs={12} sm={6}>
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: 32,
                fontWeight: "bold",
                color: getGradeColor(performance?.avg_assignment_grade || 0),
                marginBottom: 8,
              }}
            >
              {(performance?.avg_assignment_grade || 0).toFixed(1)}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 4,
              }}
            >
              <FileTextOutlined style={{ fontSize: 14, color: "#666" }} />
              <Text style={{ fontSize: 12, color: "#666" }}>
                Rata-rata Tugas
              </Text>
            </div>
          </div>
        </Col>

        <Col xs={12} sm={6}>
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: 32,
                fontWeight: "bold",
                color: getGradeColor(performance?.avg_quiz_score || 0),
                marginBottom: 8,
              }}
            >
              {(performance?.avg_quiz_score || 0).toFixed(1)}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 4,
              }}
            >
              <QuestionCircleOutlined style={{ fontSize: 14, color: "#666" }} />
              <Text style={{ fontSize: 12, color: "#666" }}>
                Rata-rata Kuis
              </Text>
            </div>
          </div>
        </Col>

        <Col xs={12} sm={6}>
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: 32,
                fontWeight: "bold",
                color: "#1890ff",
                marginBottom: 8,
              }}
            >
              {performance?.total_quiz_attempts || 0}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 4,
              }}
            >
              <CheckCircleOutlined style={{ fontSize: 14, color: "#666" }} />
              <Text style={{ fontSize: 12, color: "#666" }}>Total Attempt</Text>
            </div>
          </div>
        </Col>

        <Col xs={12} sm={6}>
          <div style={{ textAlign: "center" }}>
            <Progress
              type="circle"
              size={60}
              percent={performance?.completion_rate || 0}
              strokeColor={getCompletionColor(
                performance?.completion_rate || 0
              )}
              format={(percent) => (
                <span style={{ fontSize: 12, fontWeight: "bold" }}>
                  {percent}%
                </span>
              )}
            />
            <div style={{ marginTop: 8 }}>
              <Text style={{ fontSize: 12, color: "#666" }}>
                Tingkat Penyelesaian
              </Text>
            </div>
          </div>
        </Col>
      </Row>
    </Card>
  );
};

export default PerformanceOverviewCard;
