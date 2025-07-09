import React from "react";
import { Card, Row, Col, Typography, Space, Progress, Alert } from "antd";

const { Text } = Typography;

const getGradeColor = (grade) => {
  if (grade >= 90) return "#52c41a";
  if (grade >= 80) return "#1890ff";
  if (grade >= 70) return "#faad14";
  if (grade >= 60) return "#fa8c16";
  return "#ff4d4f";
};

const AssignmentRubricItem = ({ item }) => (
  <Card
    key={item.id}
    size="small"
    style={{
      marginBottom: 12,
      borderRadius: 8,
      border: `1px solid ${getGradeColor(item.score)}`,
    }}
  >
    <Row gutter={[16, 8]}>
      <Col xs={24} md={16}>
        <Space direction="vertical" size="small" style={{ width: "100%" }}>
          <Text strong style={{ color: "#11418b" }}>
            {item.criteria}
          </Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {item.description}
          </Text>
        </Space>
      </Col>
      <Col xs={24} md={8}>
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              color: getGradeColor(item.score),
              fontSize: 18,
              fontWeight: "bold",
              marginBottom: 4,
            }}
          >
            {item.score}/{item.max_score}
          </div>
          <Progress
            percent={(item.score / item.max_score) * 100}
            strokeColor={getGradeColor(item.score)}
            showInfo={false}
            size="small"
          />
        </div>
      </Col>
      {item.feedback && (
        <Col span={24}>
          <Alert
            message="Catatan"
            description={item.feedback}
            type="info"
            showIcon
            style={{ marginTop: 8 }}
          />
        </Col>
      )}
    </Row>
  </Card>
);

export default AssignmentRubricItem;
