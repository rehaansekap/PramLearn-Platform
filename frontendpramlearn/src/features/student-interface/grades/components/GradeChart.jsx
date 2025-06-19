import React, { useState } from "react";
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
  Tabs,
  List,
  Tag,
} from "antd";
import {
  TrophyOutlined,
  BookOutlined,
  FileTextOutlined,
  BarChartOutlined,
  RiseOutlined,
  FallOutlined,
  MinusOutlined,
  StarOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const GradeChart = ({
  grades,
  subjects = [],
  analytics,
  analyticsLoading = false,
  statistics = {},
  loading,
  compact = false,
}) => {
  const [processedSubjects, setProcessedSubjects] = useState([]);

  // Generate subjects dari grades jika subjects kosong
  const getSubjectsToUse = () => {
    if (subjects && subjects.length > 0) {
      return subjects;
    }
    
    const uniqueSubjects = [...new Set(grades.map(g => g.subject_name))];
    return uniqueSubjects.map((name, index) => ({
      id: index + 1,
      name: name,
    }));
  };

  const subjectsToUse = getSubjectsToUse();

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "60px 0" }}>
        <Spin size="large" tip="Memuat data chart..." />
      </div>
    );
  }

  if (!analytics && (!grades || grades.length === 0)) {
    return (
      <div style={{ textAlign: "center", padding: "60px 24px" }}>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <div>
              <Text style={{ fontSize: 16, color: "#666" }}>
                Belum ada data untuk ditampilkan
              </Text>
              <div style={{ marginTop: 12 }}>
                <Text type="secondary" style={{ fontSize: 14 }}>
                  Chart akan muncul setelah ada nilai quiz atau assignment
                </Text>
              </div>
            </div>
          }
        />
      </div>
    );
  }

  if (!grades || grades.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "60px 24px" }}>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Belum ada data nilai untuk chart"
        />
      </div>
    );
  }

  // Calculate stats
  const quizGrades = grades.filter((g) => g.type === "quiz" && g.grade);
  const assignmentGrades = grades.filter(
    (g) => g.type === "assignment" && g.grade
  );

  const quizAvg =
    quizGrades.length > 0
      ? quizGrades.reduce((sum, g) => sum + g.grade, 0) / quizGrades.length
      : 0;

  const assignmentAvg =
    assignmentGrades.length > 0
      ? assignmentGrades.reduce((sum, g) => sum + g.grade, 0) /
        assignmentGrades.length
      : 0;

  const overallAvg =
    grades.length > 0
      ? grades.reduce((sum, g) => sum + (g.grade || 0), 0) / grades.length
      : 0;

  // Simple trend visualization using progress bars
  const getGradeColor = (score) => {
    if (score >= 90) return "#52c41a";
    if (score >= 80) return "#1890ff";
    if (score >= 70) return "#faad14";
    if (score >= 60) return "#fa8c16";
    return "#ff4d4f";
  };

  // Calculate trend
  const calculateTrend = () => {
    if (grades.length < 5) return { trend: "stable", percentage: 0 };
    
    const recent = grades.slice(0, Math.floor(grades.length / 2));
    const older = grades.slice(Math.floor(grades.length / 2));
    
    const recentAvg = recent.reduce((sum, g) => sum + (g.grade || 0), 0) / recent.length;
    const olderAvg = older.reduce((sum, g) => sum + (g.grade || 0), 0) / older.length;
    
    const difference = recentAvg - olderAvg;
    const percentage = Math.abs((difference / olderAvg) * 100);
    
    let trend = "stable";
    if (difference > 2) trend = "increasing";
    else if (difference < -2) trend = "decreasing";
    
    return { trend, percentage: percentage.toFixed(1) };
  };

  const trendData = calculateTrend();

  const getTrendIcon = () => {
    switch (trendData.trend) {
      case "increasing":
        return <RiseOutlined style={{ color: "#52c41a" }} />;
      case "decreasing":
        return <FallOutlined style={{ color: "#ff4d4f" }} />;
      default:
        return <MinusOutlined style={{ color: "#faad14" }} />;
    }
  };

  const getTrendText = () => {
    switch (trendData.trend) {
      case "increasing":
        return "Meningkat";
      case "decreasing":
        return "Menurun";
      default:
        return "Stabil";
    }
  };

  // Get subject performance
  const getSubjectPerformance = () => {
    return subjectsToUse.map(subject => {
      const subjectGrades = grades.filter(g => g.subject_name === subject.name);
      const average = subjectGrades.length > 0 
        ? subjectGrades.reduce((sum, g) => sum + (g.grade || 0), 0) / subjectGrades.length 
        : 0;
      
      return {
        name: subject.name,
        average: average,
        count: subjectGrades.length,
        color: getGradeColor(average)
      };
    }).filter(s => s.count > 0);
  };

  const subjectPerformance = getSubjectPerformance();

  if (compact) {
    return (
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8}>
          <Card style={{ borderRadius: 12, textAlign: "center" }}>
            <Statistic
              title="Rata-rata Keseluruhan"
              value={overallAvg.toFixed(1)}
              prefix={<TrophyOutlined style={{ color: getGradeColor(overallAvg) }} />}
              valueStyle={{ color: getGradeColor(overallAvg), fontSize: 28 }}
            />
            <Progress
              percent={overallAvg}
              strokeColor={getGradeColor(overallAvg)}
              showInfo={false}
              style={{ marginTop: 8 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card style={{ borderRadius: 12, textAlign: "center" }}>
            <Statistic
              title="Rata-rata Quiz"
              value={quizAvg.toFixed(1)}
              prefix={<BookOutlined style={{ color: getGradeColor(quizAvg) }} />}
              valueStyle={{ color: getGradeColor(quizAvg), fontSize: 24 }}
            />
            <div style={{ marginTop: 8 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Dari {quizGrades.length} quiz
              </Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card style={{ borderRadius: 12, textAlign: "center" }}>
            <Statistic
              title="Rata-rata Assignment"
              value={assignmentAvg.toFixed(1)}
              prefix={<FileTextOutlined style={{ color: getGradeColor(assignmentAvg) }} />}
              valueStyle={{ color: getGradeColor(assignmentAvg), fontSize: 24 }}
            />
            <div style={{ marginTop: 8 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Dari {assignmentGrades.length} assignment
              </Text>
            </div>
          </Card>
        </Col>
      </Row>
    );
  }

  // Full version with tabs
  return (
    <div>
      {/* Overview Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card 
            style={{ 
              borderRadius: 12, 
              textAlign: "center",
              background: "linear-gradient(135deg, #11418b 0%, #1677ff 100%)",
              color: "white"
            }}
          >
            <div style={{ color: "white" }}>
              <TrophyOutlined style={{ fontSize: 32, marginBottom: 8 }} />
              <div style={{ fontSize: 24, fontWeight: "bold", marginBottom: 4 }}>
                {overallAvg.toFixed(1)}
              </div>
              <div style={{ fontSize: 14, opacity: 0.9 }}>
                Rata-rata Keseluruhan
              </div>
              <Progress
                percent={overallAvg}
                strokeColor="rgba(255,255,255,0.8)"
                trailColor="rgba(255,255,255,0.2)"
                showInfo={false}
                style={{ marginTop: 8 }}
              />
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={8}>
          <Card style={{ borderRadius: 12, textAlign: "center" }}>
            <Space direction="vertical" style={{ width: "100%" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                {getTrendIcon()}
                <Text strong style={{ fontSize: 16 }}>
                  Tren Performa
                </Text>
              </div>
              <div style={{ fontSize: 20, fontWeight: "bold", color: trendData.trend === "increasing" ? "#52c41a" : trendData.trend === "decreasing" ? "#ff4d4f" : "#faad14" }}>
                {getTrendText()}
              </div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {trendData.percentage}% dari periode sebelumnya
              </Text>
            </Space>
          </Card>
        </Col>

        <Col xs={24} sm={8}>
          <Card style={{ borderRadius: 12, textAlign: "center" }}>
            <Statistic
              title="Total Assessment"
              value={grades.length}
              prefix={<BarChartOutlined style={{ color: "#722ed1" }} />}
              valueStyle={{ color: "#722ed1", fontSize: 24 }}
            />
            <div style={{ marginTop: 8 }}>
              <Space>
                <Tag color="blue">{quizGrades.length} Quiz</Tag>
                <Tag color="green">{assignmentGrades.length} Assignment</Tag>
              </Space>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Detailed Charts */}
      <Tabs type="card" style={{ background: "white", borderRadius: 12, padding: "0 24px" }}>
        <TabPane 
          tab={
            <Space>
              <BarChartOutlined />
              <span>Performa per Mata Pelajaran</span>
            </Space>
          } 
          key="subjects"
        >
          <Card style={{ borderRadius: 12, marginTop: 16 }}>
            <Title level={4} style={{ marginBottom: 24 }}>
              Rata-rata Nilai per Mata Pelajaran
            </Title>
            
            <List
              grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 3 }}
              dataSource={subjectPerformance}
              renderItem={(subject) => (
                <List.Item>
                  <Card 
                    size="small" 
                    style={{ 
                      borderRadius: 8,
                      border: `2px solid ${subject.color}`,
                      textAlign: "center"
                    }}
                  >
                    <div style={{ marginBottom: 12 }}>
                      <BookOutlined style={{ fontSize: 24, color: subject.color, marginBottom: 8 }} />
                      <div style={{ fontWeight: "bold", fontSize: 14, marginBottom: 4 }}>
                        {subject.name}
                      </div>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {subject.count} assessment
                      </Text>
                    </div>
                    
                    <div style={{ fontSize: 20, fontWeight: "bold", color: subject.color, marginBottom: 8 }}>
                      {subject.average.toFixed(1)}
                    </div>
                    
                    <Progress
                      percent={subject.average}
                      strokeColor={subject.color}
                      showInfo={false}
                      size="small"
                    />
                  </Card>
                </List.Item>
              )}
            />
          </Card>
        </TabPane>

        <TabPane 
          tab={
            <Space>
              <StarOutlined />
              <span>Distribusi Nilai</span>
            </Space>
          } 
          key="distribution"
        >
          <Card style={{ borderRadius: 12, marginTop: 16 }}>
            <Title level={4} style={{ marginBottom: 24 }}>
              Distribusi Nilai Berdasarkan Grade
            </Title>
            
            <Row gutter={[16, 16]}>
              {[
                { grade: "A (90-100)", count: grades.filter(g => g.grade >= 90).length, color: "#52c41a" },
                { grade: "B (80-89)", count: grades.filter(g => g.grade >= 80 && g.grade < 90).length, color: "#1890ff" },
                { grade: "C (70-79)", count: grades.filter(g => g.grade >= 70 && g.grade < 80).length, color: "#faad14" },
                { grade: "D (60-69)", count: grades.filter(g => g.grade >= 60 && g.grade < 70).length, color: "#fa8c16" },
                { grade: "E (<60)", count: grades.filter(g => g.grade < 60).length, color: "#ff4d4f" },
              ].map((item, index) => (
                <Col xs={24} sm={12} md={8} lg={4} key={index}>
                  <Card size="small" style={{ textAlign: "center", borderRadius: 8 }}>
                    <div style={{ color: item.color, fontSize: 20, fontWeight: "bold", marginBottom: 8 }}>
                      {item.count}
                    </div>
                    <div style={{ fontSize: 12, color: "#666", marginBottom: 8 }}>
                      {item.grade}
                    </div>
                    <Progress
                      percent={(item.count / grades.length) * 100}
                      strokeColor={item.color}
                      showInfo={false}
                      size="small"
                    />
                    <div style={{ fontSize: 11, color: "#999", marginTop: 4 }}>
                      {((item.count / grades.length) * 100).toFixed(1)}%
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        </TabPane>

        <TabPane 
          tab={
            <Space>
              <FileTextOutlined />
              <span>Quiz vs Assignment</span>
            </Space>
          } 
          key="comparison"
        >
          <Card style={{ borderRadius: 12, marginTop: 16 }}>
            <Title level={4} style={{ marginBottom: 24 }}>
              Perbandingan Performa Quiz vs Assignment
            </Title>
            
            <Row gutter={[24, 24]}>
              <Col xs={24} md={12}>
                <Card 
                  size="small" 
                  style={{ 
                    textAlign: "center", 
                    borderRadius: 8,
                    background: "linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)",
                    color: "white"
                  }}
                >
                  <BookOutlined style={{ fontSize: 32, marginBottom: 12 }} />
                  <div style={{ fontSize: 24, fontWeight: "bold", marginBottom: 8 }}>
                    {quizAvg.toFixed(1)}
                  </div>
                  <div style={{ fontSize: 16, marginBottom: 12 }}>
                    Rata-rata Quiz
                  </div>
                  <div style={{ fontSize: 14, opacity: 0.9 }}>
                    Dari {quizGrades.length} quiz yang sudah dikerjakan
                  </div>
                  <Progress
                    percent={quizAvg}
                    strokeColor="rgba(255,255,255,0.8)"
                    trailColor="rgba(255,255,255,0.2)"
                    showInfo={false}
                    style={{ marginTop: 12 }}
                  />
                </Card>
              </Col>
              
              <Col xs={24} md={12}>
                <Card 
                  size="small" 
                  style={{ 
                    textAlign: "center", 
                    borderRadius: 8,
                    background: "linear-gradient(135deg, #52c41a 0%, #73d13d 100%)",
                    color: "white"
                  }}
                >
                  <FileTextOutlined style={{ fontSize: 32, marginBottom: 12 }} />
                  <div style={{ fontSize: 24, fontWeight: "bold", marginBottom: 8 }}>
                    {assignmentAvg.toFixed(1)}
                  </div>
                  <div style={{ fontSize: 16, marginBottom: 12 }}>
                    Rata-rata Assignment
                  </div>
                  <div style={{ fontSize: 14, opacity: 0.9 }}>
                    Dari {assignmentGrades.length} assignment yang sudah dikerjakan
                  </div>
                  <Progress
                    percent={assignmentAvg}
                    strokeColor="rgba(255,255,255,0.8)"
                    trailColor="rgba(255,255,255,0.2)"
                    showInfo={false}
                    style={{ marginTop: 12 }}
                  />
                </Card>
              </Col>
            </Row>
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default GradeChart;