import React, { useState, useEffect } from "react";
import {
  Modal,
  Card,
  Typography,
  Space,
  Tag,
  Divider,
  Progress,
  Button,
  Row,
  Col,
  Statistic,
  Alert,
  Spin,
  Rate,
  Timeline,
  Upload,
  message,
} from "antd";
import {
  TrophyOutlined,
  FileTextOutlined,
  DownloadOutlined,
  ClockCircleOutlined,
  UserOutlined,
  StarOutlined,
  MessageOutlined,
  PaperClipOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import api from "../../../../api";
import dayjs from "dayjs";

const { Title, Text, Paragraph } = Typography;

const AssignmentFeedback = ({
  visible,
  onClose,
  submissionId,
  assignmentTitle,
  onDownloadReport,
}) => {
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch assignment feedback
  useEffect(() => {
    if (visible && submissionId) {
      fetchFeedback();
    }
  }, [visible, submissionId]);

  const fetchFeedback = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(
        `student/assignment-submission/${submissionId}/feedback/`
      );
      console.log("Assignment feedback response:", response.data);
      setFeedback(response.data);
    } catch (err) {
      setError(err);
      console.error("Error fetching assignment feedback:", err);
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (grade) => {
    if (grade >= 80) return "#52c41a";
    if (grade >= 60) return "#faad14";
    return "#ff4d4f";
  };

  const getGradeLetter = (grade) => {
    if (grade >= 90) return "A";
    if (grade >= 80) return "B";
    if (grade >= 70) return "C";
    if (grade >= 60) return "D";
    return "F";
  };

  const renderRubricItem = (item) => {
    const percentage =
      item.points_earned && item.max_points
        ? (item.points_earned / item.max_points) * 100
        : 0;

    return (
      <Card
        key={item.id}
        size="small"
        style={{ marginBottom: 16 }}
        title={
          <Space>
            <Text strong>{item.criteria}</Text>
            <Tag
              color={
                percentage >= 80
                  ? "success"
                  : percentage >= 60
                  ? "warning"
                  : "error"
              }
            >
              {item.points_earned || 0} / {item.max_points || 0} points
            </Tag>
          </Space>
        }
      >
        <div style={{ marginBottom: 12 }}>
          <Progress
            percent={percentage}
            strokeColor={
              percentage >= 80
                ? "#52c41a"
                : percentage >= 60
                ? "#faad14"
                : "#ff4d4f"
            }
            showInfo={true}
            format={() => `${percentage.toFixed(1)}%`}
          />
        </div>
        {item.description && (
          <Paragraph style={{ margin: "8px 0", color: "#666" }}>
            <Text strong>Criteria: </Text>
            {item.description}
          </Paragraph>
        )}
        {item.teacher_comment && (
          <div
            style={{
              padding: 12,
              backgroundColor: "#f6faff",
              borderRadius: 6,
              borderLeft: "3px solid #1677ff",
            }}
          >
            <Text type="secondary">Teacher Comment:</Text>
            <Paragraph style={{ margin: "4px 0 0 0" }}>
              "{item.teacher_comment}"
            </Paragraph>
          </div>
        )}
      </Card>
    );
  };

  const renderAnswerReview = (answer, index) => {
    return (
      <Card
        key={answer.id}
        size="small"
        style={{ marginBottom: 16 }}
        title={
          <Space>
            <Text strong>Question {index + 1}</Text>
            {answer.points_earned !== null && (
              <Tag color={answer.points_earned > 0 ? "success" : "error"}>
                {answer.points_earned} / {answer.max_points || 1} points
              </Tag>
            )}
          </Space>
        }
      >
        <div style={{ marginBottom: 12 }}>
          <Title level={5} style={{ margin: "8px 0" }}>
            {answer.question_text}
          </Title>
        </div>

        <Space direction="vertical" style={{ width: "100%" }}>
          {/* Student's Answer */}
          <div>
            <Text strong>Your Answer:</Text>
            <div
              style={{
                padding: 12,
                backgroundColor: "#fafafa",
                borderRadius: 6,
                marginTop: 8,
                border: "1px solid #d9d9d9",
              }}
            >
              {answer.answer_type === "text" ? (
                <Paragraph style={{ margin: 0 }}>
                  {answer.answer_text || "No answer provided"}
                </Paragraph>
              ) : answer.answer_type === "choice" ? (
                <Text>
                  {answer.selected_choice}. {answer.selected_choice_text}
                </Text>
              ) : (
                <Text type="secondary">File submission</Text>
              )}
            </div>
          </div>

          {/* Teacher Feedback */}
          {answer.teacher_feedback && (
            <div>
              <Text strong>Teacher Feedback:</Text>
              <div
                style={{
                  padding: 12,
                  backgroundColor: "#f6faff",
                  borderRadius: 6,
                  marginTop: 8,
                  borderLeft: "3px solid #1677ff",
                }}
              >
                <Paragraph style={{ margin: 0 }}>
                  "{answer.teacher_feedback}"
                </Paragraph>
              </div>
            </div>
          )}

          {/* Correct Answer (for multiple choice) */}
          {answer.correct_answer &&
            answer.answer_type === "choice" &&
            answer.selected_choice !== answer.correct_answer && (
              <div>
                <Text strong>Correct Answer:</Text>
                <Tag color="success" style={{ marginLeft: 8 }}>
                  {answer.correct_answer}. {answer.correct_answer_text}
                </Tag>
              </div>
            )}
        </Space>
      </Card>
    );
  };

  if (loading) {
    return (
      <Modal
        title="Assignment Feedback"
        open={visible}
        onCancel={onClose}
        footer={null}
        width={900}
        style={{ top: 20 }}
      >
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <Spin size="large" />
          <p style={{ marginTop: 16, color: "#666" }}>
            Loading assignment feedback...
          </p>
        </div>
      </Modal>
    );
  }

  if (error) {
    return (
      <Modal
        title="Assignment Feedback"
        open={visible}
        onCancel={onClose}
        footer={null}
        width={900}
        style={{ top: 20 }}
      >
        <Alert
          message="Failed to load assignment feedback"
          description={error.message}
          type="error"
          showIcon
        />
      </Modal>
    );
  }

  return (
    <Modal
      title={
        <Space>
          <FileTextOutlined />
          <span>Assignment Feedback: {assignmentTitle}</span>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      footer={
        <Space>
          <Button onClick={onClose}>Close</Button>
          {onDownloadReport && (
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={() => onDownloadReport(submissionId)}
            >
              Download Report
            </Button>
          )}
        </Space>
      }
      width={900}
      style={{ top: 20 }}
    >
      {feedback && (
        <div>
          {/* Grade Summary */}
          <Card style={{ marginBottom: 24, borderRadius: 12 }}>
            <Row gutter={16}>
              <Col xs={24} sm={8}>
                <div style={{ textAlign: "center" }}>
                  <TrophyOutlined
                    style={{
                      fontSize: 48,
                      color: getGradeColor(feedback.grade),
                      marginBottom: 8,
                    }}
                  />
                  <Title
                    level={2}
                    style={{
                      margin: 0,
                      color: getGradeColor(feedback.grade),
                    }}
                  >
                    {feedback.grade}/100
                  </Title>
                  <Tag
                    color={getGradeColor(feedback.grade)}
                    style={{ fontSize: 14, padding: "4px 12px" }}
                  >
                    Grade: {getGradeLetter(feedback.grade)}
                  </Tag>
                </div>
              </Col>

              <Col xs={24} sm={8}>
                <Space direction="vertical" style={{ width: "100%" }}>
                  <div>
                    <Text type="secondary">Submitted:</Text>
                    <br />
                    <Space>
                      <ClockCircleOutlined />
                      <Text>
                        {dayjs(feedback.submission_date).format(
                          "DD MMM YYYY, HH:mm"
                        )}
                      </Text>
                    </Space>
                  </div>
                  <div>
                    <Text type="secondary">Graded:</Text>
                    <br />
                    <Space>
                      <UserOutlined />
                      <Text>
                        {dayjs(feedback.graded_at).format("DD MMM YYYY, HH:mm")}
                      </Text>
                    </Space>
                  </div>
                </Space>
              </Col>

              <Col xs={24} sm={8}>
                <Space direction="vertical" style={{ width: "100%" }}>
                  <div>
                    <Text type="secondary">Teacher:</Text>
                    <br />
                    <Text strong>{feedback.graded_by || "Unknown"}</Text>
                  </div>
                  <div>
                    <Text type="secondary">Overall Rating:</Text>
                    <br />
                    <Rate
                      disabled
                      value={Math.round(feedback.grade / 20)}
                      style={{ fontSize: 16 }}
                    />
                  </div>
                </Space>
              </Col>
            </Row>
          </Card>

          {/* Overall Teacher Feedback */}
          {feedback.teacher_feedback && (
            <Card
              title={
                <Space>
                  <MessageOutlined />
                  <span>Teacher's Overall Feedback</span>
                </Space>
              }
              style={{ marginBottom: 24, borderRadius: 12 }}
            >
              <div
                style={{
                  padding: 16,
                  backgroundColor: "#f6faff",
                  borderRadius: 8,
                  borderLeft: "4px solid #1677ff",
                }}
              >
                <Paragraph style={{ fontSize: 16, margin: 0 }}>
                  "{feedback.teacher_feedback}"
                </Paragraph>
              </div>
            </Card>
          )}

          {/* Grading Rubric */}
          {feedback.rubric_items && feedback.rubric_items.length > 0 && (
            <Card
              title={
                <Space>
                  <StarOutlined />
                  <span>Grading Rubric</span>
                </Space>
              }
              style={{ marginBottom: 24, borderRadius: 12 }}
            >
              {feedback.rubric_items.map(renderRubricItem)}
            </Card>
          )}

          {/* Question-by-Question Feedback */}
          {feedback.answers && feedback.answers.length > 0 && (
            <Card
              title={
                <Space>
                  <FileTextOutlined />
                  <span>Question Feedback</span>
                </Space>
              }
              style={{ marginBottom: 24, borderRadius: 12 }}
            >
              <div style={{ maxHeight: 600, overflowY: "auto" }}>
                {feedback.answers.map((answer, index) =>
                  renderAnswerReview(answer, index)
                )}
              </div>
            </Card>
          )}

          {/* Submitted Files */}
          {feedback.submitted_files && feedback.submitted_files.length > 0 && (
            <Card
              title={
                <Space>
                  <PaperClipOutlined />
                  <span>Submitted Files</span>
                </Space>
              }
              style={{ marginBottom: 24, borderRadius: 12 }}
            >
              <Space direction="vertical" style={{ width: "100%" }}>
                {feedback.submitted_files.map((file, index) => (
                  <Card key={index} size="small" style={{ marginBottom: 8 }}>
                    <Row gutter={16} align="middle">
                      <Col flex="auto">
                        <Space>
                          <PaperClipOutlined />
                          <div>
                            <Text strong>{file.name}</Text>
                            <br />
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              {file.size} • Uploaded{" "}
                              {dayjs(file.uploaded_at).format(
                                "DD MMM YYYY, HH:mm"
                              )}
                            </Text>
                          </div>
                        </Space>
                      </Col>
                      <Col>
                        <Space>
                          <Button
                            size="small"
                            icon={<EyeOutlined />}
                            onClick={() => window.open(file.url, "_blank")}
                          >
                            View
                          </Button>
                          <Button
                            size="small"
                            icon={<DownloadOutlined />}
                            onClick={() => {
                              const link = document.createElement("a");
                              link.href = file.url;
                              link.download = file.name;
                              link.click();
                            }}
                          >
                            Download
                          </Button>
                        </Space>
                      </Col>
                    </Row>
                  </Card>
                ))}
              </Space>
            </Card>
          )}

          {/* Improvement Suggestions */}
          {feedback.improvement_suggestions &&
            feedback.improvement_suggestions.length > 0 && (
              <Card
                title={
                  <Space>
                    <StarOutlined />
                    <span>Suggestions for Improvement</span>
                  </Space>
                }
                style={{ borderRadius: 12 }}
              >
                <Timeline>
                  {feedback.improvement_suggestions.map((suggestion, index) => (
                    <Timeline.Item
                      key={index}
                      color={
                        suggestion.priority === "high"
                          ? "red"
                          : suggestion.priority === "medium"
                          ? "orange"
                          : "blue"
                      }
                    >
                      <div>
                        <Text strong>{suggestion.title}</Text>
                        <Tag
                          color={
                            suggestion.priority === "high"
                              ? "red"
                              : suggestion.priority === "medium"
                              ? "orange"
                              : "blue"
                          }
                          style={{ marginLeft: 8 }}
                        >
                          {suggestion.priority} priority
                        </Tag>
                        <Paragraph style={{ margin: "8px 0 0 0" }}>
                          {suggestion.description}
                        </Paragraph>
                      </div>
                    </Timeline.Item>
                  ))}
                </Timeline>
              </Card>
            )}
        </div>
      )}
    </Modal>
  );
};

export default AssignmentFeedback;
