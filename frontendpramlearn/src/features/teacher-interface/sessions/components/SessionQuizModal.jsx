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
  Divider,
  Row,
  Col,
  Tag,
  message,
  Spin,
  Switch,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  SaveOutlined,
  CloseOutlined,
  QuestionCircleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import Swal from "sweetalert2";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const SessionQuizModal = ({
  open,
  onClose,
  onSubmit,
  editingQuiz,
  groups,
  loading,
  materialSlug,
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
        // Calculate duration from existing times if available
        let duration = 120; // default 2 hours in minutes
        if (editingQuiz.assigned_groups?.[0]) {
          const startTime = dayjs(editingQuiz.assigned_groups[0].start_time);
          const endTime = dayjs(editingQuiz.assigned_groups[0].end_time);
          duration = endTime.diff(startTime, "minute");
        }

        // Populate form for editing
        form.setFieldsValue({
          title: editingQuiz.title,
          content: editingQuiz.content,
          duration: duration,
        });

        setQuestions(editingQuiz.questions || []);
        setSelectedGroups(
          editingQuiz.assigned_groups?.map((ag) => ag.group_id) || []
        );
      } else {
        // Reset for new quiz
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

        // Set default duration (120 minutes = 2 hours)
        form.setFieldsValue({
          duration: 120,
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

    // Remove validation error for deleted question
    const newValidation = { ...questionValidation };
    delete newValidation[index];
    setQuestionValidation(newValidation);
  };

  // Update question
  const updateQuestion = (index, field, value) => {
    const newQuestions = [...questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    setQuestions(newQuestions);

    // Clear validation error for this field
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
      // Validate basic form
      const values = await form.validateFields();

      // Validasi form
      await form.validateFields();

      if (questionValidation.hasErrors) {
        message.error("Mohon perbaiki soal yang belum lengkap");
        return;
      }

      // Validate questions
      if (!validateQuestions()) {
        message.error("Mohon lengkapi semua soal dan pilihan jawaban");
        return;
      }

      if (selectedGroups.length === 0) {
        message.error("Pilih minimal satu kelompok");
        return;
      }

      if (!values.duration || values.duration <= 0) {
        message.error("Durasi quiz harus lebih dari 0 menit");
        return;
      }

      setSubmitting(true);

      // Calculate start and end time based on current time + duration
      const startTime = dayjs();
      const endTime = startTime.add(values.duration, "minute");

      const quizData = {
        title: values.title,
        content: values.content,
        is_active: values.is_active !== undefined ? values.is_active : true,
        questions: questions.map((q, idx) => {
          // Validasi manual
          if (
            !q.choice_a?.trim() ||
            !q.choice_b?.trim() ||
            !q.choice_c?.trim() ||
            !q.choice_d?.trim()
          ) {
            throw new Error(
              `Soal ke-${idx + 1} belum lengkap pilihan jawabannya`
            );
          }
          return {
            text: q.text,
            choice_a: q.choice_a,
            choice_b: q.choice_b,
            choice_c: q.choice_c,
            choice_d: q.choice_d,
            correct_choice: q.correct_choice,
          };
        }),
        group_ids: selectedGroups,
        duration: values.duration,
        start_time: values.start_time?.toISOString(),
        end_time: values.end_time?.toISOString(),
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
      // If "Semua Kelompok" is selected, select all groups
      const allGroupIds = groups.map((g) => g.id);
      setSelectedGroups(allGroupIds);
    } else {
      // Normal selection
      setSelectedGroups(value);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      footer={null}
      width="90%"
      style={{ maxWidth: 1200, top: 20 }}
      centered
      title={
        <div style={{ borderBottom: "2px solid #f0f0f0", paddingBottom: 16 }}>
          <Space>
            <QuestionCircleOutlined
              style={{ color: "#1890ff", fontSize: 24 }}
            />
            <Title level={3} style={{ margin: 0 }}>
              {isEdit ? "Edit Quiz" : "Buat Quiz Baru"}
            </Title>
          </Space>
        </div>
      }
      destroyOnClose
    >
      <Spin spinning={loading || submitting}>
        <Form form={form} layout="vertical" style={{ paddingTop: 16 }}>
          {/* Basic Information */}
          <Card title="📝 Informasi Quiz" style={{ marginBottom: 24 }}>
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Judul Quiz"
                  name="title"
                  rules={[
                    { required: true, message: "Judul quiz wajib diisi" },
                    { min: 3, message: "Judul minimal 3 karakter" },
                  ]}
                >
                  <Input placeholder="Masukkan judul quiz" size="large" />
                </Form.Item>
                <Form.Item
                  label={
                    <span style={{ fontWeight: "bold" }}>Status Quiz</span>
                  }
                  name="is_active"
                  valuePropName="checked"
                >
                  <Switch
                    checkedChildren="Aktif"
                    unCheckedChildren="Non-Aktif"
                    defaultChecked={true}
                    disabled={submitting}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Durasi Quiz"
                  name="duration"
                  rules={[
                    {
                      required: true,
                      message: "Durasi quiz wajib diisi",
                    },
                    {
                      type: "number",
                      min: 1,
                      message: "Durasi minimal 1 menit",
                    },
                    {
                      type: "number",
                      max: 1440,
                      message: "Durasi maksimal 24 jam (1440 menit)",
                    },
                  ]}
                >
                  <InputNumber
                    placeholder="Masukkan durasi dalam menit"
                    size="large"
                    style={{ width: "100%" }}
                    min={1}
                    max={1440}
                    step={5}
                    formatter={(value) => (value ? `${value} menit` : "")}
                    parser={(value) => value.replace(/[^\d]/g, "")}
                    addonBefore={<ClockCircleOutlined />}
                    onChange={(value) => {
                      // Show formatted duration when user types
                      if (value) {
                        const formatted = formatDuration(value);
                        // You could show this in a help text or tooltip
                      }
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              label="Deskripsi Quiz"
              name="content"
              rules={[
                { required: true, message: "Deskripsi quiz wajib diisi" },
              ]}
            >
              <TextArea
                rows={3}
                placeholder="Masukkan deskripsi atau instruksi quiz"
              />
            </Form.Item>
          </Card>

          {/* Group Assignment */}
          <Card title="👥 Pilih Kelompok" style={{ marginBottom: 24 }}>
            <div style={{ marginBottom: 16 }}>
              <Text type="secondary">
                Pilih kelompok yang akan mengerjakan quiz ini
              </Text>
            </div>

            <Select
              mode="multiple"
              placeholder="Pilih kelompok"
              style={{ width: "100%" }}
              size="large"
              value={selectedGroups}
              onChange={handleGroupSelection}
              optionLabelProp="label"
              maxTagCount="responsive"
            >
              {/* Opsi Semua Kelompok */}
              <Option
                key="ALL_GROUPS"
                value="ALL_GROUPS"
                label="Semua Kelompok"
              >
                <Space>
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
                      <Tag color="blue">{group.member_count} anggota</Tag>
                    </Space>
                  </Option>
                ))}
              </Select.OptGroup>
            </Select>

            {selectedGroups.length > 0 && (
              <div style={{ marginTop: 12 }}>
                <Text type="secondary">Dipilih: </Text>
                {selectedGroups.length === groups.length ? (
                  <Tag color="green" style={{ margin: "2px 4px 2px 0" }}>
                    ✓ Semua Kelompok ({groups.length})
                  </Tag>
                ) : (
                  selectedGroups.map((groupId) => {
                    const group = groups.find((g) => g.id === groupId);
                    return (
                      <Tag
                        key={groupId}
                        color="blue"
                        style={{ margin: "2px 4px 2px 0" }}
                      >
                        {group?.name}
                      </Tag>
                    );
                  })
                )}
              </div>
            )}
          </Card>

          {/* Questions */}
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
                >
                  Tambah Soal
                </Button>
              </div>
            }
            style={{ marginBottom: 24 }}
          >
            <div style={{ maxHeight: 400, overflowY: "auto" }}>
              {questions.map((question, index) => (
                <Card
                  key={index}
                  size="small"
                  style={{ marginBottom: 16 }}
                  title={`Soal ${index + 1}`}
                  extra={
                    questions.length > 1 && (
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => removeQuestion(index)}
                        size="small"
                      >
                        Hapus
                      </Button>
                    )
                  }
                >
                  {/* Question Text */}
                  <div style={{ marginBottom: 16 }}>
                    <Text strong>Pertanyaan:</Text>
                    <Input.TextArea
                      rows={2}
                      placeholder="Masukkan soal"
                      value={question.text}
                      onChange={(e) =>
                        updateQuestion(index, "text", e.target.value)
                      }
                      status={questionValidation[index]?.text ? "error" : ""}
                    />
                    {questionValidation[index]?.text && (
                      <Text type="danger" style={{ fontSize: 12 }}>
                        {questionValidation[index].text}
                      </Text>
                    )}
                  </div>

                  {/* Answer Choices */}
                  <Row gutter={[8, 8]}>
                    {["A", "B", "C", "D"].map((choice) => {
                      const fieldName = `choice_${choice.toLowerCase()}`;
                      return (
                        <Col xs={24} sm={12} key={choice}>
                          <div
                            style={{ display: "flex", alignItems: "center" }}
                          >
                            <Text strong style={{ minWidth: 20 }}>
                              {choice}.
                            </Text>
                            <Input
                              placeholder={`Pilihan ${choice}`}
                              value={question[fieldName]}
                              onChange={(e) =>
                                updateQuestion(index, fieldName, e.target.value)
                              }
                              status={
                                questionValidation[index]?.[fieldName]
                                  ? "error"
                                  : ""
                              }
                              style={{ marginLeft: 8 }}
                            />
                          </div>
                          {questionValidation[index]?.[fieldName] && (
                            <Text
                              type="danger"
                              style={{ fontSize: 12, marginLeft: 28 }}
                            >
                              {questionValidation[index][fieldName]}
                            </Text>
                          )}
                        </Col>
                      );
                    })}
                  </Row>

                  {/* Correct Answer */}
                  <div style={{ marginTop: 16 }}>
                    <Text strong>Jawaban Benar:</Text>
                    <Select
                      value={question.correct_choice}
                      onChange={(value) =>
                        updateQuestion(index, "correct_choice", value)
                      }
                      style={{ marginLeft: 8, width: 80 }}
                    >
                      {["A", "B", "C", "D"].map((choice) => (
                        <Option key={choice} value={choice}>
                          {choice}
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
              textAlign: "right",
              paddingTop: 16,
              borderTop: "1px solid #f0f0f0",
            }}
          >
            <Space>
              <Button
                onClick={handleClose}
                icon={<CloseOutlined />}
                size="large"
              >
                Batal
              </Button>
              <Button
                type="primary"
                onClick={handleSubmit}
                loading={submitting}
                icon={<SaveOutlined />}
                size="large"
              >
                {isEdit ? "Perbarui Quiz" : "Buat Quiz"}
              </Button>
            </Space>
          </div>
        </Form>
      </Spin>
    </Modal>
  );
};

export default SessionQuizModal;
