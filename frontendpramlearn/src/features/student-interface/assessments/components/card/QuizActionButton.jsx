import React from "react";
import { Button } from "antd";
import { TrophyOutlined, PlayCircleOutlined } from "@ant-design/icons";

const QuizActionButton = ({ quiz, status, timeRemaining, onStartQuiz }) => {
  const isExpired = timeRemaining === "EXPIRED";

  const getButtonConfig = () => {
    if (status.status === "completed") {
      return {
        text: "Lihat Hasil",
        type: "default",
        icon: <TrophyOutlined />,
        style: {
          background:
            "linear-gradient(135deg, #ffec3d 0%, #faad14 50%, #ff8c00 100%)",
          borderColor: "transparent",
          color: "#001529",
          fontWeight: 600,
          boxShadow: "0 4px 12px rgba(255, 173, 20, 0.4)",
          textShadow: "0 1px 2px rgba(0,0,0,0.2)",
        },
      };
    }

    return {
      text: status.status === "in_progress" ? "Lanjutkan Kuis" : "Mulai Kuis",
      type: "primary",
      icon: <PlayCircleOutlined />,
      style: {
        background:
          "linear-gradient(135deg, #001529 0%, #3a3f5c 60%, #43cea2 100%)",
      },
    };
  };

  const buttonConfig = getButtonConfig();

  return (
    <Button
      type={buttonConfig.type}
      icon={buttonConfig.icon}
      onClick={() => onStartQuiz(quiz)}
      disabled={isExpired && status.status !== "completed"}
      size="large"
      style={{
        width: "100%",
        height: 48,
        borderRadius: 10,
        fontWeight: 600,
        fontSize: 13,
        background:
          isExpired && status.status !== "completed"
            ? "#f5f5f5"
            : buttonConfig.style.background,
        border:
          isExpired && status.status !== "completed"
            ? "1px solid #d9d9d9"
            : "none",
        color:
          isExpired && status.status !== "completed"
            ? "#999"
            : buttonConfig.style.color,
        boxShadow:
          isExpired && status.status !== "completed"
            ? "none"
            : buttonConfig.style.boxShadow || "0 4px 12px rgba(0, 21, 41, 0.2)",
        textShadow: buttonConfig.style.textShadow,
        transition: "all 0.3s ease",
      }}
      onMouseEnter={(e) => {
        if (!isExpired && buttonConfig.style.background) {
          e.currentTarget.style.transform = "translateY(-2px)";
        }
      }}
      onMouseLeave={(e) => {
        if (!isExpired && buttonConfig.style.background) {
          e.currentTarget.style.transform = "translateY(0)";
        }
      }}
    >
      {/* isexpired && not submited maka tampilkan "Waktu Habis" */}
      {isExpired && status.status !== "completed"
        ? "Waktu Habis"
        : buttonConfig.text}
    </Button>
  );
};

export default QuizActionButton;
