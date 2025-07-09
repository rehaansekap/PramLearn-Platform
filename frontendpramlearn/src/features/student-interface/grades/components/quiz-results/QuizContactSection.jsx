import React from "react";
import { Card, Typography, Space, Button } from "antd";
import { CommentOutlined, UserOutlined, TeamOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const QuizContactSection = ({ isGroupQuiz }) => {
  return (
    <Card
      style={{
        marginTop: 24,
        borderRadius: 16,
        border: "2px dashed #d9d9d9",
        background: "linear-gradient(135deg, #fafafa 0%, #f0f2f5 100%)",
      }}
    >
      <div style={{ textAlign: "center", padding: "20px 0" }}>
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #1890ff 0%, #52c41a 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
            boxShadow: "0 4px 12px rgba(24, 144, 255, 0.3)",
          }}
        >
          <CommentOutlined style={{ fontSize: 24, color: "white" }} />
        </div>

        <Title level={5} style={{ margin: "0 0 8px 0", color: "#11418b" }}>
          💬 Butuh Penjelasan Lebih Lanjut?
        </Title>

        <Text type="secondary" style={{ fontSize: 14, lineHeight: 1.5 }}>
          {isGroupQuiz
            ? "Hubungi guru mata pelajaran untuk diskusi strategi kelompok dan review materi bersama"
            : "Hubungi guru mata pelajaran untuk diskusi lebih detail tentang hasil quiz ini"}
        </Text>

        <div style={{ marginTop: 20 }}>
          <Space size={12}>
            <Button
              type="primary"
              icon={<UserOutlined />}
              style={{
                borderRadius: 8,
                height: 40,
                paddingLeft: 20,
                paddingRight: 20,
                fontWeight: 600,
                background: "linear-gradient(135deg, #1890ff 0%, #52c41a 100%)",
                border: "none",
              }}
            >
              Kontak Guru
            </Button>
            {isGroupQuiz && (
              <Button
                icon={<TeamOutlined />}
                style={{
                  borderRadius: 8,
                  height: 40,
                  paddingLeft: 20,
                  paddingRight: 20,
                  fontWeight: 600,
                  borderColor: "#722ed1",
                  color: "#722ed1",
                }}
              >
                Diskusi Kelompok
              </Button>
            )}
          </Space>
        </div>
      </div>
    </Card>
  );
};

export default QuizContactSection;
