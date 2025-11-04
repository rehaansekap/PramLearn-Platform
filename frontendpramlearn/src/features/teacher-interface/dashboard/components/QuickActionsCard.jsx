import React from "react";
import { Card, Row, Col, Button, Space, Typography } from "antd";
import {
  PlusOutlined,
  FileTextOutlined,
  QuestionCircleOutlined,
  TeamOutlined,
  BarChartOutlined,
  SettingOutlined,
  BookOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Text } = Typography;

const QuickActionsCard = ({ user }) => {
  const navigate = useNavigate();

  const quickActions = [
    {
      title: "Buat Materi Baru",
      description: "Tambah materi pembelajaran",
      icon: <FileTextOutlined />,
      color: "#1677ff",
      action: () => navigate("/teacher/sessions"),
    },
    {
      title: "Buat Kuis",
      description: "Buat kuis untuk siswa",
      icon: <QuestionCircleOutlined />,
      color: "#52c41a",
      action: () => navigate("/teacher/sessions"),
    },
    {
      title: "Kelola Kelompok",
      description: "Atur kelompok belajar",
      icon: <TeamOutlined />,
      color: "#722ed1",
      action: () => navigate("/teacher/sessions"),
    },
    {
      title: "Lihat Analitik",
      description: "Monitor performa kelas",
      icon: <BarChartOutlined />,
      color: "#fa8c16",
      action: () => navigate("/teacher/sessions"),
    },
    {
      title: "Kelola Kelas",
      description: "Manajemen kelas & siswa",
      icon: <UserOutlined />,
      color: "#eb2f96",
      action: () => navigate("/teacher/classes"),
    },
    {
      title: "Pengaturan",
      description: "Konfigurasi pembelajaran",
      icon: <SettingOutlined />,
      color: "#13c2c2",
      action: () => navigate("/teacher/management"),
    },
  ];

  return (
    <Card
      title={
        <Space>
          <PlusOutlined style={{ color: "#11418b" }} />
          <Text strong style={{ color: "#11418b" }}>
            Aksi Cepat
          </Text>
        </Space>
      }
      style={{
        borderRadius: 16,
        marginBottom: 16,
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      }}
      bodyStyle={{ padding: "20px" }}
    >
      <Row gutter={[16, 16]}>
        {quickActions.map((action, index) => (
          <Col xs={12} sm={8} md={6} lg={4} key={index}>
            <Button
              type="default"
              onClick={action.action}
              style={{
                padding: "16px 12px",
                borderRadius: 12,
                height: "100%",
                border: `2px solid ${action.color}20`,
                background: `${action.color}08`,
                transition: "all 0.3s ease",
                width: "100%",
              }}
              className="quick-action-btn"
            >
              <div style={{ textAlign: "center", width: "100%" }}>
                <div
                  style={{
                    color: action.color,
                    fontSize: 22,
                    marginBottom: 10,
                  }}
                >
                  {action.icon}
                </div>
                <div>
                  <Text
                    strong
                    style={{
                      fontSize: 13,
                      color: "#222",
                      display: "block",
                      marginBottom: 6,
                      fontWeight: 700,
                      wordBreak: "break-word",
                      whiteSpace: "normal",
                      lineHeight: 1.2,
                    }}
                  >
                    {action.title}
                  </Text>
                  <Text
                    style={{
                      fontSize: 11,
                      color: "#555",
                      fontWeight: 400,
                      wordBreak: "break-word",
                      whiteSpace: "normal",
                      lineHeight: 1.3,
                      display: "block",
                    }}
                  >
                    {action.description}
                  </Text>
                </div>
              </div>
            </Button>
          </Col>
        ))}
      </Row>

      <style jsx>{`
        .quick-action-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
          border-color: ${quickActions[0]?.color}40;
        }
      `}</style>
    </Card>
  );
};

export default QuickActionsCard;
