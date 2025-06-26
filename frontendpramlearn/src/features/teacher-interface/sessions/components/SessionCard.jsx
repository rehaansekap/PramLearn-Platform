import React from "react";
import {
  Card,
  Progress,
  Tag,
  Space,
  Typography,
  Row,
  Col,
  Statistic,
} from "antd";
import {
  BookOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  UserOutlined,
  BarChartOutlined,
} from "@ant-design/icons";

const { Text, Title } = Typography;

const SessionCard = ({ session, onClick }) => {
  const getProgressColor = (progress) => {
    if (progress >= 80) return "#52c41a";
    if (progress >= 60) return "#faad14";
    return "#ff4d4f";
  };

  const getAttendanceColor = (rate) => {
    if (rate >= 90) return "green";
    if (rate >= 75) return "orange";
    return "red";
  };

  return (
    <Card
      hoverable
      onClick={onClick}
      style={{
        borderRadius: 12,
        marginBottom: 16,
        cursor: "pointer",
        transition: "all 0.3s ease",
      }}
      bodyStyle={{ padding: "20px" }}
    >
      <Row gutter={[16, 16]} align="middle">
        {/* Subject Info */}
        <Col xs={24} sm={12} md={8}>
          <Space direction="vertical" size="small" style={{ width: "100%" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <BookOutlined style={{ color: "#11418b", fontSize: 18 }} />
              <Title level={5} style={{ margin: 0, color: "#11418b" }}>
                {session.name}
              </Title>
            </div>
            <Text type="secondary" style={{ fontSize: 14 }}>
              <TeamOutlined style={{ marginRight: 4 }} />
              {session.class_name}
            </Text>
            <Tag color="blue" style={{ marginTop: 4 }}>
              {session.total_sessions} Pertemuan
            </Tag>
          </Space>
        </Col>

        {/* Statistics */}
        <Col xs={24} sm={12} md={8}>
          <Row gutter={16}>
            <Col span={12}>
              <Statistic
                title="Siswa"
                value={session.students_count}
                prefix={<UserOutlined />}
                valueStyle={{ fontSize: 18, color: "#722ed1" }}
              />
            </Col>
            <Col span={12}>
              <Statistic
                title="Aktivitas"
                value={session.recent_activities}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ fontSize: 18, color: "#fa8c16" }}
                suffix="minggu ini"
              />
            </Col>
          </Row>
        </Col>

        {/* Progress & Attendance */}
        <Col xs={24} sm={24} md={8}>
          <Space direction="vertical" size="middle" style={{ width: "100%" }}>
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 4,
                }}
              >
                <Text strong style={{ fontSize: 12 }}>
                  Progress Rata-rata
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    color: getProgressColor(session.average_progress),
                  }}
                >
                  {session.average_progress}%
                </Text>
              </div>
              <Progress
                percent={session.average_progress}
                strokeColor={getProgressColor(session.average_progress)}
                size="small"
                showInfo={false}
              />
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 12 }}>
                <CheckCircleOutlined style={{ marginRight: 4 }} />
                Kehadiran
              </Text>
              <Tag
                color={getAttendanceColor(session.attendance_rate)}
                style={{ margin: 0 }}
              >
                {session.attendance_rate}%
              </Tag>
            </div>
          </Space>
        </Col>
      </Row>
    </Card>
  );
};

export default SessionCard;
