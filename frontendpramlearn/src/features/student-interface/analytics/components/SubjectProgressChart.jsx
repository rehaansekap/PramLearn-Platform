import React, { useState } from "react";
import {
  Card,
  Row,
  Col,
  Progress,
  Typography,
  Space,
  Tag,
  Button,
  Empty,
  Spin,
  Select,
  Tooltip,
  Statistic,
} from "antd";
import {
  BookOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  PlayCircleOutlined,
  BarChartOutlined,
  LineChartOutlined,
} from "@ant-design/icons";
import { formatTimeSpent, getProgressColor } from "../utils/chartHelpers";

const { Title, Text } = Typography;
const { Option } = Select;

const SubjectProgressChart = ({ subjects, loading }) => {
  const [viewMode, setViewMode] = useState("grid"); // grid, chart
  const [sortBy, setSortBy] = useState("progress"); // progress, time, name

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "60px 0" }}>
        <Spin size="large" tip="Loading subject progress..." />
      </div>
    );
  }

  if (!subjects || subjects.length === 0) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description="No subject data available"
      />
    );
  }

  // Sort subjects based on selected criteria
  const sortedSubjects = [...subjects].sort((a, b) => {
    switch (sortBy) {
      case "progress":
        return (b.progress || 0) - (a.progress || 0);
      case "time":
        return (b.time_spent || 0) - (a.time_spent || 0);
      case "name":
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  // Calculate overall statistics
  const totalProgress = subjects.reduce(
    (sum, subject) => sum + (subject.progress || 0),
    0
  );
  const averageProgress =
    subjects.length > 0 ? Math.round(totalProgress / subjects.length) : 0;
  const totalTimeSpent = subjects.reduce(
    (sum, subject) => sum + (subject.time_spent || 0),
    0
  );
  const completedSubjects = subjects.filter(
    (subject) => (subject.progress || 0) >= 100
  ).length;

  const SubjectCard = ({ subject }) => {
    const progress = subject.progress || 0;
    const materialsCompleted = subject.materials_completed || 0;
    const totalMaterials = subject.total_materials || 0;
    const timeSpent = subject.time_spent || 0;
    const lastActivity = subject.last_activity;

    return (
      <Card
        size="small"
        style={{
          height: "100%",
          borderLeft: `4px solid ${getProgressColor(progress)}`,
        }}
        hoverable
      >
        <div style={{ marginBottom: 12 }}>
          <Space>
            <BookOutlined style={{ color: "#11418b" }} />
            <Title level={5} style={{ margin: 0, color: "#11418b" }}>
              {subject.name}
            </Title>
          </Space>
          {progress >= 100 && (
            <Tag color="success" size="small" style={{ marginLeft: 8 }}>
              <CheckCircleOutlined /> Completed
            </Tag>
          )}
        </div>

        {/* Progress Bar */}
        <div style={{ marginBottom: 16 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 4,
            }}
          >
            <Text type="secondary" style={{ fontSize: 12 }}>
              Progress
            </Text>
            <Text
              strong
              style={{ fontSize: 12, color: getProgressColor(progress) }}
            >
              {progress.toFixed(1)}%
            </Text>
          </div>
          <Progress
            percent={progress}
            strokeColor={getProgressColor(progress)}
            size="small"
            showInfo={false}
          />
        </div>

        {/* Materials Progress */}
        <Row gutter={8} style={{ marginBottom: 12 }}>
          <Col span={12}>
            <div style={{ textAlign: "center" }}>
              <Text
                style={{ fontSize: 18, fontWeight: "bold", color: "#52c41a" }}
              >
                {materialsCompleted}
              </Text>
              <br />
              <Text type="secondary" style={{ fontSize: 11 }}>
                Completed
              </Text>
            </div>
          </Col>
          <Col span={12}>
            <div style={{ textAlign: "center" }}>
              <Text
                style={{ fontSize: 18, fontWeight: "bold", color: "#1890ff" }}
              >
                {totalMaterials}
              </Text>
              <br />
              <Text type="secondary" style={{ fontSize: 11 }}>
                Total
              </Text>
            </div>
          </Col>
        </Row>

        {/* Time Spent */}
        <div style={{ marginBottom: 12 }}>
          <Space style={{ fontSize: 12 }}>
            <ClockCircleOutlined style={{ color: "#faad14" }} />
            <Text type="secondary">Time spent:</Text>
            <Text strong>{formatTimeSpent(timeSpent)}</Text>
          </Space>
        </div>

        {/* Last Activity */}
        {lastActivity && (
          <div>
            <Space style={{ fontSize: 11 }}>
              <PlayCircleOutlined style={{ color: "#722ed1" }} />
              <Text type="secondary">
                Last activity: {new Date(lastActivity).toLocaleDateString()}
              </Text>
            </Space>
          </div>
        )}
      </Card>
    );
  };

  const ChartView = () => {
    const maxTimeSpent = Math.max(...subjects.map((s) => s.time_spent || 0));

    return (
      <Card title="Progress vs Time Spent Analysis">
        <div style={{ height: 400, overflowY: "auto" }}>
          {sortedSubjects.map((subject, index) => (
            <div
              key={subject.id || index}
              style={{
                padding: "12px 0",
                borderBottom:
                  index < sortedSubjects.length - 1
                    ? "1px solid #f0f0f0"
                    : "none",
              }}
            >
              <Row align="middle" gutter={16}>
                <Col span={6}>
                  <Text strong style={{ fontSize: 14 }}>
                    {subject.name}
                  </Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {subject.materials_completed || 0}/
                    {subject.total_materials || 0} materials
                  </Text>
                </Col>

                <Col span={10}>
                  <div style={{ marginBottom: 4 }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Progress: {(subject.progress || 0).toFixed(1)}%
                    </Text>
                  </div>
                  <Progress
                    percent={subject.progress || 0}
                    strokeColor={getProgressColor(subject.progress || 0)}
                    size="small"
                    showInfo={false}
                  />
                </Col>

                <Col span={8}>
                  <div style={{ marginBottom: 4 }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Time spent: {formatTimeSpent(subject.time_spent || 0)}
                    </Text>
                  </div>
                  <Progress
                    percent={
                      maxTimeSpent > 0
                        ? ((subject.time_spent || 0) / maxTimeSpent) * 100
                        : 0
                    }
                    strokeColor="#faad14"
                    size="small"
                    showInfo={false}
                  />
                </Col>
              </Row>
            </div>
          ))}
        </div>
      </Card>
    );
  };

  return (
    <div>
      {/* Header Controls */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space>
              <Text strong>Subject Progress Overview</Text>
              <Tag color="blue">{subjects.length} subjects</Tag>
            </Space>
          </Col>
          <Col>
            <Space>
              <Select
                value={sortBy}
                onChange={setSortBy}
                style={{ width: 120 }}
                size="small"
              >
                <Option value="progress">By Progress</Option>
                <Option value="time">By Time</Option>
                <Option value="name">By Name</Option>
              </Select>

              <Button.Group size="small">
                <Button
                  type={viewMode === "grid" ? "primary" : "default"}
                  icon={<BarChartOutlined />}
                  onClick={() => setViewMode("grid")}
                >
                  Grid
                </Button>
                <Button
                  type={viewMode === "chart" ? "primary" : "default"}
                  icon={<LineChartOutlined />}
                  onClick={() => setViewMode("chart")}
                >
                  Chart
                </Button>
              </Button.Group>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Summary Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="Average Progress"
              value={averageProgress}
              suffix="%"
              valueStyle={{ color: getProgressColor(averageProgress) }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="Completed Subjects"
              value={completedSubjects}
              suffix={`/ ${subjects.length}`}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="Total Time"
              value={formatTimeSpent(totalTimeSpent)}
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="Active Learning"
              value={
                subjects.filter(
                  (s) =>
                    s.last_activity &&
                    new Date(s.last_activity) >
                      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                ).length
              }
              suffix="this week"
              valueStyle={{ color: "#722ed1" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Content */}
      {viewMode === "grid" ? (
        <Row gutter={[16, 16]}>
          {sortedSubjects.map((subject, index) => (
            <Col xs={24} sm={12} lg={8} xl={6} key={subject.id || index}>
              <SubjectCard subject={subject} />
            </Col>
          ))}
        </Row>
      ) : (
        <ChartView />
      )}
    </div>
  );
};

export default SubjectProgressChart;
