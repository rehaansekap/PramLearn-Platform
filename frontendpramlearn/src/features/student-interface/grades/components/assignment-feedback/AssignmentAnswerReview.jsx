import React from "react";
import { Divider, Typography } from "antd";
import AssignmentAnswerItem from "./AssignmentAnswerItem";

const { Text } = Typography;

const AssignmentAnswerReview = ({ answers }) =>
  answers && answers.length > 0 ? (
    <>
      <Divider orientation="left">
        <Text strong>Review Jawaban ({answers.length} soal)</Text>
      </Divider>
      <div style={{ marginBottom: 24 }}>
        {answers.map((answer, idx) => (
          <AssignmentAnswerItem
            answer={answer}
            index={idx}
            key={answer.id || idx}
          />
        ))}
      </div>
    </>
  ) : null;

export default AssignmentAnswerReview;
