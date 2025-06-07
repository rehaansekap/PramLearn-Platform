import React, { useState, useEffect } from "react";
import {
  Card,
  Form,
  Input,
  Radio,
  Button,
  Typography,
  Space,
  Divider,
  Alert,
  Tag,
  Progress,
  Modal,
  Spin,
  message,
  Affix,
} from "antd";
import {
  SaveOutlined,
  SendOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  ArrowLeftOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import StudentFileUpload from "./StudentFileUpload";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const AssignmentSubmissionForm = ({
  assignment,
  questions = [], // Default to empty array
  answers = {}, // Default to empty object
  uploadedFiles = [], // Default to empty array
  submitting = false,
  draftSaving = false,
  isDraftDirty = false,
  onAnswerChange,
  onFileChange,
  onFileRemove,
  onSaveDraft,
  onSubmit,
  onBack,
  getTimeRemaining,
}) => {
  const [form] = Form.useForm();
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);

  // Pastikan questions adalah array
  const safeQuestions = Array.isArray(questions) ? questions : [];
  const safeAnswers = answers || {};
  const safeUploadedFiles = Array.isArray(uploadedFiles) ? uploadedFiles : [];

  // Auto-save draft periodically
  useEffect(() => {
    if (!isDraftDirty || !assignment?.id) return;

    const autoSaveTimer = setTimeout(() => {
      handleSaveDraft();
    }, 30000); // 30 seconds

    return () => clearTimeout(autoSaveTimer);
  }, [isDraftDirty, safeAnswers, safeUploadedFiles, assignment?.id]);

  // Update form values when answers change
  useEffect(() => {
    if (Object.keys(safeAnswers).length > 0) {
      form.setFieldsValue(safeAnswers);
    }
  }, [safeAnswers, form]);

  const handleSaveDraft = async () => {
    if (onSaveDraft && assignment?.id) {
      await onSaveDraft(assignment.id, {
        answers: safeAnswers,
        files: safeUploadedFiles,
      });
    }
  };

  const validateSubmission = () => {
    const errors = [];

    // Check if all required questions are answered
    safeQuestions.forEach((question) => {
      if (question.required && !safeAnswers[question.id]) {
        errors.push(
          `Question ${question.order || question.id}: "${
            question.text
          }" is required`
        );
      }
    });

    // Check file requirements (if any)
    if (assignment?.requires_file_upload && safeUploadedFiles.length === 0) {
      errors.push("At least one file must be uploaded");
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSubmit = () => {
    if (!validateSubmission()) {
      message.error("Please complete all required fields");
      return;
    }

    setShowSubmitModal(true);
  };

  const confirmSubmit = async () => {
    setShowSubmitModal(false);
    if (onSubmit && assignment?.id) {
      const success = await onSubmit(assignment.id, {
        answers: safeAnswers,
        files: safeUploadedFiles,
      });
      if (success) {
        message.success("Assignment submitted successfully!");
      }
    }
  };

  // Early return if no assignment
  if (!assignment) {
    return (
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: 16 }}>
        <Alert
          message="Assignment not found"
          description="Please select an assignment to continue."
          type="warning"
          showIcon
        />
      </div>
    );
  }

  const timeRemaining = getTimeRemaining
    ? getTimeRemaining(assignment.due_date)
    : { expired: false, text: "N/A", color: "default" };
  const isOverdue = timeRemaining.expired;
  const canSubmit = !isOverdue && Object.keys(safeAnswers).length > 0;

  // Group questions by type with safety checks
  const multipleChoiceQuestions = safeQuestions.filter(
    (q) =>
      q.question_type === "multiple_choice" ||
      (q.choice_a && q.choice_a.trim() !== "")
  );
  const essayQuestions = safeQuestions.filter(
    (q) =>
      q.question_type === "essay" || !q.choice_a || q.choice_a.trim() === ""
  );

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: 16 }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={onBack}
          style={{ marginBottom: 16 }}
        >
          Back to Assignments
        </Button>

        <Card>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              flexWrap: "wrap",
              gap: 16,
            }}
          >
            <div style={{ flex: 1 }}>
              <Title level={2} style={{ color: "#11418b", margin: 0 }}>
                {assignment.title}
              </Title>
              <Paragraph style={{ margin: "8px 0", fontSize: 16 }}>
                {assignment.description}
              </Paragraph>

              <Space wrap>
                <Tag icon={<ClockCircleOutlined />} color={timeRemaining.color}>
                  {timeRemaining.text}
                </Tag>
                <Tag icon={<FileTextOutlined />} color="blue">
                  {safeQuestions.length} Questions
                </Tag>
                <Tag color="purple">
                  Due: {dayjs(assignment.due_date).format("DD MMM YYYY, HH:mm")}
                </Tag>
              </Space>
            </div>

            {/* Progress Info */}
            <div style={{ textAlign: "right", minWidth: 200 }}>
              <Text type="secondary">Progress</Text>
              <Progress
                percent={
                  safeQuestions.length > 0
                    ? Math.round(
                        (Object.keys(safeAnswers).length /
                          safeQuestions.length) *
                          100
                      )
                    : 0
                }
                strokeColor="#11418b"
                style={{ marginBottom: 8 }}
              />
              <Text type="secondary">
                {Object.keys(safeAnswers).length} of {safeQuestions.length}{" "}
                answered
              </Text>
            </div>
          </div>
        </Card>
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <Alert
          message="Please complete the following:"
          description={
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          }
          type="warning"
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}

      {/* Overdue Alert */}
      {isOverdue && (
        <Alert
          message="Assignment Overdue"
          description="This assignment is past its due date. Contact your teacher if you need to submit."
          type="error"
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}

      {/* No Questions Alert */}
      {safeQuestions.length === 0 && (
        <Alert
          message="No Questions Available"
          description="This assignment doesn't have any questions yet. Please check back later."
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}

      <Form form={form} layout="vertical">
        {/* Multiple Choice Questions */}
        {multipleChoiceQuestions.length > 0 && (
          <Card title="Multiple Choice Questions" style={{ marginBottom: 24 }}>
            {multipleChoiceQuestions.map((question, index) => (
              <div key={question.id} style={{ marginBottom: 32 }}>
                <div style={{ marginBottom: 16 }}>
                  <Space>
                    <Tag color="blue">Question {index + 1}</Tag>
                    {question.required && <Tag color="red">Required</Tag>}
                  </Space>
                  <Title level={4} style={{ margin: "8px 0" }}>
                    {question.text}
                  </Title>
                </div>

                <Radio.Group
                  value={safeAnswers[question.id]}
                  onChange={(e) =>
                    onAnswerChange &&
                    onAnswerChange(question.id, e.target.value)
                  }
                  style={{ width: "100%" }}
                  disabled={isOverdue}
                >
                  <Space direction="vertical" style={{ width: "100%" }}>
                    {question.choice_a && (
                      <Radio
                        value="A"
                        style={{ fontSize: 16, padding: "8px 0" }}
                      >
                        A. {question.choice_a}
                      </Radio>
                    )}
                    {question.choice_b && (
                      <Radio
                        value="B"
                        style={{ fontSize: 16, padding: "8px 0" }}
                      >
                        B. {question.choice_b}
                      </Radio>
                    )}
                    {question.choice_c && (
                      <Radio
                        value="C"
                        style={{ fontSize: 16, padding: "8px 0" }}
                      >
                        C. {question.choice_c}
                      </Radio>
                    )}
                    {question.choice_d && (
                      <Radio
                        value="D"
                        style={{ fontSize: 16, padding: "8px 0" }}
                      >
                        D. {question.choice_d}
                      </Radio>
                    )}
                  </Space>
                </Radio.Group>

                {index < multipleChoiceQuestions.length - 1 && <Divider />}
              </div>
            ))}
          </Card>
        )}

        {/* Essay Questions */}
        {essayQuestions.length > 0 && (
          <Card title="Essay Questions" style={{ marginBottom: 24 }}>
            {essayQuestions.map((question, index) => (
              <div key={question.id} style={{ marginBottom: 32 }}>
                <div style={{ marginBottom: 16 }}>
                  <Space>
                    <Tag color="green">Essay {index + 1}</Tag>
                    {question.required && <Tag color="red">Required</Tag>}
                  </Space>
                  <Title level={4} style={{ margin: "8px 0" }}>
                    {question.text}
                  </Title>
                </div>

                <TextArea
                  value={safeAnswers[question.id] || ""}
                  onChange={(e) =>
                    onAnswerChange &&
                    onAnswerChange(question.id, e.target.value)
                  }
                  placeholder="Type your answer here..."
                  rows={6}
                  showCount
                  maxLength={2000}
                  disabled={isOverdue}
                  style={{ fontSize: 14 }}
                />

                {index < essayQuestions.length - 1 && <Divider />}
              </div>
            ))}
          </Card>
        )}

        {/* File Upload */}
        <Card title="File Attachments" style={{ marginBottom: 24 }}>
          <StudentFileUpload
            fileList={safeUploadedFiles}
            onChange={onFileChange}
            onRemove={onFileRemove}
            disabled={isOverdue}
            maxFiles={5}
            maxSizePerFile={10}
          />
        </Card>
      </Form>

      {/* Sticky Action Bar */}
      <Affix offsetBottom={20}>
        <Card
          style={{
            textAlign: "center",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          }}
        >
          <Space size="large">
            <Button
              icon={<SaveOutlined />}
              loading={draftSaving}
              onClick={handleSaveDraft}
              disabled={!isDraftDirty || !assignment?.id}
            >
              {draftSaving ? "Saving..." : "Save Draft"}
            </Button>

            <Button
              type="primary"
              icon={<SendOutlined />}
              size="large"
              loading={submitting}
              onClick={handleSubmit}
              disabled={!canSubmit || submitting || safeQuestions.length === 0}
              style={{
                backgroundColor: "#11418b",
                borderColor: "#11418b",
                minWidth: 120,
              }}
            >
              {submitting ? "Submitting..." : "Submit Assignment"}
            </Button>
          </Space>

          {isDraftDirty && (
            <Text
              type="warning"
              style={{ display: "block", marginTop: 8, fontSize: 12 }}
            >
              You have unsaved changes
            </Text>
          )}
        </Card>
      </Affix>

      {/* Submit Confirmation Modal */}
      <Modal
        title="Submit Assignment"
        open={showSubmitModal}
        onOk={confirmSubmit}
        onCancel={() => setShowSubmitModal(false)}
        okText="Submit"
        okType="primary"
        okButtonProps={{
          style: { backgroundColor: "#11418b", borderColor: "#11418b" },
          loading: submitting,
        }}
      >
        <Space direction="vertical" style={{ width: "100%" }}>
          <Alert
            message="Are you sure you want to submit?"
            description="Once submitted, you cannot make changes to your answers."
            type="warning"
            showIcon
          />

          <div>
            <Text strong>Summary:</Text>
            <ul style={{ marginTop: 8, marginBottom: 0 }}>
              <li>
                Questions answered: {Object.keys(safeAnswers).length} of{" "}
                {safeQuestions.length}
              </li>
              <li>Files uploaded: {safeUploadedFiles.length}</li>
              <li>Time remaining: {timeRemaining.text}</li>
            </ul>
          </div>
        </Space>
      </Modal>
    </div>
  );
};

export default AssignmentSubmissionForm;
