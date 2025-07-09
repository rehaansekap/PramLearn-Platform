import React from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Progress,
  Tag,
  Space,
  Typography,
  Divider,
} from "antd";
import {
  BookOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  BarChartOutlined,
  ClockCircleOutlined,
  TrophyOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const SessionDetailCard = ({ sessionDetail, loading }) => {
  if (loading || !sessionDetail) {
    return (
      <Card loading={loading} style={{ marginBottom: 24, borderRadius: 12 }}>
        <div style={{ height: 200 }} />
      </Card>
    );
  }

  const { subject, statistics } = sessionDetail;

  const getProgressColor = (progress) => {
    if (progress >= 80) return "#52c41a";
    if (progress >= 60) return "#faad14";
    return "#ff4d4f";
  };

  return (
    <Card
      style={{
        marginBottom: 24,
        borderRadius: 12,
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        border: "none",
        color: "white",
      }}
      bodyStyle={{ padding: "32px" }}
    >
      {/* Header */}
      <Row align="middle" style={{ marginBottom: 24 }}>
        <Col flex="auto">
          <Space direction="vertical" size="small">
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <BookOutlined style={{ fontSize: 24, color: "white" }} />
              <Title level={2} style={{ color: "white", margin: 0 }}>
                {subject.name}
              </Title>
            </div>
            <Text style={{ color: "rgba(255, 255, 255, 0.8)", fontSize: 16 }}>
              <TeamOutlined style={{ marginRight: 8 }} />
              {subject.class_name} • {subject.teacher_name}
            </Text>
          </Space>
        </Col>
        <Col>
          <Tag
            color="rgba(255, 255, 255, 0.2)"
            style={{
              color: "white",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              borderRadius: 20,
              padding: "8px 16px",
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            {statistics.total_sessions} Pertemuan
          </Tag>
        </Col>
      </Row>

      <Divider
        style={{ borderColor: "rgba(255, 255, 255, 0.3)", margin: "24px 0" }}
      />

      {/* Statistics */}
      <Row gutter={[24, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <div style={{ textAlign: "center" }}>
            <TeamOutlined
              style={{ fontSize: 32, color: "white", marginBottom: 8 }}
            />
            <Statistic
              title="Total Siswa"
              value={statistics.total_students}
              valueStyle={{ color: "white", fontSize: 24 }}
              suffix=""
            />
          </div>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <div style={{ textAlign: "center" }}>
            <BarChartOutlined
              style={{ fontSize: 32, color: "white", marginBottom: 8 }}
            />
            <Statistic
              title="Progress Keseluruhan"
              value={statistics.overall_progress}
              valueStyle={{ color: "white", fontSize: 24 }}
              suffix="%"
            />
            <Progress
              percent={statistics.overall_progress}
              strokeColor="white"
              trailColor="rgba(255, 255, 255, 0.3)"
              size="small"
              showInfo={false}
              style={{ marginTop: 8 }}
            />
          </div>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <div style={{ textAlign: "center" }}>
            <CheckCircleOutlined
              style={{ fontSize: 32, color: "white", marginBottom: 8 }}
            />
            <Statistic
              title="Tingkat Kehadiran"
              value={statistics.overall_attendance}
              valueStyle={{ color: "white", fontSize: 24 }}
              suffix="%"
            />
          </div>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <div style={{ textAlign: "center" }}>
            <TrophyOutlined
              style={{ fontSize: 32, color: "white", marginBottom: 8 }}
            />
            <Statistic
              title="Penyelesaian"
              value={statistics.overall_completion}
              valueStyle={{ color: "white", fontSize: 24 }}
              suffix="%"
            />
          </div>
        </Col>
      </Row>
    </Card>
  );
};

export default SessionDetailCard;
