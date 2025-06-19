import React, { useState, useEffect } from "react";
import {
  Card,
  Tabs,
  message,
  Spin,
  Alert,
  Breadcrumb,
  Space,
  Row,
  Col,
  Statistic,
  Typography,
  Empty,
} from "antd";
import {
  TrophyOutlined,
  HomeOutlined,
  BarChartOutlined,
  FileTextOutlined,
  StarOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import GradeFilters from "./components/GradeFilters";
import GradeTable from "./components/GradeTable";
import GradeChart from "./components/GradeChart";
import PerformanceAnalytics from "./components/PerformanceAnalytics";
import AchievementBadges from "./components/AchievementBadges";
import useStudentGrades from "./hooks/useStudentGrades";

const { TabPane } = Tabs;
const { Title, Text } = Typography;

const StudentGradeOverview = () => {
  const {
    grades,
    statistics,
    achievements,
    loading,
    error,
    analytics,
    subjects: subjectsToUse,
    fetchGrades,
    fetchAnalytics,
    exportGrades,
    getGradeColor,
    getGradeLetter,
    hasGrades,
    totalGrades,
  } = useStudentGrades();

  const [activeTab, setActiveTab] = useState("overview");
  const [filters, setFilters] = useState({});
  const [analyticsData, setAnalyticsData] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    fetchGrades(newFilters);
  };

  // Load analytics when tab changes
  useEffect(() => {
    if (activeTab === "analytics" && !analyticsData) {
      setAnalyticsLoading(true);
      fetchAnalytics().then((data) => {
        setAnalyticsData(data);
        setAnalyticsLoading(false);
      });
    }
  }, [activeTab, analyticsData, fetchAnalytics]);

  // Handle export
  const handleExport = (format) => {
    exportGrades(format);
  };

  if (loading && !hasGrades) {
    return (
      <div style={{ textAlign: "center", padding: "60px 0" }}>
        <Spin size="large" tip="Memuat data nilai..." />
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "24px 16px",
          minHeight: "calc(100vh - 64px)",
        }}
      >
        <Alert
          message="Gagal memuat data nilai"
          description={error}
          type="error"
          showIcon
          style={{ borderRadius: 12 }}
        />
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "24px 16px",
        minHeight: "calc(100vh - 64px)",
      }}
    >
      {/* Breadcrumb - Konsisten dengan halaman lain */}
      <Breadcrumb
        style={{ marginBottom: 24 }}
        items={[
          {
            href: "/student",
            title: (
              <Space>
                <HomeOutlined />
                <span>Dashboard</span>
              </Space>
            ),
          },
          {
            title: (
              <Space>
                <TrophyOutlined />
                <span>My Grades</span>
              </Space>
            ),
          },
        ]}
      />

      {/* Header Section - Konsisten dengan halaman lain */}
      <div
        style={{
          background:
            "linear-gradient(135deg, #001529 0%, #3a3f5c 60%, #43cea2 100%)",
          borderRadius: 16,
          padding: "32px 24px",
          marginBottom: 32,
          color: "white",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -20,
            right: -20,
            width: 100,
            height: 100,
            borderRadius: "50%",
            background: "rgba(255, 255, 255, 0.1)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -30,
            left: -30,
            width: 120,
            height: 120,
            borderRadius: "50%",
            background: "rgba(255, 255, 255, 0.05)",
          }}
        />

        <Row gutter={[24, 24]} align="middle">
          <Col xs={24} md={16}>
            <Title
              level={2}
              style={{ color: "white", margin: 0, marginBottom: 12 }}
            >
              <TrophyOutlined style={{ marginRight: 12 }} />
              Nilai & Prestasi Saya
            </Title>

            <Space
              direction="vertical"
              size={4}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                width: "100%",
              }}
            >
              <Space size={16} style={{ marginBottom: 16 }}>
                <Space size={8}>
                  <CalendarOutlined />
                  <Text style={{ color: "rgba(255,255,255,0.9)" }}>
                    Total Assessment: <strong>{totalGrades || 0}</strong>
                  </Text>
                </Space>
                <Space size={8}>
                  <BarChartOutlined />
                  <Text style={{ color: "rgba(255,255,255,0.9)" }}>
                    Rata-rata:{" "}
                    <strong>
                      {(statistics.average_grade || 0).toFixed(1)}
                    </strong>
                  </Text>
                </Space>
              </Space>
            </Space>
          </Col>

          <Col xs={24} md={8} style={{ textAlign: "center" }}>
            <div
              style={{
                background: "rgba(255, 255, 255, 0.15)",
                borderRadius: 12,
                padding: 16,
                backdropFilter: "blur(10px)",
              }}
            >
              <TrophyOutlined style={{ fontSize: 32, marginBottom: 8 }} />
              <div style={{ fontSize: 14, opacity: 0.9 }}>
                Tracking Prestasi
              </div>
            </div>
          </Col>
        </Row>
      </div>

      {/* Stats Cards - Konsisten dengan halaman lain */}
      <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
        <Col xs={12} sm={6} md={6}>
          <Card style={{ borderRadius: 12, textAlign: "center" }}>
            <Statistic
              title="GPA (4.0)"
              value={statistics.gpa?.toFixed(1) || "0.0"}
              prefix={<TrophyOutlined style={{ color: "#1890ff" }} />}
              valueStyle={{ color: "#1890ff", fontSize: 24 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6} md={6}>
          <Card style={{ borderRadius: 12, textAlign: "center" }}>
            <Statistic
              title="Total Assessment"
              value={statistics.total_assessments || 0}
              prefix={<FileTextOutlined style={{ color: "#52c41a" }} />}
              valueStyle={{ color: "#52c41a", fontSize: 24 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6} md={6}>
          <Card style={{ borderRadius: 12, textAlign: "center" }}>
            <Statistic
              title="Rata-rata Nilai"
              value={statistics.average_grade?.toFixed(1) || "0.0"}
              prefix={<BarChartOutlined style={{ color: "#faad14" }} />}
              valueStyle={{ color: "#faad14", fontSize: 24 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6} md={6}>
          <Card style={{ borderRadius: 12, textAlign: "center" }}>
            <Statistic
              title="Pencapaian"
              value={achievements.length || 0}
              prefix={<StarOutlined style={{ color: "#722ed1" }} />}
              valueStyle={{ color: "#722ed1", fontSize: 24 }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filter Section */}
      <GradeFilters
        subjects={subjectsToUse}
        filters={filters}
        onApplyFilters={handleFilterChange}
        onClearFilters={() => {
          setFilters({});
          fetchGrades({});
        }}
        loading={loading}
      />

      {/* Main Content Tabs */}
      <Card
        style={{
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
        styles={{
          header: {
            borderBottom: "1px solid #f0f0f0",
            background: "#fafafa",
          },
        }}
      >
        {!hasGrades ? (
          <div style={{ textAlign: "center", padding: "60px 24px" }}>
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <div>
                  <Text style={{ fontSize: 16, color: "#666" }}>
                    Belum ada data nilai tersedia
                  </Text>
                  <div style={{ marginTop: 12 }}>
                    <Text type="secondary" style={{ fontSize: 14 }}>
                      Nilai akan muncul setelah Anda mengerjakan quiz atau
                      assignment
                    </Text>
                  </div>
                </div>
              }
            />
          </div>
        ) : (
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            type="card"
            size="large"
          >
            <TabPane
              tab={
                <Space>
                  <BarChartOutlined />
                  <span>Overview & Chart</span>
                </Space>
              }
              key="overview"
            >
              <GradeChart
                grades={grades}
                subjects={subjectsToUse}
                statistics={statistics}
                getGradeColor={getGradeColor}
                loading={loading}
              />
            </TabPane>

            <TabPane
              tab={
                <Space>
                  <FileTextOutlined />
                  <span>Detail Nilai ({grades.length})</span>
                </Space>
              }
              key="table"
            >
              <GradeTable
                grades={grades}
                getGradeColor={getGradeColor}
                getGradeLetter={getGradeLetter}
                onExport={handleExport}
                loading={loading}
              />
            </TabPane>

            <TabPane
              tab={
                <Space>
                  <BarChartOutlined />
                  <span>Analytics</span>
                </Space>
              }
              key="analytics"
            >
              {analyticsLoading ? (
                <div style={{ textAlign: "center", padding: "60px 0" }}>
                  <Spin size="large" tip="Memuat analytics..." />
                </div>
              ) : (
                <PerformanceAnalytics
                  grades={
                    analytics?.grades && analytics.grades.length > 0
                      ? analytics.grades
                      : grades
                  }
                  subjects={subjectsToUse}
                  statistics={analytics?.statistics || statistics}
                  loading={analyticsLoading}
                />
              )}
            </TabPane>

            <TabPane
              tab={
                <Space>
                  <StarOutlined />
                  <span>Pencapaian</span>
                </Space>
              }
              key="achievements"
            >
              <AchievementBadges grades={grades} statistics={statistics} />
            </TabPane>
          </Tabs>
        )}
      </Card>
    </div>
  );
};

export default StudentGradeOverview;
