import React, { useState } from "react";
import { Card, Typography, Progress, List, Tag, Button, Spin } from "antd";
import { ArrowLeftOutlined, FileTextOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

const getProgressColor = (percent) => {
  if (percent >= 80) return "green";
  if (percent >= 60) return "orange";
  return "red";
};

const SubjectDetailStudent = ({ subject, onBack }) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Dummy: Replace with fetch materials by subject.id if needed
  const materials = subject.materials || [];

  return (
    <Card
      style={{
        borderRadius: 12,
        marginBottom: 24,
        maxWidth: 900,
        margin: "0 auto",
      }}
      bodyStyle={{ padding: 24 }}
    >
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={onBack}
        style={{ marginBottom: 16 }}
      >
        Kembali
      </Button>
      <Title level={3} style={{ color: "#11418b", marginBottom: 8 }}>
        {subject.name}
      </Title>
      <Text type="secondary">
        Guru: <b>{subject.teacher_name || "-"}</b>
      </Text>
      <div style={{ margin: "16px 0" }}>
        <Progress
          percent={subject.progress || 0}
          strokeColor={getProgressColor(subject.progress || 0)}
          status="active"
          showInfo
          style={{ width: 200 }}
        />
        <span style={{ marginLeft: 16, fontWeight: 500 }}>
          {subject.progress || 0}% Complete
        </span>
      </div>
      <Title level={4} style={{ marginTop: 24, marginBottom: 12 }}>
        Daftar Materi
      </Title>
      <List
        itemLayout="horizontal"
        dataSource={materials}
        loading={loading}
        renderItem={(item) => (
          <List.Item
            actions={[
              <Button
                type="link"
                onClick={() => navigate(`/student/materials/${item.slug}`)} // Gunakan navigate!
              >
                Buka
              </Button>,
              item.completed ? (
                <Tag color="green">Selesai</Tag>
              ) : (
                <Tag color="orange">Belum Selesai</Tag>
              ),
            ]}
          >
            <List.Item.Meta
              avatar={
                <FileTextOutlined style={{ fontSize: 20, color: "#11418b" }} />
              }
              title={item.title}
              description={
                <>
                  <Text type="secondary">{item.description || "-"}</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {item.last_accessed
                      ? `Terakhir diakses: ${item.last_accessed}`
                      : ""}
                  </Text>
                </>
              }
            />
          </List.Item>
        )}
      />
    </Card>
  );
};

export default SubjectDetailStudent;
