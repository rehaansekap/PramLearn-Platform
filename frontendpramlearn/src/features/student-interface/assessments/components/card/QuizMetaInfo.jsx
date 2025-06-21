import React from "react";
import { Space, Typography } from "antd";
import {
  QuestionCircleOutlined,
  ClockCircleOutlined,
  BookOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

const QuizMetaInfo = ({ quiz, subjectName }) => {
  const metaItems = [
    {
      condition: quiz.questions_count,
      background: "#f0f8ff",
      border: "#d1e9ff",
      icon: (
        <QuestionCircleOutlined style={{ color: "#1890ff", fontSize: 12 }} />
      ),
      text: `${quiz.questions_count} Soal`,
      color: "#1890ff",
    },
    {
      condition: quiz.duration,
      background: "#fff7e6",
      border: "#ffd591",
      icon: <ClockCircleOutlined style={{ color: "#fa8c16", fontSize: 12 }} />,
      text: `${quiz.duration} Menit`,
      color: "#fa8c16",
    },
    {
      condition: subjectName,
      background: "#f6ffed",
      border: "#b7eb8f",
      icon: <BookOutlined style={{ color: "#52c41a", fontSize: 12 }} />,
      text: subjectName,
      color: "#52c41a",
    },
  ];

  return (
    <div style={{ marginBottom: 16 }}>
      <Space wrap size={8}>
        {metaItems.map((item, index) =>
          item.condition ? (
            <div
              key={index}
              style={{
                background: item.background,
                border: `1px solid ${item.border}`,
                borderRadius: 8,
                padding: "6px 12px",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              {item.icon}
              <Text
                style={{
                  fontSize: 12,
                  color: item.color,
                  fontWeight: 500,
                }}
              >
                {item.text}
              </Text>
            </div>
          ) : null
        )}
      </Space>
    </div>
  );
};

export default QuizMetaInfo;
