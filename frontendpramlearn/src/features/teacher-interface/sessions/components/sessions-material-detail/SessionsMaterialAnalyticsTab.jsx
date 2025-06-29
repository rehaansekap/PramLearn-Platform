import React from "react";
import {
  Card,
  Row,
  Col,
  Typography,
  Progress,
  Statistic,
  List,
  Avatar,
  Tag,
  Space,
  Empty,
  Tooltip,
} from "antd";
import {
  TrophyOutlined,
  UserOutlined,
  ClockCircleOutlined,
  BookOutlined,
  FireOutlined,
  StarOutlined,
  BarChartOutlined,
  CheckCircleOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/id";

dayjs.extend(relativeTime);
dayjs.locale("id");

const { Title, Text } = Typography;

const SessionsMaterialAnalyticsTab = ({ materialDetail, isMobile }) => {
  if (!materialDetail) {
    return (
      <Card style={{ borderRadius: 16 }}>
        <Empty description="Data analytics tidak tersedia" />
      </Card>
    );
  }

  const { statistics, students } = materialDetail;

  // Process student performance data
  const topPerformers = (students || [])
    .sort((a, b) => (b.average_grade || 0) - (a.average_grade || 0))
    .slice(0, 5);

  const recentActivities = (students || [])
    .filter((student) => student.last_activity)
    .sort(
      (a, b) => dayjs(b.last_activity).unix() - dayjs(a.last_activity).unix()
    )
    .slice(0, 8);

  const getGradeColor = (grade) => {
    if (grade >= 85) return "#52c41a";
    if (grade >= 70) return "#faad14";
    return "#ff4d4f";
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return "#52c41a";
    if (progress >= 60) return "#faad14";
    return "#ff4d4f";
  };

  const getMotivationColor = (level) => {
    switch (level?.toLowerCase()) {
      case "high":
        return "#52c41a";
      case "medium":
        return "#faad14";
      case "low":
        return "#ff4d4f";
      default:
        return "#d9d9d9";
    }
  };

  const getMotivationText = (level) => {
    switch (level?.toLowerCase()) {
      case "high":
        return "Tinggi";
      case "medium":
        return "Sedang";
      case "low":
        return "Rendah";
      default:
        return "Belum Dianalisis";
    }
  };

  // Calculate detailed analytics
  const analytics = {
    totalStudents: students?.length || 0,
    activeStudents: students?.filter((s) => s.is_online)?.length || 0,
    completedStudents:
      students?.filter((s) => (s.completion_percentage || 0) >= 100)?.length ||
      0,
    excellentStudents:
      students?.filter((s) => (s.average_grade || 0) >= 85)?.length || 0,
    averageCompletion:
      students?.length > 0
        ? students.reduce((sum, s) => sum + (s.completion_percentage || 0), 0) /
          students.length
        : 0,
    averageGrade:
      students?.length > 0
        ? students.reduce((sum, s) => sum + (s.average_grade || 0), 0) /
          students.length
        : 0,
    motivationDistribution: {
      high:
        students?.filter((s) => s.motivation_level?.toLowerCase() === "high")
          ?.length || 0,
      medium:
        students?.filter((s) => s.motivation_level?.toLowerCase() === "medium")
          ?.length || 0,
      low:
        students?.filter((s) => s.motivation_level?.toLowerCase() === "low")
          ?.length || 0,
    },
  };

  return (
    <Row gutter={[16, 16]}>
      {/* Performance Overview */}
      <Col xs={24} lg={12}>
        <Card
          title={
            <Space>
              <BarChartOutlined style={{ color: "#667eea" }} />
              <span>Performance Overview</span>
            </Space>
          }
          style={{
            borderRadius: 16,
            height: "100%",
          }}
          headStyle={{
            background: "linear-gradient(135deg, #f8faff 0%, #e6f7ff 100%)",
            borderRadius: "16px 16px 0 0",
          }}
        >
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Statistic
                title="Progress Keseluruhan"
                value={Math.round(analytics.averageCompletion)}
                suffix="%"
                valueStyle={{
                  color: getProgressColor(analytics.averageCompletion),
                  fontSize: isMobile ? 20 : 24,
                }}
                prefix={<CheckCircleOutlined />}
              />
              <Progress
                percent={analytics.averageCompletion}
                size="small"
                strokeColor={getProgressColor(analytics.averageCompletion)}
                style={{ marginTop: 8 }}
              />
            </Col>
            <Col span={12}>
              <Statistic
                title="Nilai Rata-rata"
                value={Math.round(analytics.averageGrade)}
                valueStyle={{
                  color: getGradeColor(analytics.averageGrade),
                  fontSize: isMobile ? 20 : 24,
                }}
                prefix={<TrophyOutlined />}
              />
              <Progress
                percent={analytics.averageGrade}
                size="small"
                strokeColor={getGradeColor(analytics.averageGrade)}
                style={{ marginTop: 8 }}
              />
            </Col>
            <Col span={12}>
              <Statistic
                title="Siswa Aktif"
                value={analytics.activeStudents}
                suffix={`/ ${analytics.totalStudents}`}
                valueStyle={{
                  color: "#52c41a",
                  fontSize: isMobile ? 20 : 24,
                }}
                prefix={<UserOutlined />}
              />
            </Col>
            <Col span={12}>
              <Statistic
                title="Siswa Excellent"
                value={analytics.excellentStudents}
                suffix={`/ ${analytics.totalStudents}`}
                valueStyle={{
                  color: "#faad14",
                  fontSize: isMobile ? 20 : 24,
                }}
                prefix={<StarOutlined />}
              />
            </Col>
          </Row>
        </Card>
      </Col>

      {/* Top Performers */}
      <Col xs={24} lg={12}>
        <Card
          title={
            <Space>
              <TrophyOutlined style={{ color: "#faad14" }} />
              <span>Top Performers</span>
            </Space>
          }
          style={{
            borderRadius: 16,
            height: "100%",
          }}
          headStyle={{
            background: "linear-gradient(135deg, #fffbe6 0%, #fff7e6 100%)",
            borderRadius: "16px 16px 0 0",
          }}
        >
          {topPerformers.length > 0 ? (
            <List
              dataSource={topPerformers}
              renderItem={(student, index) => (
                <List.Item
                  style={{
                    padding: "12px 0",
                    borderBottom:
                      index === topPerformers.length - 1 ? "none" : undefined,
                  }}
                >
                  <List.Item.Meta
                    avatar={
                      <div style={{ position: "relative" }}>
                        <Avatar
                          icon={<UserOutlined />}
                          style={{
                            background:
                              index === 0
                                ? "#faad14"
                                : index === 1
                                ? "#52c41a"
                                : "#1890ff",
                          }}
                        />
                        {index < 3 && (
                          <div
                            style={{
                              position: "absolute",
                              top: -4,
                              right: -4,
                              background:
                                index === 0
                                  ? "#ffd700"
                                  : index === 1
                                  ? "#c0c0c0"
                                  : "#cd7f32",
                              borderRadius: "50%",
                              width: 16,
                              height: 16,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 10,
                              color: "white",
                              fontWeight: "bold",
                            }}
                          >
                            {index + 1}
                          </div>
                        )}
                      </div>
                    }
                    title={
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Text strong style={{ fontSize: 14 }}>
                          {student.username}
                        </Text>
                        <Tag
                          color={getGradeColor(student.average_grade || 0)}
                          style={{ marginLeft: 8 }}
                        >
                          {Math.round(student.average_grade || 0)}
                        </Tag>
                      </div>
                    }
                    description={
                      <div>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          Progress:{" "}
                          {Math.round(student.completion_percentage || 0)}%
                        </Text>
                        <Progress
                          percent={student.completion_percentage || 0}
                          size="small"
                          strokeColor={getProgressColor(
                            student.completion_percentage || 0
                          )}
                          showInfo={false}
                          style={{ marginTop: 4 }}
                        />
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="Belum ada data performance"
              style={{ margin: "20px 0" }}
            />
          )}
        </Card>
      </Col>

      {/* Motivation Distribution */}
      <Col xs={24} lg={12}>
        <Card
          title={
            <Space>
              <FireOutlined style={{ color: "#ff4d4f" }} />
              <span>Distribusi Motivasi</span>
            </Space>
          }
          style={{ borderRadius: 16 }}
          headStyle={{
            background: "linear-gradient(135deg, #fff2f0 0%, #ffebe6 100%)",
            borderRadius: "16px 16px 0 0",
          }}
        >
          <Row gutter={[16, 16]}>
            <Col span={8}>
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontSize: isMobile ? 24 : 32,
                    fontWeight: 700,
                    color: "#52c41a",
                    lineHeight: 1,
                  }}
                >
                  {analytics.motivationDistribution.high}
                </div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Tinggi
                </Text>
                <Progress
                  percent={
                    analytics.totalStudents > 0
                      ? (analytics.motivationDistribution.high /
                          analytics.totalStudents) *
                        100
                      : 0
                  }
                  size="small"
                  strokeColor="#52c41a"
                  showInfo={false}
                  style={{ marginTop: 8 }}
                />
              </div>
            </Col>
            <Col span={8}>
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontSize: isMobile ? 24 : 32,
                    fontWeight: 700,
                    color: "#faad14",
                    lineHeight: 1,
                  }}
                >
                  {analytics.motivationDistribution.medium}
                </div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Sedang
                </Text>
                <Progress
                  percent={
                    analytics.totalStudents > 0
                      ? (analytics.motivationDistribution.medium /
                          analytics.totalStudents) *
                        100
                      : 0
                  }
                  size="small"
                  strokeColor="#faad14"
                  showInfo={false}
                  style={{ marginTop: 8 }}
                />
              </div>
            </Col>
            <Col span={8}>
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontSize: isMobile ? 24 : 32,
                    fontWeight: 700,
                    color: "#ff4d4f",
                    lineHeight: 1,
                  }}
                >
                  {analytics.motivationDistribution.low}
                </div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Rendah
                </Text>
                <Progress
                  percent={
                    analytics.totalStudents > 0
                      ? (analytics.motivationDistribution.low /
                          analytics.totalStudents) *
                        100
                      : 0
                  }
                  size="small"
                  strokeColor="#ff4d4f"
                  showInfo={false}
                  style={{ marginTop: 8 }}
                />
              </div>
            </Col>
          </Row>
        </Card>
      </Col>

      {/* Recent Activities */}
      <Col xs={24} lg={12}>
        <Card
          title={
            <Space>
              <ClockCircleOutlined style={{ color: "#722ed1" }} />
              <span>Aktivitas Terbaru</span>
            </Space>
          }
          style={{ borderRadius: 16 }}
          headStyle={{
            background: "linear-gradient(135deg, #f9f0ff 0%, #efdbff 100%)",
            borderRadius: "16px 16px 0 0",
          }}
        >
          {recentActivities.length > 0 ? (
            <List
              dataSource={recentActivities}
              renderItem={(student) => (
                <List.Item
                  style={{
                    padding: "8px 0",
                    borderBottom: "1px solid #f0f0f0",
                  }}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        icon={<UserOutlined />}
                        style={{
                          background: student.is_online ? "#52c41a" : "#d9d9d9",
                        }}
                      />
                    }
                    title={
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Text strong style={{ fontSize: 13 }}>
                          {student.username}
                        </Text>
                        <Tag
                          color={getMotivationColor(student.motivation_level)}
                          size="small"
                        >
                          {getMotivationText(student.motivation_level)}
                        </Tag>
                      </div>
                    }
                    description={
                      <div style={{ fontSize: 12 }}>
                        <Text type="secondary">
                          Terakhir aktif:{" "}
                          {dayjs(student.last_activity).fromNow()}
                        </Text>
                        <br />
                        <Text type="secondary">
                          Progress:{" "}
                          {Math.round(student.completion_percentage || 0)}%
                        </Text>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="Belum ada aktivitas terbaru"
              style={{ margin: "20px 0" }}
            />
          )}
        </Card>
      </Col>
    </Row>
  );
};

export default SessionsMaterialAnalyticsTab;
