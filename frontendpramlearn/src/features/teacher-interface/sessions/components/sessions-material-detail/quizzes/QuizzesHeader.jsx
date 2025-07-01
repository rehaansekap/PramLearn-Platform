import React from "react";
import { Typography, Button, Space } from "antd";
import { QuestionCircleOutlined, PlusOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const QuizzesHeader = ({
  isMobile = false,
  quizzesCount = 0,
  onAddQuiz,
  loading = false,
}) => {
  return (
    <div
      style={{
        textAlign: "center",
        marginBottom: isMobile ? 24 : 32,
        padding: isMobile ? "24px" : "32px",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        borderRadius: 16,
        color: "white",
        boxShadow: "0 8px 32px rgba(102, 126, 234, 0.2)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background Pattern */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            "url(data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.08'%3E%3Cpath d='M30 30m-10 0a10 10 0 1 1 20 0a10 10 0 1 1 -20 0'/%3E%3Cpath d='M20 20l20 20M40 20l-20 20'/%3E%3C/g%3E%3C/svg%3E)",
          opacity: 0.3,
        }}
      />

      {/* Content */}
      <div style={{ position: "relative", zIndex: 1 }}>
        <div
          style={{
            background: "rgba(255, 255, 255, 0.15)",
            width: isMobile ? 80 : 100,
            height: isMobile ? 80 : 100,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto",
            marginBottom: isMobile ? 16 : 20,
            backdropFilter: "blur(10px)",
            border: "3px solid rgba(255, 255, 255, 0.2)",
          }}
        >
          <QuestionCircleOutlined
            style={{
              fontSize: isMobile ? 32 : 40,
              color: "white",
            }}
          />
        </div>

        <Title
          level={isMobile ? 4 : 3}
          style={{
            color: "white",
            margin: 0,
            marginBottom: isMobile ? 8 : 12,
            fontWeight: 700,
          }}
        >
          Manajemen Quiz
        </Title>

        <Text
          style={{
            fontSize: isMobile ? 14 : 16,
            color: "rgba(255, 255, 255, 0.9)",
            fontWeight: 400,
            display: "block",
            marginBottom: 16,
            maxWidth: 400,
            margin: "0 auto 16px",
          }}
        >
          Kelola quiz kelompok dan pantau progres pengerjaan quiz siswa
        </Text>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={onAddQuiz}
          loading={loading}
          size={isMobile ? "middle" : "large"}
          style={{
            background: "rgba(255, 255, 255, 0.2)",
            borderColor: "rgba(255, 255, 255, 0.3)",
            backdropFilter: "blur(10px)",
            fontWeight: 600,
            height: isMobile ? 40 : 48,
            minWidth: isMobile ? 120 : 160,
            borderRadius: 24,
          }}
        >
          {isMobile ? "Buat Quiz" : "Buat Quiz Baru"}
        </Button>
      </div>
    </div>
  );
};

export default QuizzesHeader;
