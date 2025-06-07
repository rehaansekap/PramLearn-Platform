import React, { useState, useMemo } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Typography,
  Calendar,
  Badge,
  Select,
  Space,
  Tag,
  Progress,
  Tooltip,
  Empty,
  Spin,
} from "antd";
import {
  CalendarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  CloseCircleOutlined,
  UserOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import { getAttendanceColor } from "../utils/chartHelpers";
dayjs.extend(isBetween);

const { Title, Text } = Typography;
const { Option } = Select;

const AttendanceVisualization = ({ attendanceData, loading }) => {
  const [viewPeriod, setViewPeriod] = useState("month"); // month, week, year
  const [selectedDate, setSelectedDate] = useState(dayjs());

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "60px 0" }}>
        <Spin size="large" tip="Loading attendance data..." />
      </div>
    );
  }

  if (
    !attendanceData ||
    !attendanceData.records ||
    attendanceData.records.length === 0
  ) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description="No attendance data available"
      />
    );
  }

  const { records, summary } = attendanceData;

  // Create attendance map for calendar
  const attendanceMap = useMemo(() => {
    const map = {};
    records.forEach((record) => {
      map[record.date] = record;
    });
    return map;
  }, [records]);

  // Calendar cell renderer
  const dateCellRender = (date) => {
    const dateStr = date.format("YYYY-MM-DD");
    const attendance = attendanceMap[dateStr];

    if (!attendance) return null;

    const statusColors = {
      present: "#52c41a",
      late: "#faad14",
      absent: "#ff4d4f",
      excused: "#1890ff",
    };

    return (
      <Tooltip
        title={
          <div>
            <div>
              <strong>{date.format("DD MMM YYYY")}</strong>
            </div>
            <div>Status: {attendance.status.toUpperCase()}</div>
            {attendance.check_in_time && (
              <div>Check-in: {attendance.check_in_time}</div>
            )}
            {attendance.subject && <div>Subject: {attendance.subject}</div>}
          </div>
        }
      >
        <Badge
          status="processing"
          style={{
            backgroundColor: statusColors[attendance.status] || "#d9d9d9",
            width: 8,
            height: 8,
            borderRadius: "50%",
          }}
        />
      </Tooltip>
    );
  };

  // Calculate attendance trends
  const getAttendanceTrends = () => {
    const end = dayjs(); // hari ini
    const start = end.subtract(1, "month"); // 1 bulan ke belakang
    const last30Days = records
      .filter((record) =>
        dayjs(record.date).isAfter(dayjs().subtract(30, "day"))
      )
      .sort((a, b) => dayjs(a.date).unix() - dayjs(b.date).unix());

    const weeklyTrends = [];
    for (let i = 0; i < 4; i++) {
      const weekStart = dayjs()
        .subtract((3 - i) * 7, "day")
        .startOf("week");
      const weekEnd = weekStart.endOf("week");

      const weekRecords = last30Days.filter((record) => {
        const recordDate = dayjs(record.date);
        if (recordDate.isBetween(start, end, null, "[]")) {
          return recordDate.isBetween(weekStart, weekEnd, null, "[]");
        }
      });

      const presentCount = weekRecords.filter(
        (r) => r.status === "present" || r.status === "late"
      ).length;
      const attendanceRate =
        weekRecords.length > 0 ? (presentCount / weekRecords.length) * 100 : 0;

      weeklyTrends.push({
        week: `Week ${i + 1}`,
        weekStart: weekStart.format("MMM DD"),
        weekEnd: weekEnd.format("MMM DD"),
        attendanceRate: Math.round(attendanceRate),
        totalSessions: weekRecords.length,
        presentCount,
      });
    }

    return weeklyTrends;
  };

  const attendanceTrends = getAttendanceTrends();

  // Calculate monthly stats
  const getMonthlyStats = () => {
    const currentMonth = records.filter(
      (record) =>
        dayjs(record.date).month() === dayjs().month() &&
        dayjs(record.date).year() === dayjs().year()
    );

    const statusCounts = {
      present: currentMonth.filter((r) => r.status === "present").length,
      late: currentMonth.filter((r) => r.status === "late").length,
      absent: currentMonth.filter((r) => r.status === "absent").length,
      excused: currentMonth.filter((r) => r.status === "excused").length,
    };

    return {
      total: currentMonth.length,
      ...statusCounts,
      attendanceRate:
        currentMonth.length > 0
          ? Math.round(
              ((statusCounts.present + statusCounts.late) /
                currentMonth.length) *
                100
            )
          : 0,
    };
  };

  const monthlyStats = getMonthlyStats();

  return (
    <div>
      {/* Header Controls */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space>
              <CalendarOutlined style={{ color: "#11418b" }} />
              <Text strong>Attendance Overview</Text>
            </Space>
          </Col>
          <Col>
            <Select
              value={viewPeriod}
              onChange={setViewPeriod}
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

      {/* Attendance Summary Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="Attendance Rate"
              value={summary?.attendance_rate || 0}
              suffix="%"
              prefix={<CheckCircleOutlined />}
              valueStyle={{
                color:
                  (summary?.attendance_rate || 0) >= 80
                    ? "#52c41a"
                    : (summary?.attendance_rate || 0) >= 60
                    ? "#faad14"
                    : "#ff4d4f",
              }}
            />
            <Progress
              percent={summary?.attendance_rate || 0}
              size="small"
              showInfo={false}
              strokeColor={
                (summary?.attendance_rate || 0) >= 80
                  ? "#52c41a"
                  : (summary?.attendance_rate || 0) >= 60
                  ? "#faad14"
                  : "#ff4d4f"
              }
              style={{ marginTop: 8 }}
            />
          </Card>
        </Col>

        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="Present Days"
              value={summary?.present_count || 0}
              suffix={`/ ${summary?.total_sessions || 0}`}
              prefix={<UserOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>

        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="Late Arrivals"
              value={summary?.late_count || 0}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>

        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="Absences"
              value={summary?.absent_count || 0}
              prefix={<CloseCircleOutlined />}
              valueStyle={{ color: "#ff4d4f" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Calendar View */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={16}>
          <Card
            title={
              <Space>
                <CalendarOutlined />
                <Text strong>Attendance Calendar</Text>
              </Space>
            }
          >
            <Calendar
              value={selectedDate}
              onSelect={setSelectedDate}
              dateCellRender={dateCellRender}
              headerRender={({ value, onChange }) => (
                <div style={{ padding: 8 }}>
                  <Row justify="space-between" align="middle">
                    <Col>
                      <Title level={4} style={{ margin: 0 }}>
                        {value.format("MMMM YYYY")}
                      </Title>
                    </Col>
                    <Col>
                      <Space>
                        <button
                          onClick={() => onChange(value.subtract(1, "month"))}
                          style={{
                            border: "none",
                            background: "none",
                            cursor: "pointer",
                            padding: "4px 8px",
                          }}
                        >
                          ‹
                        </button>
                        <button
                          onClick={() => onChange(dayjs())}
                          style={{
                            border: "1px solid #d9d9d9",
                            background: "#fafafa",
                            cursor: "pointer",
                            padding: "4px 8px",
                            borderRadius: 4,
                          }}
                        >
                          Today
                        </button>
                        <button
                          onClick={() => onChange(value.add(1, "month"))}
                          style={{
                            border: "none",
                            background: "none",
                            cursor: "pointer",
                            padding: "4px 8px",
                          }}
                        >
                          ›
                        </button>
                      </Space>
                    </Col>
                  </Row>
                </div>
              )}
            />

            {/* Legend */}
            <div style={{ marginTop: 16, textAlign: "center" }}>
              <Space wrap>
                <Space size="small">
                  <Badge status="success" />
                  <Text type="secondary">Present</Text>
                </Space>
                <Space size="small">
                  <Badge status="warning" />
                  <Text type="secondary">Late</Text>
                </Space>
                <Space size="small">
                  <Badge status="error" />
                  <Text type="secondary">Absent</Text>
                </Space>
                <Space size="small">
                  <Badge status="processing" />
                  <Text type="secondary">Excused</Text>
                </Space>
              </Space>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          {/* Monthly Breakdown */}
          <Card
            title="This Month Breakdown"
            style={{ marginBottom: 16, height: "fit-content" }}
          >
            <Space direction="vertical" style={{ width: "100%" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Space>
                  <Badge status="success" />
                  <Text>Present:</Text>
                </Space>
                <Text strong style={{ color: "#52c41a" }}>
                  {monthlyStats.present}
                </Text>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Space>
                  <Badge status="warning" />
                  <Text>Late:</Text>
                </Space>
                <Text strong style={{ color: "#faad14" }}>
                  {monthlyStats.late}
                </Text>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Space>
                  <Badge status="error" />
                  <Text>Absent:</Text>
                </Space>
                <Text strong style={{ color: "#ff4d4f" }}>
                  {monthlyStats.absent}
                </Text>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Space>
                  <Badge status="processing" />
                  <Text>Excused:</Text>
                </Space>
                <Text strong style={{ color: "#1890ff" }}>
                  {monthlyStats.excused}
                </Text>
              </div>

              <div
                style={{
                  marginTop: 16,
                  padding: "12px 0",
                  borderTop: "1px solid #f0f0f0",
                }}
              >
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <Text strong>Total Sessions:</Text>
                  <Text strong>{monthlyStats.total}</Text>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: 8,
                  }}
                >
                  <Text strong>Attendance Rate:</Text>
                  <Text strong style={{ color: getAttendanceColor("present") }}>
                    {monthlyStats.attendanceRate}%
                  </Text>
                </div>
              </div>
            </Space>
          </Card>

          {/* Weekly Trends */}
          <Card title="Weekly Trends">
            <Space direction="vertical" style={{ width: "100%" }}>
              {attendanceTrends.map((week, index) => (
                <div key={index}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 4,
                    }}
                  >
                    <Text style={{ fontSize: 12 }}>
                      {week.weekStart} - {week.weekEnd}
                    </Text>
                    <Text strong style={{ fontSize: 12 }}>
                      {week.attendanceRate}%
                    </Text>
                  </div>
                  <Progress
                    percent={week.attendanceRate}
                    size="small"
                    showInfo={false}
                    strokeColor={
                      week.attendanceRate >= 80
                        ? "#52c41a"
                        : week.attendanceRate >= 60
                        ? "#faad14"
                        : "#ff4d4f"
                    }
                  />
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    {week.presentCount}/{week.totalSessions} sessions
                  </Text>
                </div>
              ))}
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AttendanceVisualization;
