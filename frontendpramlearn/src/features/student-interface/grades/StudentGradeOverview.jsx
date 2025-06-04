import React, { useState } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Button,
  Typography,
  Space,
  Modal,
  Alert,
  Tabs,
  Tag,
} from "antd";
import {
  TrophyOutlined,
  BookOutlined,
  FileTextOutlined,
  DownloadOutlined,
  StarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  LineChartOutlined,
  CalendarOutlined,
  BarChartOutlined,
} from "@ant-design/icons";

// Import komponen baru
import GradeFilters from "./components/GradeFilters";
import GradeTable from "./components/GradeTable";
import PerformanceAnalytics from "./components/PerformanceAnalytics";
import AchievementBadges from "./components/AchievementBadges";
import GradeChart from "./components/GradeChart";
import useStudentGrades from "./hooks/useStudentGrades";

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const StudentGradeOverview = () => {
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  const {
    grades,
    statistics,
    subjects,
    filters,
    loading,
    error,
    applyFilters,
    clearFilters,
    getGradeColor,
    getGradeLetter,
    exportGrades,
  } = useStudentGrades();

  // Handle view detail
  const handleViewDetail = (record) => {
    setSelectedGrade(record);
    setDetailModalVisible(true);
  };

  // Calculate GPA (4.0 scale)
  const calculateGPA = () => {
    if (!grades || grades.length === 0) return 0;
    const validGrades = grades.filter((g) => g.grade !== null);
    if (validGrades.length === 0) return 0;

    const gradePoints = validGrades.map((grade) => {
      if (grade.grade >= 90) return 4.0;
      if (grade.grade >= 80) return 3.0;
      if (grade.grade >= 70) return 2.0;
      if (grade.grade >= 60) return 1.0;
      return 0.0;
    });

    return (
      gradePoints.reduce((sum, point) => sum + point, 0) / gradePoints.length
    );
  };

  const gpa = calculateGPA();
  const validGrades = grades.filter((g) => g.grade !== null);
  const passedGrades = validGrades.filter((g) => g.grade >= 60);
  const average =
    validGrades.length > 0
      ? validGrades.reduce((sum, g) => sum + g.grade, 0) / validGrades.length
      : 0;

  if (error) {
    return (
      <Alert
        message="Failed to load grades"
        description={error.message}
        type="error"
        showIcon
        style={{ margin: 16 }}
      />
    );
  }

  return (
    <div style={{ maxWidth: 1400, margin: "0 auto", padding: 16 }}>
      {/* Header */}
      <div style={{ marginBottom: 24, textAlign: "center" }}>
        <Title level={2} style={{ color: "#11418b", marginBottom: 8 }}>
          <TrophyOutlined style={{ marginRight: 8 }} />
          Grades & Results
        </Title>
        <Text type="secondary">
          Track your academic progress and achievements
        </Text>
      </div>

      {/* Grade Filters */}
      <GradeFilters
        subjects={subjects}
        filters={filters}
        onApplyFilters={applyFilters}
        onClearFilters={clearFilters}
        loading={loading}
      />

      {/* Quick Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Overall GPA"
              value={gpa}
              precision={2}
              suffix="/4.0"
              valueStyle={{
                color:
                  gpa >= 3.0 ? "#52c41a" : gpa >= 2.0 ? "#faad14" : "#ff4d4f",
              }}
              prefix={<StarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Assessments"
              value={validGrades.length}
              valueStyle={{ color: "#52c41a" }}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Pass Rate"
              value={
                validGrades.length > 0
                  ? Math.round((passedGrades.length / validGrades.length) * 100)
                  : 0
              }
              suffix="%"
              valueStyle={{
                color:
                  passedGrades.length >= validGrades.length / 2
                    ? "#52c41a"
                    : "#ff4d4f",
              }}
              prefix={
                passedGrades.length >= validGrades.length / 2 ? (
                  <CheckCircleOutlined />
                ) : (
                  <CloseCircleOutlined />
                )
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Average Score"
              value={average}
              precision={1}
              suffix="/100"
              valueStyle={{
                color:
                  average >= 80
                    ? "#52c41a"
                    : average >= 60
                    ? "#faad14"
                    : "#ff4d4f",
              }}
              prefix={<TrophyOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Content Tabs */}
      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab} type="card">
          <TabPane
            tab={
              <span>
                <CalendarOutlined />
                Overview & Table
              </span>
            }
            key="overview"
          >
            <Space direction="vertical" style={{ width: "100%" }} size="large">
              {/* Performance Chart */}
              <Card
                title={
                  <Space>
                    <LineChartOutlined />
                    Performance Trends
                  </Space>
                }
                extra={
                  <Button
                    icon={<DownloadOutlined />}
                    onClick={() => exportGrades("excel")}
                  >
                    Export
                  </Button>
                }
              >
                <GradeChart
                  grades={grades}
                  subjects={subjects}
                  loading={loading}
                  compact={true}
                />
              </Card>

              {/* Grade Table */}
              <GradeTable
                grades={grades}
                loading={loading}
                onViewDetail={handleViewDetail}
                getGradeColor={getGradeColor}
                getGradeLetter={getGradeLetter}
              />
            </Space>
          </TabPane>

          <TabPane
            tab={
              <span>
                <BarChartOutlined />
                Analytics
              </span>
            }
            key="analytics"
          >
            <PerformanceAnalytics
              grades={grades}
              subjects={subjects}
              statistics={statistics}
            />
          </TabPane>

          <TabPane
            tab={
              <span>
                <TrophyOutlined />
                Achievements
              </span>
            }
            key="achievements"
          >
            <AchievementBadges grades={grades} statistics={statistics} />
          </TabPane>
        </Tabs>
      </Card>

      {/* Detail Modal */}
      <Modal
        title="Grade Details"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={600}
      >
        {selectedGrade && (
          <div>
            <Card size="small" style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={12}>
                  <Statistic
                    title="Score"
                    value={selectedGrade.grade}
                    suffix="/100"
                    valueStyle={{ color: getGradeColor(selectedGrade.grade) }}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Grade"
                    value={getGradeLetter(selectedGrade.grade)}
                    valueStyle={{ color: getGradeColor(selectedGrade.grade) }}
                  />
                </Col>
              </Row>
            </Card>

            <Space direction="vertical" style={{ width: "100%" }}>
              <div>
                <Text strong>Title: </Text>
                <Text>{selectedGrade.title}</Text>
              </div>
              <div>
                <Text strong>Subject: </Text>
                <Text>{selectedGrade.subject_name}</Text>
              </div>
              <div>
                <Text strong>Type: </Text>
                <Tag color={selectedGrade.type === "quiz" ? "blue" : "green"}>
                  {selectedGrade.type === "quiz" ? "Quiz" : "Assignment"}
                </Tag>
              </div>
              <div>
                <Text strong>Date: </Text>
                <Text>
                  {new Date(selectedGrade.date).toLocaleDateString("id-ID", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </div>
              {selectedGrade.teacher_feedback && (
                <div>
                  <Text strong>Teacher Feedback: </Text>
                  <div
                    style={{
                      marginTop: 8,
                      padding: 12,
                      backgroundColor: "#f6ffed",
                      borderRadius: 6,
                      border: "1px solid #b7eb8f",
                    }}
                  >
                    <Text>{selectedGrade.teacher_feedback}</Text>
                  </div>
                </div>
              )}
            </Space>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default StudentGradeOverview;
