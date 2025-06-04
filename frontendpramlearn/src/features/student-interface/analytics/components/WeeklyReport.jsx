import React, { useState } from "react";
import {
  Card,
  Row,
  Col,
  Typography,
  Statistic,
  Progress,
  Button,
  Select,
  Space,
  Tag,
  Timeline,
  Empty,
  Spin,
  Divider,
} from "antd";
import {
  CalendarOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
  BookOutlined,
  BarChartOutlined,
  LineChartOutlined,
  DownloadOutlined,
  PrinterOutlined,
  ShareAltOutlined,
  FireOutlined,
  StarOutlined,
} from "@ant-design/icons";
import { formatTimeSpent, getProgressColor } from "../utils/chartHelpers";
import {
  getWeeklyProgress,
  getMonthlyProgress,
  calculateGrowthRate,
} from "../utils/analyticsCalculations";

const { Title, Text } = Typography;
const { Option } = Select;

const WeeklyReport = ({ analytics, attendanceData, loading }) => {
  const [reportPeriod, setReportPeriod] = useState("week"); // week, month, quarter
  const [selectedWeek, setSelectedWeek] = useState(0); // 0 = current week

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "60px 0" }}>
        <Spin size="large" tip="Generating report..." />
      </div>
    );
  }

  if (!analytics?.behavior?.daily_activity) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description="No data available for report generation"
      />
    );
  }

  // Generate report data based on selected period
  const generateReportData = () => {
    const { daily_activity } = analytics.behavior;
    const { overview, subjects } = analytics;
    const { records: attendanceRecords } = attendanceData || { records: [] };

    if (reportPeriod === "week") {
      const weeklyData = getWeeklyProgress(daily_activity);
      const currentWeekData = weeklyData[selectedWeek] || {};

      // Get previous week data for comparison
      const previousWeekData = weeklyData[selectedWeek + 1] || {};

      // Calculate week attendance
      const weekStart = new Date();
      weekStart.setDate(
        weekStart.getDate() - selectedWeek * 7 - weekStart.getDay()
      );
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      const weekAttendance = attendanceRecords.filter((record) => {
        const recordDate = new Date(record.date);
        return recordDate >= weekStart && recordDate <= weekEnd;
      });

      const attendanceRate =
        weekAttendance.length > 0
          ? Math.round(
              (weekAttendance.filter(
                (r) => r.status === "present" || r.status === "late"
              ).length /
                weekAttendance.length) *
                100
            )
          : 0;

      return {
        period: "This Week",
        startDate: weekStart.toLocaleDateString(),
        endDate: weekEnd.toLocaleDateString(),
        data: {
          timeSpent: currentWeekData.time_spent || 0,
          materialsAccessed: currentWeekData.materials_accessed || 0,
          attendanceRate,
          attendanceSessions: weekAttendance.length,
          presentDays: weekAttendance.filter((r) => r.status === "present")
            .length,
          progressGrowth: calculateGrowthRate(
            currentWeekData.materials_accessed || 0,
            previousWeekData.materials_accessed || 0
          ),
          timeGrowth: calculateGrowthRate(
            currentWeekData.time_spent || 0,
            previousWeekData.time_spent || 0
          ),
        },
        comparison: {
          timeSpent: previousWeekData.time_spent || 0,
          materialsAccessed: previousWeekData.materials_accessed || 0,
        },
      };
    } else if (reportPeriod === "month") {
      const monthlyData = getMonthlyProgress(daily_activity);
      const currentMonthData = monthlyData[0] || {};
      const previousMonthData = monthlyData[1] || {};

      const monthAttendance = attendanceRecords.filter((record) => {
        const recordDate = new Date(record.date);
        const currentDate = new Date();
        return (
          recordDate.getMonth() === currentDate.getMonth() &&
          recordDate.getFullYear() === currentDate.getFullYear()
        );
      });

      const attendanceRate =
        monthAttendance.length > 0
          ? Math.round(
              (monthAttendance.filter(
                (r) => r.status === "present" || r.status === "late"
              ).length /
                monthAttendance.length) *
                100
            )
          : 0;

      return {
        period: "This Month",
        startDate: new Date(
          new Date().getFullYear(),
          new Date().getMonth(),
          1
        ).toLocaleDateString(),
        endDate: new Date(
          new Date().getFullYear(),
          new Date().getMonth() + 1,
          0
        ).toLocaleDateString(),
        data: {
          timeSpent: currentMonthData.time_spent || 0,
          materialsAccessed: currentMonthData.materials_accessed || 0,
          attendanceRate,
          attendanceSessions: monthAttendance.length,
          presentDays: monthAttendance.filter((r) => r.status === "present")
            .length,
          activeDays: currentMonthData.days_active || 0,
          progressGrowth: calculateGrowthRate(
            currentMonthData.materials_accessed || 0,
            previousMonthData.materials_accessed || 0
          ),
          timeGrowth: calculateGrowthRate(
            currentMonthData.time_spent || 0,
            previousMonthData.time_spent || 0
          ),
        },
        comparison: {
          timeSpent: previousMonthData.time_spent || 0,
          materialsAccessed: previousMonthData.materials_accessed || 0,
        },
      };
    }

    return null;
  };

  const reportData = generateReportData();

  // Generate insights and recommendations
  const generateInsights = () => {
    if (!reportData) return [];

    const insights = [];
    const { data } = reportData;

    // Performance insights
    if (data.progressGrowth > 10) {
      insights.push({
        type: "success",
        title: "Excellent Progress! 📈",
        description: `Your learning progress increased by ${data.progressGrowth}% compared to last ${reportPeriod}.`,
      });
    } else if (data.progressGrowth < -10) {
      insights.push({
        type: "warning",
        title: "Progress Slowing 📉",
        description: `Your progress decreased by ${Math.abs(
          data.progressGrowth
        )}%. Consider increasing study time.`,
      });
    }

    // Attendance insights
    if (data.attendanceRate >= 90) {
      insights.push({
        type: "success",
        title: "Perfect Attendance! 🎯",
        description: `You maintained ${data.attendanceRate}% attendance rate this ${reportPeriod}.`,
      });
    } else if (data.attendanceRate < 70) {
      insights.push({
        type: "warning",
        title: "Attendance Needs Attention 📅",
        description: `Your attendance rate is ${data.attendanceRate}%. Try to attend more sessions.`,
      });
    }

    // Study time insights
    const avgDailyTime =
      reportPeriod === "week" ? data.timeSpent / 7 : data.timeSpent / 30;
    if (avgDailyTime > 3600) {
      // More than 1 hour per day
      insights.push({
        type: "success",
        title: "Great Study Habits! ⏰",
        description: `You're averaging ${formatTimeSpent(
          avgDailyTime
        )} of study time daily.`,
      });
    } else if (avgDailyTime < 1800) {
      // Less than 30 minutes per day
      insights.push({
        type: "info",
        title: "Consider More Study Time 📚",
        description: `Try to increase daily study time to at least 30 minutes for better results.`,
      });
    }

    return insights;
  };

  const insights = generateInsights();

  // Generate subject performance summary
  const getSubjectSummary = () => {
    if (!analytics.subjects) return [];

    return analytics.subjects
      .sort((a, b) => (b.progress || 0) - (a.progress || 0))
      .slice(0, 5)
      .map((subject) => ({
        name: subject.name,
        progress: subject.progress || 0,
        timeSpent: subject.time_spent || 0,
        materialsCompleted: subject.materials_completed || 0,
        totalMaterials: subject.total_materials || 0,
      }));
  };

  const subjectSummary = getSubjectSummary();

  // Generate action items
  const generateActionItems = () => {
    const actions = [];

    if (reportData?.data.attendanceRate < 80) {
      actions.push("Improve attendance by setting reminders for classes");
    }

    if (reportData?.data.progressGrowth < 0) {
      actions.push("Increase daily study time to maintain learning momentum");
    }

    if (subjectSummary.some((s) => s.progress < 50)) {
      const weakSubject = subjectSummary.find((s) => s.progress < 50);
      actions.push(
        `Focus more time on ${weakSubject?.name} - currently at ${weakSubject?.progress}%`
      );
    }

    if (analytics.overview?.learning_streak < 7) {
      actions.push(
        "Build a consistent study routine to increase learning streak"
      );
    }

    return actions;
  };

  const actionItems = generateActionItems();

  if (!reportData) {
    return (
      <Empty description="Unable to generate report for selected period" />
    );
  }

  return (
    <div>
      {/* Header Controls */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space>
              <CalendarOutlined style={{ color: "#11418b" }} />
              <Text strong>Learning Report</Text>
            </Space>
          </Col>
          <Col>
            <Space>
              <Select
                value={reportPeriod}
                onChange={setReportPeriod}
                style={{ width: 120 }}
                size="small"
              >
                <Option value="week">Weekly</Option>
                <Option value="month">Monthly</Option>
                <Option value="quarter">Quarterly</Option>
              </Select>

              {reportPeriod === "week" && (
                <Select
                  value={selectedWeek}
                  onChange={setSelectedWeek}
                  style={{ width: 140 }}
                  size="small"
                >
                  <Option value={0}>Current Week</Option>
                  <Option value={1}>Last Week</Option>
                  <Option value={2}>2 Weeks Ago</Option>
                  <Option value={3}>3 Weeks Ago</Option>
                </Select>
              )}

              <Button.Group size="small">
                <Button icon={<DownloadOutlined />}>Export</Button>
                <Button icon={<PrinterOutlined />}>Print</Button>
                <Button icon={<ShareAltOutlined />}>Share</Button>
              </Button.Group>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Report Header */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <Title level={3} style={{ color: "#11418b", marginBottom: 8 }}>
            {reportData.period} Learning Report
          </Title>
          <Text type="secondary">
            {reportData.startDate} - {reportData.endDate}
          </Text>
        </div>

        {/* Key Metrics */}
        <Row gutter={[16, 16]}>
          <Col xs={12} sm={6}>
            <Statistic
              title="Study Time"
              value={formatTimeSpent(reportData.data.timeSpent)}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
            {reportData.data.timeGrowth !== 0 && (
              <Text
                type={reportData.data.timeGrowth > 0 ? "success" : "danger"}
                style={{ fontSize: 12 }}
              >
                {reportData.data.timeGrowth > 0 ? "↗" : "↘"}{" "}
                {Math.abs(reportData.data.timeGrowth)}%
              </Text>
            )}
          </Col>

          <Col xs={12} sm={6}>
            <Statistic
              title="Materials Accessed"
              value={reportData.data.materialsAccessed}
              prefix={<BookOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
            {reportData.data.progressGrowth !== 0 && (
              <Text
                type={reportData.data.progressGrowth > 0 ? "success" : "danger"}
                style={{ fontSize: 12 }}
              >
                {reportData.data.progressGrowth > 0 ? "↗" : "↘"}{" "}
                {Math.abs(reportData.data.progressGrowth)}%
              </Text>
            )}
          </Col>

          <Col xs={12} sm={6}>
            <Statistic
              title="Attendance Rate"
              value={reportData.data.attendanceRate}
              suffix="%"
              prefix={<CalendarOutlined />}
              valueStyle={{
                color:
                  reportData.data.attendanceRate >= 80
                    ? "#52c41a"
                    : reportData.data.attendanceRate >= 60
                    ? "#faad14"
                    : "#ff4d4f",
              }}
            />
          </Col>

          <Col xs={12} sm={6}>
            <Statistic
              title="Present Days"
              value={reportData.data.presentDays}
              suffix={`/ ${reportData.data.attendanceSessions}`}
              prefix={<StarOutlined />}
              valueStyle={{ color: "#722ed1" }}
            />
          </Col>
        </Row>
      </Card>

      <Row gutter={[16, 16]}>
        {/* Subject Performance */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <BarChartOutlined />
                <Text strong>Subject Performance</Text>
              </Space>
            }
            style={{ height: 400 }}
          >
            <div style={{ overflowY: "auto", maxHeight: 300 }}>
              {subjectSummary.map((subject, index) => (
                <div
                  key={index}
                  style={{
                    marginBottom: 16,
                    padding: "12px 0",
                    borderBottom:
                      index < subjectSummary.length - 1
                        ? "1px solid #f0f0f0"
                        : "none",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 8,
                    }}
                  >
                    <Text strong>{subject.name}</Text>
                    <Space>
                      <Text style={{ fontSize: 12 }}>
                        {subject.progress.toFixed(1)}%
                      </Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {formatTimeSpent(subject.timeSpent)}
                      </Text>
                    </Space>
                  </div>
                  <Progress
                    percent={subject.progress}
                    strokeColor={getProgressColor(subject.progress)}
                    size="small"
                    showInfo={false}
                  />
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    {subject.materialsCompleted}/{subject.totalMaterials}{" "}
                    materials completed
                  </Text>
                </div>
              ))}
            </div>
          </Card>
        </Col>

        {/* Insights & Recommendations */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <TrophyOutlined />
                <Text strong>Insights & Recommendations</Text>
              </Space>
            }
            style={{ height: 400 }}
          >
            <div style={{ overflowY: "auto", maxHeight: 300 }}>
              {/* Insights */}
              {insights.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <Text
                    strong
                    style={{ fontSize: 14, marginBottom: 8, display: "block" }}
                  >
                    📊 Insights
                  </Text>
                  <Space direction="vertical" style={{ width: "100%" }}>
                    {insights.map((insight, index) => (
                      <Card
                        key={index}
                        size="small"
                        style={{
                          borderLeft: `4px solid ${
                            insight.type === "success"
                              ? "#52c41a"
                              : insight.type === "warning"
                              ? "#faad14"
                              : "#1890ff"
                          }`,
                        }}
                      >
                        <Text strong style={{ fontSize: 12 }}>
                          {insight.title}
                        </Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: 11 }}>
                          {insight.description}
                        </Text>
                      </Card>
                    ))}
                  </Space>
                </div>
              )}

              {/* Action Items */}
              {actionItems.length > 0 && (
                <div>
                  <Text
                    strong
                    style={{ fontSize: 14, marginBottom: 8, display: "block" }}
                  >
                    🎯 Action Items
                  </Text>
                  <Timeline size="small">
                    {actionItems.map((action, index) => (
                      <Timeline.Item key={index}>
                        <Text style={{ fontSize: 12 }}>{action}</Text>
                      </Timeline.Item>
                    ))}
                  </Timeline>
                </div>
              )}
            </div>
          </Card>
        </Col>
      </Row>

      {/* Summary Card */}
      <Card
        title="Summary & Goals"
        style={{ marginTop: 16 }}
        extra={
          <Tag color="blue">
            Report generated on {new Date().toLocaleDateString()}
          </Tag>
        }
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Text strong>🎯 Goals for Next {reportPeriod}</Text>
            <ul style={{ marginTop: 8, marginBottom: 0 }}>
              <li>Maintain attendance rate above 85%</li>
              <li>Increase daily study time by 15 minutes</li>
              <li>Complete all pending assignments</li>
              <li>Focus on subjects with progress below 70%</li>
            </ul>
          </Col>
          <Col xs={24} md={12}>
            <Text strong>🏆 Achievements This {reportPeriod}</Text>
            <div style={{ marginTop: 8 }}>
              {analytics.achievements?.earned
                ?.slice(0, 3)
                .map((achievement, index) => (
                  <Tag
                    key={index}
                    color="gold"
                    style={{ margin: "2px 4px 2px 0" }}
                  >
                    {achievement.title}
                  </Tag>
                )) || (
                <Text type="secondary">No new achievements this period</Text>
              )}
            </div>
          </Col>
        </Row>

        <Divider />

        <div style={{ textAlign: "center" }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Keep up the great work! Consistent learning leads to academic
            success. 📚✨
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default WeeklyReport;
