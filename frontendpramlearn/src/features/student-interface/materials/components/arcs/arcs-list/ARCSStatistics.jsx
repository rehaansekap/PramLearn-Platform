import React from "react";
import { Card, Statistic, Row, Col } from "antd";
import {
  FormOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";

const ARCSStatistics = ({ statistics }) => {
  const statsData = [
    {
      title: "Total Kuesioner",
      value: statistics.total,
      prefix: <FormOutlined style={{ color: "#1890ff" }} />,
      valueStyle: { color: "#1890ff", fontSize: 24 },
    },
    {
      title: "Selesai",
      value: statistics.completed,
      prefix: <CheckCircleOutlined style={{ color: "#52c41a" }} />,
      valueStyle: { color: "#52c41a", fontSize: 24 },
    },
    {
      title: "Tersedia",
      value: statistics.available,
      prefix: <ClockCircleOutlined style={{ color: "#faad14" }} />,
      valueStyle: { color: "#faad14", fontSize: 24 },
    },
    {
      title: "Rata-rata Skor",
      value: statistics.averageScore
        ? statistics.averageScore.toFixed(1)
        : "0.0",
      prefix: <TrophyOutlined style={{ color: "#722ed1" }} />,
      valueStyle: { color: "#722ed1", fontSize: 24 },
      suffix: "/5.0",
    },
  ];

  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
      {statsData.map((stat, index) => (
        <Col xs={12} sm={6} md={6} key={index}>
          <Card style={{ borderRadius: 12, textAlign: "center" }}>
            <Statistic
              title={stat.title}
              value={stat.value}
              prefix={stat.prefix}
              valueStyle={stat.valueStyle}
              suffix={stat.suffix}
            />
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default ARCSStatistics;
