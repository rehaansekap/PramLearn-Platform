import React from "react";
import { Button, Space } from "antd";
import { BookOutlined, FileTextOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const ActionButtons = ({ isMobile }) => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        textAlign: "center",
        marginTop: 32,
        paddingTop: 24,
        borderTop: "1px solid #f0f0f0",
      }}
    >
      <Space
        direction={isMobile ? "vertical" : "horizontal"}
        size="large"
        wrap
        style={{
          width: isMobile ? "100%" : "auto",
          justifyContent: "center",
          display: "flex",
          gap: isMobile ? 16 : 24,
        }}
      >
        <Button
          icon={<BookOutlined />}
          onClick={() => navigate("/student/subjects")}
          size="large"
          style={{
            borderRadius: 12,
            fontWeight: 600,
            height: 48,
            padding: "0 24px",
            boxShadow: "0 4px 16px rgba(0, 21, 41, 0.3)",
            minWidth: isMobile ? "100%" : "200px",
            width: isMobile ? "100%" : "auto",
            maxWidth: isMobile ? "100%" : "280px",
            margin: isMobile ? "0" : undefined,
            display: "block",
          }}
          block={isMobile}
        >
          Kembali ke Mata Pelajaran
        </Button>

        <Button
          type="primary"
          icon={<FileTextOutlined />}
          onClick={() => navigate("/student/assignments")}
          size="large"
          style={{
            background:
              "linear-gradient(135deg, #001529 0%, #3a3f5c 60%, #43cea2 100%)",
            borderColor: "#d9d9d9",
            borderRadius: 12,
            fontWeight: 600,
            height: 48,
            padding: "0 24px",
            boxShadow: "0 4px 16px rgba(0, 21, 41, 0.3)",
            minWidth: isMobile ? "100%" : "200px",
            width: isMobile ? "100%" : "auto",
            maxWidth: isMobile ? "100%" : "280px",
            margin: isMobile ? "0" : undefined,
            display: "block",
          }}
          block={isMobile}
        >
          Lihat Tugas Lainnya
        </Button>
      </Space>
    </div>
  );
};

export default ActionButtons;
