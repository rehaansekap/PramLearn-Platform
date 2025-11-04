import React from "react";
import { Card, Statistic, Row, Col } from "antd";
import {
  ClockCircleOutlined,
  TrophyOutlined,
  PercentageOutlined,
  BarChartOutlined,
} from "@ant-design/icons";

const QuizStatisticsCards = ({ results }) => {
  const getScoreColor = (score) => {
    if (score >= 80) return "#52c41a";
    if (score >= 60) return "#faad14";
    return "#ff4d4f";
  };

  const statisticsData = [
    {
      title: "Waktu Pengerjaan",
      value: results.time_taken || 0,
      suffix: "menit",
      icon: <ClockCircleOutlined style={{ color: "#1890ff", fontSize: 24 }} />,
      color: "#1890ff",
      background: "linear-gradient(135deg, #e6f7ff 0%, #bae7ff 100%)",
    },
    {
      title: "Peringkat",
      value: results.rank || "-",
      suffix: results.total_participants
        ? `/ ${results.total_participants}`
        : "",
      icon: <TrophyOutlined style={{ color: "#faad14", fontSize: 24 }} />,
      color: "#faad14",
      background: "linear-gradient(135deg, #fff7e6 0%, #ffd591 100%)",
    },
    {
      title: "Tingkat Keberhasilan",
      value: (
        (results.correct_answers / results.total_questions) *
        100
      ).toFixed(1),
      suffix: "%",
      icon: (
        <PercentageOutlined
          style={{ color: getScoreColor(results.score), fontSize: 24 }}
        />
      ),
      color: getScoreColor(results.score),
      background: `linear-gradient(135deg, ${getScoreColor(
        results.score
      )}15 0%, ${getScoreColor(results.score)}30 100%)`,
    },
    {
      title: "Jawaban Benar",
      value: results.correct_answers,
      suffix: `/ ${results.total_questions}`,
      icon: <BarChartOutlined style={{ color: "#52c41a", fontSize: 24 }} />,
      color: "#52c41a",
      background: "linear-gradient(135deg, #f6ffed 0%, #d9f7be 100%)",
    },
  ];

  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
      {statisticsData.map((stat, index) => (
        <Col xs={12} sm={6} key={index}>
          <Card
            style={{
              borderRadius: 16,
              background: stat.background,
              border: `1px solid ${stat.color}30`,
              textAlign: "center",
              height: "100%",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              transition: "all 0.3s ease",
            }}
            bodyStyle={{ padding: "20px 16px" }}
            hoverable
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
            }}
          >
            <div style={{ marginBottom: 12 }}>
              <div
                style={{
                  background: "white",
                  borderRadius: "50%",
                  width: 48,
                  height: 48,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto",
                  boxShadow: `0 2px 8px ${stat.color}30`,
                }}
              >
                {stat.icon}
              </div>
            </div>
            <Statistic
              title={stat.title}
              value={stat.value}
              suffix={stat.suffix}
              valueStyle={{
                color: stat.color,
                fontSize: 20,
                fontWeight: 700,
              }}
              titleStyle={{
                fontSize: 12,
                fontWeight: 500,
                color: "#666",
              }}
            />
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default QuizStatisticsCards;
