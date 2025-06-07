import React, { useState } from "react";
import {
  Card,
  List,
  Tag,
  Button,
  Typography,
  Space,
  Empty,
  Spin,
  Badge,
  Progress,
  Tooltip,
  Input,
  Select,
} from "antd";
import {
  ClockCircleOutlined,
  FileTextOutlined,
  CalendarOutlined,
  TrophyOutlined,
  EditOutlined,
  SearchOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const { Title, Text } = Typography;
const { Option } = Select;

const StudentAssignmentList = ({
  assignments,
  loading,
  error,
  onSelectAssignment,
  getAssignmentStatus,
  getTimeRemaining,
}) => {
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Filter assignments
  const filteredAssignments = assignments.filter((assignment) => {
    const matchSearch =
      assignment.title.toLowerCase().includes(searchText.toLowerCase()) ||
      assignment.description.toLowerCase().includes(searchText.toLowerCase());

    if (!matchSearch) return false;

    if (statusFilter === "all") return true;

    const status = getAssignmentStatus(assignment);
    return status.status === statusFilter;
  });

  const getStatusIcon = (status) => {
    switch (status.status) {
      case "graded":
        return <TrophyOutlined />;
      case "submitted":
        return <FileTextOutlined />;
      case "overdue":
        return <ClockCircleOutlined />;
      default:
        return <EditOutlined />;
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "40px 0" }}>
        <Spin size="large" tip="Loading assignments..." />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <Empty
          description="Failed to load assignments"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </Card>
    );
  }

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: 16 }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ color: "#11418b", margin: 0 }}>
          📝 My Assignments
        </Title>
        <Text type="secondary">
          Complete your assignments before the due date
        </Text>
      </div>

      {/* Filters */}
      <Card style={{ marginBottom: 24 }}>
        <Space direction="vertical" style={{ width: "100%" }}>
          <div
            style={{
              display: "flex",
              gap: 16,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <Input
              placeholder="Search assignments..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ maxWidth: 300 }}
              allowClear
            />
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ minWidth: 150 }}
              prefix={<FilterOutlined />}
            >
              <Option value="all">All Status</Option>
              <Option value="available">Available</Option>
              <Option value="submitted">Submitted</Option>
              <Option value="graded">Graded</Option>
              <Option value="overdue">Overdue</Option>
            </Select>
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Text type="secondary">Quick filters:</Text>
            <Tag
              color={statusFilter === "available" ? "blue" : "default"}
              style={{ cursor: "pointer" }}
              onClick={() => setStatusFilter("available")}
            >
              Available (
              {
                assignments.filter(
                  (a) => getAssignmentStatus(a).status === "available"
                ).length
              }
              )
            </Tag>
            <Tag
              color={statusFilter === "submitted" ? "green" : "default"}
              style={{ cursor: "pointer" }}
              onClick={() => setStatusFilter("submitted")}
            >
              Submitted (
              {
                assignments.filter(
                  (a) => getAssignmentStatus(a).status === "submitted"
                ).length
              }
              )
            </Tag>
            <Tag
              color={statusFilter === "overdue" ? "red" : "default"}
              style={{ cursor: "pointer" }}
              onClick={() => setStatusFilter("overdue")}
            >
              Overdue (
              {
                assignments.filter(
                  (a) => getAssignmentStatus(a).status === "overdue"
                ).length
              }
              )
            </Tag>
          </div>
        </Space>
      </Card>

      {/* Assignment List */}
      {filteredAssignments.length === 0 ? (
        <Card>
          <Empty
            description={
              searchText || statusFilter !== "all"
                ? "No assignments match your filters"
                : "No assignments available"
            }
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </Card>
      ) : (
        <List
          grid={{ gutter: 16, xs: 1, sm: 1, md: 1, lg: 1, xl: 1 }}
          dataSource={filteredAssignments}
          renderItem={(assignment) => {
            const status = getAssignmentStatus(assignment);
            const timeRemaining = getTimeRemaining(assignment.due_date);

            return (
              <List.Item>
                <Badge.Ribbon
                  text={status.text}
                  color={status.color}
                  placement="start"
                >
                  <Card
                    hoverable
                    style={{
                      borderRadius: 12,
                      border: `2px solid ${
                        status.status === "available"
                          ? "#1890ff"
                          : status.status === "overdue"
                          ? "#ff4d4f"
                          : "#d9d9d9"
                      }`,
                    }}
                    bodyStyle={{ padding: 20 }}
                  >
                    {/* Header */}
                    <div style={{ marginBottom: 16 }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          marginBottom: 8,
                        }}
                      >
                        <Title
                          level={4}
                          style={{ margin: 0, color: "#11418b" }}
                        >
                          {assignment.title}
                        </Title>
                        {getStatusIcon(status)}
                      </div>

                      <Text type="secondary" style={{ fontSize: 14 }}>
                        {assignment.description}
                      </Text>
                    </div>

                    {/* Info Tags */}
                    <div style={{ marginBottom: 16 }}>
                      <Space wrap size="small">
                        <Tag icon={<CalendarOutlined />} color="blue">
                          Due:{" "}
                          {dayjs(assignment.due_date).format(
                            "DD MMM YYYY, HH:mm"
                          )}
                        </Tag>
                        <Tag icon={<FileTextOutlined />} color="green">
                          {assignment.questions?.length || 0} Questions
                        </Tag>
                        {assignment.subject && (
                          <Tag color="purple">
                            {assignment.subject_name || assignment.subject}
                          </Tag>
                        )}
                      </Space>
                    </div>

                    {/* Due Date Countdown */}
                    <div style={{ marginBottom: 16 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          marginBottom: 4,
                        }}
                      >
                        <ClockCircleOutlined
                          style={{ color: timeRemaining.color }}
                        />
                        <Text strong style={{ color: timeRemaining.color }}>
                          {timeRemaining.text}
                        </Text>
                      </div>

                      {!timeRemaining.expired && (
                        <Progress
                          percent={Math.max(
                            0,
                            Math.min(
                              100,
                              100 -
                                (dayjs(assignment.due_date).diff(dayjs()) /
                                  (7 * 24 * 60 * 60 * 1000)) *
                                  100
                            )
                          )}
                          strokeColor={timeRemaining.color}
                          showInfo={false}
                          size="small"
                        />
                      )}
                    </div>

                    {/* Grade Info (if submitted) */}
                    {status.status === "graded" &&
                      assignment.grade !== undefined && (
                        <div
                          style={{
                            marginBottom: 16,
                            padding: 12,
                            backgroundColor: "#f6ffed",
                            borderRadius: 6,
                          }}
                        >
                          <Space>
                            <TrophyOutlined style={{ color: "#52c41a" }} />
                            <Text strong>Grade: {assignment.grade}/100</Text>
                            <Tag
                              color={
                                assignment.grade >= 80
                                  ? "success"
                                  : assignment.grade >= 60
                                  ? "warning"
                                  : "error"
                              }
                            >
                              {assignment.grade >= 80
                                ? "Excellent"
                                : assignment.grade >= 60
                                ? "Good"
                                : "Needs Improvement"}
                            </Tag>
                          </Space>
                        </div>
                      )}

                    {/* Action Button */}
                    <Button
                      type={
                        status.status === "available" ? "primary" : "default"
                      }
                      block
                      size="large"
                      icon={getStatusIcon(status)}
                      onClick={() => onSelectAssignment(assignment)}
                      disabled={
                        status.status === "overdue" &&
                        !assignment.allow_late_submission
                      }
                      style={{
                        height: 45,
                        fontSize: 16,
                        fontWeight: 600,
                        borderRadius: 8,
                      }}
                    >
                      {status.status === "available"
                        ? "Start Assignment"
                        : status.status === "submitted"
                        ? "View Submission"
                        : status.status === "graded"
                        ? "View Grade & Feedback"
                        : "View Assignment"}
                    </Button>

                    {/* Submission timestamp */}
                    {assignment.submitted_at && (
                      <Text
                        type="secondary"
                        style={{
                          display: "block",
                          textAlign: "center",
                          marginTop: 8,
                          fontSize: 12,
                        }}
                      >
                        Submitted:{" "}
                        {dayjs(assignment.submitted_at).format(
                          "DD MMM YYYY, HH:mm"
                        )}
                      </Text>
                    )}
                  </Card>
                </Badge.Ribbon>
              </List.Item>
            );
          }}
        />
      )}
    </div>
  );
};

export default StudentAssignmentList;
