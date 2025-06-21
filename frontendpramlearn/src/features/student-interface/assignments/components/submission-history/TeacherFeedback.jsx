import React from "react";
import { Card, Typography, Space } from "antd";
import { MessageOutlined } from "@ant-design/icons";

const { Paragraph } = Typography;

const TeacherFeedback = ({ feedback }) => {
  if (!feedback || feedback.trim() === "") return null;

  return (
    <Card
      title={
        <Space>
          <MessageOutlined style={{ color: "#52c41a" }} />
          <span>Feedback Guru</span>
        </Space>
      }
      style={{ borderRadius: 12 }}
    >
      <div
        style={{
          background: "#f6ffed",
          padding: "16px",
          borderRadius: 8,
          border: "1px solid #b7eb8f",
        }}
      >
        <Paragraph
          style={{
            margin: 0,
            fontStyle: "italic",
            color: "#555",
            fontSize: 14,
          }}
        >
          "{feedback}"
        </Paragraph>
      </div>
    </Card>
  );
};

export default TeacherFeedback;
