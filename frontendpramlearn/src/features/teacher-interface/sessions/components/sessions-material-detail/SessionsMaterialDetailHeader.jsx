import React from "react";
import {
  Card,
  Typography,
  Row,
  Col,
  Button,
  Space,
  Tag,
  Statistic,
  Breadcrumb,
} from "antd";
import {
  ArrowLeftOutlined,
  ReloadOutlined,
  FileTextOutlined,
  QuestionCircleOutlined,
  TeamOutlined,
  BarChartOutlined,
  PlayCircleOutlined,
  BookOutlined,
  UserOutlined,
  TrophyOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const SessionsMaterialDetailHeader = ({
  materialDetail,
  onBack,
  onRefresh,
  refreshing,
  isMobile,
}) => {
  if (!materialDetail) return null;

  const { material, statistics } = materialDetail;
  // Ambil dari materialDetail.statistics
  const stats = materialDetail.statistics || {};
  const contentStats = stats.content_stats || {};

  const totalStudents =
    stats.total_students ||
    (materialDetail.students ? materialDetail.students.length : 0);
  const progress = stats.average_progress || 0;
  const attendance = stats.attendance_rate || 0;
  const totalQuizzes =
    contentStats.quizzes ||
    (materialDetail.quizzes ? materialDetail.quizzes.length : 0);
  const totalAssignments =
    contentStats.assignments ||
    (materialDetail.assignments ? materialDetail.assignments.length : 0);

  const getProgressColor = (progress) => {
    if (progress >= 80) return "#52c41a";
    if (progress >= 60) return "#faad14";
    return "#ff4d4f";
  };

  const getAttendanceColor = (rate) => {
    if (rate >= 80) return "#52c41a";
    if (rate >= 60) return "#faad14";
    return "#ff4d4f";
  };

  return (
    <div style={{ marginBottom: 24 }}>
      {/* Navigation & Actions */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={onBack}
          type="text"
          size={isMobile ? "middle" : "large"}
          style={{
            fontWeight: 600,
            color: "#11418b",
          }}
        >
          Kembali ke Detail Session
        </Button>

        <Button
          icon={<ReloadOutlined />}
          onClick={onRefresh}
          loading={refreshing}
          type="primary"
          ghost
          size={isMobile ? "middle" : "large"}
        >
          Refresh Data
        </Button>
      </div>

      {/* Header Card */}
      <Card
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          border: "none",
          borderRadius: 16,
          color: "white",
        }}
        bodyStyle={{ padding: isMobile ? "20px" : "32px" }}
      >
        <Row gutter={[24, 24]} align="middle">
          <Col xs={24} lg={16}>
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 12,
                }}
              >
                <PlayCircleOutlined
                  style={{ fontSize: isMobile ? 28 : 36, color: "white" }}
                />
                <div>
                  <Tag
                    color="rgba(255,255,255,0.2)"
                    style={{
                      color: "white",
                      border: "1px solid rgba(255,255,255,0.3)",
                      marginBottom: 8,
                      fontSize: 12,
                      fontWeight: 500,
                    }}
                  >
                    {material?.subject?.class_name || "Kelas"}
                  </Tag>
                  <Title
                    level={isMobile ? 3 : 2}
                    style={{
                      color: "white",
                      marginBottom: 8,
                      fontWeight: 700,
                    }}
                  >
                    {material?.title || "Detail Material"}
                  </Title>
                  <Text
                    style={{
                      color: "rgba(255,255,255,0.9)",
                      fontSize: isMobile ? 14 : 16,
                      display: "block",
                    }}
                  >
                    Kelola konten, tugas, quiz, dan monitor progress siswa pada
                    materi ini
                  </Text>
                </div>
              </div>
            </div>
          </Col>

          <Col xs={24} lg={8}>
            <Row gutter={[12, 12]}>
              <Col span={12}>
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontSize: isMobile ? 24 : 32,
                      fontWeight: 700,
                      color: "white",
                      lineHeight: 1,
                    }}
                  >
                    {statistics?.total_students || 0}
                  </div>
                  <Text
                    style={{
                      color: "rgba(255,255,255,0.8)",
                      fontSize: isMobile ? 11 : 12,
                      textTransform: "uppercase",
                      letterSpacing: 1,
                    }}
                  >
                    Total Siswa
                  </Text>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontSize: isMobile ? 24 : 32,
                      fontWeight: 700,
                      color: "white",
                      lineHeight: 1,
                    }}
                  >
                    {Math.round(statistics?.overall_progress || 0)}%
                  </div>
                  <Text
                    style={{
                      color: "rgba(255,255,255,0.8)",
                      fontSize: isMobile ? 11 : 12,
                      textTransform: "uppercase",
                      letterSpacing: 1,
                    }}
                  >
                    Progress
                  </Text>
                </div>
              </Col>
            </Row>
          </Col>
        </Row>
      </Card>

      {/* Quick Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={12} sm={6} lg={6}>
          <Card
            style={{
              borderRadius: 12,
              border: "1px solid #f0f0f0",
              height: "100%",
            }}
            bodyStyle={{ padding: isMobile ? "16px" : "20px" }}
          >
            <Statistic
              title={
                <Space>
                  <BarChartOutlined style={{ color: "#52c41a" }} />
                  <span style={{ fontSize: isMobile ? 12 : 14 }}>Progress</span>
                </Space>
              }
              value={progress || 0}
              suffix="%"
              valueStyle={{
                color: getProgressColor(progress || 0),
                fontSize: isMobile ? 20 : 24,
                fontWeight: 700,
              }}
            />
          </Card>
        </Col>

        <Col xs={12} sm={6} lg={6}>
          <Card
            style={{
              borderRadius: 12,
              border: "1px solid #f0f0f0",
              height: "100%",
            }}
            bodyStyle={{ padding: isMobile ? "16px" : "20px" }}
          >
            <Statistic
              title={
                <Space>
                  <UserOutlined style={{ color: "#1890ff" }} />
                  <span style={{ fontSize: isMobile ? 12 : 14 }}>
                    Kehadiran
                  </span>
                </Space>
              }
              value={attendance || 0}
              suffix="%"
              valueStyle={{
                color: getAttendanceColor(attendance || 0),
                fontSize: isMobile ? 20 : 24,
                fontWeight: 700,
              }}
            />
          </Card>
        </Col>

        <Col xs={12} sm={6} lg={6}>
          <Card
            style={{
              borderRadius: 12,
              border: "1px solid #f0f0f0",
              height: "100%",
            }}
            bodyStyle={{ padding: isMobile ? "16px" : "20px" }}
          >
            <Statistic
              title={
                <Space>
                  <QuestionCircleOutlined style={{ color: "#faad14" }} />
                  <span style={{ fontSize: isMobile ? 12 : 14 }}>Quiz</span>
                </Space>
              }
              value={totalQuizzes || 0}
              valueStyle={{
                color: "#faad14",
                fontSize: isMobile ? 20 : 24,
                fontWeight: 700,
              }}
            />
          </Card>
        </Col>

        <Col xs={12} sm={6} lg={6}>
          <Card
            style={{
              borderRadius: 12,
              border: "1px solid #f0f0f0",
              height: "100%",
            }}
            bodyStyle={{ padding: isMobile ? "16px" : "20px" }}
          >
            <Statistic
              title={
                <Space>
                  <FileTextOutlined style={{ color: "#722ed1" }} />
                  <span style={{ fontSize: isMobile ? 12 : 14 }}>
                    Assignment
                  </span>
                </Space>
              }
              value={totalAssignments || 0}
              valueStyle={{
                color: "#722ed1",
                fontSize: isMobile ? 20 : 24,
                fontWeight: 700,
              }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default SessionsMaterialDetailHeader;
