import React from "react";
import { Card, Avatar, Typography } from "antd";
import { UserOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const WelcomeCard = ({ user }) => (
  <Card
    style={{
      background: "linear-gradient(90deg, #11418b 60%, #1677ff 100%)",
      color: "#fff",
      borderRadius: 12,
      marginBottom: 16,
      minHeight: 120,
      display: "flex",
      alignItems: "center",
    }}
    bodyStyle={{ display: "flex", alignItems: "center", padding: 24 }}
  >
    <Avatar
      size={64}
      icon={<UserOutlined />}
      style={{ backgroundColor: "#fff", color: "#11418b", marginRight: 24 }}
    />
    <div>
      <Title level={3} style={{ color: "#fff", margin: 0 }}>
        Selamat datang, {user?.first_name || user?.username || "Siswa"}!
      </Title>
      <Text style={{ color: "#e6f7ff" }}>
        Semangat belajar hari ini. Raih prestasi terbaikmu!
      </Text>
    </div>
  </Card>
);

export default WelcomeCard;
