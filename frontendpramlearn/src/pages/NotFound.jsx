import React from "react";
import { Result, Button, Card } from "antd";
import { HomeOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const NotFound = () => {
  const navigate = useNavigate();
  const { user, token } = useContext(AuthContext);

  // Helper function untuk mendapatkan home path berdasarkan role
  const getHomePath = () => {
    if (!token || !user) return "/login";

    switch (user.role) {
      case 1:
        return "/admin";
      case 2:
        return "/teacher";
      case 3:
        return "/student";
      default:
        return "/login";
    }
  };

  const handleGoHome = () => {
    navigate(getHomePath());
  };

  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background Decoration */}
      <div
        style={{
          position: "absolute",
          top: "-30%",
          right: "-20%",
          width: "40%",
          height: "160%",
          background: "rgba(255, 255, 255, 0.1)",
          borderRadius: "50%",
          transform: "rotate(45deg)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-20%",
          left: "-15%",
          width: "50%",
          height: "50%",
          background: "rgba(255, 255, 255, 0.05)",
          borderRadius: "50%",
        }}
      />

      <Card
        style={{
          width: "100%",
          maxWidth: 600,
          borderRadius: 20,
          boxShadow: "0 25px 50px rgba(0,0,0,0.15)",
          border: "none",
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(20px)",
          position: "relative",
          zIndex: 1,
        }}
        bodyStyle={{
          padding: "48px 40px",
        }}
      >
        <Result
          status="404"
          title={
            <span
              style={{
                fontSize: "3rem",
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
              <h2
                style={{
                  color: "#11418b",
                  fontSize: "1.5rem",
                  fontWeight: 600,
                  marginBottom: 16,
                }}
              >
                Halaman Tidak Ditemukan
              </h2>
              <p
                style={{
                  color: "#666",
                  fontSize: "16px",
                  lineHeight: 1.6,
                  marginBottom: 8,
                }}
              >
                Maaf, halaman yang Anda cari tidak dapat ditemukan atau mungkin
                telah dipindahkan.
              </p>
              <p
                style={{
                  color: "#999",
                  fontSize: "14px",
                }}
              >
                Silakan periksa URL atau kembali ke halaman utama.
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
                  minWidth: 140,
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
                  background:
                    "linear-gradient(135deg, #11418b 0%, #1890ff 100%)",
                  border: "none",
                  boxShadow: "0 8px 20px rgba(17, 65, 139, 0.3)",
                  minWidth: 140,
                }}
              >
                Beranda
              </Button>
            </div>
          }
        />

        {/* Footer dengan branding */}
        <div
          style={{
            textAlign: "center",
            marginTop: 32,
            paddingTop: 24,
            borderTop: "1px solid #f0f0f0",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 8,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #11418b 0%, #1890ff 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 12,
              }}
            >
              <span style={{ color: "#fff", fontSize: 16, fontWeight: 700 }}>
                P
              </span>
            </div>
            <span
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: "#11418b",
              }}
            >
              PramLearn
            </span>
          </div>
          <p
            style={{
              color: "#999",
              fontSize: 14,
              margin: 0,
            }}
          >
            Platform Pembelajaran Cerdas
          </p>
        </div>
      </Card>
    </div>
  );
};

export default NotFound;
