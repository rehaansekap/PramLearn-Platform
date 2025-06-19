import React from "react";
import {
  Card,
  Row,
  Col,
  Progress,
  Typography,
  Space,
  Statistic,
  Empty,
  Spin,
  List,
  Tag,
  Alert,
} from "antd";
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  RiseOutlined,
  FallOutlined,
  MinusOutlined,
  StarOutlined,
  TrophyOutlined,
  BookOutlined,
  CalendarOutlined,
  BarChartOutlined,
  LineChartOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

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
      <div style={{ textAlign: "center", padding: "60px 24px" }}>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <div>
              <Text style={{ fontSize: 16, color: "#666" }}>
                Belum ada data untuk analytics
              </Text>
              <div style={{ marginTop: 12 }}>
                <Text type="secondary" style={{ fontSize: 14 }}>
                  Analytics akan muncul setelah Anda memiliki minimal 5 nilai
                </Text>
              </div>
            </div>
          }
        />
      </div>
    );
  }

  // ✅ PERBAIKI KONDISI EMPTY STATE
  if (!grades || grades.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "60px 24px" }}>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Belum ada data untuk analytics"
        />
      </div>
    );
  }

  // Calculate trends
  const calculateTrend = () => {
    if (grades.length < 10) {
      return {
        trend: "insufficient_data",
        percentage: 0,
        message: "Minimal 10 nilai diperlukan untuk analisis tren",
      };
    }

    const sortedGrades = [...grades].sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
    const halfPoint = Math.floor(sortedGrades.length / 2);

    const recentGrades = sortedGrades.slice(halfPoint);
    const olderGrades = sortedGrades.slice(0, halfPoint);

    const recentAvg =
      recentGrades.reduce((sum, g) => sum + (g.grade || 0), 0) /
      recentGrades.length;
    const olderAvg =
      olderGrades.reduce((sum, g) => sum + (g.grade || 0), 0) /
      olderGrades.length;

    const difference = recentAvg - olderAvg;
    const percentage = Math.abs((difference / olderAvg) * 100);

    let trend = "stable";
    if (difference > 3) trend = "increasing";
    else if (difference < -3) trend = "decreasing";

    return {
      trend,
      percentage: percentage.toFixed(1),
      recentAvg: recentAvg.toFixed(1),
      olderAvg: olderAvg.toFixed(1),
      difference: difference.toFixed(1),
    };
  };

  // Calculate subject performance
  const getSubjectPerformance = () => {
    const subjectMap = new Map();

    grades.forEach((grade) => {
      const subjectName = grade.subject_name;
      if (!subjectMap.has(subjectName)) {
        subjectMap.set(subjectName, {
          name: subjectName,
          grades: [],
          quizCount: 0,
          assignmentCount: 0,
        });
      }

      const subject = subjectMap.get(subjectName);
      subject.grades.push(grade);

      if (grade.type === "quiz") subject.quizCount++;
      else subject.assignmentCount++;
    });

    return Array.from(subjectMap.values())
      .map((subject) => {
        const average =
          subject.grades.reduce((sum, g) => sum + (g.grade || 0), 0) /
          subject.grades.length;
        const highest = Math.max(...subject.grades.map((g) => g.grade || 0));
        const lowest = Math.min(...subject.grades.map((g) => g.grade || 0));

        return {
          ...subject,
          average: average.toFixed(1),
          highest,
          lowest,
          totalAssessments: subject.grades.length,
          consistency:
            subject.grades.length > 1
              ? (100 - ((highest - lowest) / highest) * 100).toFixed(1)
              : 100,
        };
      })
      .sort((a, b) => b.average - a.average);
  };

  // Get monthly performance
  const getMonthlyPerformance = () => {
    const monthlyMap = new Map();

    grades.forEach((grade) => {
      const month = dayjs(grade.date).format("YYYY-MM");
      const monthName = dayjs(grade.date).format("MMM YYYY");

      if (!monthlyMap.has(month)) {
        monthlyMap.set(month, {
          month: monthName,
          grades: [],
          quizCount: 0,
          assignmentCount: 0,
        });
      }

      const monthData = monthlyMap.get(month);
      monthData.grades.push(grade);

      if (grade.type === "quiz") monthData.quizCount++;
      else monthData.assignmentCount++;
    });

    return Array.from(monthlyMap.values())
      .map((month) => ({
        ...month,
        average:
          month.grades.reduce((sum, g) => sum + (g.grade || 0), 0) /
          month.grades.length,
        totalAssessments: month.grades.length,
      }))
      .sort((a, b) => b.month.localeCompare(a.month))
      .slice(0, 6); // Last 6 months
  };

  // Performance insights
  const getPerformanceInsights = () => {
    const insights = [];
    const trend = calculateTrend();
    const subjectPerformance = getSubjectPerformance();
    const averageGrade =
      grades.reduce((sum, g) => sum + (g.grade || 0), 0) / grades.length;

    // Trend insight
    if (trend.trend === "increasing") {
      insights.push({
        type: "success",
        icon: <ArrowUpOutlined />,
        title: "Performa Meningkat",
        description: `Nilai Anda meningkat ${trend.percentage}% dari periode sebelumnya. Pertahankan!`,
      });
    } else if (trend.trend === "decreasing") {
      insights.push({
        type: "warning",
        icon: <ArrowDownOutlined />,
        title: "Perlu Perhatian",
        description: `Nilai menurun ${trend.percentage}%. Fokus pada review materi dan latihan lebih banyak.`,
      });
    }

    // Subject strength/weakness
    if (subjectPerformance.length > 0) {
      const strongest = subjectPerformance[0];
      const weakest = subjectPerformance[subjectPerformance.length - 1];

      if (strongest.average >= 85) {
        insights.push({
          type: "info",
          icon: <StarOutlined />,
          title: "Mata Pelajaran Terkuat",
          description: `Anda sangat baik di ${strongest.name} dengan rata-rata ${strongest.average}`,
        });
      }

      if (weakest.average < 70 && subjectPerformance.length > 1) {
        insights.push({
          type: "warning",
          icon: <BookOutlined />,
          title: "Perlu Peningkatan",
          description: `${weakest.name} memerlukan perhatian lebih dengan rata-rata ${weakest.average}`,
        });
      }
    }

    // Overall performance
    if (averageGrade >= 90) {
      insights.push({
        type: "success",
        icon: <TrophyOutlined />,
        title: "Prestasi Luar Biasa",
        description:
          "Rata-rata keseluruhan Anda sangat tinggi. Anda adalah siswa berprestasi!",
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
      case "increasing":
        return <RiseOutlined style={{ color: "#52c41a" }} />;
      case "decreasing":
        return <FallOutlined style={{ color: "#ff4d4f" }} />;
      case "insufficient_data":
        return <BarChartOutlined style={{ color: "#faad14" }} />;
      default:
        return <MinusOutlined style={{ color: "#faad14" }} />;
    }
  };

  const getTrendColor = () => {
    switch (trend.trend) {
      case "increasing":
        return "#52c41a";
      case "decreasing":
        return "#ff4d4f";
      default:
        return "#faad14";
    }
  };

  const getGradeColor = (score) => {
    if (score >= 90) return "#52c41a";
    if (score >= 80) return "#1890ff";
    if (score >= 70) return "#faad14";
    if (score >= 60) return "#fa8c16";
    return "#ff4d4f";
  };

  return (
    <div>
      {/* Performance Insights */}
      {insights.length > 0 && (
        <Card style={{ borderRadius: 12, marginBottom: 24 }}>
          <Title level={4} style={{ marginBottom: 16 }}>
            <BarChartOutlined style={{ marginRight: 8 }} />
            Insight Performa
          </Title>
          <Row gutter={[16, 16]}>
            {insights.map((insight, index) => (
              <Col xs={24} md={12} lg={8} key={index}>
                <Alert
                  message={insight.title}
                  description={insight.description}
                  type={insight.type}
                  icon={insight.icon}
                  showIcon
                  style={{ borderRadius: 8 }}
                />
              </Col>
            ))}
          </Row>
        </Card>
      )}

      {/* Trend Analysis */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} md={8}>
          <Card style={{ borderRadius: 12, textAlign: "center" }}>
            <Space direction="vertical" style={{ width: "100%" }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>
                {getTrendIcon()}
              </div>
              <Title level={4} style={{ margin: 0, color: getTrendColor() }}>
                {trend.trend === "insufficient_data"
                  ? "Insufficient Data"
                  : trend.trend === "increasing"
                  ? "Tren Meningkat"
                  : trend.trend === "decreasing"
                  ? "Tren Menurun"
                  : "Tren Stabil"}
              </Title>
              {trend.trend !== "insufficient_data" ? (
                <>
                  <Text type="secondary">
                    Perubahan {trend.percentage}% dari periode sebelumnya
                  </Text>
                  <div style={{ marginTop: 8 }}>
                    <Text style={{ fontSize: 12, color: "#666" }}>
                      Periode lama: {trend.olderAvg} → Periode baru:{" "}
                      {trend.recentAvg}
                    </Text>
                  </div>
                </>
              ) : (
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {trend.message}
                </Text>
              )}
            </Space>
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card style={{ borderRadius: 12, textAlign: "center" }}>
            <Statistic
              title="Konsistensi Performa"
              value={
                grades.length > 1
                  ? (
                      100 -
                      ((Math.max(...grades.map((g) => g.grade)) -
                        Math.min(...grades.map((g) => g.grade))) /
                        Math.max(...grades.map((g) => g.grade))) *
                        100
                    ).toFixed(1)
                  : 100
              }
              suffix="%"
              prefix={<LineChartOutlined style={{ color: "#722ed1" }} />}
              valueStyle={{ color: "#722ed1" }}
            />
            <Progress
              percent={
                grades.length > 1
                  ? 100 -
                    ((Math.max(...grades.map((g) => g.grade)) -
                      Math.min(...grades.map((g) => g.grade))) /
                      Math.max(...grades.map((g) => g.grade))) *
                      100
                  : 100
              }
              strokeColor="#722ed1"
              showInfo={false}
              style={{ marginTop: 8 }}
            />
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card style={{ borderRadius: 12, textAlign: "center" }}>
            <Statistic
              title="Nilai Tertinggi"
              value={Math.max(...grades.map((g) => g.grade || 0)).toFixed(1)}
              prefix={<TrophyOutlined style={{ color: "#faad14" }} />}
              valueStyle={{ color: "#faad14" }}
            />
            <div style={{ marginTop: 8 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Terendah:{" "}
                {Math.min(...grades.map((g) => g.grade || 0)).toFixed(1)}
              </Text>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Subject Performance Analysis */}
      <Card style={{ borderRadius: 12, marginBottom: 24 }}>
        <Title level={4} style={{ marginBottom: 16 }}>
          <BookOutlined style={{ marginRight: 8 }} />
          Analisis per Mata Pelajaran
        </Title>

        <List
          grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 3 }}
          dataSource={subjectPerformance}
          renderItem={(subject, index) => (
            <List.Item>
              <Card
                size="small"
                style={{
                  borderRadius: 8,
                  border: `2px solid ${getGradeColor(subject.average)}`,
                  position: "relative",
                }}
              >
                {index === 0 && (
                  <div
                    style={{
                      position: "absolute",
                      top: -8,
                      right: -8,
                      background: "#faad14",
                      borderRadius: "50%",
                      width: 24,
                      height: 24,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <TrophyOutlined style={{ color: "white", fontSize: 12 }} />
                  </div>
                )}

                <div style={{ textAlign: "center", marginBottom: 12 }}>
                  <Title
                    level={5}
                    style={{ margin: 0, color: getGradeColor(subject.average) }}
                  >
                    {subject.name}
                  </Title>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {subject.totalAssessments} assessment
                  </Text>
                </div>

                <Row gutter={8} style={{ marginBottom: 12 }}>
                  <Col span={8} style={{ textAlign: "center" }}>
                    <div
                      style={{
                        fontSize: 16,
                        fontWeight: "bold",
                        color: getGradeColor(subject.average),
                      }}
                    >
                      {subject.average}
                    </div>
                    <div style={{ fontSize: 10, color: "#666" }}>Rata-rata</div>
                  </Col>
                  <Col span={8} style={{ textAlign: "center" }}>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: "bold",
                        color: "#52c41a",
                      }}
                    >
                      {subject.highest}
                    </div>
                    <div style={{ fontSize: 10, color: "#666" }}>Tertinggi</div>
                  </Col>
                  <Col span={8} style={{ textAlign: "center" }}>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: "bold",
                        color: "#ff4d4f",
                      }}
                    >
                      {subject.lowest}
                    </div>
                    <div style={{ fontSize: 10, color: "#666" }}>Terendah</div>
                  </Col>
                </Row>

                <Progress
                  percent={subject.average}
                  strokeColor={getGradeColor(subject.average)}
                  showInfo={false}
                  size="small"
                  style={{ marginBottom: 8 }}
                />

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 11,
                    color: "#666",
                  }}
                >
                  <span>Konsistensi: {subject.consistency}%</span>
                  <Space size={4}>
                    <Tag size="small" color="blue">
                      {subject.quizCount}Q
                    </Tag>
                    <Tag size="small" color="green">
                      {subject.assignmentCount}A
                    </Tag>
                  </Space>
                </div>
              </Card>
            </List.Item>
          )}
        />
      </Card>

      {/* Monthly Performance */}
      {monthlyPerformance.length > 0 && (
        <Card style={{ borderRadius: 12 }}>
          <Title level={4} style={{ marginBottom: 16 }}>
            <CalendarOutlined style={{ marginRight: 8 }} />
            Performa Bulanan (6 Bulan Terakhir)
          </Title>

          <List
            grid={{ gutter: 16, xs: 2, sm: 3, md: 4, lg: 6 }}
            dataSource={monthlyPerformance}
            renderItem={(month) => (
              <List.Item>
                <Card
                  size="small"
                  style={{ textAlign: "center", borderRadius: 8 }}
                >
                  <div style={{ marginBottom: 8 }}>
                    <Text strong style={{ fontSize: 12 }}>
                      {month.month}
                    </Text>
                  </div>
                  <div
                    style={{
                      fontSize: 18,
                      fontWeight: "bold",
                      color: getGradeColor(month.average),
                      marginBottom: 8,
                    }}
                  >
                    {month.average.toFixed(1)}
                  </div>
                  <Progress
                    percent={month.average}
                    strokeColor={getGradeColor(month.average)}
                    showInfo={false}
                    size="small"
                    style={{ marginBottom: 8 }}
                  />
                  <div style={{ fontSize: 10, color: "#666" }}>
                    {month.totalAssessments} assessment
                  </div>
                  <Space size={2} style={{ marginTop: 4 }}>
                    <Tag size="small" color="blue">
                      {month.quizCount}Q
                    </Tag>
                    <Tag size="small" color="green">
                      {month.assignmentCount}A
                    </Tag>
                  </Space>
                </Card>
              </List.Item>
            )}
          />
        </Card>
      )}
    </div>
  );
};

export default PerformanceAnalytics;
