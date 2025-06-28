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
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  DragOutlined,
  QuestionCircleOutlined,
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
    attention: "blue",
    relevance: "green",
    confidence: "orange",
    satisfaction: "purple",
  };

  const dimensionLabels = {
    attention: "Attention",
    relevance: "Relevance",
    confidence: "Confidence",
    satisfaction: "Satisfaction",
  };

  const typeLabels = {
    likert_5: "Likert 1-5",
    likert_7: "Likert 1-7",
    multiple_choice: "Pilihan Ganda",
    text: "Input Teks",
  };

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
      <>
        <Form.Item
          label="Pilihan A"
          name="choice_a"
          rules={[{ required: true, message: "Pilihan A harus diisi" }]}
        >
          <Input placeholder="Masukkan pilihan A" />
        </Form.Item>

        <Form.Item
          label="Pilihan B"
          name="choice_b"
          rules={[{ required: true, message: "Pilihan B harus diisi" }]}
        >
          <Input placeholder="Masukkan pilihan B" />
        </Form.Item>

        <Form.Item label="Pilihan C" name="choice_c">
          <Input placeholder="Masukkan pilihan C (opsional)" />
        </Form.Item>

        <Form.Item label="Pilihan D" name="choice_d">
          <Input placeholder="Masukkan pilihan D (opsional)" />
        </Form.Item>

        <Form.Item label="Pilihan E" name="choice_e">
          <Input placeholder="Masukkan pilihan E (opsional)" />
        </Form.Item>
      </>
    );
  };

  const columns = [
    {
      title: "No",
      dataIndex: "order",
      key: "order",
      width: 50,
      align: "center",
      sorter: (a, b) => a.order - b.order,
    },
    {
      title: "Pertanyaan",
      dataIndex: "text",
      key: "text",
      ellipsis: true,
      render: (text) => (
        <Text style={{ fontSize: isMobile ? 12 : 14 }}>
          {text.length > 80 ? `${text.substring(0, 80)}...` : text}
        </Text>
      ),
    },
    {
      title: "Dimensi",
      dataIndex: "dimension",
      key: "dimension",
      width: 120,
      render: (dimension) => (
        <Tag color={dimensionColors[dimension]} size="small">
          {dimensionLabels[dimension]}
        </Tag>
      ),
      filters: [
        { text: "Attention", value: "attention" },
        { text: "Relevance", value: "relevance" },
        { text: "Confidence", value: "confidence" },
        { text: "Satisfaction", value: "satisfaction" },
      ],
      onFilter: (value, record) => record.dimension === value,
    },
    {
      title: "Tipe",
      dataIndex: "question_type",
      key: "question_type",
      width: 100,
      render: (type) => (
        <Tag color="blue" size="small">
          {typeLabels[type]}
        </Tag>
      ),
      responsive: ["md"],
    },
    {
      title: "Wajib",
      dataIndex: "is_required",
      key: "is_required",
      width: 80,
      align: "center",
      render: (required) => (
        <Tag color={required ? "green" : "default"} size="small">
          {required ? "Ya" : "Tidak"}
        </Tag>
      ),
      responsive: ["lg"],
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
          />
          <Popconfirm
            title="Hapus pertanyaan ini?"
            description="Tindakan ini tidak dapat dibatalkan."
            onConfirm={() => {
              /* Handle delete */
            }}
            okText="Ya, Hapus"
            cancelText="Batal"
          >
            <Button
              size="small"
              icon={<DeleteOutlined />}
              danger
              title="Hapus"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (questions.length === 0 && !loading) {
    return (
      <Card>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <div>
              <Text>Belum ada pertanyaan untuk kuesioner ini.</Text>
              <br />
              <Text type="secondary">
                Tambahkan pertanyaan untuk mengukur dimensi ARCS.
              </Text>
            </div>
          }
        >
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            Tambah Pertanyaan Pertama
          </Button>
        </Empty>
      </Card>
    );
  }

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <div>
          <Title level={5} style={{ margin: 0, color: "#11418b" }}>
            Pertanyaan Kuesioner
          </Title>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Kelola pertanyaan untuk mengukur motivasi siswa
          </Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
          size={isMobile ? "small" : "middle"}
        >
          {isMobile ? "Tambah" : "Tambah Pertanyaan"}
        </Button>
      </div>

      {/* Summary Stats */}
      <Alert
        message={`Total: ${questions.length} pertanyaan`}
        description={
          <div>
            {Object.entries(dimensionLabels).map(([key, label]) => {
              const count = questions.filter((q) => q.dimension === key).length;
              return (
                <Tag
                  key={key}
                  color={dimensionColors[key]}
                  style={{ margin: "2px" }}
                >
                  {label}: {count}
                </Tag>
              );
            })}
          </div>
        }
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />

      {/* Questions Table */}
      <Table
        columns={columns}
        dataSource={questions.map((q) => ({ ...q, key: q.id }))}
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: false,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} dari ${total} pertanyaan`,
        }}
        scroll={{ x: isMobile ? 800 : undefined }}
        size={isMobile ? "small" : "middle"}
      />

      {/* Add/Edit Modal */}
      <Modal
        title={
          <div style={{ textAlign: "center" }}>
            <QuestionCircleOutlined
              style={{ fontSize: 20, color: "#11418b", marginRight: 8 }}
            />
            {editingQuestion ? "Edit Pertanyaan" : "Tambah Pertanyaan Baru"}
          </div>
        }
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={600}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          style={{ marginTop: 16 }}
        >
          <Form.Item
            label="Teks Pertanyaan"
            name="text"
            rules={[
              { required: true, message: "Teks pertanyaan harus diisi" },
              { min: 10, message: "Pertanyaan minimal 10 karakter" },
            ]}
          >
            <TextArea
              placeholder="Masukkan teks pertanyaan..."
              rows={3}
              maxLength={500}
              showCount
            />
          </Form.Item>

          <Form.Item
            label="Dimensi ARCS"
            name="dimension"
            rules={[{ required: true, message: "Pilih dimensi ARCS" }]}
          >
            <Select placeholder="Pilih dimensi ARCS">
              <Option value="attention">Attention (Perhatian)</Option>
              <Option value="relevance">Relevance (Relevansi)</Option>
              <Option value="confidence">Confidence (Percaya Diri)</Option>
              <Option value="satisfaction">Satisfaction (Kepuasan)</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Tipe Pertanyaan"
            name="question_type"
            rules={[{ required: true, message: "Pilih tipe pertanyaan" }]}
            initialValue="likert_5"
          >
            <Select placeholder="Pilih tipe pertanyaan">
              <Option value="likert_5">Skala Likert 1-5</Option>
              <Option value="likert_7">Skala Likert 1-7</Option>
              <Option value="multiple_choice">Pilihan Ganda</Option>
              <Option value="text">Input Teks</Option>
            </Select>
          </Form.Item>

          {renderChoiceInputs()}

          <Form.Item
            label="Wajib Dijawab"
            name="is_required"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch />
          </Form.Item>

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
            <Button type="primary" htmlType="submit" loading={submitting}>
              {editingQuestion ? "Update" : "Tambah"} Pertanyaan
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default ARCSQuestionManager;
