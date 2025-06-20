import React from "react";
import { Typography, Space } from "antd";
import { BookOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const SubjectListHeader = () => {
  return (
    <div
      style={{
        textAlign: "center",
        marginBottom: 32,
        padding: "24px 0",
        background:
          "linear-gradient(135deg, #001529 0%, #3a3f5c 60%, #43cea2 100%)",
        borderRadius: 16,
        color: "white",
      }}
    >
      <Space direction="vertical" size="small">
        <BookOutlined style={{ fontSize: 48, color: "white" }} />
        <Title
          level={2}
          style={{
            color: "white",
            margin: 0,
            fontSize: 28,
            fontWeight: 700,
          }}
        >
          Mata Pelajaran Saya
        </Title>
        <Text
          style={{
            color: "rgba(255,255,255,0.9)",
            fontSize: 16,
          }}
        >
          Kelola dan akses semua materi pembelajaran Anda
        </Text>
      </Space>
    </div>
  );
};

export default SubjectListHeader;
