import React from "react";
import { Card, Statistic, Row, Col } from "antd";
import {
  FileTextOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";

const AssignmentStatistics = ({ statistics }) => {
  const statsData = [
    {
      title: "Total Tugas",
      value: statistics.total,
      prefix: <FileTextOutlined style={{ color: "#1890ff" }} />,
      valueStyle: { color: "#1890ff", fontSize: 24 },
    },
    {
      title: "Selesai",
      value: statistics.completed,
      prefix: <TrophyOutlined style={{ color: "#52c41a" }} />,
      valueStyle: { color: "#52c41a", fontSize: 24 },
    },
    {
      title: "Terlambat",
      value: statistics.overdue,
      prefix: <ClockCircleOutlined style={{ color: "#ff4d4f" }} />,
      valueStyle: { color: "#ff4d4f", fontSize: 24 },
    },
    {
      title: "Rata-rata Nilai",
      value: statistics.averageScore.toFixed(1),
      prefix: <TrophyOutlined style={{ color: "#faad14" }} />,
      valueStyle: { color: "#faad14", fontSize: 24 },
      suffix: "/100",
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

export default AssignmentStatistics;
