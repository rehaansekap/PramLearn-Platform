import React from "react";
import { Typography } from "antd";
import { ClockCircleOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { Text } = Typography;

const TimeRemaining = ({ quiz, timeRemaining, timeColor }) => {
  if (!quiz.end_time) return null;

  const isExpired = timeRemaining === "EXPIRED";

  return (
    <div
      style={{
        background: isExpired
          ? "linear-gradient(135deg, #fff2f0 0%, #ffebe6 100%)"
          : "linear-gradient(135deg, #f6ffed 0%, #e6fffb 100%)",
        border: `1px solid ${isExpired ? "#ffccc7" : "#b7eb8f"}`,
        borderRadius: 12,
        padding: "16px",
        marginBottom: 16,
        textAlign: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          marginBottom: 8,
        }}
      >
        <div
          style={{
            background: isExpired ? "#ff4d4f" : "#52c41a",
            borderRadius: "50%",
            width: 24,
            height: 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ClockCircleOutlined style={{ color: "white", fontSize: 12 }} />
        </div>
        <Text
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "#666",
          }}
        >
          {isExpired ? "Waktu Habis" : "Sisa Waktu"}
        </Text>
      </div>

      <div
        style={{
          fontSize: 18,
          fontWeight: 700,
          color: isExpired ? "#ff4d4f" : timeColor,
          marginBottom: 4,
        }}
      >
        {isExpired ? "KEDALUWARSA" : timeRemaining || "Tidak Terbatas"}
      </div>

      <Text style={{ fontSize: 12, color: "#999" }}>
        Batas Waktu: {dayjs(quiz.end_time).format("DD MMM YYYY, HH:mm")}
      </Text>
    </div>
  );
};

export default TimeRemaining;
