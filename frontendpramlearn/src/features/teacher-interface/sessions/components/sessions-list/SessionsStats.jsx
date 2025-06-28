import React from "react";
import { Row, Col, Card, Statistic, Progress, Space, Typography } from "antd";
import {
  BookOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
  UserOutlined,
} from "@ant-design/icons";
import "./styles/styles.css";

const { Text } = Typography;

const SessionsStats = ({ sessions = [], isMobile }) => {
  // Calculate statistics
  const totalSessions = sessions.length;
  const totalStudents = sessions.reduce(
    (sum, session) => sum + (session.students_count || 0),
    0
  );
  const averageProgress =
    sessions.length > 0
      ? sessions.reduce(
          (sum, session) => sum + (session.overall_progress || 0),
          0
        ) / sessions.length
      : 0;
  const averageAttendance =
    sessions.length > 0
      ? sessions.reduce(
          (sum, session) => sum + (session.overall_attendance || 0),
          0
        ) / sessions.length
      : 0;

  const statsData = [
    {
      title: "Total Sesi",
      value: totalSessions,
      icon: <BookOutlined style={{ color: "#1890ff" }} />,
      color: "#1890ff",
      bgColor: "#f0f9ff",
    },
    {
      title: "Total Siswa",
      value: totalStudents,
      icon: <TeamOutlined style={{ color: "#52c41a" }} />,
      color: "#52c41a",
      bgColor: "#f6ffed",
    },
    {
      title: "Rata-rata Progress",
      value: `${Math.round(averageProgress)}%`,
      icon: <CheckCircleOutlined style={{ color: "#faad14" }} />,
      color: "#faad14",
      bgColor: "#fffbe6",
      progress: averageProgress,
    },
    {
      title: "Rata-rata Kehadiran",
      value: `${Math.round(averageAttendance)}%`,
      icon: <UserOutlined style={{ color: "#722ed1" }} />,
      color: "#722ed1",
      bgColor: "#f9f0ff",
      progress: averageAttendance,
    },
  ];

  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
      {statsData.map((stat, index) => (
        <Col xs={12} sm={12} md={6} lg={6} key={index}>
          <Card
            style={{
              borderRadius: 16,
              border: `1px solid ${stat.color}20`,
              background: stat.bgColor,
              height: "100%",
            }}
            bodyStyle={{
              padding: isMobile ? 16 : 20,
              textAlign: "center",
            }}
          >
            <Space direction="vertical" style={{ width: "100%" }} size="small">
              <div
                style={{
                  background: "white",
                  borderRadius: "50%",
                  width: 48,
                  height: 48,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 8px",
                  fontSize: 20,
                  boxShadow: `0 4px 12px ${stat.color}20`,
                }}
              >
                {stat.icon}
              </div>

              <Statistic
                value={stat.value}
                valueStyle={{
                  color: stat.color,
                  fontSize: isMobile ? 20 : 24,
                  fontWeight: 700,
                }}
              />

              <Text
                style={{
                  color: "#666",
                  fontSize: isMobile ? 12 : 14,
                  fontWeight: 500,
                }}
              >
                {stat.title}
              </Text>

              {stat.progress !== undefined && (
                <Progress
                  percent={Math.round(stat.progress)}
                  size="small"
                  strokeColor={stat.color}
                  showInfo={false}
                  style={{ marginTop: 8 }}
                />
              )}
            </Space>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default SessionsStats;
