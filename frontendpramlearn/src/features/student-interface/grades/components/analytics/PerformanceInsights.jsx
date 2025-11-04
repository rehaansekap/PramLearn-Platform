import React from "react";
import { Card, Row, Col, Typography, Alert } from "antd";
import { BarChartOutlined } from "@ant-design/icons";

const { Title } = Typography;

const PerformanceInsights = ({ insights }) => {
  return (
    <Card
      style={{
        borderRadius: 16,
        marginBottom: 24,
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
      }}
    >
      <Title level={4} style={{ marginBottom: 16, color: "#11418b" }}>
        <BarChartOutlined style={{ marginRight: 8 }} />
        💡 Insight Performa
      </Title>
      <Row gutter={[16, 16]}>
        {insights.map((insight, index) => (
          <Col xs={24} md={12} lg={8} key={index}>
            <Alert
              message={insight.title}
              description={insight.description}
              type={insight.type}
              icon={insight.icon}
              showIcon
              style={{
                borderRadius: 12,
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              }}
            />
          </Col>
        ))}
      </Row>
    </Card>
  );
};

export default PerformanceInsights;
