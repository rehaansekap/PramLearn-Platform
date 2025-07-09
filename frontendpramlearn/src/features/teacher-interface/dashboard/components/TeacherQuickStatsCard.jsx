import React from "react";
import { Card, Row, Col, Statistic, Progress, Space, Spin } from "antd";
import {
  BookOutlined,
  TeamOutlined,
  FileTextOutlined,
  QuestionCircleOutlined,
  UserOutlined,
  ClockCircleOutlined,
  TrophyOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const TeacherQuickStatsCard = ({ stats, loading }) => {
  const navigate = useNavigate();

  const statsConfig = [
    {
      title: "Mata Pelajaran",
      value: stats?.subjects_count || 0,
      icon: <BookOutlined />,
      color: "#1677ff",
      gradient: "linear-gradient(135deg, #1677ff 0%, #69c0ff 100%)",
      action: () => navigate("/teacher/subjects"),
    },
    {
      title: "Total Kelas",
      value: stats?.classes_count || 0,
      icon: <TeamOutlined />,
      color: "#52c41a",
      gradient: "linear-gradient(135deg, #52c41a 0%, #95de64 100%)",
      action: () => navigate("/teacher/classes"),
    },
    {
      title: "Total Siswa",
      value: stats?.total_students || 0,
      icon: <UserOutlined />,
      color: "#722ed1",
      gradient: "linear-gradient(135deg, #722ed1 0%, #b37feb 100%)",
      action: () => navigate("/teacher/classes"),
    },
    {
      title: "Materi Pembelajaran",
      value: stats?.materials_count || 0,
      icon: <FileTextOutlined />,
      color: "#fa8c16",
      gradient: "linear-gradient(135deg, #fa8c16 0%, #ffc069 100%)",
      action: () => navigate("/teacher/sessions"),
    },
    {
      title: "Tugas Aktif",
      value: stats?.assignments_count || 0,
      icon: <FileTextOutlined />,
      color: "#eb2f96",
      gradient: "linear-gradient(135deg, #eb2f96 0%, #ff85c0 100%)",
      action: () => navigate("/teacher/sessions"),
    },
    {
      title: "Kuis Aktif",
      value: stats?.quizzes_count || 0,
      icon: <QuestionCircleOutlined />,
      color: "#13c2c2",
      gradient: "linear-gradient(135deg, #13c2c2 0%, #5cdbd3 100%)",
      action: () => navigate("/teacher/sessions"),
    },
    {
      title: "Submission Pending",
      value: stats?.pending_submissions || 0,
      icon: <ClockCircleOutlined />,
      color: "#faad14",
      gradient: "linear-gradient(135deg, #faad14 0%, #ffd666 100%)",
      action: () => navigate("/teacher/sessions"),
      highlight: (stats?.pending_submissions || 0) > 0,
    },
    {
      title: "Rata-rata Nilai",
      value: (stats?.performance_overview?.avg_assignment_grade || 0).toFixed(
        1
      ),
      icon: <TrophyOutlined />,
      color: "#f5222d",
      gradient: "linear-gradient(135deg, #f5222d 0%, #ff7875 100%)",
      suffix: "/100",
      action: () => navigate("/teacher/sessions"),
    },
  ];

  return (
    <div style={{ marginBottom: 24 }}>
      {loading ? (
        <Card style={{ borderRadius: 16 }}>
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <Spin size="large" tip="Memuat statistik pengajaran..." />
          </div>
        </Card>
      ) : (
        <Row gutter={[16, 16]}>
          {statsConfig.map((stat, index) => (
            <Col xs={12} sm={8} md={6} lg={6} xl={3} key={index}>
              <Card
                hoverable
                onClick={stat.action}
                style={{
                  height: "100%",
                  borderRadius: 16,
                  border: "none",
                  background: stat.gradient,
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  transform: stat.highlight ? "scale(1.02)" : "scale(1)",
                  boxShadow: stat.highlight
                    ? `0 8px 24px ${stat.color}40`
                    : "0 4px 12px rgba(0,0,0,0.1)",
                }}
                bodyStyle={{
                  padding: "20px 16px",
                  textAlign: "center",
                  height: "100%",
                  position: "relative",
                  overflow: "hidden",
                }}
                className="stats-card"
              >
                {/* Background decoration */}
                <div
                  style={{
                    position: "absolute",
                    top: -20,
                    right: -20,
                    width: 60,
                    height: 60,
                    background: "rgba(255, 255, 255, 0.1)",
                    borderRadius: "50%",
                    zIndex: 0,
                  }}
                />

                <div style={{ position: "relative", zIndex: 1 }}>
                  <div
                    style={{
                      color: "white",
                      fontSize: 28,
                      marginBottom: 12,
                      filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))",
                    }}
                  >
                    {stat.icon}
                  </div>

                  <Statistic
                    title={
                      <span
                        style={{
                          color: "rgba(255, 255, 255, 0.9)",
                          fontSize: 12,
                          fontWeight: 500,
                        }}
                      >
                        {stat.title}
                      </span>
                    }
                    value={stat.value}
                    suffix={stat.suffix}
                    valueStyle={{
                      color: "white",
                      fontSize: "clamp(18px, 3vw, 24px)",
                      fontWeight: "bold",
                      filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))",
                    }}
                  />

                  {stat.highlight && (
                    <div
                      style={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        width: 8,
                        height: 8,
                        background: "#ff4d4f",
                        borderRadius: "50%",
                        animation: "pulse 2s infinite",
                      }}
                    />
                  )}
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <style jsx>{`
        .stats-card:hover {
          transform: translateY(-4px) !important;
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15) !important;
        }

        @keyframes pulse {
          0% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(255, 77, 79, 0.7);
          }
          70% {
            transform: scale(1);
            box-shadow: 0 0 0 10px rgba(255, 77, 79, 0);
          }
          100% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(255, 77, 79, 0);
          }
        }

        @media (max-width: 768px) {
          .stats-card {
            margin-bottom: 8px;
          }
        }
      `}</style>
    </div>
  );
};

export default TeacherQuickStatsCard;
