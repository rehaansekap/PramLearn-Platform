import React from "react";
import { Row, Col, Alert, Skeleton } from "antd";
import useStudentDashboard from "./hooks/useStudentDashboard";
import WelcomeCard from "./components/WelcomeCard";
import QuickStatsCard from "./components/QuickStatsCard";
import RecentActivitiesCard from "./components/RecentActivitiesCard";

const StudentDashboard = () => {
  const { dashboard, loading, error, user } = useStudentDashboard();

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: 16 }}>
      {error && (
        <Alert
          message="Gagal memuat dashboard"
          description={
            error.message || "Terjadi kesalahan saat mengambil data dashboard."
          }
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      <WelcomeCard user={user} />

      <QuickStatsCard
        stats={{
          subjects: dashboard?.stats?.subjects,
          pending_assignments: dashboard?.stats?.pending_assignments,
          available_quizzes: dashboard?.stats?.available_quizzes,
          progress: dashboard?.stats?.progress,
        }}
        loading={loading}
      />

      <Row gutter={16}>
        <Col xs={24} md={16}>
          <RecentActivitiesCard
            activities={dashboard?.recent_activities || []}
            loading={loading}
          />
        </Col>
        <Col xs={24} md={8}>
          {/* Notification Center/Today's Schedule placeholder */}
          <Skeleton active loading={loading} paragraph={{ rows: 4 }}>
            <div
              style={{
                background: "#f6faff",
                borderRadius: 12,
                padding: 16,
                minHeight: 180,
              }}
            >
              <h4 style={{ color: "#11418b", marginBottom: 8 }}>
                Jadwal Hari Ini
              </h4>
              <ul style={{ paddingLeft: 16 }}>
                {dashboard?.today_schedule?.length > 0 ? (
                  dashboard.today_schedule.map((item, idx) => (
                    <li key={idx} style={{ marginBottom: 8 }}>
                      <span style={{ fontWeight: 500 }}>{item.time}</span> -{" "}
                      {item.activity}
                    </li>
                  ))
                ) : (
                  <li>Tidak ada jadwal hari ini</li>
                )}
              </ul>
            </div>
          </Skeleton>
        </Col>
      </Row>
    </div>
  );
};

export default StudentDashboard;
