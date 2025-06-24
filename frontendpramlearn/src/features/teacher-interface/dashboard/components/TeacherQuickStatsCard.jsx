import React from "react";
import { Card, Row, Col, Statistic, Space, Spin } from "antd";
import {
  BookOutlined,
  TeamOutlined,
  FileTextOutlined,
  QuestionCircleOutlined,
  UserOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const TeacherQuickStatsCard = ({ stats, loading }) => {
  const navigate = useNavigate();

  const statsData = [
    {
      title: "Mata Pelajaran",
      value: stats?.subjects_count || 0,
      icon: <BookOutlined />,
      color: "#1677ff",
      action: () => navigate("/teacher/management"),
    },
    {
      title: "Kelas Diampu",
      value: stats?.classes_count || 0,
      icon: <TeamOutlined />,
      color: "#52c41a",
      action: () => navigate("/teacher/management"),
    },
    {
      title: "Total Siswa",
      value: stats?.total_students || 0,
      icon: <UserOutlined />,
      color: "#722ed1",
      action: () => navigate("/teacher/management"),
    },
    {
      title: "Materi Pembelajaran",
      value: stats?.materials_count || 0,
      icon: <FileTextOutlined />,
      color: "#fa8c16",
      action: () => navigate("/teacher/management"),
    },
    {
      title: "Tugas Aktif",
      value: stats?.assignments_count || 0,
      icon: <FileTextOutlined />,
      color: "#eb2f96",
      action: () => navigate("/teacher/management"),
    },
    {
      title: "Submission Menunggu",
      value: stats?.pending_submissions || 0,
      icon: <ClockCircleOutlined />,
      color: "#faad14",
      action: () => navigate("/teacher/management"),
    },
  ];

  return (
    <Card
      title={
        <Space>
          <BookOutlined style={{ color: "#11418b" }} />
          <span style={{ color: "#11418b", fontWeight: "bold" }}>
            Statistik Pengajaran
          </span>
        </Space>
      }
      style={{ borderRadius: 12, marginBottom: 24 }}
    >
      {loading ? (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <Spin size="large" tip="Memuat statistik..." />
        </div>
      ) : (
        <Row gutter={[16, 16]}>
          {statsData.map((stat, index) => (
            <Col xs={12} sm={8} lg={4} key={index}>
              <Card
                hoverable
                style={{
                  borderRadius: 8,
                  border: `1px solid ${stat.color}20`,
                  background: `${stat.color}08`,
                  cursor: "pointer",
                }}
                bodyStyle={{ padding: "16px 12px", textAlign: "center" }}
                onClick={stat.action}
              >
                <div
                  style={{ color: stat.color, fontSize: 24, marginBottom: 8 }}
                >
                  {stat.icon}
                </div>
                <Statistic
                  title={stat.title}
                  value={stat.value}
                  valueStyle={{
                    color: stat.color,
                    fontSize: 20,
                    fontWeight: "bold",
                  }}
                />
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Card>
  );
};

export default TeacherQuickStatsCard;
