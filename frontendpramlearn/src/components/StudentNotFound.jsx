import React from "react";
import { Result, Button } from "antd";
import { HomeOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const StudentNotFound = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate("/student");
  };

  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <div style={{ padding: "40px 16px", textAlign: "center" }}>
      <Result
        status="404"
        title={
          <span
            style={{
              fontSize: "2.5rem",
              fontWeight: 800,
              background: "linear-gradient(135deg, #11418b 0%, #1890ff 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            404
          </span>
        }
        subTitle={
          <div style={{ marginBottom: 32 }}>
            <h3
              style={{
                color: "#11418b",
                fontSize: "1.25rem",
                fontWeight: 600,
                marginBottom: 12,
              }}
            >
              Halaman Tidak Ditemukan
            </h3>
            <p
              style={{
                color: "#666",
                fontSize: "16px",
                lineHeight: 1.6,
                marginBottom: 8,
              }}
            >
              Halaman yang Anda cari tidak dapat ditemukan di area student.
            </p>
            <p
              style={{
                color: "#999",
                fontSize: "14px",
              }}
            >
              Silakan kembali ke dashboard atau halaman sebelumnya.
            </p>
          </div>
        }
        extra={
          <div
            style={{
              display: "flex",
              gap: 16,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <Button
              type="default"
              icon={<ArrowLeftOutlined />}
              onClick={handleGoBack}
              size="large"
              style={{
                height: 48,
                padding: "0 24px",
                borderRadius: 12,
                fontSize: 16,
                fontWeight: 600,
                border: "2px solid #e6f7ff",
                color: "#11418b",
                minWidth: 120,
              }}
            >
              Kembali
            </Button>
            <Button
              type="primary"
              icon={<HomeOutlined />}
              onClick={handleGoHome}
              size="large"
              style={{
                height: 48,
                padding: "0 24px",
                borderRadius: 12,
                fontSize: 16,
                fontWeight: 600,
                background: "linear-gradient(135deg, #11418b 0%, #1890ff 100%)",
                border: "none",
                boxShadow: "0 8px 20px rgba(17, 65, 139, 0.3)",
                minWidth: 120,
              }}
            >
              Dashboard
            </Button>
          </div>
        }
      />
    </div>
  );
};

export default StudentNotFound;
