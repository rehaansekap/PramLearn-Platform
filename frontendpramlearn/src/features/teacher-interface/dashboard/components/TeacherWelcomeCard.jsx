import React from "react";
import { Card, Typography, Space, Tag } from "antd";
import {
  BookOutlined,
  ClockCircleOutlined,
  UserOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const TeacherWelcomeCard = ({ user }) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Selamat Pagi";
    if (hour < 17) return "Selamat Siang";
    return "Selamat Malam";
  };

  const userName =
    user?.first_name && user?.last_name
      ? `${user.first_name} ${user.last_name}`
      : user?.username || "Guru";

  return (
    <Card
      style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        border: "none",
        borderRadius: 16,
        color: "white",
        marginBottom: 24,
      }}
      bodyStyle={{ padding: "32px" }}
    >
      <Space direction="vertical" size="small" style={{ width: "100%" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "rgba(255, 255, 255, 0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 24,
            }}
          >
            <UserOutlined />
          </div>
          <div>
            <Title level={3} style={{ color: "white", margin: 0 }}>
              {getGreeting()}, {userName}!
            </Title>
            <Text style={{ color: "rgba(255, 255, 255, 0.8)", fontSize: 16 }}>
              Selamat datang di Portal Guru PramLearn
            </Text>
          </div>
        </div>

        <div
          style={{ marginTop: 16, display: "flex", gap: 12, flexWrap: "wrap" }}
        >
          <Tag
            color="rgba(255, 255, 255, 0.2)"
            style={{
              color: "white",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              borderRadius: 20,
              padding: "4px 12px",
            }}
          >
            <BookOutlined style={{ marginRight: 4 }} />
            Pengajar
          </Tag>
          <Tag
            color="rgba(255, 255, 255, 0.2)"
            style={{
              color: "white",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              borderRadius: 20,
              padding: "4px 12px",
            }}
          >
            <ClockCircleOutlined style={{ marginRight: 4 }} />
            {new Date().toLocaleDateString("id-ID", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </Tag>
        </div>
      </Space>
    </Card>
  );
};

export default TeacherWelcomeCard;
