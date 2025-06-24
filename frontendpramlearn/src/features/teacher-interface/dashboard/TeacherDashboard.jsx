import React from "react";
import { Row, Col, Space, Alert, Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import useTeacherDashboard from "./hooks/useTeacherDashboard";
import TeacherWelcomeCard from "./components/TeacherWelcomeCard";
import TeacherQuickStatsCard from "./components/TeacherQuickStatsCard";
import RecentSubmissionsCard from "./components/RecentSubmissionsCard";
import PerformanceOverviewCard from "./components/PerformanceOverviewCard";
import UpcomingDeadlinesCard from "./components/UpcomingDeadlinesCard";
import TeacherTodayScheduleCard from "./components/TeacherTodayScheduleCard";

const TeacherDashboard = () => {
  const { dashboard, loading, error, user } = useTeacherDashboard();

  if (error && !dashboard) {
    return (
      <div
        style={{
          minHeight: "100vh",
          padding: "24px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Alert
          message="Gagal Memuat Dashboard"
          description="Terjadi kesalahan saat mengambil data dashboard. Silakan refresh halaman."
          type="error"
          showIcon
          style={{ maxWidth: 500 }}
          action={
            <button
              onClick={() => window.location.reload()}
              style={{
                background: "#ff4d4f",
                color: "white",
                border: "none",
                padding: "8px 16px",
                borderRadius: 6,
                cursor: "pointer",
              }}
            >
              Refresh
            </button>
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
      }}
    >
      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
        }}
      >
        {/* Header & Statistik Cepat */}
        <div style={{ marginBottom: 24 }}>
          <Space direction="vertical" size="middle" style={{ width: "100%" }}>
            <TeacherWelcomeCard user={user} />
            <TeacherQuickStatsCard stats={dashboard} loading={loading} />
          </Space>
        </div>

        {/* Konten Utama */}
        <Row gutter={[24, 24]}>
          {/* Kiri: Submissions, Performance */}
          <Col xs={24} xl={16}>
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
              <RecentSubmissionsCard
                submissions={dashboard?.recent_submissions || []}
                loading={loading}
              />
              <PerformanceOverviewCard
                performance={dashboard?.performance_overview || {}}
                loading={loading}
              />
            </Space>
          </Col>

          {/* Kanan: Deadline, Jadwal Hari Ini */}
          <Col xs={24} xl={8}>
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
              <UpcomingDeadlinesCard
                deadlines={dashboard?.upcoming_deadlines || []}
                loading={loading}
              />
              <TeacherTodayScheduleCard
                schedule={dashboard?.today_schedule || []}
                loading={loading}
              />
            </Space>
          </Col>
        </Row>

        {/* Loading Overlay untuk refresh data */}
        {loading && dashboard && (
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
            }}
          >
            <Spin
              indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}
              tip="Memperbarui data dashboard..."
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;
