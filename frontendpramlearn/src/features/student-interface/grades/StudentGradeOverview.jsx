import React, { useState, useEffect } from "react";
import { Alert, Spin } from "antd";
import GradeHeader from "./components/overview/GradeHeader";
import GradeStats from "./components/overview/GradeStats";
import GradeContent from "./components/overview/GradeContent";
import GradeModals from "./components/overview/GradeModals";
import useStudentGrades from "./hooks/useStudentGrades";

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
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState(null);

  const handleViewDetail = (grade) => {
    setSelectedGrade(grade);
    setDetailModalVisible(true);
  };

  const handleCloseDetail = () => {
    setDetailModalVisible(false);
    setSelectedGrade(null);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    fetchGrades(newFilters);
  };

  const handleExport = (format) => {
    exportGrades(format);
  };

  useEffect(() => {
    if (activeTab === "analytics" && !analyticsData) {
      setAnalyticsLoading(true);
      fetchAnalytics().then((data) => {
        setAnalyticsData(data);
        setAnalyticsLoading(false);
      });
    }
  }, [activeTab, analyticsData, fetchAnalytics]);

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
      <GradeHeader statistics={statistics} totalGrades={totalGrades} />

      <GradeStats statistics={statistics} achievements={achievements} />

      <GradeContent
        grades={grades}
        subjects={subjectsToUse}
        statistics={statistics}
        analytics={analytics}
        analyticsData={analyticsData}
        analyticsLoading={analyticsLoading}
        achievements={achievements}
        activeTab={activeTab}
        filters={filters}
        loading={loading}
        hasGrades={hasGrades}
        onTabChange={setActiveTab}
        onFilterChange={handleFilterChange}
        onViewDetail={handleViewDetail}
        onExport={handleExport}
        onClearFilters={() => {
          setFilters({});
          fetchGrades({});
        }}
        getGradeColor={getGradeColor}
        getGradeLetter={getGradeLetter}
      />

      <GradeModals
        selectedGrade={selectedGrade}
        detailModalVisible={detailModalVisible}
        onCloseDetail={handleCloseDetail}
      />
    </div>
  );
};

export default StudentGradeOverview;
