import React from "react";
import { Row, Col, Space } from "antd";
import useStudentDashboard from "./hooks/useStudentDashboard";
import WelcomeCard from "./components/WelcomeCard";
import QuickStatsCard from "./components/QuickStatsCard";
import RecentActivitiesCard from "./components/RecentActivitiesCard";
import QuickActionsCard from "./components/QuickActionsCard";
import UpcomingDeadlinesCard from "./components/UpcomingDeadlinesCard";
import LearningStreakCard from "./components/LearningStreakCard";
import TodayScheduleCard from "./components/TodayScheduleCard";

const StudentDashboard = () => {
  const { dashboard, loading, error, user } = useStudentDashboard();

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
        {/* Header & Quick Stats */}
        <div style={{ marginBottom: 24 }}>
          <Space direction="vertical" size="middle" style={{ width: "100%" }}>
            <WelcomeCard user={user} />
            <QuickStatsCard
              stats={{
                subjects: dashboard?.subjects_count,
                pending_assignments: dashboard?.pending_assignments,
                available_quizzes: dashboard?.available_quizzes,
                progress: dashboard?.progress,
              }}
              loading={loading}
            />
          </Space>
        </div>

        {/* Main Content */}
        <Row gutter={[24, 24]}>
          {/* Kiri: Aktivitas Terbaru, Day Learning Streak */}
          <Col xs={24} xl={16}>
            <Space direction="vertical" size="small" style={{ width: "100%" }}>
              <RecentActivitiesCard
                activities={dashboard?.recent_activities || []}
                loading={loading}
              />
              <LearningStreakCard
                streakData={dashboard?.learning_streak}
                loading={loading}
              />
            </Space>
          </Col>

          {/* Kanan: Quick Actions, Upcoming Deadlines, Today's Schedule */}
          <Col xs={24} xl={8}>
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
              <QuickActionsCard
                quickActions={dashboard?.quick_actions}
                loading={loading}
              />
              <UpcomingDeadlinesCard
                deadlines={dashboard?.upcoming_deadlines}
                loading={loading}
              />
              <TodayScheduleCard
                schedule={dashboard?.today_schedule}
                loading={loading}
              />
            </Space>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default StudentDashboard;
