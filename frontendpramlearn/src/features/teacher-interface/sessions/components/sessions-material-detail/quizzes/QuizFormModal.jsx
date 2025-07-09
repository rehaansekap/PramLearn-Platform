import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Button,
  Space,
  Card,
  Typography,
  Select,
  InputNumber,
  Row,
  Col,
  Tag,
  message,
  Spin,
  Switch,
  Divider,
  Alert,
  Tooltip,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  SaveOutlined,
  CloseOutlined,
  QuestionCircleOutlined,
  ClockCircleOutlined,
  InfoCircleOutlined,
  TeamOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import Swal from "sweetalert2";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const QuizFormModal = ({
  open,
  onClose,
  onSubmit,
  editingQuiz,
  groups,
  loading,
  isMobile = false,
}) => {
  const [form] = Form.useForm();
  const [questions, setQuestions] = useState([]);
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [questionValidation, setQuestionValidation] = useState({});

  const isEdit = !!editingQuiz;

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      if (isEdit && editingQuiz) {
        let duration = 120;
        if (editingQuiz.assigned_groups?.[0]) {
          const startTime = new Date(editingQuiz.assigned_groups[0].start_time);
          const endTime = new Date(editingQuiz.assigned_groups[0].end_time);
          duration = Math.floor((endTime - startTime) / (1000 * 60));
        }

        form.setFieldsValue({
          title: editingQuiz.title,
          content: editingQuiz.content,
          duration: duration,
          is_active: editingQuiz.is_active,
        });

        setQuestions(editingQuiz.questions || []);
        setSelectedGroups(
          editingQuiz.assigned_groups?.map((ag) => ag.group_id) || []
        );
      } else {
        form.resetFields();
        setQuestions([
          {
            text: "",
            choice_a: "",
            choice_b: "",
            choice_c: "",
            choice_d: "",
            correct_choice: "A",
          },
        ]);
        setSelectedGroups([]);
        form.setFieldsValue({
          duration: 120,
          is_active: true,
        });
      }
      setQuestionValidation({});
    }
  }, [open, isEdit, editingQuiz, form]);

  // Add new question
  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        text: "",
        choice_a: "",
        choice_b: "",
        choice_c: "",
        choice_d: "",
        correct_choice: "A",
      },
    ]);
  };

  // Remove question
  const removeQuestion = (index) => {
    if (questions.length <= 1) {
      message.warning("Quiz harus memiliki minimal 1 soal");
      return;
    }

    setQuestions(questions.filter((_, i) => i !== index));
    const newValidation = { ...questionValidation };
    delete newValidation[index];
    setQuestionValidation(newValidation);
  };

  // Update question
  const updateQuestion = (index, field, value) => {
    const newQuestions = [...questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    setQuestions(newQuestions);

    if (questionValidation[index]?.[field]) {
      const newValidation = { ...questionValidation };
      delete newValidation[index][field];
      setQuestionValidation(newValidation);
    }
  };

  // Validate questions
  const validateQuestions = () => {
    const validation = {};
    let hasError = false;

    questions.forEach((question, index) => {
      const errors = {};

      if (!question.text.trim()) {
        errors.text = "Soal tidak boleh kosong";
        hasError = true;
      }

      ["choice_a", "choice_b", "choice_c", "choice_d"].forEach((choice) => {
        if (!question[choice].trim()) {
          errors[choice] = "Pilihan tidak boleh kosong";
          hasError = true;
        }
      });

      if (Object.keys(errors).length > 0) {
        validation[index] = errors;
      }
    });

    setQuestionValidation(validation);
    return !hasError;
  };

  // Format duration for display
  const formatDuration = (minutes) => {
    if (!minutes) return "";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours > 0) {
      return mins > 0 ? `${hours} jam ${mins} menit` : `${hours} jam`;
    }
    return `${mins} menit`;
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (!validateQuestions()) {
        message.error("Mohon lengkapi semua soal dan pilihan jawaban");
        return;
      }

      if (selectedGroups.length === 0) {
        message.error("Pilih minimal satu kelompok");
        return;
      }

      setSubmitting(true);

      const quizData = {
        title: values.title,
        content: values.content,
        is_active: values.is_active !== undefined ? values.is_active : true,
        questions: questions.map((q) => ({
          text: q.text,
          choice_a: q.choice_a,
          choice_b: q.choice_b,
          choice_c: q.choice_c,
          choice_d: q.choice_d,
          correct_choice: q.correct_choice,
        })),
        group_ids: selectedGroups,
        duration: values.duration,
      };

      await onSubmit(quizData, isEdit ? editingQuiz.id : null);
      message.success(
        isEdit ? "Quiz berhasil diperbarui!" : "Quiz berhasil dibuat!"
      );
      onClose();
    } catch (error) {
      console.error("Error submitting quiz:", error);
      if (error.errorFields) {
        message.error("Mohon lengkapi form dengan benar");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (questions.some((q) => q.text.trim() || q.choice_a.trim())) {
      Swal.fire({
        title: "Keluar tanpa menyimpan?",
        text: "Perubahan yang belum disimpan akan hilang.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Ya, Keluar",
        cancelButtonText: "Batal",
      }).then((result) => {
        if (result.isConfirmed) {
          onClose();
        }
      });
    } else {
      onClose();
    }
  };

  const handleGroupSelection = (value) => {
    if (value.includes("ALL_GROUPS")) {
      const allGroupIds = groups.map((g) => g.id);
      setSelectedGroups(allGroupIds);
    } else {
      setSelectedGroups(value);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      footer={null}
      width={isMobile ? "95%" : "90%"}
      style={{ maxWidth: 1200, top: 20 }}
      centered
      title={
        <div
          style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            margin: "-24px -24px 0",
            padding: "20px 24px",
            borderRadius: "8px 8px 0 0",
            color: "white",
          }}
        >
          <Space>
            <QuestionCircleOutlined style={{ fontSize: 24 }} />
            <Title level={4} style={{ margin: 0, color: "white" }}>
              {isEdit ? "✏️ Edit Quiz" : "🚀 Buat Quiz Baru"}
            </Title>
          </Space>
        </div>
      }
      destroyOnClose
    >
      <Spin spinning={loading || submitting}>
        <div style={{ padding: "20px 0" }}>
          <Form form={form} layout="vertical">
            {/* Basic Information */}
            <Card
              title="📝 Informasi Quiz"
              style={{ marginBottom: 24 }}
              headStyle={{
                background: "linear-gradient(135deg, #f8fafc 0%, #e6f3ff 100%)",
                borderRadius: "8px 8px 0 0",
              }}
            >
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    label={<Text strong>Judul Quiz</Text>}
                    name="title"
                    rules={[
                      { required: true, message: "Judul quiz wajib diisi" },
                      { min: 3, message: "Judul minimal 3 karakter" },
                    ]}
                  >
                    <Input
                      placeholder="Masukkan judul quiz yang menarik"
                      size="large"
                      prefix={
                        <QuestionCircleOutlined style={{ color: "#1890ff" }} />
                      }
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    label={<Text strong>Durasi Quiz</Text>}
                    name="duration"
                    rules={[
                      { required: true, message: "Durasi quiz wajib diisi" },
                      {
                        type: "number",
                        min: 1,
                        message: "Durasi minimal 1 menit",
                      },
                      {
                        type: "number",
                        max: 1440,
                        message: "Durasi maksimal 24 jam",
                      },
                    ]}
                  >
                    <InputNumber
                      placeholder="Durasi dalam menit"
                      size="large"
                      style={{ width: "100%" }}
                      min={1}
                      max={1440}
                      step={5}
                      prefix={<ClockCircleOutlined />}
                      formatter={(value) => (value ? `${value} menit` : "")}
                      parser={(value) => value.replace(/[^\d]/g, "")}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} md={16}>
                  <Form.Item
                    label={<Text strong>Deskripsi Quiz</Text>}
                    name="content"
                    rules={[
                      { required: true, message: "Deskripsi quiz wajib diisi" },
                    ]}
                  >
                    <TextArea
                      rows={3}
                      placeholder="Masukkan deskripsi atau instruksi quiz"
                      style={{ borderRadius: 8 }}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item
                    label={<Text strong>Status Quiz</Text>}
                    name="is_active"
                    valuePropName="checked"
                  >
                    <div style={{ textAlign: "center", padding: "20px 0" }}>
                      <Switch
                        checkedChildren="🟢 Aktif"
                        unCheckedChildren="🔴 Non-Aktif"
                        size="large"
                        style={{ marginBottom: 8 }}
                      />
                      <div>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          Quiz aktif dapat dikerjakan siswa
                        </Text>
                      </div>
                    </div>
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            {/* Group Assignment */}
            <Card
              title="👥 Penugasan Kelompok"
              style={{ marginBottom: 24 }}
              headStyle={{
                background: "linear-gradient(135deg, #f6ffed 0%, #e6f7ff 100%)",
                borderRadius: "8px 8px 0 0",
              }}
            >
              <Alert
                message="Info Penugasan"
                description="Pilih kelompok yang akan mengerjakan quiz ini. Anda bisa memilih semua kelompok sekaligus atau pilih individual."
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
                icon={<InfoCircleOutlined />}
              />

              <Select
                mode="multiple"
                placeholder="🔍 Pilih kelompok yang akan mengerjakan quiz"
                style={{ width: "100%" }}
                size="large"
                value={selectedGroups}
                onChange={handleGroupSelection}
                optionLabelProp="label"
                maxTagCount="responsive"
                notFoundContent="Tidak ada kelompok tersedia"
              >
                <Option
                  key="ALL_GROUPS"
                  value="ALL_GROUPS"
                  label="Semua Kelompok"
                >
                  <Space>
                    <TeamOutlined style={{ color: "#1890ff" }} />
                    <Text strong style={{ color: "#1890ff" }}>
                      ✓ Semua Kelompok
                    </Text>
                    <Tag color="blue">{groups.length} kelompok</Tag>
                  </Space>
                </Option>

                <Select.OptGroup label="Pilih Individual">
                  {groups.map((group) => (
                    <Option key={group.id} value={group.id} label={group.name}>
                      <Space>
                        <Text strong>{group.name}</Text>
                        <Text type="secondary">({group.code})</Text>
                        <Tag color="green">{group.member_count} anggota</Tag>
                      </Space>
                    </Option>
                  ))}
                </Select.OptGroup>
              </Select>

              {selectedGroups.length > 0 && (
                <div
                  style={{
                    marginTop: 16,
                    padding: 16,
                    background: "#f8fafc",
                    borderRadius: 8,
                  }}
                >
                  <Text
                    type="secondary"
                    style={{ marginBottom: 8, display: "block" }}
                  >
                    📌 Kelompok Terpilih:
                  </Text>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {selectedGroups.length === groups.length ? (
                      <Tag
                        color="green"
                        style={{ padding: "4px 12px", fontSize: 12 }}
                      >
                        ✅ Semua Kelompok ({groups.length})
                      </Tag>
                    ) : (
                      selectedGroups.map((groupId) => {
                        const group = groups.find((g) => g.id === groupId);
                        return (
                          <Tag
                            key={groupId}
                            color="blue"
                            style={{ padding: "4px 8px", fontSize: 11 }}
                          >
                            {group?.name}
                          </Tag>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
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
                  <span>❓ Soal Quiz ({questions.length})</span>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={addQuestion}
                    size="small"
                    style={{
                      background:
                        "linear-gradient(135deg, #52c41a 0%, #73d13d 100%)",
                      border: "none",
                      borderRadius: 8,
                    }}
                  >
                    Tambah Soal
                  </Button>
                </div>
              }
              style={{ marginBottom: 24 }}
              headStyle={{
                background: "linear-gradient(135deg, #fffbe6 0%, #fff7e6 100%)",
                borderRadius: "8px 8px 0 0",
              }}
            >
              {questions.length === 0 && (
                <Alert
                  message="Belum ada soal"
                  description="Klik 'Tambah Soal' untuk mulai membuat soal quiz."
                  type="warning"
                  showIcon
                  icon={<WarningOutlined />}
                />
              )}

              <div
                style={{ maxHeight: isMobile ? 300 : 400, overflowY: "auto" }}
              >
                {questions.map((question, index) => (
                  <Card
                    key={index}
                    size="small"
                    style={{
                      marginBottom: 16,
                      borderRadius: 12,
                      border: "1px solid #e6f7ff",
                    }}
                    title={
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Text strong style={{ color: "#1890ff" }}>
                          📝 Soal {index + 1}
                        </Text>
                        {questions.length > 1 && (
                          <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => removeQuestion(index)}
                            size="small"
                            style={{ borderRadius: 6 }}
                          >
                            Hapus
                          </Button>
                        )}
                      </div>
                    }
                    headStyle={{
                      background: "#f8fafc",
                      borderRadius: "8px 8px 0 0",
                    }}
                  >
                    {/* Question Text */}
                    <div style={{ marginBottom: 16 }}>
                      <Text
                        strong
                        style={{ display: "block", marginBottom: 8 }}
                      >
                        Pertanyaan:
                      </Text>
                      <TextArea
                        rows={isMobile ? 2 : 3}
                        placeholder="Masukkan soal yang jelas dan mudah dipahami"
                        value={question.text}
                        onChange={(e) =>
                          updateQuestion(index, "text", e.target.value)
                        }
                        status={questionValidation[index]?.text ? "error" : ""}
                        style={{ borderRadius: 8 }}
                      />
                      {questionValidation[index]?.text && (
                        <Text type="danger" style={{ fontSize: 12 }}>
                          {questionValidation[index].text}
                        </Text>
                      )}
                    </div>

                    {/* Answer Choices */}
                    <div style={{ marginBottom: 16 }}>
                      <Text
                        strong
                        style={{ display: "block", marginBottom: 8 }}
                      >
                        Pilihan Jawaban:
                      </Text>
                      <Row gutter={[8, 8]}>
                        {["A", "B", "C", "D"].map((choice) => {
                          const fieldName = `choice_${choice.toLowerCase()}`;
                          return (
                            <Col xs={24} sm={12} key={choice}>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
                                <div
                                  style={{
                                    background: "#1890ff",
                                    color: "white",
                                    borderRadius: "50%",
                                    width: 24,
                                    height: 24,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: 12,
                                    fontWeight: "bold",
                                    marginRight: 8,
                                    minWidth: 24,
                                  }}
                                >
                                  {choice}
                                </div>
                                <Input
                                  placeholder={`Pilihan ${choice}`}
                                  value={question[fieldName]}
                                  onChange={(e) =>
                                    updateQuestion(
                                      index,
                                      fieldName,
                                      e.target.value
                                    )
                                  }
                                  status={
                                    questionValidation[index]?.[fieldName]
                                      ? "error"
                                      : ""
                                  }
                                  style={{ borderRadius: 6 }}
                                />
                              </div>
                              {questionValidation[index]?.[fieldName] && (
                                <Text
                                  type="danger"
                                  style={{ fontSize: 12, marginLeft: 32 }}
                                >
                                  {questionValidation[index][fieldName]}
                                </Text>
                              )}
                            </Col>
                          );
                        })}
                      </Row>
                    </div>

                    {/* Correct Answer */}
                    <div>
                      <Text strong style={{ marginRight: 8 }}>
                        Jawaban Benar:
                      </Text>
                      <Select
                        value={question.correct_choice}
                        onChange={(value) =>
                          updateQuestion(index, "correct_choice", value)
                        }
                        style={{ width: 100 }}
                        size="large"
                      >
                        {["A", "B", "C", "D"].map((choice) => (
                          <Option key={choice} value={choice}>
                            <Space>
                              <div
                                style={{
                                  background: "#52c41a",
                                  color: "white",
                                  borderRadius: "50%",
                                  width: 20,
                                  height: 20,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontSize: 10,
                                  fontWeight: "bold",
                                }}
                              >
                                {choice}
                              </div>
                              Pilihan {choice}
                            </Space>
                          </Option>
                        ))}
                      </Select>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>

            {/* Action Buttons */}
            <div
              style={{
                textAlign: "center",
                paddingTop: 24,
                borderTop: "2px solid #f0f0f0",
                // background: "linear-gradient(135deg, #f8fafc 0%, #e6f3ff 100%)",
                margin: "0 -24px -20px",
                padding: "24px",
                borderRadius: "0 0 8px 8px",
              }}
            >
              <Space size="large">
                <Button
                  onClick={handleClose}
                  icon={<CloseOutlined />}
                  size="large"
                  style={{
                    borderRadius: 8,
                    minWidth: 120,
                    height: 48,
                  }}
                >
                  Batal
                </Button>
                <Button
                  type="primary"
                  onClick={handleSubmit}
                  loading={submitting}
                  size="large"
                  style={{
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    border: "none",
                    borderRadius: 8,
                    minWidth: 140,
                    height: 48,
                    fontWeight: 600,
                  }}
                >
                  {isEdit ? "💾 Perbarui Quiz" : "🚀 Buat Quiz"}
                </Button>
              </Space>
            </div>
          </Form>
        </div>
      </Spin>
    </Modal>
  );
};

export default QuizFormModal;
