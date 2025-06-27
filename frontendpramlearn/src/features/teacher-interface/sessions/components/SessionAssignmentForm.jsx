import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Button,
  DatePicker,
  Space,
  Divider,
  Card,
  Row,
  Col,
  Select,
  Radio,
  Spin,
  message,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  LoadingOutlined,
  SaveOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { TextArea } = Input;
const { Option } = Select;

const SessionAssignmentForm = ({
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

  // Initialize form when editing - PERBAIKAN
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

        // PERBAIKAN: Load questions from editingAssignment or assignmentDetail
        const questionsToLoad = editingAssignment.questions || [];
        console.log("Loading questions for edit:", questionsToLoad); // Debug log

        setQuestions(
          questionsToLoad.map((q, index) => ({
            id: q.id || Date.now() + index,
            text: q.text || "",
            choice_a: q.choice_a || "",
            choice_b: q.choice_b || "",
            choice_c: q.choice_c || "",
            choice_d: q.choice_d || "",
            correct_choice: q.correct_choice || "A",
            explanation: q.explanation || "", // PERBAIKAN: pastikan explanation ter-load
          }))
        );

        setInitialLoading(false);
      }, 500);

      return () => clearTimeout(timer);
    } else if (open) {
      // Reset form for new assignment
      form.resetFields();
      setQuestions([]);
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

  const handleSubmit = async (values) => {
    try {
      setLoading(true);

      // Validate questions
      if (questions.length === 0) {
        message.error("Minimal harus ada 1 pertanyaan");
        return;
      }

      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        if (
          !q.text ||
          !q.choice_a ||
          !q.choice_b ||
          !q.choice_c ||
          !q.choice_d
        ) {
          message.error(`Pertanyaan ${i + 1} belum lengkap`);
          return;
        }
      }

      const assignmentData = {
        ...values,
        due_date: values.due_date ? values.due_date.toISOString() : null,
        questions: questions.map((q) => ({
          id: q.id, // PERBAIKAN: sertakan ID untuk update
          text: q.text,
          choice_a: q.choice_a,
          choice_b: q.choice_b,
          choice_c: q.choice_c,
          choice_d: q.choice_d,
          correct_choice: q.correct_choice,
          explanation: q.explanation || "", // PERBAIKAN: pastikan explanation dikirim
        })),
      };

      console.log("Submitting assignment data:", assignmentData); // Debug log

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
    onClose();
  };

  // Rest of the component remains the same...
  const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      footer={null}
      width={900}
      centered
      destroyOnClose
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <FileTextOutlined style={{ color: "#11418b", fontSize: 20 }} />
          <span style={{ color: "#11418b", fontSize: 18, fontWeight: 600 }}>
            {editingAssignment ? "Edit Assignment" : "Buat Assignment Baru"}
          </span>
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
            title="Informasi Assignment"
            size="small"
            style={{ marginBottom: 24 }}
          >
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  label="Judul Assignment"
                  name="title"
                  rules={[
                    { required: true, message: "Judul assignment wajib diisi" },
                  ]}
                >
                  <Input placeholder="Masukkan judul assignment" size="large" />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item
                  label="Deskripsi"
                  name="description"
                  rules={[
                    {
                      required: true,
                      message: "Deskripsi assignment wajib diisi",
                    },
                  ]}
                >
                  <TextArea
                    rows={3}
                    placeholder="Masukkan deskripsi assignment"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Batas Waktu"
                  name="due_date"
                  rules={[
                    { required: true, message: "Batas waktu wajib diisi" },
                  ]}
                >
                  <DatePicker
                    showTime
                    format="YYYY-MM-DD HH:mm"
                    placeholder="Pilih batas waktu"
                    style={{ width: "100%" }}
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
                <span>Pertanyaan Assignment ({questions.length})</span>
                <Button
                  type="dashed"
                  icon={<PlusOutlined />}
                  onClick={addQuestion}
                  size="small"
                >
                  Tambah Pertanyaan
                </Button>
              </div>
            }
            size="small"
          >
            {questions.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px 0",
                  color: "#999",
                }}
              >
                <FileTextOutlined style={{ fontSize: 32, marginBottom: 16 }} />
                <p>Belum ada pertanyaan</p>
                <Button
                  type="dashed"
                  icon={<PlusOutlined />}
                  onClick={addQuestion}
                >
                  Tambah Pertanyaan Pertama
                </Button>
              </div>
            ) : (
              <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                {questions.map((question, index) => (
                  <Card
                    key={question.id || index}
                    size="small"
                    style={{ marginBottom: 16 }}
                    title={`Pertanyaan ${index + 1}`}
                    extra={
                      <Button
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                        onClick={() => removeQuestion(index)}
                      >
                        Hapus
                      </Button>
                    }
                  >
                    <Space direction="vertical" style={{ width: "100%" }}>
                      <Input
                        placeholder="Teks pertanyaan"
                        value={question.text}
                        onChange={(e) =>
                          updateQuestion(index, "text", e.target.value)
                        }
                      />

                      <Row gutter={8}>
                        <Col span={12}>
                          <Input
                            addonBefore="A"
                            placeholder="Pilihan A"
                            value={question.choice_a}
                            onChange={(e) =>
                              updateQuestion(index, "choice_a", e.target.value)
                            }
                          />
                        </Col>
                        <Col span={12}>
                          <Input
                            addonBefore="B"
                            placeholder="Pilihan B"
                            value={question.choice_b}
                            onChange={(e) =>
                              updateQuestion(index, "choice_b", e.target.value)
                            }
                          />
                        </Col>
                      </Row>

                      <Row gutter={8}>
                        <Col span={12}>
                          <Input
                            addonBefore="C"
                            placeholder="Pilihan C"
                            value={question.choice_c}
                            onChange={(e) =>
                              updateQuestion(index, "choice_c", e.target.value)
                            }
                          />
                        </Col>
                        <Col span={12}>
                          <Input
                            addonBefore="D"
                            placeholder="Pilihan D"
                            value={question.choice_d}
                            onChange={(e) =>
                              updateQuestion(index, "choice_d", e.target.value)
                            }
                          />
                        </Col>
                      </Row>

                      <div>
                        <span style={{ marginRight: 8 }}>Jawaban Benar:</span>
                        <Radio.Group
                          value={question.correct_choice}
                          onChange={(e) =>
                            updateQuestion(
                              index,
                              "correct_choice",
                              e.target.value
                            )
                          }
                        >
                          <Radio value="A">A</Radio>
                          <Radio value="B">B</Radio>
                          <Radio value="C">C</Radio>
                          <Radio value="D">D</Radio>
                        </Radio.Group>
                      </div>

                      <Input
                        placeholder="Penjelasan (opsional)"
                        value={question.explanation}
                        onChange={(e) =>
                          updateQuestion(index, "explanation", e.target.value)
                        }
                      />
                    </Space>
                  </Card>
                ))}
              </div>
            )}
          </Card>

          {/* Form Actions */}
          <div style={{ textAlign: "right", marginTop: 24 }}>
            <Space>
              <Button onClick={handleClose} size="large">
                Batal
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                size="large"
                icon={<SaveOutlined />}
              >
                {editingAssignment ? "Perbarui Assignment" : "Buat Assignment"}
              </Button>
            </Space>
          </div>
        </Form>
      )}
    </Modal>
  );
};

export default SessionAssignmentForm;
