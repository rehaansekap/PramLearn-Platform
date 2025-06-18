import React from "react";
import { Card, Row, Col, Avatar, Typography, Space } from "antd";
import { UserOutlined, SmileOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const WelcomeCard = ({ user }) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Selamat Pagi";
    if (hour < 15) return "Selamat Siang";
    if (hour < 18) return "Selamat Sore";
    return "Selamat Malam";
  };

  const getMotivationalMessage = () => {
    const messages = [
      "Semangat belajar hari ini! Raih prestasi terbaikmu!",
      "Hari yang produktif dimulai dari langkah kecil!",
      "Tetap konsisten dalam belajar untuk meraih impian!",
      "Setiap usaha yang kamu lakukan akan membuahkan hasil!",
      "Jadilah versi terbaik dari dirimu hari ini!",
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  return (
    <Card
      style={{
        borderRadius: 16,
        background:
          "linear-gradient(135deg, #001529 0%, #3a3f5c 60%, #43cea2 100%)",
        border: "none",
        color: "white",
        boxShadow: "0 8px 32px rgba(102, 126, 234, 0.3)",
      }}
      bodyStyle={{ padding: "32px" }}
    >
      <Row align="middle" gutter={[24, 16]}>
        <Col xs={24} sm={4} style={{ textAlign: "center" }}>
          <Avatar
            size={80}
            icon={<UserOutlined />}
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              border: "3px solid rgba(255, 255, 255, 0.3)",
            }}
          />
        </Col>
        <Col xs={24} sm={20}>
          <Space direction="vertical" size="small" style={{ width: "100%" }}>
            <Title
              level={2}
              style={{
                color: "white",
                margin: 0,
                fontSize: "clamp(20px, 4vw, 28px)",
              }}
            >
              {getGreeting()}, {user?.first_name || user?.username || "Student"}
              !
            </Title>
            <Text
              style={{
                color: "rgba(255, 255, 255, 0.9)",
                fontSize: "clamp(14px, 2.5vw, 16px)",
                display: "block",
                marginTop: 8,
              }}
            >
              <SmileOutlined style={{ marginRight: 8 }} />
              {getMotivationalMessage()}
            </Text>
          </Space>
        </Col>
      </Row>
    </Card>
  );
};

export default WelcomeCard;
