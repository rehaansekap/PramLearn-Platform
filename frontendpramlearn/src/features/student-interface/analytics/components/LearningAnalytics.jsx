import React, { useState } from "react";
import {
  Card,
  Row,
  Col,
  Typography,
  Select,
  Space,
  Tag,
  Progress,
  Empty,
  Spin,
  Statistic,
  List,
  Avatar,
} from "antd";
import {
  ClockCircleOutlined,
  BookOutlined,
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
  FireOutlined,
  TrophyOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { formatTimeSpent } from "../utils/chartHelpers";
import {
  getPeakLearningHours,
  getSubjectTimeDistribution,
} from "../utils/analyticsCalculations";

const { Title, Text } = Typography;
const { Option } = Select;

const LearningAnalytics = ({ behavior, loading }) => {
  const [timeFrame, setTimeFrame] = useState("week"); // week, month, year

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "60px 0" }}>
        <Spin size="large" tip="Loading learning analytics..." />
      </div>
    );
  }

  if (!behavior) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description="No learning behavior data available"
      />
    );
  }

  const {
    daily_activity = [],
    peak_learning_hours = [],
    subjects_time_distribution = [],
    learning_patterns = {},
  } = behavior;

  // Calculate learning insights
  const calculateInsights = () => {
    const totalTimeSpent = daily_activity.reduce(
      (sum, day) => sum + (day.time_spent || 0),
      0
    );
    const totalMaterialsAccessed = daily_activity.reduce(
      (sum, day) => sum + (day.materials_accessed || 0),
      0
    );
    const activeDays = daily_activity.filter(
      (day) => (day.time_spent || 0) > 0
    ).length;
    const averageSessionTime = activeDays > 0 ? totalTimeSpent / activeDays : 0;

    return {
      totalTimeSpent,
      totalMaterialsAccessed,
      activeDays,
      averageSessionTime,
    };
  };

  const insights = calculateInsights();

  // Get peak learning hours data
  const peakHours = getPeakLearningHours(behavior);

  // Get subject time distribution
  const timeDistribution = getSubjectTimeDistribution(
    subjects_time_distribution
  );

  // Learning patterns analysis
  const getLearningPatternInsights = () => {
    const patterns = [];
    const { activeDays } = insights; // Tambahkan ini
    // Most active day
    const dayActivity = daily_activity.reduce((acc, day) => {
      const dayName = new Date(day.date).toLocaleDateString("en-US", {
        weekday: "long",
      });
      acc[dayName] = (acc[dayName] || 0) + (day.time_spent || 0);
      return acc;
    }, {});

    const mostActiveDay = Object.entries(dayActivity).reduce(
      (max, [day, time]) => (time > max.time ? { day, time } : max),
      { day: "", time: 0 }
    );

    if (mostActiveDay.day) {
      patterns.push({
        type: "day_preference",
        title: "Most Active Day",
        description: `You learn most on ${mostActiveDay.day}s`,
        value: formatTimeSpent(mostActiveDay.time),
        icon: <CalendarOutlined />,
        color: "#1890ff",
      });
    }

    // Peak learning hour
    const peakHour = peakHours.reduce(
      (max, hour) => (hour.time_spent > max.time_spent ? hour : max),
      { hour: 0, time_spent: 0 }
    );

    if (peakHour.hour) {
      patterns.push({
        type: "time_preference",
        title: "Peak Learning Hour",
        description: `You're most productive at ${peakHour.hour}:00`,
        value: formatTimeSpent(peakHour.time_spent),
        icon: <ClockCircleOutlined />,
        color: "#52c41a",
      });
    }

    // Learning consistency
    const consistencyScore =
      activeDays > 0 ? Math.min((activeDays / 30) * 100, 100) : 0;
    patterns.push({
      type: "consistency",
      title: "Learning Consistency",
      description: `${activeDays} active days this month`,
      value: `${Math.round(consistencyScore)}%`,
      icon: <FireOutlined />,
      color:
        consistencyScore >= 70
          ? "#52c41a"
          : consistencyScore >= 40
          ? "#faad14"
          : "#ff4d4f",
    });

    return patterns;
  };

  const learningPatterns = getLearningPatternInsights();

  // Daily activity chart data (simplified)
  const getDailyActivityData = () => {
    return daily_activity.slice(-7).map((day) => ({
      date: new Date(day.date).toLocaleDateString("en-US", {
        weekday: "short",
      }),
      timeSpent: Math.round((day.time_spent || 0) / 60), // Convert to minutes
      materialsAccessed: day.materials_accessed || 0,
    }));
  };

  const dailyActivityData = getDailyActivityData();

  return (
    <div>
      {/* Header Controls */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space>
              <BarChartOutlined style={{ color: "#11418b" }} />
              <Text strong>Learning Behavior Analytics</Text>
            </Space>
          </Col>
          <Col>
            <Select
              value={timeFrame}
              onChange={setTimeFrame}
              style={{ width: 120 }}
              size="small"
            >
              <Option value="week">This Week</Option>
              <Option value="month">This Month</Option>
              <Option value="year">This Year</Option>
            </Select>
          </Col>
        </Row>
      </Card>

      {/* Learning Insights Summary */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="Total Time Spent"
              value={formatTimeSpent(insights.totalTimeSpent)}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>

        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="Materials Accessed"
              value={insights.totalMaterialsAccessed}
              prefix={<BookOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>

        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="Active Days"
              value={insights.activeDays}
              suffix={`/${timeFrame === "week" ? "7" : "30"}`}
              prefix={<FireOutlined />}
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>

        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="Avg Session"
              value={formatTimeSpent(insights.averageSessionTime)}
              prefix={<TrophyOutlined />}
              valueStyle={{ color: "#722ed1" }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* Learning Patterns */}
        <Col xs={24} lg={8}>
          <Card
            title={
              <Space>
                <LineChartOutlined />
                <Text strong>Learning Patterns</Text>
              </Space>
            }
            style={{ height: 400 }}
          >
            <List
              dataSource={learningPatterns}
              renderItem={(pattern) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        style={{ backgroundColor: pattern.color }}
                        icon={pattern.icon}
                      />
                    }
                    title={pattern.title}
                    description={pattern.description}
                  />
                  <Text strong style={{ color: pattern.color }}>
                    {pattern.value}
                  </Text>
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* Subject Time Distribution */}
        <Col xs={24} lg={8}>
          <Card
            title={
              <Space>
                <PieChartOutlined />
                <Text strong>Time by Subject</Text>
              </Space>
            }
            style={{ height: 400 }}
          >
            <div style={{ overflowY: "auto", maxHeight: 300 }}>
              {timeDistribution.map((subject, index) => (
                <div
                  key={index}
                  style={{
                    marginBottom: 16,
                    padding: "12px 0",
                    borderBottom:
                      index < timeDistribution.length - 1
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
                      <Text type="secondary">{subject.percentage}%</Text>
                      <Text strong>{formatTimeSpent(subject.time_spent)}</Text>
                    </Space>
                  </div>
                  <Progress
                    percent={subject.percentage}
                    size="small"
                    showInfo={false}
                    strokeColor={`hsl(${(index * 50) % 360}, 70%, 50%)`}
                  />
                </div>
              ))}
            </div>
          </Card>
        </Col>

        {/* Daily Activity */}
        <Col xs={24} lg={8}>
          <Card
            title={
              <Space>
                <BarChartOutlined />
                <Text strong>Daily Activity</Text>
              </Space>
            }
            style={{ height: 400 }}
          >
            <div style={{ overflowY: "auto", maxHeight: 300 }}>
              {dailyActivityData.map((day, index) => (
                <div
                  key={index}
                  style={{
                    marginBottom: 16,
                    padding: "8px 0",
                    borderBottom:
                      index < dailyActivityData.length - 1
                        ? "1px solid #f0f0f0"
                        : "none",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 4,
                    }}
                  >
                    <Text strong>{day.date}</Text>
                    <Text type="secondary">{day.timeSpent}m</Text>
                  </div>
                  <Progress
                    percent={
                      day.timeSpent > 0
                        ? Math.min((day.timeSpent / 120) * 100, 100)
                        : 0
                    }
                    size="small"
                    showInfo={false}
                    strokeColor="#1890ff"
                    style={{ marginBottom: 4 }}
                  />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {day.materialsAccessed} materials accessed
                  </Text>
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>

      {/* Peak Learning Hours */}
      <Row style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card
            title={
              <Space>
                <ClockCircleOutlined />
                <Text strong>Peak Learning Hours</Text>
              </Space>
            }
          >
            <Row gutter={8}>
              {Array.from({ length: 24 }, (_, hour) => {
                const hourData = peakHours.find((h) => h.hour === hour) || {
                  activity_count: 0,
                  time_spent: 0,
                };
                const maxActivity = Math.max(
                  ...peakHours.map((h) => h.activity_count),
                  1
                );
                const intensity = (hourData.activity_count / maxActivity) * 100;

                return (
                  <Col span={1} key={hour}>
                    <div style={{ textAlign: "center" }}>
                      <div
                        style={{
                          height: 60,
                          background:
                            intensity > 0
                              ? `linear-gradient(to top, #1890ff ${intensity}%, #f0f0f0 ${intensity}%)`
                              : "#f0f0f0",
                          margin: "0 2px",
                          borderRadius: 2,
                          display: "flex",
                          alignItems: "flex-end",
                          justifyContent: "center",
                          fontSize: 10,
                          color: intensity > 50 ? "#fff" : "#666",
                        }}
                        title={`${hour}:00 - ${
                          hourData.activity_count
                        } activities, ${formatTimeSpent(hourData.time_spent)}`}
                      >
                        {intensity > 30 ? hourData.activity_count : ""}
                      </div>
                      <Text style={{ fontSize: 10 }}>
                        {hour.toString().padStart(2, "0")}
                      </Text>
                    </div>
                  </Col>
                );
              })}
            </Row>
            <div style={{ marginTop: 8, textAlign: "center" }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Hover over bars to see detailed activity for each hour
              </Text>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default LearningAnalytics;
