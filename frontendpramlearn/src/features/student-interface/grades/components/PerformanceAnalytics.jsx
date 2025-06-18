import React from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Progress,
  Typography,
  Space,
  Tag,
  Divider,
  Tooltip,
  Empty,
  Spin,
  List,
  Badge,
} from "antd";
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  StarOutlined,
  AimOutlined,
  CalendarOutlined,
  BookOutlined,
  TrophyOutlined,
  BulbOutlined,
  LineChartOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const PerformanceAnalytics = ({
  grades = [],
  subjects = [],
  statistics = {},
  loading = false,
}) => {

  // Show loading state
  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "60px 0" }}>
        <Spin size="large" tip="Memuat analytics..." />
      </div>
    );
  }

  if (!Array.isArray(grades) || grades.length === 0) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={
          <div>
            <Text style={{ fontSize: 16, color: "#666" }}>
              Belum ada data nilai untuk dianalisis
            </Text>
            <div style={{ marginTop: 12 }}>
              <Text type="secondary" style={{ fontSize: 14 }}>
                Analytics akan tersedia setelah ada nilai yang tercatat
              </Text>
            </div>
          </div>
        }
      />
    );
  }

  // ✅ PERBAIKI KONDISI EMPTY STATE
  if (!grades || grades.length === 0) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={
          <div>
            <Text style={{ fontSize: 16, color: "#666" }}>
              Belum ada data nilai untuk dianalisis
            </Text>
            <div style={{ marginTop: 12 }}>
              <Text type="secondary" style={{ fontSize: 14 }}>
                Analytics akan tersedia setelah ada nilai yang tercatat
              </Text>
            </div>
          </div>
        }
      />
    );
  }

  // Calculate trends
  const calculateTrend = () => {
    if (grades.length < 2) return { trend: "stable", percentage: 0 };

    const recentGrades = grades.slice(0, 5).map((g) => g.grade);
    const olderGrades = grades.slice(5, 10).map((g) => g.grade);

    if (recentGrades.length === 0 || olderGrades.length === 0)
      return { trend: "stable", percentage: 0 };

    const recentAvg =
      recentGrades.reduce((a, b) => a + b, 0) / recentGrades.length;
    const olderAvg =
      olderGrades.reduce((a, b) => a + b, 0) / olderGrades.length;

    const difference = recentAvg - olderAvg;
    const percentage = Math.abs((difference / olderAvg) * 100);

    return {
      trend: difference > 2 ? "up" : difference < -2 ? "down" : "stable",
      percentage: Math.round(percentage * 10) / 10,
      difference: Math.round(difference * 10) / 10,
    };
  };

  // Calculate subject performance
  const getSubjectPerformance = () => {
    const subjectStats = {};

    grades.forEach((grade) => {
      const subjectName = grade.subject_name || "Unknown Subject";
      if (!subjectStats[subjectName]) {
        subjectStats[subjectName] = {
          name: subjectName,
          grades: [],
          quizzes: [],
          assignments: [],
        };
      }

      subjectStats[subjectName].grades.push(grade.grade);

      if (grade.assessment_type === "quiz") {
        subjectStats[subjectName].quizzes.push(grade.grade);
      } else if (grade.assessment_type === "assignment") {
        subjectStats[subjectName].assignments.push(grade.grade);
      }
    });

    return Object.values(subjectStats).map((subject) => ({
      ...subject,
      average:
        subject.grades.length > 0
          ? subject.grades.reduce((a, b) => a + b, 0) / subject.grades.length
          : 0,
      quizAverage:
        subject.quizzes.length > 0
          ? subject.quizzes.reduce((a, b) => a + b, 0) / subject.quizzes.length
          : 0,
      assignmentAverage:
        subject.assignments.length > 0
          ? subject.assignments.reduce((a, b) => a + b, 0) /
            subject.assignments.length
          : 0,
      totalAssessments: subject.grades.length,
    }));
  };

  // Get monthly performance
  const getMonthlyPerformance = () => {
    const monthlyData = {};

    grades.forEach((grade) => {
      const month = new Date(grade.date || grade.created_at).toLocaleDateString(
        "id-ID",
        {
          year: "numeric",
          month: "long",
        }
      );

      if (!monthlyData[month]) {
        monthlyData[month] = [];
      }
      monthlyData[month].push(grade.grade);
    });

    return Object.entries(monthlyData)
      .map(([month, gradesInMonth]) => ({
        month,
        average:
          gradesInMonth.reduce((a, b) => a + b, 0) / gradesInMonth.length,
        count: gradesInMonth.length,
      }))
      .sort((a, b) => new Date(a.month) - new Date(b.month));
  };

  // Performance insights
  const getPerformanceInsights = () => {
    const insights = [];
    const trend = calculateTrend();

    // Trend insights
    if (trend.trend === "up") {
      insights.push({
        type: "success",
        title: "Performa Meningkat! 📈",
        description: `Nilai Anda meningkat ${trend.percentage}% dalam beberapa assessment terakhir`,
      });
    } else if (trend.trend === "down") {
      insights.push({
        type: "warning",
        title: "Perlu Perhatian 📉",
        description: `Nilai menurun ${trend.percentage}% dari sebelumnya. Mari tingkatkan lagi!`,
      });
    } else {
      insights.push({
        type: "info",
        title: "Performa Stabil 📊",
        description: "Nilai Anda konsisten. Terus pertahankan!",
      });
    }

    // Subject-specific insights
    const subjectPerf = getSubjectPerformance();
    let bestSubject = null;
    let weakestSubject = null;

    if (subjectPerf.length > 0) {
      bestSubject = subjectPerf.reduce((best, current) =>
        current.average > best.average ? current : best
      );
      weakestSubject = subjectPerf.reduce((worst, current) =>
        current.average < worst.average ? current : worst
      );
    }

    if (bestSubject && bestSubject.average > 0) {
      insights.push({
        type: "success",
        title: `Unggul di ${bestSubject.name} 🏆`,
        description: `Rata-rata ${bestSubject.average.toFixed(
          1
        )} - Pertahankan performa ini!`,
      });
    }

    if (
      weakestSubject &&
      weakestSubject.average > 0 &&
      weakestSubject.average < 70
    ) {
      insights.push({
        type: "warning",
        title: `Focus pada ${weakestSubject.name} 🎯`,
        description: `Rata-rata ${weakestSubject.average.toFixed(
          1
        )} - Butuh lebih banyak latihan`,
      });
    }

    return insights;
  };

  const trend = calculateTrend();
  const subjectPerformance = getSubjectPerformance();
  const monthlyPerformance = getMonthlyPerformance();
  const insights = getPerformanceInsights();

  const getTrendIcon = () => {
    switch (trend.trend) {
      case "up":
        return <ArrowUpOutlined style={{ color: "#52c41a" }} />;
      case "down":
        return <ArrowDownOutlined style={{ color: "#ff4d4f" }} />;
      default:
        return <AimOutlined style={{ color: "#faad14" }} />;
    }
  };

  const getTrendColor = () => {
    switch (trend.trend) {
      case "up":
        return "#52c41a";
      case "down":
        return "#ff4d4f";
      default:
        return "#faad14";
    }
  };

  return (
    <div>
      {/* Header Analytics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={24}>
          <Card
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
            }}
          >
            <Row align="middle" justify="center">
              <Col>
                <div style={{ textAlign: "center" }}>
                  <TrophyOutlined style={{ fontSize: 48, marginBottom: 16 }} />
                  <Title level={3} style={{ color: "white", margin: 0 }}>
                    Analytics Performa Akademik
                  </Title>
                  <Text style={{ color: "rgba(255,255,255,0.8)" }}>
                    Analisis mendalam terhadap pencapaian belajar Anda
                  </Text>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Performance Trend */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title="Tren Performa"
              value={trend.percentage}
              suffix="%"
              prefix={getTrendIcon()}
              valueStyle={{ color: getTrendColor() }}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {trend.trend === "up"
                ? "Meningkat"
                : trend.trend === "down"
                ? "Menurun"
                : "Stabil"}{" "}
              dari sebelumnya
            </Text>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title="Target Pencapaian"
              value={75}
              suffix="/ 100"
              prefix={<AimOutlined />}
              valueStyle={{
                color: statistics.average_grade >= 75 ? "#52c41a" : "#faad14",
              }}
            />
            <Progress
              percent={((statistics.average_grade || 0) / 100) * 100}
              size="small"
              showInfo={false}
              strokeColor={
                statistics.average_grade >= 75
                  ? "#52c41a"
                  : statistics.average_grade >= 60
                  ? "#faad14"
                  : "#ff4d4f"
              }
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title="Konsistensi"
              value={grades.length}
              suffix="assessments"
              prefix={<CalendarOutlined />}
              valueStyle={{ color: "#11418b" }}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              Aktif mengerjakan tugas
            </Text>
          </Card>
        </Col>
      </Row>

      {/* Performance Insights */}
      <Card title="💡 Insights & Rekomendasi" style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]}>
          {insights.map((insight, index) => (
            <Col xs={24} md={12} lg={8} key={index}>
              <Card
                size="small"
                style={{
                  borderLeft: `4px solid ${
                    insight.type === "success"
                      ? "#52c41a"
                      : insight.type === "warning"
                      ? "#faad14"
                      : "#11418b"
                  }`,
                }}
              >
                <Title level={5} style={{ marginBottom: 8 }}>
                  {insight.title}
                </Title>
                <Text type="secondary">{insight.description}</Text>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      {/* Subject Performance */}
      <Card title="📚 Performa per Mata Pelajaran" style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]}>
          {subjectPerformance.map((subject, index) => (
            <Col xs={24} sm={12} lg={8} key={index}>
              <Card size="small" style={{ height: "100%" }}>
                <div style={{ marginBottom: 12 }}>
                  <Text strong style={{ fontSize: 16 }}>
                    {subject.name}
                  </Text>
                  <div style={{ float: "right" }}>
                    <Badge
                      status={
                        subject.average >= 80
                          ? "success"
                          : subject.average >= 60
                          ? "warning"
                          : "error"
                      }
                      text={subject.average.toFixed(1)}
                    />
                  </div>
                </div>

                <Progress
                  percent={subject.average}
                  strokeColor={
                    subject.average >= 80
                      ? "#52c41a"
                      : subject.average >= 60
                      ? "#faad14"
                      : "#ff4d4f"
                  }
                  showInfo={false}
                  style={{ marginBottom: 12 }}
                />

                <Space wrap>
                  <Tooltip title="Quiz Average">
                    <Tag color="blue" size="small">
                      Quiz: {subject.quizAverage.toFixed(1)}
                    </Tag>
                  </Tooltip>
                  <Tooltip title="Assignment Average">
                    <Tag color="green" size="small">
                      Tugas: {subject.assignmentAverage.toFixed(1)}
                    </Tag>
                  </Tooltip>
                </Space>

                <Divider style={{ margin: "8px 0" }} />

                <Text type="secondary" style={{ fontSize: 11 }}>
                  {subject.totalAssessments} total assessment
                </Text>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      {/* Monthly Performance */}
      <Card title="📅 Performa Bulanan" style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]}>
          {monthlyPerformance.map((month, index) => (
            <Col xs={12} sm={8} md={6} key={index}>
              <Card size="small" style={{ textAlign: "center" }}>
                <Statistic
                  title={month.month}
                  value={month.average.toFixed(1)}
                  valueStyle={{
                    color:
                      month.average >= 80
                        ? "#52c41a"
                        : month.average >= 60
                        ? "#faad14"
                        : "#ff4d4f",
                    fontSize: 16,
                  }}
                />
                <Text type="secondary" style={{ fontSize: 11 }}>
                  {month.count} assessment
                </Text>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      {/* Recent Grades */}
      <Card title="📋 Nilai Terbaru" style={{ marginBottom: 24 }}>
        <List
          itemLayout="horizontal"
          dataSource={grades.slice(0, 5)}
          renderItem={(grade, index) => (
            <List.Item>
              <List.Item.Meta
                avatar={
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      background:
                        grade.grade >= 80
                          ? "#52c41a"
                          : grade.grade >= 60
                          ? "#faad14"
                          : "#ff4d4f",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontWeight: "bold",
                    }}
                  >
                    {grade.grade}
                  </div>
                }
                title={
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Text strong>
                      {grade.subject_name || "Unknown Subject"}
                    </Text>
                    <Tag
                      color={
                        grade.assessment_type === "quiz" ? "blue" : "green"
                      }
                    >
                      {grade.assessment_type || "Assessment"}
                    </Tag>
                  </div>
                }
                description={
                  <div>
                    <Text type="secondary">
                      {new Date(
                        grade.date || grade.created_at
                      ).toLocaleDateString("id-ID", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </Text>
                    {grade.assignment_title && (
                      <div>
                        <Text style={{ fontSize: 12 }}>
                          {grade.assignment_title}
                        </Text>
                      </div>
                    )}
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
};

export default PerformanceAnalytics;
