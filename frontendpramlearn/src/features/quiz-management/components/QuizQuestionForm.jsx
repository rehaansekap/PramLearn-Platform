import React from "react";
import { Card, Input, Radio, Button, Space } from "antd";
import { DeleteOutlined } from "@ant-design/icons";

const { TextArea } = Input;

const QuizQuestionForm = ({
  question,
  idx,
  onChange,
  onChoiceChange,
  onRemove,
  disabled = false, // Tambahkan prop disabled
}) => {
  const choices = ["A", "B", "C", "D"];

  return (
    <Card
      size="small"
      style={{
        marginBottom: 16,
        border: "1px solid #d9d9d9",
        borderRadius: "8px",
        opacity: disabled ? 0.6 : 1,
      }}
      title={
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontWeight: "600", color: "#11418b" }}>
            Soal {idx + 1}
          </span>
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => onRemove(idx)}
            title="Hapus Soal"
            size="small"
            disabled={disabled}
          />
        </div>
      }
    >
      <Space direction="vertical" style={{ width: "100%" }}>
        <div>
          <label
            style={{ fontWeight: "600", marginBottom: "8px", display: "block" }}
          >
            Pertanyaan:
          </label>
          <TextArea
            placeholder="Tulis soal..."
            value={question.text}
            onChange={(e) => onChange(idx, "text", e.target.value)}
            rows={3}
            style={{ marginBottom: 16 }}
            disabled={disabled}
          />
        </div>

        <div>
          <label
            style={{ fontWeight: "600", marginBottom: "8px", display: "block" }}
          >
            Pilihan Jawaban:
          </label>
          <Radio.Group
            value={question.correctChoice}
            onChange={(e) => onChange(idx, "correctChoice", e.target.value)}
            style={{ width: "100%" }}
            disabled={disabled}
          >
            <Space direction="vertical" style={{ width: "100%" }}>
              {choices.map((label, cIdx) => (
                <div
                  key={label}
                  style={{ display: "flex", alignItems: "center", gap: 8 }}
                >
                  <Radio value={label} style={{ fontWeight: "600" }}>
                    {label}.
                  </Radio>
                  <Input
                    placeholder={`Pilihan ${label}`}
                    value={question.choices ? question.choices[cIdx] : ""}
                    onChange={(e) => onChoiceChange(idx, cIdx, e.target.value)}
                    style={{ flex: 1 }}
                    disabled={disabled}
                  />
                </div>
              ))}
            </Space>
          </Radio.Group>
        </div>

        <div
          style={{
            fontSize: "12px",
            color: "#666",
            fontStyle: "italic",
            marginTop: "8px",
          }}
        >
          * Pilih radio button untuk menentukan jawaban yang benar
        </div>
      </Space>
    </Card>
  );
};

export default QuizQuestionForm;
