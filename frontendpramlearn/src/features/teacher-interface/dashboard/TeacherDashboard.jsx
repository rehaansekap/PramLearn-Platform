import React from "react";
import { Row, Col, Space, Alert, Spin, Button } from "antd";
import { LoadingOutlined, ReloadOutlined } from "@ant-design/icons";
import useTeacherDashboard from "./hooks/useTeacherDashboard";
import TeacherWelcomeCard from "./components/TeacherWelcomeCard";
import TeacherQuickStatsCard from "./components/TeacherQuickStatsCard";
import RecentSubmissionsCard from "./components/RecentSubmissionsCard";
import PerformanceOverviewCard from "./components/PerformanceOverviewCard";
import UpcomingDeadlinesCard from "./components/UpcomingDeadlinesCard";
import TeacherTodayScheduleCard from "./components/TeacherTodayScheduleCard";
import QuickActionsCard from "./components/QuickActionsCard";
import ClassProgressCard from "./components/ClassProgressCard";
import StudentEngagementCard from "./components/StudentEngagementCard";

const TeacherDashboard = () => {
  const { dashboard, loading, error, user, refreshing, refresh } =
    useTeacherDashboard();

  if (error && !dashboard) {
    return (
      <div
        style={{
          minHeight: "100vh",
          padding: "24px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "#f8fafc",
        }}
      >
        <Alert
          message="Gagal Memuat Dashboard"
          description="Terjadi kesalahan saat mengambil data dashboard. Silakan refresh halaman."
          type="error"
          showIcon
          style={{
            maxWidth: 500,
            borderRadius: 12,
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}
          action={
            <Button
              type="primary"
              danger
              onClick={() => window.location.reload()}
              style={{
                borderRadius: 8,
              }}
            >
              Refresh Halaman
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "24px",
        background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
      }}
    >
      <div
        style={{
          maxWidth: "1600px",
          margin: "0 auto",
        }}
      >
        {/* Header Welcome Section */}
        <div style={{ marginBottom: 32 }}>
          <TeacherWelcomeCard
            user={user}
            dashboard={dashboard}
            onRefresh={refresh}
            refreshing={refreshing}
          />
        </div>

        {/* Quick Stats Grid */}
        <div style={{ marginBottom: 32 }}>
          <TeacherQuickStatsCard stats={dashboard} loading={loading} />
        </div>

        {/* Main Content Grid */}
        <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
          {/* Left Column - Primary Content */}
          <Col xs={24} xl={16}>
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
              {/* Quick Actions */}
              <QuickActionsCard user={user} />

              {/* Recent Submissions */}
              <RecentSubmissionsCard
                submissions={dashboard?.recent_submissions || []}
                loading={loading}
              />

              {/* Performance Overview */}
              <PerformanceOverviewCard
                performance={dashboard?.performance_overview || {}}
                loading={loading}
              />

              {/* Class Progress */}
              <ClassProgressCard
                classesData={dashboard?.classes_progress || []}
                loading={loading}
              />
            </Space>
          </Col>

          {/* Right Column - Secondary Content */}
          <Col xs={24} xl={8}>
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
              {/* Today Schedule */}
              <TeacherTodayScheduleCard
                schedule={dashboard?.today_schedule || []}
                loading={loading}
              />

              {/* Upcoming Deadlines */}
              <UpcomingDeadlinesCard
                deadlines={dashboard?.upcoming_deadlines || []}
                loading={loading}
              />

              {/* Student Engagement */}
              <StudentEngagementCard
                engagement={dashboard?.student_engagement || {}}
                loading={loading}
              />
            </Space>
          </Col>
        </Row>

        {/* Global Loading Overlay */}
        {loading && !dashboard && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(255, 255, 255, 0.9)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 1000,
              backdropFilter: "blur(4px)",
            }}
          >
            <Spin
              indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />}
              tip="Memuat dashboard..."
            />
          </div>
        )}

        {/* Refresh Loading Overlay */}
        {refreshing && dashboard && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(255, 255, 255, 0.8)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 1000,
              backdropFilter: "blur(2px)",
            }}
          >
            <Spin
              indicator={<LoadingOutlined style={{ fontSize: 32 }} spin />}
              tip="Memperbarui data dashboard..."
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;
