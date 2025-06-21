import React from "react";
import { Card, Result, Tag, Typography, Space, Progress } from "antd";
import { TrophyOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const SubmissionResultCard = ({
  submission,
  submissionDetails,
  assignment,
  isMobile,
  getGradeColor,
  getGradeText,
}) => {
  if (!submission || submission.grade === null) return null;

  return (
    <Card
      style={{
        marginBottom: 32,
        borderRadius: 16,
        background: `linear-gradient(135deg, ${getGradeColor(
          submission.grade
        )}15, #fff)`,
        border: `2px solid ${getGradeColor(submission.grade)}`,
        boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
      }}
    >
      <Result
        icon={
          <TrophyOutlined
            style={{
              color: getGradeColor(submission.grade),
              fontSize: isMobile ? 56 : 72,
            }}
          />
        }
        title={
          <Space direction="vertical" size="small">
            <Title
              level={2}
              style={{
                margin: 0,
                color: getGradeColor(submission.grade),
                fontSize: isMobile ? 24 : 32,
              }}
            >
              Nilai Anda: {submission.grade.toFixed(1)}/100
            </Title>
            <Tag
              color={getGradeColor(submission.grade)}
              style={{
                fontSize: isMobile ? 12 : 14,
                padding: "4px 12px",
                fontWeight: "bold",
              }}
            >
              Grade: {getGradeText(submission.grade)}
            </Tag>
          </Space>
        }
        subTitle={
          <div style={{ marginTop: 16 }}>
            <Text style={{ fontSize: 16, color: "#666", marginRight: 12 }}>
              {submissionDetails?.correct_answers || 0} dari{" "}
              {submissionDetails?.total_questions ||
                assignment?.questions?.length ||
                0}{" "}
              soal benar
            </Text>
            <Progress
              percent={submission.grade.toFixed(1)}
              strokeColor={getGradeColor(submission.grade.toFixed(1))}
              style={{
                maxWidth: 300,
                margin: "12px auto 0",
              }}
              strokeWidth={8}
            />
          </div>
        }
      />
    </Card>
  );
};

export default SubmissionResultCard;
