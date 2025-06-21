import React from "react";
import { Button, Space, Grid } from "antd";
import { BookOutlined, FileTextOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { useBreakpoint } = Grid;

const GroupQuizActions = ({ results }) => {
  const navigate = useNavigate();
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  return (
    <div
      style={{
        textAlign: "center",
        marginTop: 32,
        padding: "24px",
        background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
        borderRadius: 16,
        border: "1px solid #cbd5e0",
      }}
    >
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <div>
          <h3 style={{ margin: "0 0 8px 0", color: "#2d3748" }}>
            🎯 Langkah Selanjutnya
          </h3>
          <p style={{ margin: 0, color: "#718096", fontSize: 14 }}>
            Lanjutkan perjalanan belajar kelompok Anda dengan mengeksplorasi
            materi lain atau mengerjakan kuis tambahan
          </p>
        </div>

        <Space
          direction={isMobile ? "vertical" : "horizontal"}
          size={16}
          style={{
            width: "100%",
            justifyContent: "center",
            display: "flex",
            flexWrap: "wrap",
            gap: isMobile ? 12 : 16,
          }}
        >
          <Button
            type="primary"
            icon={<BookOutlined />}
            onClick={() =>
              navigate(
                `/student/materials/${results.material_slug || "unknown"}`
              )
            }
            style={{
              background:
                "linear-gradient(135deg, #001529 0%, #3a3f5c 60%, #43cea2 100%)",
              borderColor: "#d9d9d9",
              borderRadius: 12,
              fontWeight: 600,
              height: 48,
              padding: "0 24px",
              fontSize: 14,
              boxShadow: "0 4px 16px rgba(0, 21, 41, 0.3)",
              minWidth: isMobile ? "200px" : "auto",
              width: isMobile ? "100%" : "auto",
              maxWidth: isMobile ? "280px" : "none",
              margin: isMobile ? "0 auto" : 0,
            }}
          >
            Kembali ke Mata Pelajaran
          </Button>

          <Button
            icon={<FileTextOutlined />}
            onClick={() => navigate("/student/assessments")}
            size="large"
            style={{
              borderRadius: 12,
              fontWeight: 600,
              height: 48,
              padding: "0 24px",
              fontSize: 14,
              minWidth: isMobile ? "200px" : "auto",
              width: isMobile ? "100%" : "auto",
              maxWidth: isMobile ? "280px" : "none",
              margin: isMobile ? "0 auto" : 0,
              borderColor: "#11418b",
              color: "#11418b",
            }}
          >
            Lihat Kuis Lainnya
          </Button>
        </Space>
      </Space>
    </div>
  );
};

export default GroupQuizActions;
