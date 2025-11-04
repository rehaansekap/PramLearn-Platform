import React from "react";
import { Card, Statistic, Row, Col } from "antd";
import {
  ClockCircleOutlined,
  CrownOutlined,
  CheckCircleOutlined,
  StarOutlined,
} from "@ant-design/icons";

const GroupQuizStatistics = ({ results }) => {
  const getScoreColor = (score) => {
    if (score >= 80) return "#52c41a";
    if (score >= 60) return "#faad14";
    return "#ff4d4f";
  };

  const getGradeIcon = (score) => {
    if (score >= 90) return <CrownOutlined />;
    if (score >= 80) return <StarOutlined />;
    return <ClockCircleOutlined />;
  };

  const statisticsData = [
    // {
    //   title: "Waktu Pengerjaan",
    //   value: results.time_taken || 0,
    //   suffix: "menit",
    //   icon: <ClockCircleOutlined style={{ color: "#1890ff" }} />,
    //   color: "#1890ff",
    // },
    // {
    //   title: "Peringkat",
    //   value: results.rank || "-",
    //   suffix: results.total_participants
    //     ? `/ ${results.total_participants}`
    //     : "",
    //   icon: <CrownOutlined style={{ color: "#faad14" }} />,
    //   color: "#faad14",
    // },
    {
      title: "Jawaban Benar",
      value: results.correct_answers,
      suffix: `/ ${results.total_questions}`,
      icon: <CheckCircleOutlined style={{ color: "#52c41a" }} />,
      color: "#52c41a",
    },
    {
      title: "Persentase Benar",
      value: (
        (results.correct_answers / results.total_questions) *
        100
      ).toFixed(1),
      suffix: "%",
      icon: getGradeIcon(results.score),
      color: getScoreColor(results.score),
    },
  ];

  return (
    <Row gutter={[16, 16]}>
      {statisticsData.map((stat, index) => (
        <Col xs={24} sm={12} key={index}>
          <Card
            style={{
              borderRadius: 12,
              textAlign: "center",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            }}
          >
            <Statistic
              title={stat.title}
              value={stat.value}
              suffix={stat.suffix}
              prefix={stat.icon}
              valueStyle={{ color: stat.color, fontSize: 20 }}
            />
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default GroupQuizStatistics;
