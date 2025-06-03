import React from "react";
import { Card, Input, Radio, Button, Space } from "antd";
import { DeleteOutlined } from "@ant-design/icons";

const { TextArea } = Input;

const choices = ["A", "B", "C", "D"];

const AssignmentQuestionForm = ({
  question,
  idx,
  onChange,
  onRemove,
  disabled = false,
}) => (
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
          value={question.correct_choice}
          onChange={(e) => onChange(idx, "correct_choice", e.target.value)}
          style={{ width: "100%" }}
          disabled={disabled}
        >
          <Space direction="vertical" style={{ width: "100%" }}>
            {choices.map((label) => (
              <div
                key={label}
                style={{ display: "flex", alignItems: "center", gap: 8 }}
              >
                <Radio value={label} style={{ fontWeight: "600" }}>
                  {label}.
                </Radio>
                <Input
                  placeholder={`Pilihan ${label}`}
                  value={question[`choice_${label.toLowerCase()}`]}
                  onChange={(e) =>
                    onChange(
                      idx,
                      `choice_${label.toLowerCase()}`,
                      e.target.value
                    )
                  }
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

export default AssignmentQuestionForm;
