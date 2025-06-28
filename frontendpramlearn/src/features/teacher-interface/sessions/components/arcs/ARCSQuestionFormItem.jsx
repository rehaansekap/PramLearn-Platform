import React from "react";
import {
  Card,
  Input,
  Select,
  Switch,
  Button,
  Row,
  Col,
  Space,
  Typography,
} from "antd";
import { DeleteOutlined, DragOutlined } from "@ant-design/icons";

const { TextArea } = Input;
const { Option } = Select;
const { Text } = Typography;

const ARCSQuestionFormItem = ({ question, index, onUpdate, onRemove }) => {
  const handleFieldChange = (field, value) => {
    onUpdate(index, field, value);
  };

  const renderChoiceInputs = () => {
    if (question.question_type !== "multiple_choice") return null;

    const choices = [
      "choice_a",
      "choice_b",
      "choice_c",
      "choice_d",
      "choice_e",
    ];
    const labels = ["A", "B", "C", "D", "E"];

    return (
      <div style={{ marginTop: 12 }}>
        <Text strong style={{ fontSize: 12, color: "#666" }}>
          Pilihan Jawaban:
        </Text>
        <div style={{ marginTop: 8 }}>
          {choices.map((choice, choiceIndex) => (
            <div key={choice} style={{ marginBottom: 8 }}>
              <Input
                placeholder={`Pilihan ${labels[choiceIndex]} ${
                  choiceIndex < 2 ? "(Wajib)" : "(Opsional)"
                }`}
                value={question[choice] || ""}
                onChange={(e) => handleFieldChange(choice, e.target.value)}
                addonBefore={labels[choiceIndex]}
                required={choiceIndex < 2}
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Card
      size="small"
      style={{
        marginBottom: 16,
        border: "1px solid #e8e8e8",
      }}
      title={
        <Space align="center">
          <DragOutlined style={{ color: "#999", cursor: "move" }} />
          <Text strong>Pertanyaan {index + 1}</Text>
        </Space>
      }
      extra={
        <Button
          type="text"
          danger
          size="small"
          icon={<DeleteOutlined />}
          onClick={() => onRemove(index)}
          title="Hapus pertanyaan"
        />
      }
    >
      <Row gutter={[16, 12]}>
        <Col span={24}>
          <Text strong style={{ fontSize: 12, color: "#666" }}>
            Teks Pertanyaan: *
          </Text>
          <TextArea
            placeholder="Masukkan teks pertanyaan..."
            value={question.text}
            onChange={(e) => handleFieldChange("text", e.target.value)}
            rows={2}
            style={{ marginTop: 4 }}
          />
        </Col>

        <Col xs={24} sm={12}>
          <Text strong style={{ fontSize: 12, color: "#666" }}>
            Dimensi ARCS: *
          </Text>
          <Select
            value={question.dimension}
            onChange={(value) => handleFieldChange("dimension", value)}
            style={{ width: "100%", marginTop: 4 }}
            placeholder="Pilih dimensi"
          >
            <Option value="attention">Attention (Perhatian)</Option>
            <Option value="relevance">Relevance (Relevansi)</Option>
            <Option value="confidence">Confidence (Percaya Diri)</Option>
            <Option value="satisfaction">Satisfaction (Kepuasan)</Option>
          </Select>
        </Col>

        <Col xs={24} sm={12}>
          <Text strong style={{ fontSize: 12, color: "#666" }}>
            Tipe Pertanyaan: *
          </Text>
          <Select
            value={question.question_type}
            onChange={(value) => handleFieldChange("question_type", value)}
            style={{ width: "100%", marginTop: 4 }}
            placeholder="Pilih tipe"
          >
            <Option value="likert_5">Skala Likert 1-5</Option>
            <Option value="likert_7">Skala Likert 1-7</Option>
            <Option value="multiple_choice">Pilihan Ganda</Option>
            <Option value="text">Input Teks</Option>
          </Select>
        </Col>

        <Col span={24}>
          <Space align="center">
            <Text strong style={{ fontSize: 12, color: "#666" }}>
              Wajib dijawab:
            </Text>
            <Switch
              checked={question.is_required}
              onChange={(checked) => handleFieldChange("is_required", checked)}
              size="small"
            />
          </Space>
        </Col>

        {renderChoiceInputs()}
      </Row>
    </Card>
  );
};

export default ARCSQuestionFormItem;
