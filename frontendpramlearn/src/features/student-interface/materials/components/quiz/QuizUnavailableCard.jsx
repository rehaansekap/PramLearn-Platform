import React from "react";
import { Card, Typography, Tag } from "antd";
import { FileTextOutlined, TeamOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const QuizUnavailableCard = ({ quiz }) => {
  const isMobile = window.innerWidth <= 768;

  return (
    <Card
      style={{
        borderRadius: 16,
        overflow: "hidden",
        boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
        border: "1px solid #f0f0f0",
        height: "100%",
        opacity: 0.6,
      }}
      bodyStyle={{ padding: "20px" }}
    >
      <div style={{ textAlign: "center", padding: "40px 20px" }}>
        <FileTextOutlined
          style={{
            fontSize: 48,
            color: "#d9d9d9",
            marginBottom: 16,
          }}
        />
        <Title level={5} style={{ color: "#999", marginBottom: 8 }}>
          {quiz.title}
        </Title>
        <Text type="secondary">{quiz.not_available_reason}</Text>
        {quiz.is_group_quiz && (
          <div style={{ marginTop: 12 }}>
            <Tag icon={<TeamOutlined />} color="orange">
              Group Quiz
            </Tag>
          </div>
        )}
      </div>
    </Card>
  );
};

export default QuizUnavailableCard;
