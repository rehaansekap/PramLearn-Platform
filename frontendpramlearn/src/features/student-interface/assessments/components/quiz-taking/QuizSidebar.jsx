import React from "react";
import { Typography, Button, Tag, Tooltip } from "antd";
import { FlagOutlined } from "@ant-design/icons";

const { Title } = Typography;

const QuizSidebar = ({
  questions,
  answers,
  flaggedQuestions,
  currentQuestionIndex,
  onQuestionSelect,
  onToggleFlag,
  collapsed,
}) => (
  <div style={{ padding: 16 }}>
    <Title level={5} style={{ marginBottom: 16, textAlign: "center" }}>
      Navigasi Soal
    </Title>
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 8,
        justifyContent: "center",
      }}
    >
      {questions.map((q, idx) => (
        <Tooltip
          key={q.id}
          title={
            flaggedQuestions.has(q.id)
              ? "Soal ditandai"
              : answers[q.id]
              ? "Sudah dijawab"
              : "Belum dijawab"
          }
        >
          <Button
            type={currentQuestionIndex === idx ? "primary" : "default"}
            shape="circle"
            size="small"
            style={{
              borderColor: flaggedQuestions.has(q.id) ? "#faad14" : undefined,
              background: flaggedQuestions.has(q.id)
                ? "#fffbe6"
                : answers[q.id]
                ? "#e6fffb"
                : undefined,
              color: flaggedQuestions.has(q.id) ? "#faad14" : undefined,
              fontWeight: 600,
            }}
            onClick={() => onQuestionSelect(idx)}
          >
            {idx + 1}
            {flaggedQuestions.has(q.id) && (
              <FlagOutlined style={{ fontSize: 10, marginLeft: 2 }} />
            )}
          </Button>
        </Tooltip>
      ))}
    </div>
    <div style={{ marginTop: 24, textAlign: "center" }}>
      <Tag color="blue" style={{ fontSize: 12 }}>
        Klik nomor untuk lompat ke soal
      </Tag>
    </div>
  </div>
);

export default QuizSidebar;
