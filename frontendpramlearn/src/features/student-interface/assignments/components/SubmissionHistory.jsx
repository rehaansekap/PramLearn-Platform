import React, { useState } from "react";
import {
  Card,
  List,
  Typography,
  Space,
  Tag,
  Button,
  Modal,
  Divider,
  Empty,
  Timeline,
  Rate,
  Progress,
  Tooltip,
} from "antd";
import {
  HistoryOutlined,
  TrophyOutlined,
  FileTextOutlined,
  DownloadOutlined,
  EyeOutlined,
  ClockCircleOutlined,
  UserOutlined,
  StarOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Title, Text, Paragraph } = Typography;

const SubmissionHistory = ({ submissions, assignment, onBack }) => {
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  const getGradeColor = (grade) => {
    if (grade >= 80) return "#52c41a"; // Green
    if (grade >= 60) return "#faad14"; // Orange
    return "#ff4d4f"; // Red
  };

  const getGradeText = (grade) => {
    if (grade >= 90) return "Excellent";
    if (grade >= 80) return "Good";
    if (grade >= 60) return "Fair";
    return "Needs Improvement";
  };

  const showSubmissionDetail = (submission) => {
    setSelectedSubmission(submission);
    setDetailModalVisible(true);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: 16 }}>
      {/* Header */}
      <Card style={{ marginBottom: 24 }}>
        <Space direction="vertical" style={{ width: "100%" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <Title level={2} style={{ color: "#11418b", margin: 0 }}>
                📊 Submission History
              </Title>
              <Text type="secondary" style={{ fontSize: 16 }}>
                {assignment.title}
              </Text>
            </div>
            <Button onClick={onBack}>Back to Assignment</Button>
          </div>

          <Space wrap>
            <Tag icon={<FileTextOutlined />} color="blue">
              {submissions.length} Submission
              {submissions.length !== 1 ? "s" : ""}
            </Tag>
            <Tag icon={<ClockCircleOutlined />} color="green">
              Due: {dayjs(assignment.due_date).format("DD MMM YYYY, HH:mm")}
            </Tag>
          </Space>
        </Space>
      </Card>

      {/* Submissions List */}
      {submissions.length === 0 ? (
        <Card>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="No submissions yet"
          />
        </Card>
      ) : (
        <Timeline mode="left" style={{ padding: "0 24px" }}>
          {submissions.map((submission, index) => (
            <Timeline.Item
              key={submission.id}
              dot={
                submission.grade !== null ? (
                  <TrophyOutlined
                    style={{ color: getGradeColor(submission.grade) }}
                  />
                ) : (
                  <ClockCircleOutlined style={{ color: "#1890ff" }} />
                )
              }
              color={
                submission.grade !== null
                  ? getGradeColor(submission.grade)
                  : "blue"
              }
            >
              <Card
                hoverable
                style={{
                  marginBottom: 16,
                  border:
                    index === 0 ? "2px solid #1890ff" : "1px solid #d9d9d9",
                }}
                title={
                  <Space>
                    <Text strong>Submission #{submissions.length - index}</Text>
                    {index === 0 && <Tag color="blue">Latest</Tag>}
                    {submission.grade !== null && (
                      <Tag color={getGradeColor(submission.grade)}>Graded</Tag>
                    )}
                  </Space>
                }
                extra={
                  <Button
                    type="link"
                    icon={<EyeOutlined />}
                    onClick={() => showSubmissionDetail(submission)}
                  >
                    View Details
                  </Button>
                }
              >
                <Space direction="vertical" style={{ width: "100%" }}>
                  {/* Submission Info */}
                  <div>
                    <Space wrap>
                      <Tag icon={<ClockCircleOutlined />}>
                        Submitted:{" "}
                        {dayjs(submission.submission_date).format(
                          "DD MMM YYYY, HH:mm"
                        )}
                      </Tag>
                      <Tag icon={<FileTextOutlined />}>
                        {submission.answers?.length || 0} Answers
                      </Tag>
                      {submission.uploaded_files?.length > 0 && (
                        <Tag icon={<DownloadOutlined />}>
                          {submission.uploaded_files.length} Files
                        </Tag>
                      )}
                    </Space>
                  </div>

                  {/* Grade Display */}
                  {submission.grade !== null ? (
                    <div
                      style={{
                        padding: 16,
                        backgroundColor: `${getGradeColor(submission.grade)}10`,
                        borderRadius: 8,
                        border: `1px solid ${getGradeColor(
                          submission.grade
                        )}30`,
                      }}
                    >
                      <Space direction="vertical" style={{ width: "100%" }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <Space>
                            <TrophyOutlined
                              style={{ color: getGradeColor(submission.grade) }}
                            />
                            <Text strong style={{ fontSize: 18 }}>
                              Grade: {submission.grade}/100
                            </Text>
                          </Space>
                          <Tag
                            color={getGradeColor(submission.grade)}
                            style={{ fontSize: 14 }}
                          >
                            {getGradeText(submission.grade)}
                          </Tag>
                        </div>

                        <Progress
                          percent={submission.grade}
                          strokeColor={getGradeColor(submission.grade)}
                          showInfo={false}
                        />

                        {submission.teacher_feedback && (
                          <div>
                            <Text strong>Teacher Feedback:</Text>
                            <Paragraph
                              style={{
                                margin: "8px 0 0 0",
                                fontStyle: "italic",
                              }}
                            >
                              "{submission.teacher_feedback}"
                            </Paragraph>
                          </div>
                        )}

                        {submission.graded_at && (
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            Graded on:{" "}
                            {dayjs(submission.graded_at).format(
                              "DD MMM YYYY, HH:mm"
                            )}
                          </Text>
                        )}
                      </Space>
                    </div>
                  ) : (
                    <div
                      style={{
                        padding: 16,
                        backgroundColor: "#f6f6f6",
                        borderRadius: 8,
                        textAlign: "center",
                      }}
                    >
                      <Space direction="vertical">
                        <ClockCircleOutlined
                          style={{ fontSize: 24, color: "#1890ff" }}
                        />
                        <Text type="secondary">
                          Waiting for teacher to grade
                        </Text>
                      </Space>
                    </div>
                  )}
                </Space>
              </Card>
            </Timeline.Item>
          ))}
        </Timeline>
      )}

      {/* Submission Detail Modal */}
      <Modal
        title={`Submission Details - ${
          selectedSubmission
            ? dayjs(selectedSubmission.submission_date).format(
                "DD MMM YYYY, HH:mm"
              )
            : ""
        }`}
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={800}
        style={{ top: 20 }}
      >
        {selectedSubmission && (
          <div>
            {/* Grade Section */}
            {selectedSubmission.grade !== null && (
              <Card size="small" style={{ marginBottom: 16 }}>
                <div style={{ textAlign: "center" }}>
                  <Space direction="vertical" size="large">
                    <div>
                      <TrophyOutlined
                        style={{
                          fontSize: 48,
                          color: getGradeColor(selectedSubmission.grade),
                          marginBottom: 8,
                        }}
                      />
                      <Title
                        level={2}
                        style={{
                          margin: 0,
                          color: getGradeColor(selectedSubmission.grade),
                        }}
                      >
                        {selectedSubmission.grade}/100
                      </Title>
                      <Tag
                        color={getGradeColor(selectedSubmission.grade)}
                        style={{ fontSize: 14 }}
                      >
                        {getGradeText(selectedSubmission.grade)}
                      </Tag>
                    </div>

                    {selectedSubmission.teacher_feedback && (
                      <div style={{ textAlign: "left" }}>
                        <Text strong>Teacher Feedback:</Text>
                        <Card
                          size="small"
                          style={{ marginTop: 8, backgroundColor: "#fafafa" }}
                        >
                          <Paragraph style={{ margin: 0, fontStyle: "italic" }}>
                            "{selectedSubmission.teacher_feedback}"
                          </Paragraph>
                        </Card>
                      </div>
                    )}
                  </Space>
                </div>
              </Card>
            )}

            {/* Answers Section */}
            {selectedSubmission.answers &&
              selectedSubmission.answers.length > 0 && (
                <Card
                  size="small"
                  title="Your Answers"
                  style={{ marginBottom: 16 }}
                >
                  <List
                    dataSource={selectedSubmission.answers}
                    renderItem={(answer, index) => (
                      <List.Item>
                        <div style={{ width: "100%" }}>
                          <Text strong>Question {index + 1}:</Text>
                          <div
                            style={{
                              marginTop: 4,
                              padding: 8,
                              backgroundColor: "#f9f9f9",
                              borderRadius: 4,
                            }}
                          >
                            <Text>
                              {answer.answer_text || answer.selected_choice}
                            </Text>
                          </div>
                        </div>
                      </List.Item>
                    )}
                  />
                </Card>
              )}

            {/* Files Section */}
            {selectedSubmission.uploaded_files &&
              selectedSubmission.uploaded_files.length > 0 && (
                <Card size="small" title="Uploaded Files">
                  <List
                    dataSource={selectedSubmission.uploaded_files}
                    renderItem={(file) => (
                      <List.Item
                        actions={[
                          <Button
                            type="link"
                            icon={<DownloadOutlined />}
                            onClick={() => window.open(file.file_url, "_blank")}
                          >
                            Download
                          </Button>,
                        ]}
                      >
                        <List.Item.Meta
                          avatar={
                            <FileTextOutlined
                              style={{ fontSize: 20, color: "#1890ff" }}
                            />
                          }
                          title={file.file_name}
                          description={`Size: ${formatFileSize(
                            file.file_size || 0
                          )}`}
                        />
                      </List.Item>
                    )}
                  />
                </Card>
              )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SubmissionHistory;
