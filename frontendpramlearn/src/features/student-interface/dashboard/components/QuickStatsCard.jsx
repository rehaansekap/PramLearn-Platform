import React from "react";
import { Card, Row, Col, Statistic, Button, Space, Spin } from "antd";
import {
  BookOutlined,
  FileTextOutlined,
  QuestionCircleOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const QuickStatsCard = ({ stats, loading }) => {
  const navigate = useNavigate();

  const statsData = [
    {
      title: "Subjects",
      value: stats?.subjects || 0,
      icon: <BookOutlined />,
      color: "#1677ff",
      action: () => navigate("/student/subjects"),
    },
    {
      title: "Pending Tasks",
      value: stats?.pending_assignments || 0,
      icon: <FileTextOutlined />,
      color: "#ff4d4f",
      action: () => navigate("/student/assignments"),
    },
    {
      title: "Available Quizzes",
      value: stats?.available_quizzes || 0,
      icon: <QuestionCircleOutlined />,
      color: "#52c41a",
      action: () => navigate("/student/quizzes"),
    },
    {
      title: "Progress",
      value: stats?.progress || 0,
      suffix: "%",
      icon: <TrophyOutlined />,
      color: "#faad14",
      action: () => navigate("/student/progress"),
    },
  ];

  return (
    <Card
      style={{
        borderRadius: 12,
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
      }}
      bodyStyle={{ padding: "24px" }}
    >
      <Row gutter={[24, 24]}>
        {statsData.map((stat, index) => (
          <Col xs={12} sm={6} key={index}>
            <Card
              hoverable
              onClick={stat.action}
              style={{
                borderRadius: 12,
                border: `2px solid ${stat.color}20`,
                background: `${stat.color}05`,
                textAlign: "center",
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
              bodyStyle={{ padding: "20px 16px" }}
            >
              {loading ? (
                <Spin size="large" />
              ) : (
                <Space
                  direction="vertical"
                  size="small"
                  style={{ width: "100%" }}
                >
                  <div
                    style={{
                      fontSize: 24,
                      color: stat.color,
                      marginBottom: 8,
                    }}
                  >
                    {stat.icon}
                  </div>
                  <Statistic
                    value={stat.value}
                    suffix={stat.suffix}
                    valueStyle={{
                      fontSize: "clamp(20px, 4vw, 24px)",
                      fontWeight: "bold",
                      color: stat.color,
                    }}
                  />
                  <div
                    style={{
                      fontSize: "clamp(12px, 2vw, 14px)",
                      fontWeight: 500,
                      color: "#666",
                      marginTop: 4,
                    }}
                  >
                    {stat.title}
                  </div>
                </Space>
              )}
            </Card>
          </Col>
        ))}
      </Row>
    </Card>
  );
};

export default QuickStatsCard;
