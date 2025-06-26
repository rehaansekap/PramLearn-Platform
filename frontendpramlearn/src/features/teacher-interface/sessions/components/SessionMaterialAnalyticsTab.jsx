import React, { useState, useEffect } from "react";
import {
  Card,
  Typography,
  Row,
  Col,
  Statistic,
  Progress,
  Table,
  Tag,
  Space,
  Empty,
  Spin,
} from "antd";
import {
  BarChartOutlined,
  UserOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  TrophyOutlined,
  LoadingOutlined,
  FireOutlined,
  BookOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const SessionMaterialAnalyticsTab = ({
  materialSlug,
  materialDetail,
  statistics,
}) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Get detailed analytics
  const getDetailedAnalytics = () => {
    const { students, groups, quizzes, assignments } = materialDetail || {};

    // Student performance analysis
    const highPerformers =
      students?.filter((s) => (s.completion_percentage || 0) >= 80).length || 0;
    const mediumPerformers =
      students?.filter(
        (s) =>
          (s.completion_percentage || 0) >= 50 &&
          (s.completion_percentage || 0) < 80
      ).length || 0;
    const lowPerformers =
      students?.filter((s) => (s.completion_percentage || 0) < 50).length || 0;

    // Attendance analysis
    const presentStudents =
      students?.filter((s) => s.attendance_status === "present").length || 0;
    const lateStudents =
      students?.filter((s) => s.attendance_status === "late").length || 0;
    const absentStudents =
      students?.filter((s) => s.attendance_status === "absent").length || 0;

    // Motivation level analysis
    const highMotivation =
      students?.filter((s) => s.motivation_level?.toLowerCase() === "high")
        .length || 0;
    const mediumMotivation =
      students?.filter((s) => s.motivation_level?.toLowerCase() === "medium")
        .length || 0;
    const lowMotivation =
      students?.filter((s) => s.motivation_level?.toLowerCase() === "low")
        .length || 0;

    // Group performance
    const activeGroups =
      groups?.filter((g) => (g.quiz_count || 0) > 0).length || 0;
    const avgGroupSize =
      groups?.length > 0
        ? (
            groups.reduce((sum, g) => sum + (g.member_count || 0), 0) /
            groups.length
          ).toFixed(1)
        : 0;

    // Quiz & Assignment analysis
    const avgQuizAssignments =
      quizzes?.length > 0
        ? (
            quizzes.reduce((sum, q) => sum + (q.assigned_groups || 0), 0) /
            quizzes.length
          ).toFixed(1)
        : 0;
    const completionRate =
      assignments?.length > 0
        ? (
            (assignments.reduce(
              (sum, a) => sum + (a.total_submissions || 0),
              0
            ) /
              (assignments.length * (students?.length || 1))) *
            100
          ).toFixed(1)
        : 0;

    return {
      performance: { highPerformers, mediumPerformers, lowPerformers },
      attendance: { presentStudents, lateStudents, absentStudents },
      motivation: { highMotivation, mediumMotivation, lowMotivation },
      groups: { activeGroups, avgGroupSize },
      activities: { avgQuizAssignments, completionRate },
    };
  };

  const analytics = getDetailedAnalytics();

  // Get top performing students
  const getTopPerformers = () => {
    const { students } = materialDetail || {};
    if (!students) return [];

    return students
      .sort(
        (a, b) =>
          (b.completion_percentage || 0) - (a.completion_percentage || 0)
      )
      .slice(0, 5)
      .map((student, index) => ({
        ...student,
        rank: index + 1,
      }));
  };

  const topPerformers = getTopPerformers();

  const getMotivationColor = (level) => {
    switch (level?.toLowerCase()) {
      case "high":
        return "green";
      case "medium":
        return "orange";
      case "low":
        return "red";
      default:
        return "default";
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

  const performanceColumns = [
    {
      title: "Rank",
      key: "rank",
      render: (_, record) => (
        <div style={{ textAlign: "center" }}>
          <TrophyOutlined
            style={{
              color:
                record.rank === 1
                  ? "#ffd700"
                  : record.rank === 2
                  ? "#c0c0c0"
                  : record.rank === 3
                  ? "#cd7f32"
                  : "#666",
              fontSize: 16,
            }}
          />
          <Text style={{ marginLeft: 4 }}>{record.rank}</Text>
        </div>
      ),
      width: 80,
      align: "center",
    },
    {
      title: "Nama Siswa",
      key: "name",
      render: (_, record) => (
        <div>
          <Text strong>{record.username}</Text>
          {(record.first_name || record.last_name) && (
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {`${record.first_name || ""} ${record.last_name || ""}`.trim()}
              </Text>
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Progress",
      key: "progress",
      render: (_, record) => (
        <div style={{ minWidth: 100 }}>
          <Progress
            percent={Math.round(record.completion_percentage || 0)}
            size="small"
            strokeColor="#52c41a"
          />
        </div>
      ),
      width: 120,
    },
    {
      title: "Motivasi",
      key: "motivation",
      render: (_, record) => (
        <Tag color={getMotivationColor(record.motivation_level)}>
          {getMotivationText(record.motivation_level)}
        </Tag>
      ),
      width: 100,
      align: "center",
    },
  ];

  const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "40px 0" }}>
        <Spin indicator={antIcon} />
        <p style={{ marginTop: 16, color: "#666" }}>Memuat data analitik...</p>
      </div>
    );
  }

  if (!materialDetail) {
    return (
      <Card style={{ borderRadius: 12 }}>
        <Empty
          description="Data analitik tidak tersedia"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </Card>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <BarChartOutlined
          style={{ fontSize: 32, color: "#11418b", marginBottom: 16 }}
        />
        <Title level={3} style={{ color: "#11418b", margin: 0 }}>
          Analitik Pembelajaran
        </Title>
        <Text type="secondary" style={{ fontSize: 14 }}>
          Ringkasan performa dan statistik materi pembelajaran
        </Text>
      </div>

      {/* Overview Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
        <Col xs={12} sm={8} lg={6}>
          <Card size="small" style={{ borderRadius: 8, textAlign: "center" }}>
            <Statistic
              title="Total Siswa"
              value={statistics?.total_students || 0}
              prefix={<UserOutlined style={{ color: "#1677ff" }} />}
              valueStyle={{ color: "#1677ff", fontSize: 18 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={6}>
          <Card size="small" style={{ borderRadius: 8, textAlign: "center" }}>
            <Statistic
              title="Tingkat Kehadiran"
              value={statistics?.attendance_rate || 0}
              suffix="%"
              prefix={<CheckCircleOutlined style={{ color: "#52c41a" }} />}
              valueStyle={{ color: "#52c41a", fontSize: 18 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={6}>
          <Card size="small" style={{ borderRadius: 8, textAlign: "center" }}>
            <Statistic
              title="Progress Rata-rata"
              value={statistics?.average_progress || 0}
              suffix="%"
              prefix={<FireOutlined style={{ color: "#faad14" }} />}
              valueStyle={{ color: "#faad14", fontSize: 18 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={6}>
          <Card size="small" style={{ borderRadius: 8, textAlign: "center" }}>
            <Statistic
              title="Total Konten"
              value={
                (statistics?.content_stats?.pdf_files || 0) +
                (statistics?.content_stats?.videos || 0) +
                (statistics?.content_stats?.quizzes || 0) +
                (statistics?.content_stats?.assignments || 0)
              }
              prefix={<BookOutlined style={{ color: "#722ed1" }} />}
              valueStyle={{ color: "#722ed1", fontSize: 18 }}
            />
          </Card>
        </Col>
      </Row>

      {/* Performance Analysis */}
      <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <TrophyOutlined style={{ color: "#11418b" }} />
                <Text strong>Analisis Performa Siswa</Text>
              </Space>
            }
            style={{ borderRadius: 12 }}
            headStyle={{ borderBottom: "2px solid #f0f0f0" }}
          >
            <Row gutter={[16, 16]}>
              <Col span={8}>
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontSize: 24,
                      fontWeight: "bold",
                      color: "#52c41a",
                      marginBottom: 4,
                    }}
                  >
                    {analytics.performance.highPerformers}
                  </div>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Performa Tinggi
                  </Text>
                  <div style={{ marginTop: 8 }}>
                    <Progress
                      type="circle"
                      size={60}
                      percent={
                        statistics?.total_students > 0
                          ? Math.round(
                              (analytics.performance.highPerformers /
                                statistics.total_students) *
                                100
                            )
                          : 0
                      }
                      strokeColor="#52c41a"
                      format={(percent) => `${percent}%`}
                    />
                  </div>
                </div>
              </Col>
              <Col span={8}>
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontSize: 24,
                      fontWeight: "bold",
                      color: "#faad14",
                      marginBottom: 4,
                    }}
                  >
                    {analytics.performance.mediumPerformers}
                  </div>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Performa Sedang
                  </Text>
                  <div style={{ marginTop: 8 }}>
                    <Progress
                      type="circle"
                      size={60}
                      percent={
                        statistics?.total_students > 0
                          ? Math.round(
                              (analytics.performance.mediumPerformers /
                                statistics.total_students) *
                                100
                            )
                          : 0
                      }
                      strokeColor="#faad14"
                      format={(percent) => `${percent}%`}
                    />
                  </div>
                </div>
              </Col>
              <Col span={8}>
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontSize: 24,
                      fontWeight: "bold",
                      color: "#ff4d4f",
                      marginBottom: 4,
                    }}
                  >
                    {analytics.performance.lowPerformers}
                  </div>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Performa Rendah
                  </Text>
                  <div style={{ marginTop: 8 }}>
                    <Progress
                      type="circle"
                      size={60}
                      percent={
                        statistics?.total_students > 0
                          ? Math.round(
                              (analytics.performance.lowPerformers /
                                statistics.total_students) *
                                100
                            )
                          : 0
                      }
                      strokeColor="#ff4d4f"
                      format={(percent) => `${percent}%`}
                    />
                  </div>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <FireOutlined style={{ color: "#11418b" }} />
                <Text strong>Analisis Motivasi</Text>
              </Space>
            }
            style={{ borderRadius: 12 }}
            headStyle={{ borderBottom: "2px solid #f0f0f0" }}
          >
            <Row gutter={[16, 16]}>
              <Col span={8}>
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontSize: 24,
                      fontWeight: "bold",
                      color: "#52c41a",
                      marginBottom: 4,
                    }}
                  >
                    {analytics.motivation.highMotivation}
                  </div>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Motivasi Tinggi
                  </Text>
                  <div style={{ marginTop: 8 }}>
                    <Progress
                      type="circle"
                      size={60}
                      percent={
                        statistics?.total_students > 0
                          ? Math.round(
                              (analytics.motivation.highMotivation /
                                statistics.total_students) *
                                100
                            )
                          : 0
                      }
                      strokeColor="#52c41a"
                      format={(percent) => `${percent}%`}
                    />
                  </div>
                </div>
              </Col>
              <Col span={8}>
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontSize: 24,
                      fontWeight: "bold",
                      color: "#faad14",
                      marginBottom: 4,
                    }}
                  >
                    {analytics.motivation.mediumMotivation}
                  </div>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Motivasi Sedang
                  </Text>
                  <div style={{ marginTop: 8 }}>
                    <Progress
                      type="circle"
                      size={60}
                      percent={
                        statistics?.total_students > 0
                          ? Math.round(
                              (analytics.motivation.mediumMotivation /
                                statistics.total_students) *
                                100
                            )
                          : 0
                      }
                      strokeColor="#faad14"
                      format={(percent) => `${percent}%`}
                    />
                  </div>
                </div>
              </Col>
              <Col span={8}>
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontSize: 24,
                      fontWeight: "bold",
                      color: "#ff4d4f",
                      marginBottom: 4,
                    }}
                  >
                    {analytics.motivation.lowMotivation}
                  </div>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Motivasi Rendah
                  </Text>
                  <div style={{ marginTop: 8 }}>
                    <Progress
                      type="circle"
                      size={60}
                      percent={
                        statistics?.total_students > 0
                          ? Math.round(
                              (analytics.motivation.lowMotivation /
                                statistics.total_students) *
                                100
                            )
                          : 0
                      }
                      strokeColor="#ff4d4f"
                      format={(percent) => `${percent}%`}
                    />
                  </div>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Activity Summary */}
      <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
        <Col xs={12} sm={6}>
          <Card size="small" style={{ borderRadius: 8, textAlign: "center" }}>
            <Statistic
              title="Kelompok Aktif"
              value={analytics.groups.activeGroups}
              suffix={`/ ${materialDetail?.groups?.length || 0}`}
              prefix={<UserOutlined style={{ color: "#1677ff" }} />}
              valueStyle={{ color: "#1677ff", fontSize: 16 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" style={{ borderRadius: 8, textAlign: "center" }}>
            <Statistic
              title="Rata-rata Anggota"
              value={analytics.groups.avgGroupSize}
              prefix={<UserOutlined style={{ color: "#52c41a" }} />}
              valueStyle={{ color: "#52c41a", fontSize: 16 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" style={{ borderRadius: 8, textAlign: "center" }}>
            <Statistic
              title="Quiz per Kelompok"
              value={analytics.activities.avgQuizAssignments}
              prefix={<BookOutlined style={{ color: "#faad14" }} />}
              valueStyle={{ color: "#faad14", fontSize: 16 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" style={{ borderRadius: 8, textAlign: "center" }}>
            <Statistic
              title="Tingkat Pengumpulan"
              value={analytics.activities.completionRate}
              suffix="%"
              prefix={<CheckCircleOutlined style={{ color: "#722ed1" }} />}
              valueStyle={{ color: "#722ed1", fontSize: 16 }}
            />
          </Card>
        </Col>
      </Row>

      {/* Top Performers */}
      <Card
        title={
          <Space>
            <TrophyOutlined style={{ color: "#11418b" }} />
            <Text strong>Top 5 Siswa Berprestasi</Text>
          </Space>
        }
        style={{ borderRadius: 12 }}
        headStyle={{ borderBottom: "2px solid #f0f0f0" }}
      >
        {topPerformers.length > 0 ? (
          <Table
            dataSource={topPerformers}
            columns={performanceColumns}
            pagination={false}
            size="middle"
            style={{ width: "100%" }}
            scroll={{ x: isMobile ? 500 : undefined }}
          />
        ) : (
          <Empty
            description="Belum ada data performa siswa"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            style={{ padding: "40px 0" }}
          />
        )}
      </Card>
    </div>
  );
};

export default SessionMaterialAnalyticsTab;
