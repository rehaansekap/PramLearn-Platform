// Update ARCSQuestionnaireForm dengan field waktu
import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  Switch,
  Button,
  Typography,
  Alert,
  Space,
  Divider,
  DatePicker,
  InputNumber,
  Row,
  Col,
} from "antd";
import {
  QuestionCircleOutlined,
  PlusOutlined,
  SaveOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import useARCSQuestionForm from "../../../hooks/useARCSQuestionForm";
import ARCSQuestionFormItem from "./ARCSQuestionFormItem";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

const ARCSQuestionnaireForm = ({
  visible,
  onCancel,
  onSubmit,
  editingQuestionnaire,
  loading,
}) => {
  const [form] = Form.useForm();
  const [basicFormLoading, setBasicFormLoading] = useState(false);
  const [includeQuestions, setIncludeQuestions] = useState(false);
  const [hasTimeLimit, setHasTimeLimit] = useState(false);

  const {
    questions,
    setQuestions,
    addQuestion,
    updateQuestion,
    removeQuestion,
    validateQuestions,
    resetForm,
  } = useARCSQuestionForm();

  useEffect(() => {
    if (visible) {
      if (editingQuestionnaire) {
        // Set form values for editing
        form.setFieldsValue({
          title: editingQuestionnaire.title,
          description: editingQuestionnaire.description,
          questionnaire_type: editingQuestionnaire.questionnaire_type,
          is_active: editingQuestionnaire.is_active,
          duration_minutes: editingQuestionnaire.duration_minutes,
          date_range: editingQuestionnaire.start_date && editingQuestionnaire.end_date 
            ? [dayjs(editingQuestionnaire.start_date), dayjs(editingQuestionnaire.end_date)]
            : null,
        });

        // Set time limit state
        setHasTimeLimit(!!(editingQuestionnaire.start_date || editingQuestionnaire.end_date));

        // Load questions if available
        if (
          editingQuestionnaire.questions &&
          editingQuestionnaire.questions.length > 0
        ) {
          const isSame =
            questions.length === editingQuestionnaire.questions.length &&
            questions.every(
              (q, i) =>
                q.id === editingQuestionnaire.questions[i].id &&
                q.text === editingQuestionnaire.questions[i].text
            );
          if (!isSame) {
            setQuestions(editingQuestionnaire.questions);
            setIncludeQuestions(true);
          }
        } else {
          if (questions.length > 0) {
            resetForm();
          }
          setIncludeQuestions(false);
        }
      } else {
        // Reset for new questionnaire
        form.resetFields();
        if (questions.length > 0) {
          resetForm();
        }
        setIncludeQuestions(false);
        setHasTimeLimit(false);
      }
    }
  }, [visible, editingQuestionnaire]);

  const handleSubmit = async () => {
    try {
      setBasicFormLoading(true);

      const basicValues = await form.validateFields();

      let finalData = { ...basicValues };

      // Handle date range
      if (hasTimeLimit && basicValues.date_range) {
        finalData.start_date = basicValues.date_range[0].toISOString();
        finalData.end_date = basicValues.date_range[1].toISOString();
      } else {
        finalData.start_date = null;
        finalData.end_date = null;
      }

      // Remove date_range from final data
      delete finalData.date_range;

      // Handle duration
      if (!finalData.duration_minutes) {
        finalData.duration_minutes = null;
      }

      if (includeQuestions) {
        const questionErrors = validateQuestions();
        if (questionErrors.length > 0) {
          Modal.error({
            title: "Validasi Pertanyaan Gagal",
            content: (
              <div>
                {questionErrors.map((error, index) => (
                  <div key={index}>• {error}</div>
                ))}
              </div>
            ),
          });
          return;
        }
        finalData.questions = questions;
      }

      await onSubmit(finalData);
    } catch (error) {
      console.error("Error submitting questionnaire:", error);
    } finally {
      setBasicFormLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    resetForm();
    setIncludeQuestions(false);
    setHasTimeLimit(false);
    onCancel();
  };

  return (
    <Modal
      title={
        <div style={{ textAlign: "center" }}>
          <QuestionCircleOutlined
            style={{ fontSize: 24, color: "#11418b", marginRight: 8 }}
          />
          <span style={{ fontSize: 18, fontWeight: 600, color: "#11418b" }}>
            {editingQuestionnaire
              ? "Edit Kuesioner ARCS"
              : "Buat Kuesioner ARCS Baru"}
          </span>
        </div>
      }
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={900}
      centered
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        style={{ marginTop: 24 }}
      >
        {/* Basic Information */}
        <Title level={5} style={{ color: "#11418b", marginBottom: 16 }}>
          Informasi Dasar
        </Title>

        <Form.Item
          label="Judul Kuesioner"
          name="title"
          rules={[
            { required: true, message: "Judul kuesioner harus diisi" },
            { min: 3, message: "Judul minimal 3 karakter" },
          ]}
        >
          <Input placeholder="Masukkan judul kuesioner ARCS" size="large" />
        </Form.Item>

        <Form.Item label="Deskripsi" name="description">
          <TextArea
            placeholder="Deskripsi kuesioner (opsional)"
            rows={3}
            maxLength={500}
            showCount
          />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Tipe Kuesioner"
              name="questionnaire_type"
              rules={[{ required: true, message: "Pilih tipe kuesioner" }]}
            >
              <Select placeholder="Pilih tipe kuesioner" size="large">
                <Option value="pre">Pre-Assessment (Sebelum Pembelajaran)</Option>
                <Option value="post">Post-Assessment (Setelah Pembelajaran)</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Status"
              name="is_active"
              valuePropName="checked"
              initialValue={true}
            >
              <Switch checkedChildren="Aktif" unCheckedChildren="Tidak Aktif" />
            </Form.Item>
          </Col>
        </Row>

        <Divider />

        {/* Time Limit Section */}
        <div style={{ marginBottom: 16 }}>
          <Space align="center" style={{ marginBottom: 12 }}>
            <CalendarOutlined style={{ color: "#11418b" }} />
            <Title level={5} style={{ color: "#11418b", margin: 0 }}>
              Pengaturan Waktu
            </Title>
            <Switch
              checked={hasTimeLimit}
              onChange={setHasTimeLimit}
              checkedChildren="Aktif"
              unCheckedChildren="Tidak Ada"
            />
          </Space>

          <Text type="secondary" style={{ fontSize: 12 }}>
            Atur masa berlaku dan durasi pengisian kuesioner
          </Text>
        </div>

        {hasTimeLimit && (
          <div
            style={{
              border: "1px solid #d9d9d9",
              borderRadius: 8,
              padding: 16,
              marginBottom: 16,
              backgroundColor: "#fafafa",
            }}
          >
            <Row gutter={16}>
              <Col span={16}>
                <Form.Item
                  label="Periode Pengisian"
                  name="date_range"
                  rules={[
                    {
                      required: hasTimeLimit,
                      message: "Pilih periode pengisian",
                    },
                  ]}
                >
                  <RangePicker
                    showTime={{
                      format: "HH:mm",
                    }}
                    format="DD/MM/YYYY HH:mm"
                    placeholder={["Tanggal Mulai", "Tanggal Berakhir"]}
                    style={{ width: "100%" }}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label="Durasi Maksimal (menit)"
                  name="duration_minutes"
                  help="Kosongkan jika tidak ada batas durasi"
                >
                  <InputNumber
                    min={1}
                    max={300}
                    placeholder="contoh: 30"
                    style={{ width: "100%" }}
                    addonAfter="menit"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Alert
              message="Pengaturan Waktu"
              description={
                <ul style={{ marginBottom: 0, paddingLeft: 20, fontSize: 12 }}>
                  <li>Siswa hanya dapat mengisi kuesioner dalam periode yang ditentukan</li>
                  <li>Durasi maksimal adalah waktu total pengisian per siswa</li>
                  <li>Jika durasi kosong, siswa dapat mengisi tanpa batas waktu</li>
                </ul>
              }
              type="info"
              showIcon
            />
          </div>
        )}

        <Divider />

        {/* Questions Section */}
        <div style={{ marginBottom: 16 }}>
          <Space align="center" style={{ marginBottom: 12 }}>
            <Title level={5} style={{ color: "#11418b", margin: 0 }}>
              Pertanyaan Kuesioner
            </Title>
            <Switch
              checked={includeQuestions}
              onChange={setIncludeQuestions}
              checkedChildren="Sertakan"
              unCheckedChildren="Lewati"
            />
          </Space>

          <Text type="secondary" style={{ fontSize: 12 }}>
            Anda dapat menambahkan pertanyaan sekarang atau nanti setelah
            kuesioner dibuat
          </Text>
        </div>

        {includeQuestions && (
          <div
            style={{
              border: "1px solid #d9d9d9",
              borderRadius: 8,
              padding: 16,
              marginBottom: 16,
            }}
          >
            {questions.length === 0 ? (
              <Alert
                message="Belum ada pertanyaan"
                description="Klik tombol di bawah untuk menambahkan pertanyaan pertama"
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />
            ) : (
              <div style={{ marginBottom: 16 }}>
                {questions.map((question, index) => (
                  <ARCSQuestionFormItem
                    key={question.id}
                    question={question}
                    index={index}
                    onUpdate={updateQuestion}
                    onRemove={removeQuestion}
                  />
                ))}
              </div>
            )}

            <Button
              type="dashed"
              icon={<PlusOutlined />}
              onClick={addQuestion}
              style={{ width: "100%" }}
            >
              Tambah Pertanyaan
            </Button>
          </div>
        )}

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 8,
            paddingTop: 16,
            borderTop: "1px solid #f0f0f0",
          }}
        >
          <Button onClick={handleCancel}>Batal</Button>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            htmlType="submit"
            loading={basicFormLoading || loading}
          >
            {editingQuestionnaire ? "Update Kuesioner" : "Buat Kuesioner"}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default ARCSQuestionnaireForm;