import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Typography, Button, List, Progress, Card, Space, Tag } from "antd";
import {
  ArrowLeftOutlined,
  BookOutlined,
  PlayCircleOutlined,
  ClockCircleOutlined,
  UserOutlined,
} from "@ant-design/icons";
import SubjectDetailHeader from "./components/SubjectDetailHeader";
import MaterialProgressCard from "./components/MaterialProgressCard";

const { Title, Text } = Typography;

const getProgressColor = (percent) => {
  if (percent >= 80) return "#52c41a";
  if (percent >= 60) return "#faad14";
  return "#ff4d4f";
};

const SubjectDetailStudent = ({ subject, onBack }) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const materials = subject.materials || [];

  const handleMaterialClick = (material) => {
    if (material.slug) {
      navigate(`/student/materials/${material.slug}`);
    }
  };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 16px" }}>
      {/* Header dengan tombol kembali */}
      <div style={{ marginBottom: 24 }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={onBack}
          style={{
            marginBottom: 16,
            borderRadius: 8,
            height: 40,
            paddingLeft: 16,
            paddingRight: 20,
          }}
        >
          Kembali ke Daftar Mata Pelajaran
        </Button>
      </div>

      {/* Subject Header */}
      <SubjectDetailHeader subject={subject} />

      {/* Materials List */}
      <Card
        title={
          <Space>
            <BookOutlined style={{ color: "#1890ff" }} />
            <Text strong style={{ fontSize: 16 }}>
              Daftar Materi ({materials.length})
            </Text>
          </Space>
        }
        style={{
          borderRadius: 16,
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          border: "1px solid #f0f0f0",
        }}
        bodyStyle={{ padding: "24px" }}
      >
        {materials.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "60px 20px",
              color: "#999",
            }}
          >
            <BookOutlined
              style={{ fontSize: 48, color: "#d9d9d9", marginBottom: 16 }}
            />
            <Title level={4} style={{ color: "#999", margin: 0 }}>
              Belum ada materi tersedia
            </Title>
            <Text style={{ color: "#999" }}>
              Materi pembelajaran akan muncul di sini setelah guru
              menambahkannya
            </Text>
          </div>
        ) : (
          <List
            dataSource={materials}
            renderItem={(item) => (
              <MaterialProgressCard
                material={item}
                onClick={() => handleMaterialClick(item)}
                getProgressColor={getProgressColor}
              />
            )}
          />
        )}
      </Card>
    </div>
  );
};

export default SubjectDetailStudent;
