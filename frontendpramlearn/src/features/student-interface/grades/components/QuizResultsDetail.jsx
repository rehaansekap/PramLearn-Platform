import React, { useState, useEffect } from "react";
import {
  Modal,
  Card,
  Typography,
  Space,
  Tag,
  Divider,
  List,
  Progress,
  Button,
  Tooltip,
  Row,
  Col,
  Statistic,
  Alert,
  Spin,
} from "antd";
import {
  TrophyOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  QuestionCircleOutlined,
  BookOutlined,
  DownloadOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import api from "../../../../api";
import dayjs from "dayjs";

const { Title, Text, Paragraph } = Typography;

const QuizResultsDetail = ({
  visible,
  onClose,
  attemptId,
  quizTitle,
  onDownloadReport,
}) => {
  const [quizReview, setQuizReview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch quiz review details
  useEffect(() => {
    if (visible && attemptId) {
      fetchQuizReview();
    }
  }, [visible, attemptId]);

  const fetchQuizReview = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(
        `student/quiz-attempt/${attemptId}/review/`
      );
      console.log("Quiz review response:", response.data);
      setQuizReview(response.data);
    } catch (err) {
      setError(err);
      console.error("Error fetching quiz review:", err);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "#52c41a";
    if (score >= 60) return "#faad14";
    return "#ff4d4f";
  };

  const getGradeLetter = (score) => {
    if (score >= 90) return "A";
    if (score >= 80) return "B";
    if (score >= 70) return "C";
    if (score >= 60) return "D";
    return "F";
  };

  const renderQuestionReview = (question, index) => {
    const isCorrect = question.is_correct;
    const userAnswer = question.selected_answer;
    const correctAnswer = question.correct_answer;

    return (
      <Card
        key={question.id}
        size="small"
        style={{
          marginBottom: 16,
          borderLeft: `4px solid ${isCorrect ? "#52c41a" : "#ff4d4f"}`,
          backgroundColor: isCorrect ? "#f6ffed" : "#fff2f0",
        }}
      >
        <div style={{ marginBottom: 12 }}>
          <Space>
            <Tag color={isCorrect ? "success" : "error"}>
              Question {index + 1}
            </Tag>
            {isCorrect ? (
              <CheckCircleOutlined style={{ color: "#52c41a", fontSize: 16 }} />
            ) : (
              <CloseCircleOutlined style={{ color: "#ff4d4f", fontSize: 16 }} />
            )}
            <Text type="secondary">
              {question.points || 1}{" "}
              {question.points === 1 ? "point" : "points"}
            </Text>
          </Space>
          <Title level={5} style={{ margin: "8px 0" }}>
            {question.question_text}
          </Title>
        </div>

        <Space direction="vertical" style={{ width: "100%" }}>
          {/* User's Answer */}
          <div>
            <Text strong>Your Answer: </Text>
            <Tag color={isCorrect ? "success" : "error"}>
              {userAnswer}. {question.selected_answer_text}
            </Tag>
          </div>

          {/* Correct Answer (if wrong) */}
          {!isCorrect && (
            <div>
              <Text strong>Correct Answer: </Text>
              <Tag color="success">
                {correctAnswer}. {question.correct_answer_text}
              </Tag>
            </div>
          )}

          {/* All Options */}
          <div>
            <Text strong>All Options:</Text>
            <div style={{ marginTop: 8 }}>
              {["A", "B", "C", "D"].map((option) => {
                const optionText = question[`choice_${option.toLowerCase()}`];
                if (!optionText) return null;

                const isUserChoice = userAnswer === option;
                const isCorrectChoice = correctAnswer === option;

                return (
                  <div
                    key={option}
                    style={{
                      padding: "6px 12px",
                      margin: "4px 0",
                      borderRadius: 6,
                      backgroundColor: isCorrectChoice
                        ? "#f6ffed"
                        : isUserChoice
                        ? "#fff2f0"
                        : "#fafafa",
                      border: `1px solid ${
                        isCorrectChoice
                          ? "#b7eb8f"
                          : isUserChoice
                          ? "#ffccc7"
                          : "#d9d9d9"
                      }`,
                    }}
                  >
                    <Space>
                      <Text strong>{option}.</Text>
                      <Text>{optionText}</Text>
                      {isCorrectChoice && (
                        <CheckCircleOutlined style={{ color: "#52c41a" }} />
                      )}
                      {isUserChoice && !isCorrectChoice && (
                        <CloseCircleOutlined style={{ color: "#ff4d4f" }} />
                      )}
                    </Space>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Explanation */}
          {question.explanation && (
            <div>
              <Text strong>Explanation: </Text>
              <Paragraph style={{ margin: "4px 0" }}>
                {question.explanation}
              </Paragraph>
            </div>
          )}
        </Space>
      </Card>
    );
  };

  if (loading) {
    return (
      <Modal
        title="Quiz Review"
        open={visible}
        onCancel={onClose}
        footer={null}
        width={900}
        style={{ top: 20 }}
      >
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <Spin size="large" />
          <p style={{ marginTop: 16, color: "#666" }}>Loading quiz review...</p>
        </div>
      </Modal>
    );
  }

  if (error) {
    return (
      <Modal
        title="Quiz Review"
        open={visible}
        onCancel={onClose}
        footer={null}
        width={900}
        style={{ top: 20 }}
      >
        <Alert
          message="Failed to load quiz review"
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
          <BookOutlined />
          <span>Quiz Review: {quizTitle}</span>
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
              onClick={() => onDownloadReport(attemptId)}
            >
              Download Report
            </Button>
          )}
        </Space>
      }
      width={900}
      style={{ top: 20 }}
    >
      {quizReview && (
        <div>
          {/* Quiz Result Summary */}
          <Card style={{ marginBottom: 24, borderRadius: 12 }}>
            <Row gutter={16}>
              <Col xs={24} sm={8}>
                <div style={{ textAlign: "center" }}>
                  <TrophyOutlined
                    style={{
                      fontSize: 48,
                      color: getScoreColor(quizReview.score),
                      marginBottom: 8,
                    }}
                  />
                  <Title
                    level={2}
                    style={{
                      margin: 0,
                      color: getScoreColor(quizReview.score),
                    }}
                  >
                    {quizReview.score.toFixed(1)}
                  </Title>
                  <Tag
                    color={getScoreColor(quizReview.score)}
                    style={{ fontSize: 14, padding: "4px 12px" }}
                  >
                    Grade: {getGradeLetter(quizReview.score)}
                  </Tag>
                </div>
              </Col>

              <Col xs={24} sm={8}>
                <Space direction="vertical" style={{ width: "100%" }}>
                  <Statistic
                    title="Correct Answers"
                    value={quizReview.correct_answers}
                    suffix={`/ ${quizReview.total_questions}`}
                    valueStyle={{ color: "#52c41a" }}
                  />
                  <Progress
                    percent={Math.round(
                      (quizReview.correct_answers /
                        quizReview.total_questions) *
                        100
                    )}
                    strokeColor="#52c41a"
                    size="small"
                  />
                </Space>
              </Col>

              <Col xs={24} sm={8}>
                <Space direction="vertical" style={{ width: "100%" }}>
                  <div>
                    <Text type="secondary">Time Taken:</Text>
                    <br />
                    <Space>
                      <ClockCircleOutlined />
                      <Text strong>{quizReview.time_taken} minutes</Text>
                    </Space>
                  </div>
                  <div>
                    <Text type="secondary">Completed:</Text>
                    <br />
                    <Text>
                      {dayjs(quizReview.submitted_at).format(
                        "DD MMM YYYY, HH:mm"
                      )}
                    </Text>
                  </div>
                </Space>
              </Col>
            </Row>
          </Card>

          {/* Performance Summary */}
          <Card
            title="Performance Summary"
            style={{ marginBottom: 24, borderRadius: 12 }}
          >
            <Row gutter={16}>
              <Col xs={12} sm={6}>
                <Statistic
                  title="Score"
                  value={quizReview.score}
                  suffix="/ 100"
                  precision={1}
                  valueStyle={{ color: getScoreColor(quizReview.score) }}
                />
              </Col>
              <Col xs={12} sm={6}>
                <Statistic
                  title="Accuracy"
                  value={Math.round(
                    (quizReview.correct_answers / quizReview.total_questions) *
                      100
                  )}
                  suffix="%"
                  valueStyle={{ color: "#1677ff" }}
                />
              </Col>
              <Col xs={12} sm={6}>
                <Statistic
                  title="Rank"
                  value={quizReview.rank || "-"}
                  suffix={
                    quizReview.total_participants
                      ? `/ ${quizReview.total_participants}`
                      : ""
                  }
                  valueStyle={{ color: "#722ed1" }}
                />
              </Col>
              <Col xs={12} sm={6}>
                <Statistic
                  title="Class Average"
                  value={quizReview.class_average || 0}
                  precision={1}
                  valueStyle={{ color: "#fa8c16" }}
                />
              </Col>
            </Row>
          </Card>

          {/* Question-by-Question Review */}
          <Card
            title={
              <Space>
                <QuestionCircleOutlined />
                <span>Question Review</span>
                <Tag color="blue">
                  {quizReview.correct_answers} correct,{" "}
                  {quizReview.total_questions - quizReview.correct_answers}{" "}
                  incorrect
                </Tag>
              </Space>
            }
            style={{ borderRadius: 12 }}
          >
            <div style={{ maxHeight: 600, overflowY: "auto" }}>
              {quizReview.questions && quizReview.questions.length > 0 ? (
                quizReview.questions.map((question, index) =>
                  renderQuestionReview(question, index)
                )
              ) : (
                <Empty description="No question details available" />
              )}
            </div>
          </Card>
        </div>
      )}
    </Modal>
  );
};

export default QuizResultsDetail;
