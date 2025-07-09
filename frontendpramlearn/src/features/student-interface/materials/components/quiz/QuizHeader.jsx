import React from "react";
import { Typography } from "antd";
import { BookOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const QuizHeader = () => {
  return (
    <div style={{ marginBottom: 24, textAlign: "center" }}>
      <BookOutlined
        style={{
          fontSize: 32,
          color: "#11418b",
          marginBottom: 12,
        }}
      />
      <Title
        level={4}
        style={{
          margin: 0,
          marginBottom: 8,
          color: "#11418b",
          fontSize: "20px",
          fontWeight: 700,
        }}
      >
        Quiz Tersedia
      </Title>
      <Text type="secondary" style={{ fontSize: "14px", color: "#666" }}>
        Kerjakan quiz untuk menguji pemahaman Anda
      </Text>
    </div>
  );
};

export default QuizHeader;
