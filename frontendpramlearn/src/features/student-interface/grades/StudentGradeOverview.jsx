import React, { useState, useEffect } from "react";
import { Card, Tabs, message, Spin, Alert } from "antd";
import GradeFilters from "./components/GradeFilters";
import GradeTable from "./components/GradeTable";
import GradeChart from "./components/GradeChart";
import PerformanceAnalytics from "./components/PerformanceAnalytics";
import AchievementBadges from "./components/AchievementBadges";
import useStudentGrades from "./hooks/useStudentGrades";

const { TabPane } = Tabs;

const StudentGradeOverview = () => {
  const {
    grades,
    statistics,
    achievements,
    loading,
    error,
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
      <Alert
        message="Gagal memuat data nilai"
        description={error}
        type="error"
        showIcon
        style={{ margin: "24px 0" }}
      />
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px" }}>
      {/* Header Statistics Cards */}
      <Card style={{ marginBottom: 24 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div style={{ textAlign: "center", minWidth: 120 }}>
            <div style={{ fontSize: 24, fontWeight: "bold", color: "#1890ff" }}>
              {statistics.gpa?.toFixed(1) || "0.0"}
            </div>
            <div style={{ color: "#666" }}>GPA (4.0)</div>
          </div>
          <div style={{ textAlign: "center", minWidth: 120 }}>
            <div style={{ fontSize: 24, fontWeight: "bold", color: "#52c41a" }}>
              {statistics.total_assessments || 0}
            </div>
            <div style={{ color: "#666" }}>Total Assessment</div>
          </div>
          <div style={{ textAlign: "center", minWidth: 120 }}>
            <div style={{ fontSize: 24, fontWeight: "bold", color: "#faad14" }}>
              {statistics.average_grade?.toFixed(1) || "0.0"}
            </div>
            <div style={{ color: "#666" }}>Rata-rata Nilai</div>
          </div>
          <div style={{ textAlign: "center", minWidth: 120 }}>
            <div style={{ fontSize: 24, fontWeight: "bold", color: "#722ed1" }}>
              {achievements.length || 0}
            </div>
            <div style={{ color: "#666" }}>Achievement</div>
          </div>
        </div>
      </Card>

      {/* Filter Section */}
      <GradeFilters onFilterChange={handleFilterChange} />

      {/* Main Content Tabs */}
      <Card style={{ marginTop: 24 }}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          type="card"
          size="large"
        >
          <TabPane tab="📊 Overview & Chart" key="overview">
            <GradeChart
              grades={grades}
              statistics={statistics}
              getGradeColor={getGradeColor}
              loading={loading}
            />
          </TabPane>

          <TabPane tab="📋 Table & Detail" key="table">
            <GradeTable
              grades={grades}
              getGradeColor={getGradeColor}
              getGradeLetter={getGradeLetter}
              onExport={handleExport}
              loading={loading}
            />
          </TabPane>

          <TabPane tab="📈 Analytics" key="analytics">
            {analyticsLoading ? (
              <div style={{ textAlign: "center", padding: "60px 0" }}>
                <Spin size="large" tip="Memuat analytics..." />
              </div>
            ) : (
              <PerformanceAnalytics
                analyticsData={analyticsData}
                statistics={statistics}
                getGradeColor={getGradeColor}
              />
            )}
          </TabPane>

          <TabPane tab="🏆 Achievements" key="achievements">
            <AchievementBadges
              achievements={achievements}
              statistics={statistics}
            />
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default StudentGradeOverview;
