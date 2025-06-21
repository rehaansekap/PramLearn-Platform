import React from "react";
import { Card, Row, Col, Typography, Space, Tag } from "antd";
import dayjs from "dayjs";

const { Title, Text } = Typography;

const getGradeColor = (grade) => {
  if (grade >= 90) return "#52c41a";
  if (grade >= 80) return "#1890ff";
  if (grade >= 70) return "#faad14";
  if (grade >= 60) return "#fa8c16";
  return "#ff4d4f";
};

const getGradeLetter = (grade) => {
  if (grade >= 90) return "A";
  if (grade >= 80) return "B";
  if (grade >= 70) return "C";
  if (grade >= 60) return "D";
  return "E";
};

const AssignmentDetailInfo = ({ submission, graded_at, graded_by }) => (
  <Card style={{ marginBottom: 24, borderRadius: 12 }}>
    <Title level={5} style={{ marginBottom: 16 }}>
      Detail Penilaian Assignment
    </Title>
    <Row gutter={[16, 16]}>
      <Col xs={24} sm={12}>
        <div style={{ padding: 16, background: "#f8f9fa", borderRadius: 8 }}>
          <Space direction="vertical" style={{ width: "100%" }}>
            <Text strong style={{ color: "#1890ff" }}>
              📊 Informasi Penilaian
            </Text>
            <div>
              <Text type="secondary">Nilai Akhir: </Text>
              <Text
                strong
                style={{
                  fontSize: 16,
                  color: getGradeColor(submission?.final_score || 0),
                }}
              >
                {submission?.final_score?.toFixed(1) || "0.0"}/100
              </Text>
            </div>
            <div>
              <Text type="secondary">Grade: </Text>
              <Tag
                color={getGradeColor(submission?.final_score || 0)}
                style={{ fontWeight: "bold" }}
              >
                {getGradeLetter(submission?.final_score || 0)}
              </Tag>
            </div>
            <div>
              <Text type="secondary">Status: </Text>
              <Tag color="success">Sudah Dinilai</Tag>
            </div>
          </Space>
        </div>
      </Col>
      <Col xs={24} sm={12}>
        <div style={{ padding: 16, background: "#f0f8ff", borderRadius: 8 }}>
          <Space direction="vertical" style={{ width: "100%" }}>
            <Text strong style={{ color: "#722ed1" }}>
              📅 Timeline Assignment
            </Text>
            <div>
              <Text type="secondary">Dikumpulkan: </Text>
              <br />
              <Text strong>
                {submission?.submitted_at
                  ? dayjs(submission.submitted_at).format("DD MMMM YYYY")
                  : "N/A"}
              </Text>
            </div>
            <div>
              <Text type="secondary">Dinilai: </Text>
              <br />
              <Text strong>
                {graded_at ? dayjs(graded_at).format("DD MMMM YYYY") : "N/A"}
              </Text>
            </div>
            <div>
              <Text type="secondary">Dinilai oleh: </Text>
              <Tag color="blue">{graded_by || "Guru"}</Tag>
            </div>
          </Space>
        </div>
      </Col>
    </Row>
  </Card>
);

export default AssignmentDetailInfo;
