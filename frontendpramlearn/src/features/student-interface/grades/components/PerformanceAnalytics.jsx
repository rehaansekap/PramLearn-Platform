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
} from "antd";
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  StarOutlined,
  AimOutlined, // Ganti dari TargetOutlined ke AimOutlined
  CalendarOutlined,
  BookOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const PerformanceAnalytics = ({
  grades = [],
  subjects = [],
  statistics = {},
}) => {
  // Calculate trends
  const calculateTrend = () => {
    if (grades.length < 2) return { trend: "stable", percentage: 0 };

    const recentGrades = grades.slice(0, 5).map((g) => g.grade);
    const olderGrades = grades.slice(5, 10).map((g) => g.grade);

    if (recentGrades.length === 0 || olderGrades.length === 0)
      return { trend: "stable", percentage: 0 };

    const recentAvg =
      recentGrades.reduce((sum, g) => sum + g, 0) / recentGrades.length;
    const olderAvg =
      olderGrades.reduce((sum, g) => sum + g, 0) / olderGrades.length;

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
    return subjects.map((subject) => {
      const subjectGrades = grades.filter(
        (g) => g.subject_name === subject.name
      );
      const average =
        subjectGrades.length > 0
          ? subjectGrades.reduce((sum, g) => sum + g.grade, 0) /
            subjectGrades.length
          : 0;

      const quizGrades = subjectGrades.filter((g) => g.type === "quiz");
      const assignmentGrades = subjectGrades.filter(
        (g) => g.type === "assignment"
      );

      return {
        ...subject,
        average,
        totalAssessments: subjectGrades.length,
        quizAverage:
          quizGrades.length > 0
            ? quizGrades.reduce((sum, g) => sum + g.grade, 0) /
              quizGrades.length
            : 0,
        assignmentAverage:
          assignmentGrades.length > 0
            ? assignmentGrades.reduce((sum, g) => sum + g.grade, 0) /
              assignmentGrades.length
            : 0,
        quizCount: quizGrades.length,
        assignmentCount: assignmentGrades.length,
      };
    });
  };

  // Calculate monthly performance
  const getMonthlyPerformance = () => {
    const monthlyData = {};

    grades.forEach((grade) => {
      const month = new Date(grade.date).toISOString().slice(0, 7); // YYYY-MM
      if (!monthlyData[month]) {
        monthlyData[month] = { grades: [], total: 0 };
      }
      monthlyData[month].grades.push(grade.grade);
      monthlyData[month].total += grade.grade;
    });

    return Object.entries(monthlyData)
      .map(([month, data]) => ({
        month,
        average: data.total / data.grades.length,
        count: data.grades.length,
        monthName: new Date(month + "-01").toLocaleDateString("id-ID", {
          month: "long",
          year: "numeric",
        }),
      }))
      .sort((a, b) => new Date(b.month) - new Date(a.month))
      .slice(0, 6);
  };

  // Get performance insights
  const getPerformanceInsights = () => {
    const insights = [];
    const trend = calculateTrend();

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
        title: `Focus on ${weakestSubject.name} 🎯`,
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
        return <AimOutlined style={{ color: "#faad14" }} />; // Ganti di sini
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
              value={((statistics.average_grade || 0) / 100) * 100}
              suffix="/ 100"
              prefix={<AimOutlined />} // Ganti di sini
              valueStyle={{
                color:
                  statistics.average_grade >= 80
                    ? "#52c41a"
                    : statistics.average_grade >= 60
                    ? "#faad14"
                    : "#ff4d4f",
              }}
            />
            <Progress
              percent={statistics.average_grade || 0}
              size="small"
              showInfo={false}
              strokeColor={
                statistics.average_grade >= 80
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

      {/* Subject Performance Breakdown */}
      <Card title="📚 Performa per Mata Pelajaran" style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]}>
          {subjectPerformance.map((subject) => (
            <Col xs={24} sm={12} lg={8} key={subject.id}>
              <Card size="small">
                <div style={{ marginBottom: 12 }}>
                  <Space>
                    <BookOutlined style={{ color: "#11418b" }} />
                    <Text strong>{subject.name}</Text>
                  </Space>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <Text style={{ fontSize: 24, fontWeight: "bold" }}>
                    {subject.average.toFixed(1)}
                  </Text>
                  <Text type="secondary"> / 100</Text>
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
          {monthlyPerformance.map((month) => (
            <Col xs={12} sm={8} md={6} lg={4} key={month.month}>
              <Card size="small" style={{ textAlign: "center" }}>
                <Text strong style={{ fontSize: 16 }}>
                  {month.average.toFixed(1)}
                </Text>
                <br />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {month.monthName}
                </Text>
                <br />
                <Tag size="small">{month.count} assessment</Tag>
                <Progress
                  percent={month.average}
                  size="small"
                  showInfo={false}
                  strokeColor={
                    month.average >= 80
                      ? "#52c41a"
                      : month.average >= 60
                      ? "#faad14"
                      : "#ff4d4f"
                  }
                  style={{ marginTop: 8 }}
                />
              </Card>
            </Col>
          ))}
        </Row>
      </Card>
    </div>
  );
};

export default PerformanceAnalytics;
