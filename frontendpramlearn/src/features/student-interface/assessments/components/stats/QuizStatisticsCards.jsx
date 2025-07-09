import React from "react";
import { Row, Col, Card, Statistic } from "antd";
import {
  FileTextOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
  DashboardOutlined,
} from "@ant-design/icons";

const QuizStatisticsCards = ({ statistics }) => {
  const statsData = [
    {
      title: "Total Kuis",
      value: statistics.total,
      prefix: <FileTextOutlined style={{ color: "#1890ff" }} />,
      color: "#1890ff",
    },
    {
      title: "Selesai",
      value: statistics.completed,
      prefix: <TrophyOutlined style={{ color: "#52c41a" }} />,
      color: "#52c41a",
    },
    {
      title: "Sedang Dikerjakan",
      value: statistics.inProgress,
      prefix: <ClockCircleOutlined style={{ color: "#faad14" }} />,
      color: "#faad14",
    },
    {
      title: "Rata-rata Skor",
      value: statistics.averageScore,
      precision: 1,
      suffix: "/100",
      prefix: <DashboardOutlined style={{ color: "#722ed1" }} />,
      color: "#722ed1",
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
              precision={stat.precision}
              suffix={stat.suffix}
              prefix={stat.prefix}
              valueStyle={{ color: stat.color, fontSize: 24 }}
            />
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default QuizStatisticsCards;
