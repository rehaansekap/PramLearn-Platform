import React from "react";
import { Alert, Typography } from "antd";
import { StarOutlined, CommentOutlined } from "@ant-design/icons";

const { Text } = Typography;

const AssignmentFeedbackAlert = ({ teacher_feedback }) => (
  <Alert
    message="Feedback Keseluruhan"
    description={
      teacher_feedback && teacher_feedback !== "No feedback available" ? (
        teacher_feedback
      ) : (
        <div>
          <Text type="secondary" italic>
            Belum ada feedback khusus dari guru untuk assignment ini.
          </Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            Anda dapat melihat detail penilaian di bawah.
          </Text>
        </div>
      )
    }
    type={
      teacher_feedback && teacher_feedback !== "No feedback available"
        ? "info"
        : "warning"
    }
    showIcon
    icon={
      teacher_feedback && teacher_feedback !== "No feedback available" ? (
        <StarOutlined />
      ) : (
        <CommentOutlined />
      )
    }
    style={{ marginBottom: 24, borderRadius: 8 }}
  />
);

export default AssignmentFeedbackAlert;
