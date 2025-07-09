import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Button,
  DatePicker,
  Space,
  Card,
  Row,
  Col,
  Radio,
  Spin,
  message,
  Divider,
  Typography,
  Tooltip,
  Progress,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  LoadingOutlined,
  SaveOutlined,
  FileTextOutlined,
  BulbOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { TextArea } = Input;
const { Title, Text } = Typography;

const AssignmentFormModal = ({
  open,
  onClose,
  materialSlug,
  editingAssignment,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (open && editingAssignment) {
      setInitialLoading(true);

      const timer = setTimeout(() => {
        form.setFieldsValue({
          title: editingAssignment.title,
          description: editingAssignment.description,
          due_date: editingAssignment.due_date
            ? dayjs(editingAssignment.due_date)
            : null,
        });

        const questionsToLoad = editingAssignment.questions || [];
        setQuestions(
          questionsToLoad.map((q, index) => ({
            id: q.id || Date.now() + index,
            text: q.text || "",
            choice_a: q.choice_a || "",
            choice_b: q.choice_b || "",
            choice_c: q.choice_c || "",
            choice_d: q.choice_d || "",
            correct_choice: q.correct_choice || "A",
            explanation: q.explanation || "",
          }))
        );

        setInitialLoading(false);
      }, 500);

      return () => clearTimeout(timer);
    } else if (open) {
      form.resetFields();
      setQuestions([]);
      setCurrentStep(0);
    }
  }, [open, editingAssignment, form]);

  const addQuestion = () => {
    const newQuestion = {
      id: Date.now(),
      text: "",
      choice_a: "",
      choice_b: "",
      choice_c: "",
      choice_d: "",
      correct_choice: "A",
      explanation: "",
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (index, field, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      [field]: value,
    };
    setQuestions(updatedQuestions);
  };

  const removeQuestion = (index) => {
    const updatedQuestions = questions.filter((_, i) => i !== index);
    setQuestions(updatedQuestions);
  };

  const validateQuestions = () => {
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.text || !q.choice_a || !q.choice_b || !q.choice_c || !q.choice_d) {
        return { valid: false, questionIndex: i };
      }
    }
    return { valid: true };
  };

  const getQuestionProgress = () => {
    if (questions.length === 0) return 0;

    const completedQuestions = questions.filter(
      (q) => q.text && q.choice_a && q.choice_b && q.choice_c && q.choice_d
    ).length;

    return (completedQuestions / questions.length) * 100;
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);

      if (questions.length === 0) {
        message.error("Minimal harus ada 1 pertanyaan");
        return;
      }

      const validation = validateQuestions();
      if (!validation.valid) {
        message.error(
          `Pertanyaan ${validation.questionIndex + 1} belum lengkap`
        );
        return;
      }

      const assignmentData = {
        ...values,
        due_date: values.due_date ? values.due_date.toISOString() : null,
        questions: questions.map((q) => ({
          id: q.id,
          text: q.text,
          choice_a: q.choice_a,
          choice_b: q.choice_b,
          choice_c: q.choice_c,
          choice_d: q.choice_d,
          correct_choice: q.correct_choice,
          explanation: q.explanation || "",
        })),
      };

      await onSuccess(assignmentData);
      handleClose();
    } catch (error) {
      console.error("Error submitting assignment:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    form.resetFields();
    setQuestions([]);
    setInitialLoading(false);
    setCurrentStep(0);
    onClose();
  };

  const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

  const renderQuestionCard = (question, index) => (
    <Card
      key={question.id || index}
      size="small"
      style={{
        marginBottom: 16,
        borderRadius: 12,
        border: "1px solid #f0f0f0",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
      }}
      title={
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ color: "#667eea", fontWeight: 600 }}>
            📝 Pertanyaan {index + 1}
          </span>
          <div style={{ display: "flex", gap: 8 }}>
            {question.text &&
              question.choice_a &&
              question.choice_b &&
              question.choice_c &&
              question.choice_d && (
                <CheckCircleOutlined style={{ color: "#52c41a" }} />
              )}
            <Button
              danger
              size="small"
              icon={<DeleteOutlined />}
              onClick={() => removeQuestion(index)}
              style={{ borderRadius: 6 }}
            >
              Hapus
            </Button>
          </div>
        </div>
      }
    >
      <Space direction="vertical" style={{ width: "100%" }}>
        {/* Question Text */}
        <div>
          <Text strong style={{ display: "block", marginBottom: 8 }}>
            Teks Pertanyaan:
          </Text>
          <TextArea
            placeholder="Masukkan pertanyaan assignment..."
            value={question.text}
            onChange={(e) => updateQuestion(index, "text", e.target.value)}
            rows={3}
            style={{ borderRadius: 8 }}
          />
        </div>

        {/* Answer Choices */}
        <div>
          <Text strong style={{ display: "block", marginBottom: 8 }}>
            Pilihan Jawaban:
          </Text>
          <Row gutter={[8, 8]}>
            {["A", "B", "C", "D"].map((choice) => (
              <Col span={12} key={choice}>
                <Input
                  addonBefore={
                    <span
                      style={{
                        fontWeight: 600,
                        color: "#667eea",
                        minWidth: 20,
                        textAlign: "center",
                      }}
                    >
                      {choice}
                    </span>
                  }
                  placeholder={`Pilihan ${choice}`}
                  value={question[`choice_${choice.toLowerCase()}`]}
                  onChange={(e) =>
                    updateQuestion(
                      index,
                      `choice_${choice.toLowerCase()}`,
                      e.target.value
                    )
                  }
                  style={{ borderRadius: 8 }}
                />
              </Col>
            ))}
          </Row>
        </div>

        {/* Correct Answer */}
        <div>
          <Text strong style={{ display: "block", marginBottom: 8 }}>
            Jawaban Benar:
          </Text>
          <Radio.Group
            value={question.correct_choice}
            onChange={(e) =>
              updateQuestion(index, "correct_choice", e.target.value)
            }
            style={{
              display: "flex",
              gap: 16,
              padding: "8px 12px",
              background: "#f8faff",
              borderRadius: 8,
              border: "1px solid #e6f7ff",
            }}
          >
            {["A", "B", "C", "D"].map((choice) => (
              <Radio
                key={choice}
                value={choice}
                style={{ fontWeight: 600, color: "#667eea" }}
              >
                {choice}
              </Radio>
            ))}
          </Radio.Group>
        </div>

        {/* Explanation */}
        <div>
          <Text strong style={{ display: "block", marginBottom: 8 }}>
            <BulbOutlined style={{ marginRight: 4, color: "#faad14" }} />
            Penjelasan (Opsional):
          </Text>
          <Input
            placeholder="Penjelasan jawaban untuk membantu siswa memahami..."
            value={question.explanation}
            onChange={(e) =>
              updateQuestion(index, "explanation", e.target.value)
            }
            style={{ borderRadius: 8 }}
          />
        </div>
      </Space>
    </Card>
  );

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      footer={null}
      width={1000}
      centered
      destroyOnClose
      title={
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "8px 0",
          }}
        >
          <div
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              borderRadius: "50%",
              width: 40,
              height: 40,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <FileTextOutlined style={{ color: "white", fontSize: 18 }} />
          </div>
          <div>
            <span style={{ color: "#667eea", fontSize: 18, fontWeight: 700 }}>
              {editingAssignment ? "Edit Assignment" : "Buat Assignment Baru"}
            </span>
            <div style={{ fontSize: 12, color: "#666", fontWeight: 400 }}>
              {editingAssignment
                ? "Perbarui assignment yang sudah ada"
                : "Buat assignment baru untuk siswa"}
            </div>
          </div>
        </div>
      }
    >
      {initialLoading ? (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <Spin indicator={antIcon} />
          <p style={{ marginTop: 16, color: "#666" }}>
            Memuat data assignment...
          </p>
        </div>
      ) : (
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          style={{ maxHeight: "70vh", overflowY: "auto" }}
        >
          {/* Basic Assignment Info */}
          <Card
            title={
              <span style={{ color: "#667eea", fontWeight: 600 }}>
                📋 Informasi Dasar Assignment
              </span>
            }
            size="small"
            style={{
              marginBottom: 24,
              borderRadius: 12,
              border: "1px solid #e6f7ff",
              background: "linear-gradient(135deg, #f8faff 0%, #e6f3ff 100%)",
            }}
          >
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  label={<Text strong>Judul Assignment</Text>}
                  name="title"
                  rules={[
                    { required: true, message: "Judul assignment wajib diisi" },
                  ]}
                >
                  <Input
                    placeholder="Masukkan judul assignment yang menarik..."
                    size="large"
                    style={{ borderRadius: 8 }}
                  />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item
                  label={<Text strong>Deskripsi Assignment</Text>}
                  name="description"
                  rules={[
                    {
                      required: true,
                      message: "Deskripsi assignment wajib diisi",
                    },
                  ]}
                >
                  <TextArea
                    rows={4}
                    placeholder="Jelaskan tujuan dan instruksi assignment ini..."
                    style={{ borderRadius: 8 }}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label={<Text strong>Batas Waktu Pengerjaan</Text>}
                  name="due_date"
                  rules={[
                    { required: true, message: "Batas waktu wajib diisi" },
                  ]}
                >
                  <DatePicker
                    showTime
                    format="YYYY-MM-DD HH:mm"
                    placeholder="Pilih tanggal dan waktu deadline"
                    style={{ width: "100%", borderRadius: 8 }}
                    size="large"
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* Questions Section */}
          <Card
            title={
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <span style={{ color: "#667eea", fontWeight: 600 }}>
                    📝 Soal Assignment ({questions.length})
                  </span>
                  {questions.length > 0 && (
                    <div style={{ marginTop: 8 }}>
                      <Text style={{ fontSize: 12, color: "#666" }}>
                        Progress: {Math.round(getQuestionProgress())}% lengkap
                      </Text>
                      <Progress
                        percent={getQuestionProgress()}
                        size="small"
                        strokeColor="#52c41a"
                        style={{ marginTop: 4 }}
                      />
                    </div>
                  )}
                </div>
                <Button
                  type="dashed"
                  icon={<PlusOutlined />}
                  onClick={addQuestion}
                  style={{
                    borderColor: "#667eea",
                    color: "#667eea",
                    borderRadius: 8,
                    fontWeight: 600,
                  }}
                >
                  Tambah Soal
                </Button>
              </div>
            }
            size="small"
            style={{
              borderRadius: 12,
              border: "1px solid #e6f7ff",
            }}
          >
            {questions.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "60px 20px",
                  background:
                    "linear-gradient(135deg, #f8faff 0%, #e6f3ff 100%)",
                  borderRadius: 12,
                  border: "2px dashed #d6e4ff",
                }}
              >
                <div
                  style={{
                    background: "rgba(102, 126, 234, 0.1)",
                    borderRadius: "50%",
                    width: 80,
                    height: 80,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto",
                    marginBottom: 16,
                  }}
                >
                  <FileTextOutlined
                    style={{ fontSize: 32, color: "#667eea" }}
                  />
                </div>
                <Title level={5} style={{ color: "#667eea", marginBottom: 8 }}>
                  Belum ada soal assignment
                </Title>
                <Text
                  type="secondary"
                  style={{ marginBottom: 16, display: "block" }}
                >
                  Tambahkan soal untuk assignment ini
                </Text>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={addQuestion}
                  size="large"
                  style={{
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    border: "none",
                    borderRadius: 8,
                    fontWeight: 600,
                  }}
                >
                  Tambah Soal Pertama
                </Button>
              </div>
            ) : (
              <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                {questions.map((question, index) =>
                  renderQuestionCard(question, index)
                )}

                <div style={{ textAlign: "center", marginTop: 16 }}>
                  <Button
                    type="dashed"
                    icon={<PlusOutlined />}
                    onClick={addQuestion}
                    size="large"
                    style={{
                      borderColor: "#667eea",
                      color: "#667eea",
                      borderRadius: 8,
                      fontWeight: 600,
                      width: "100%",
                      height: 48,
                    }}
                  >
                    ➕ Tambah Soal Lagi
                  </Button>
                </div>
              </div>
            )}
          </Card>

          {/* Form Actions */}
          <div
            style={{
              textAlign: "right",
              marginTop: 32,
              padding: "20px 0",
              borderTop: "1px solid #f0f0f0",
            }}
          >
            <Space size="large">
              <Button
                onClick={handleClose}
                size="large"
                style={{
                  borderRadius: 8,
                  fontWeight: 600,
                  minWidth: 120,
                }}
              >
                Batal
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                size="large"
                style={{
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  border: "none",
                  borderRadius: 8,
                  fontWeight: 600,
                  minWidth: 180,
                  boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
                }}
              >
                {editingAssignment
                  ? "💾 Perbarui Assignment"
                  : "🚀 Buat Assignment"}
              </Button>
            </Space>
          </div>
        </Form>
      )}
    </Modal>
  );
};

export default AssignmentFormModal;
