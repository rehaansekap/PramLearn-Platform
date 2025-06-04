import React, { useState } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Progress,
  Typography,
  Tabs,
  Space,
  Button,
  Alert,
  Spin,
  Tag,
} from "antd";
import {
  TrophyOutlined,
  BookOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  FireOutlined,
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
  ReloadOutlined,
} from "@ant-design/icons";

import useStudentAnalytics from "../hooks/useStudentAnalytics";
import useAttendanceData from "../hooks/useAttendanceData";
import SubjectProgressChart from "./SubjectProgressChart";
import AttendanceVisualization from "./AttendanceVisualization";
import LearningAnalytics from "./LearningAnalytics";
import AchievementSystem from "./AchievementSystem";
import WeeklyReport from "./WeeklyReport";

import { formatTimeSpent, getProgressColor } from "../utils/chartHelpers";
import { calculateLearningStreak } from "../utils/analyticsCalculations";

const { Title, Text } = Typography;

const StudentProgressOverview = () => {
  const [activeTab, setActiveTab] = useState("progress");
  const { analytics, loading, error, refreshAnalytics } = useStudentAnalytics();
  const { attendanceData, loading: attendanceLoading } = useAttendanceData();

  if (loading && !analytics.overview) {
    return (
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: 16 }}>
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <Spin size="large" tip="Loading analytics..." />
        </div>
      </div>
    );
  }

  if (error && !analytics.overview) {
    return (
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: 16 }}>
        <Alert
          message="Failed to load analytics"
          description="Please try refreshing the page or contact support if the problem persists."
          type="error"
          showIcon
          action={
            <Button onClick={refreshAnalytics} type="primary" size="small">
              Retry
            </Button>
          }
        />
      </div>
    );
  }

  const { overview, subjects, behavior, achievements } = analytics;

  return (
    <div style={{ maxWidth: 1400, margin: "0 auto", padding: 16 }}>
      {/* Header */}
      <div style={{ marginBottom: 24, textAlign: "center" }}>
        <Title level={2} style={{ color: "#11418b", marginBottom: 8 }}>
          <BarChartOutlined style={{ marginRight: 8 }} />
          Learning Analytics
        </Title>
        <Text type="secondary">
          Track your learning progress and achievements
        </Text>
        <div style={{ marginTop: 16 }}>
          <Button
            icon={<ReloadOutlined />}
            onClick={refreshAnalytics}
            loading={loading}
            type="default"
          >
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Quick Stats Overview */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Overall Progress"
              value={overview?.overall_progress || 0}
              suffix="%"
              prefix={<TrophyOutlined style={{ color: "#faad14" }} />}
              valueStyle={{
                color: getProgressColor(overview?.overall_progress || 0),
              }}
            />
            <Progress
              percent={overview?.overall_progress || 0}
              strokeColor={getProgressColor(overview?.overall_progress || 0)}
              size="small"
              showInfo={false}
              style={{ marginTop: 8 }}
            />
          </Card>
        </Col>

        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Active Subjects"
              value={overview?.total_subjects || 0}
              prefix={<BookOutlined style={{ color: "#1890ff" }} />}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {overview?.completed_materials || 0} /{" "}
              {overview?.total_materials || 0} materials completed
            </Text>
          </Card>
        </Col>

        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Learning Streak"
              value={calculateLearningStreak(attendanceData?.records || [])}
              suffix="days"
              prefix={<FireOutlined style={{ color: "#ff4d4f" }} />}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              Keep it up! 🔥
            </Text>
          </Card>
        </Col>

        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Time Spent"
              value={formatTimeSpent(overview?.total_time_spent || 0)}
              prefix={<ClockCircleOutlined style={{ color: "#52c41a" }} />}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              This month
            </Text>
          </Card>
        </Col>
      </Row>

      {/* Achievement Summary */}
      {achievements?.earned?.length > 0 && (
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={24}>
            <Card
              title={
                <Space>
                  <TrophyOutlined style={{ color: "#faad14" }} />
                  <Text strong>Recent Achievements</Text>
                </Space>
              }
              size="small"
            >
              <Space wrap>
                {achievements.earned.slice(0, 5).map((achievement, index) => (
                  <Tag
                    key={index}
                    color="gold"
                    style={{ padding: "4px 8px", fontSize: 12 }}
                  >
                    {achievement.icon} {achievement.title}
                  </Tag>
                ))}
                {achievements.earned.length > 5 && (
                  <Tag color="default">
                    +{achievements.earned.length - 5} more
                  </Tag>
                )}
              </Space>
            </Card>
          </Col>
        </Row>
      )}

      {/* Main Analytics Tabs - Using items prop instead of TabPane */}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        size="large"
        style={{ marginBottom: 24 }}
        items={[
          {
            key: "progress",
            label: (
              <span>
                <LineChartOutlined />
                Subject Progress
              </span>
            ),
            children: (
              <SubjectProgressChart subjects={subjects} loading={loading} />
            ),
          },
          {
            key: "attendance",
            label: (
              <span>
                <CalendarOutlined />
                Attendance
              </span>
            ),
            children: (
              <AttendanceVisualization
                attendanceData={attendanceData}
                loading={attendanceLoading}
              />
            ),
          },
          {
            key: "behavior",
            label: (
              <span>
                <PieChartOutlined />
                Learning Behavior
              </span>
            ),
            children: (
              <LearningAnalytics behavior={behavior} loading={loading} />
            ),
          },
          {
            key: "achievements",
            label: (
              <span>
                <TrophyOutlined />
                Achievements
              </span>
            ),
            children: (
              <AchievementSystem
                achievements={achievements}
                loading={loading}
              />
            ),
          },
          {
            key: "reports",
            label: (
              <span>
                <BarChartOutlined />
                Reports
              </span>
            ),
            children: (
              <WeeklyReport
                analytics={analytics}
                attendanceData={attendanceData}
                loading={loading || attendanceLoading}
              />
            ),
          },
        ]}
      />
    </div>
  );
};

export default StudentProgressOverview;
