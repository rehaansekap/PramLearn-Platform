import React, { useState } from "react";
import {
  Form,
  Input,
  Button,
  Card,
  Typography,
  Space,
  Alert,
  Spin,
} from "antd";
import {
  UserOutlined,
  LockOutlined,
  LoginOutlined,
  BookOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const LoginForm = ({ onFinish, loading = false, error = null }) => {
  const [form] = Form.useForm();

  const handleSubmit = (values) => {
    onFinish(values);
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
          top: "-50%",
          right: "-20%",
          width: "40%",
          height: "200%",
          background: "rgba(255, 255, 255, 0.1)",
          borderRadius: "50%",
          transform: "rotate(45deg)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-30%",
          left: "-20%",
          width: "60%",
          height: "60%",
          background: "rgba(255, 255, 255, 0.05)",
          borderRadius: "50%",
        }}
      />

      <Card
        style={{
          width: "100%",
          maxWidth: 420,
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
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div
            style={{
              width: 88,
              height: 88,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #11418b 0%, #1890ff 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px",
              boxShadow: "0 12px 25px rgba(17, 65, 139, 0.3)",
              position: "relative",
            }}
          >
            <BookOutlined style={{ fontSize: 40, color: "#fff" }} />
            <div
              style={{
                position: "absolute",
                top: -3,
                right: -3,
                width: 24,
                height: 24,
                borderRadius: "50%",
                background: "#52c41a",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span style={{ fontSize: 12, color: "#fff" }}>✓</span>
            </div>
          </div>
          <Title
            level={1}
            style={{
              color: "#11418b",
              marginBottom: 8,
              fontWeight: 800,
              fontSize: 32,
              background: "linear-gradient(135deg, #11418b 0%, #1890ff 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            PramLearn
          </Title>
          <Text
            style={{
              fontSize: 16,
              color: "#666",
              fontWeight: 500,
            }}
          >
            Platform Pembelajaran Cerdas
          </Text>
          <div
            style={{
              marginTop: 16,
              padding: "8px 16px",
              background: "linear-gradient(90deg, #f0f7ff 0%, #e6f7ff 100%)",
              borderRadius: 20,
              border: "1px solid #d6e4ff",
            }}
          >
            <Text
              style={{
                fontSize: 14,
                color: "#11418b",
                fontWeight: 600,
              }}
            >
              Masuk ke akun Anda untuk melanjutkan
            </Text>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert
            message="Login Gagal"
            description={error}
            type="error"
            showIcon
            style={{
              marginBottom: 24,
              borderRadius: 12,
              border: "1px solid #ffccc7",
            }}
          />
        )}

        {/* Login Form */}
        <Form
          form={form}
          name="login"
          onFinish={handleSubmit}
          layout="vertical"
          requiredMark={false}
          size="large"
        >
          <Form.Item
            name="username"
            rules={[
              {
                required: true,
                message: "Username wajib diisi!",
              },
            ]}
            style={{ marginBottom: 20 }}
          >
            <Input
              prefix={
                <UserOutlined
                  style={{ color: "#11418b", fontSize: 16, opacity: 0.8 }}
                />
              }
              placeholder="Masukkan username"
              style={{
                borderRadius: 12,
                border: "2px solid #e6f7ff",
                boxShadow: "none",
                height: 52,
                fontSize: 16,
                backgroundColor: "#fafcff",
                transition: "all 0.3s ease",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#11418b";
                e.target.style.boxShadow = "0 0 0 3px rgba(17, 65, 139, 0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#e6f7ff";
                e.target.style.boxShadow = "none";
              }}
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              {
                required: true,
                message: "Password wajib diisi!",
              },
            ]}
            style={{ marginBottom: 32 }}
          >
            <Input.Password
              prefix={
                <LockOutlined
                  style={{ color: "#11418b", fontSize: 16, opacity: 0.8 }}
                />
              }
              placeholder="Masukkan password"
              style={{
                borderRadius: 12,
                border: "2px solid #e6f7ff",
                boxShadow: "none",
                height: 52,
                fontSize: 16,
                backgroundColor: "#fafcff",
                transition: "all 0.3s ease",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#11418b";
                e.target.style.boxShadow = "0 0 0 3px rgba(17, 65, 139, 0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#e6f7ff";
                e.target.style.boxShadow = "none";
              }}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              icon={!loading && <LoginOutlined />}
              style={{
                width: "100%",
                height: 52,
                borderRadius: 12,
                fontSize: 16,
                fontWeight: 600,
                background: "linear-gradient(135deg, #11418b 0%, #1890ff 100%)",
                border: "none",
                boxShadow: "0 8px 20px rgba(17, 65, 139, 0.3)",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.target.style.transform = "translateY(-2px)";
                  e.target.style.boxShadow =
                    "0 12px 25px rgba(17, 65, 139, 0.4)";
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow =
                    "0 8px 20px rgba(17, 65, 139, 0.3)";
                }
              }}
            >
              {loading ? (
                <Space>
                  <Spin size="small" />
                  Memproses Login...
                </Space>
              ) : (
                "Masuk ke PramLearn"
              )}
            </Button>
          </Form.Item>
        </Form>

        {/* Footer */}
        <div style={{ textAlign: "center", marginTop: 32 }}>
          <Text
            style={{
              fontSize: 14,
              color: "#999",
            }}
          >
            Belum punya akun?{" "}
            <Text
              style={{
                color: "#11418b",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Hubungi Administrator
            </Text>
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default LoginForm;
