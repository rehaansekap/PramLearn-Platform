import React, { useState } from "react";
import {
  Card,
  Button,
  Table,
  Space,
  Tag,
  Typography,
  Empty,
  Modal,
  Form,
  Input,
  Select,
  Switch,
  Popconfirm,
  Alert,
  Progress,
  Row,
  Col,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  DragOutlined,
  QuestionCircleOutlined,
  BulbOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const ARCSQuestionManager = ({
  questionnaire,
  questions,
  loading,
  onCreateQuestion,
  onUpdateQuestion,
  materialSlug,
  isMobile,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const dimensionColors = {
    attention: "#1890ff",
    relevance: "#52c41a",
    confidence: "#faad14",
    satisfaction: "#722ed1",
  };

  const dimensionLabels = {
    attention: "Attention",
    relevance: "Relevance",
    confidence: "Confidence",
    satisfaction: "Satisfaction",
  };

  const dimensionDescriptions = {
    attention: "🎯 Kemampuan menarik dan mempertahankan perhatian siswa",
    relevance: "🔗 Kesesuaian materi dengan kebutuhan dan tujuan siswa",
    confidence: "💪 Tingkat keyakinan siswa dalam menguasai materi",
    satisfaction: "😊 Kepuasan siswa terhadap proses pembelajaran",
  };

  const typeLabels = {
    likert_5: "Likert 1-5",
    likert_7: "Likert 1-7",
    multiple_choice: "Pilihan Ganda",
    text: "Input Teks",
  };

  // Calculate dimension distribution
  const dimensionStats = Object.keys(dimensionLabels).reduce((acc, dim) => {
    acc[dim] = questions.filter((q) => q.dimension === dim).length;
    return acc;
  }, {});

  const totalQuestions = questions.length;

  const handleAdd = () => {
    setEditingQuestion(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (question) => {
    setEditingQuestion(question);
    form.setFieldsValue(question);
    setIsModalVisible(true);
  };

  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      await onCreateQuestion(values);
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error("Error saving question:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingQuestion(null);
    form.resetFields();
  };

  const renderChoiceInputs = () => {
    const questionType = form.getFieldValue("question_type");
    if (questionType !== "multiple_choice") return null;

    return (
      <div style={{ marginTop: 16 }}>
        <Text
          strong
          style={{ display: "block", marginBottom: 12, color: "#667eea" }}
        >
          📝 Pilihan Jawaban:
        </Text>

        <Row gutter={[12, 12]}>
          {["choice_a", "choice_b", "choice_c", "choice_d", "choice_e"].map(
            (choice, index) => {
              const letter = String.fromCharCode(65 + index);
              const isRequired = index < 2;

              return (
                <Col span={24} key={choice}>
                  <Form.Item
                    name={choice}
                    rules={
                      isRequired
                        ? [
                            {
                              required: true,
                              message: `Pilihan ${letter} harus diisi`,
                            },
                          ]
                        : []
                    }
                    style={{ marginBottom: 8 }}
                  >
                    <Input
                      placeholder={`Pilihan ${letter} ${
                        isRequired ? "(Wajib)" : "(Opsional)"
                      }`}
                      addonBefore={
                        <div
                          style={{
                            background: isRequired ? "#1890ff" : "#d9d9d9",
                            color: "white",
                            width: 24,
                            height: 24,
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 12,
                            fontWeight: 600,
                          }}
                        >
                          {letter}
                        </div>
                      }
                      style={{ borderRadius: 8 }}
                    />
                  </Form.Item>
                </Col>
              );
            }
          )}
        </Row>
      </div>
    );
  };

  const columns = [
    {
      title: "No",
      dataIndex: "order",
      key: "order",
      width: 50,
      align: "center",
      render: (order, record, index) => (
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          {index + 1}
        </div>
      ),
    },
    {
      title: "Pertanyaan",
      dataIndex: "text",
      key: "text",
      render: (text, record) => (
        <div>
          <Text
            style={{
              fontSize: isMobile ? 12 : 14,
              lineHeight: 1.4,
              display: "block",
              marginBottom: 8,
            }}
          >
            {text.length > 100 ? `${text.substring(0, 100)}...` : text}
          </Text>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <Tag
              color={dimensionColors[record.dimension]}
              size="small"
              style={{
                borderRadius: 12,
                fontWeight: 600,
                fontSize: 10,
              }}
            >
              {dimensionLabels[record.dimension]}
            </Tag>
            <Tag
              color="blue"
              size="small"
              style={{
                borderRadius: 12,
                fontSize: 10,
              }}
            >
              {typeLabels[record.question_type]}
            </Tag>
            {record.is_required && (
              <Tag
                color="red"
                size="small"
                style={{
                  borderRadius: 12,
                  fontSize: 10,
                }}
              >
                Wajib
              </Tag>
            )}
          </div>
        </div>
      ),
    },
    {
      title: "Aksi",
      key: "actions",
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            title="Edit"
            style={{ borderRadius: 6 }}
          />
          <Popconfirm
            title="Hapus pertanyaan ini?"
            description="Tindakan ini tidak dapat dibatalkan"
            onConfirm={() => console.log("Delete question:", record.id)}
            okText="Ya"
            cancelText="Batal"
          >
            <Button
              size="small"
              icon={<DeleteOutlined />}
              danger
              title="Hapus"
              style={{ borderRadius: 6 }}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (!questionnaire) {
    return (
      <Alert
        message="Pilih Kuesioner"
        description="Silakan pilih kuesioner terlebih dahulu untuk mengelola pertanyaan"
        type="info"
        showIcon
        style={{ borderRadius: 12 }}
      />
    );
  }

  return (
    <div>
      {/* Header */}
      <Card
        style={{
          marginBottom: 24,
          borderRadius: 16,
          background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
          border: "1px solid #bae6fd",
        }}
        bodyStyle={{ padding: isMobile ? "16px" : "20px" }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 16,
          }}
        >
          <div
            style={{
              background: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)",
              borderRadius: "50%",
              width: isMobile ? 48 : 56,
              height: isMobile ? 48 : 56,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px rgba(14, 165, 233, 0.3)",
            }}
          >
            <QuestionCircleOutlined
              style={{
                color: "white",
                fontSize: isMobile ? 20 : 24,
              }}
            />
          </div>
          <div>
            <Title
              level={isMobile ? 5 : 4}
              style={{ margin: 0, color: "#0c4a6e" }}
            >
              🎯 Kelola Pertanyaan ARCS
            </Title>
            <Text style={{ color: "#0369a1", fontSize: isMobile ? 12 : 14 }}>
              {questionnaire.title}
            </Text>
          </div>
        </div>

        {/* Dimension Distribution */}
        <div
          style={{
            background: "rgba(255, 255, 255, 0.8)",
            borderRadius: 12,
            padding: "16px",
            marginBottom: 16,
          }}
        >
          <Text
            strong
            style={{ display: "block", marginBottom: 12, color: "#0c4a6e" }}
          >
            📊 Distribusi Dimensi ARCS:
          </Text>
          <Row gutter={[8, 8]}>
            {Object.entries(dimensionStats).map(([dimension, count]) => (
              <Col xs={12} sm={6} key={dimension}>
                <div
                  style={{
                    textAlign: "center",
                    padding: "8px",
                    background: "white",
                    borderRadius: 8,
                    border: `2px solid ${dimensionColors[dimension]}20`,
                  }}
                >
                  <div
                    style={{
                      color: dimensionColors[dimension],
                      fontWeight: 600,
                      fontSize: isMobile ? 16 : 18,
                    }}
                  >
                    {count}
                  </div>
                  <div
                    style={{
                      fontSize: isMobile ? 10 : 11,
                      color: "#666",
                      fontWeight: 500,
                    }}
                  >
                    {dimensionLabels[dimension]}
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </div>

        {/* Action Button */}
        <div style={{ textAlign: "center" }}>
          <Button
            type="primary"
            onClick={handleAdd}
            size="large"
            style={{
              borderRadius: 8,
              background: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)",
              border: "none",
              boxShadow: "0 4px 12px rgba(14, 165, 233, 0.3)",
              fontWeight: 600,
              height: 44,
              // minWidth: 160,
              width: "100%",
            }}
          >
            ➕ Tambah Pertanyaan
          </Button>
        </div>
      </Card>

      {/* Questions Table */}
      {questions.length > 0 ? (
        <Card
          style={{
            borderRadius: 16,
            border: "none",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          }}
          bodyStyle={{ padding: 0 }}
        >
          <Table
            columns={columns}
            dataSource={questions.map((q, index) => ({
              ...q,
              key: q.id || index,
            }))}
            loading={loading}
            pagination={false}
            scroll={{ x: isMobile ? 500 : undefined }}
            size={isMobile ? "small" : "middle"}
          />
        </Card>
      ) : (
        <Card
          style={{
            borderRadius: 16,
            border: "2px dashed #d9d9d9",
            textAlign: "center",
            padding: "40px 20px",
          }}
        >
          <Empty
            description={
              <div>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: "#667eea",
                    marginBottom: 8,
                  }}
                >
                  Belum ada pertanyaan
                </div>
                <div style={{ fontSize: 14, color: "#666" }}>
                  Mulai buat pertanyaan ARCS untuk kuesioner ini
                </div>
              </div>
            }
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </Card>
      )}

      {/* Question Form Modal */}
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
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
              <BulbOutlined style={{ color: "white", fontSize: 16 }} />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 600, color: "#262626" }}>
                {editingQuestion
                  ? "📝 Edit Pertanyaan"
                  : "➕ Tambah Pertanyaan"}
              </div>
              <div style={{ fontSize: 12, color: "#666" }}>
                Kuesioner: {questionnaire.title}
              </div>
            </div>
          </div>
        }
        open={isModalVisible}
        onCancel={handleCancel}
        width={isMobile ? "95%" : 800}
        footer={null}
        destroyOnClose
        style={{ top: isMobile ? 20 : 40 }}
      >
        {/* ARCS Info */}
        <Alert
          message="Tentang Dimensi ARCS"
          description={
            <div style={{ fontSize: 12 }}>
              <ul style={{ margin: 0, paddingLeft: 16 }}>
                {Object.entries(dimensionDescriptions).map(([key, desc]) => (
                  <li key={key} style={{ marginBottom: 4 }}>
                    <strong style={{ color: dimensionColors[key] }}>
                      {dimensionLabels[key]}:
                    </strong>{" "}
                    {desc}
                  </li>
                ))}
              </ul>
            </div>
          }
          type="info"
          showIcon
          style={{
            marginBottom: 24,
            borderRadius: 8,
            border: "1px solid #d6e4ff",
            background: "#f0f9ff",
          }}
        />

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            dimension: "attention",
            question_type: "likert_5",
            is_required: true,
          }}
        >
          {/* Question Text */}
          <Form.Item
            name="text"
            label={
              <span style={{ fontWeight: 600, color: "#667eea" }}>
                ❓ Teks Pertanyaan
              </span>
            }
            rules={[
              { required: true, message: "Teks pertanyaan harus diisi" },
              { min: 10, message: "Pertanyaan minimal 10 karakter" },
            ]}
          >
            <TextArea
              rows={3}
              placeholder="Masukkan pertanyaan yang akan diajukan kepada siswa..."
              style={{ borderRadius: 8 }}
            />
          </Form.Item>

          <Row gutter={16}>
            {/* Dimension */}
            <Col xs={24} sm={12}>
              <Form.Item
                name="dimension"
                label={
                  <span style={{ fontWeight: 600, color: "#667eea" }}>
                    🎯 Dimensi ARCS
                  </span>
                }
                rules={[{ required: true, message: "Pilih dimensi ARCS" }]}
              >
                <Select
                  placeholder="Pilih dimensi ARCS"
                  style={{ borderRadius: 8 }}
                >
                  {Object.entries(dimensionLabels).map(([key, label]) => (
                    <Option key={key} value={key}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <div
                          style={{
                            width: 12,
                            height: 12,
                            borderRadius: "50%",
                            background: dimensionColors[key],
                          }}
                        />
                        {label}
                      </div>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            {/* Question Type */}
            <Col xs={24} sm={12}>
              <Form.Item
                name="question_type"
                label={
                  <span style={{ fontWeight: 600, color: "#667eea" }}>
                    📝 Tipe Pertanyaan
                  </span>
                }
                rules={[{ required: true, message: "Pilih tipe pertanyaan" }]}
              >
                <Select
                  placeholder="Pilih tipe pertanyaan"
                  style={{ borderRadius: 8 }}
                >
                  {Object.entries(typeLabels).map(([key, label]) => (
                    <Option key={key} value={key}>
                      {label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {/* Multiple Choice Options */}
          <Form.Item dependencies={["question_type"]}>
            {() => renderChoiceInputs()}
          </Form.Item>

          {/* Is Required */}
          <Form.Item
            name="is_required"
            valuePropName="checked"
            style={{ marginBottom: 24 }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "12px 16px",
                background: "#f8fafc",
                borderRadius: 8,
                border: "1px solid #e5e7eb",
              }}
            >
              <Switch size="small" />
              <span style={{ fontWeight: 600, color: "#667eea" }}>
                🔒 Pertanyaan Wajib Dijawab
              </span>
            </div>
          </Form.Item>

          {/* Form Actions */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 12,
              paddingTop: 16,
              borderTop: "1px solid #f0f0f0",
            }}
          >
            <Button
              onClick={handleCancel}
              size="large"
              style={{
                borderRadius: 8,
                minWidth: 100,
                height: 44,
              }}
            >
              Batal
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={submitting}
              size="large"
              style={{
                borderRadius: 8,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                border: "none",
                minWidth: 120,
                height: 44,
                fontWeight: 600,
              }}
            >
              {editingQuestion ? "💾 Update" : "➕ Tambah"}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default ARCSQuestionManager;
