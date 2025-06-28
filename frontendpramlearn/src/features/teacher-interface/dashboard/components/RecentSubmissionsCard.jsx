import React from "react";
import {
  Card,
  List,
  Typography,
  Space,
  Tag,
  Empty,
  Skeleton,
  Avatar,
  Button,
  Badge,
  Tooltip,
} from "antd";
import {
  FileTextOutlined,
  UserOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  StarOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useNavigate } from "react-router-dom";

dayjs.extend(relativeTime);
dayjs.locale("id");

const { Text } = Typography;

const RecentSubmissionsCard = ({ submissions, loading }) => {
  const navigate = useNavigate();

  const formatTime = (timeString) => {
    try {
      const time = dayjs(timeString);
      if (time.isValid()) {
        if (dayjs().diff(time, "hour") > 24) {
          return time.format("DD MMM, HH:mm");
        }
        return time.fromNow();
      }
      return timeString;
    } catch (error) {
      return timeString;
    }
  };

  const getGradeColor = (grade) => {
    if (grade === null || grade === undefined) return "#faad14";
    if (grade >= 90) return "#52c41a";
    if (grade >= 80) return "#1890ff";
    if (grade >= 70) return "#faad14";
    return "#ff4d4f";
  };

  const getGradeBadge = (grade) => {
    if (grade === null || grade === undefined) return "Belum Dinilai";
    if (grade >= 90) return "Excellent";
    if (grade >= 80) return "Good";
    if (grade >= 70) return "Fair";
    return "Needs Improvement";
  };

  const getPriorityLevel = (submission) => {
    const hoursAgo = dayjs().diff(dayjs(submission.submission_date), "hour");
    if (hoursAgo > 48 && !submission.is_graded) return "high";
    if (hoursAgo > 24 && !submission.is_graded) return "medium";
    return "low";
  };

  const sortedSubmissions = submissions
    ?.sort((a, b) => {
      // Prioritize ungraded submissions
      if (!a.is_graded && b.is_graded) return -1;
      if (a.is_graded && !b.is_graded) return 1;
      // Then sort by submission date
      return dayjs(b.submission_date).unix() - dayjs(a.submission_date).unix();
    })
    ?.slice(0, 8); // Show max 8 submissions

  return (
    <Card
      title={
        <Space>
          <FileTextOutlined style={{ color: "#11418b" }} />
          <Text strong style={{ color: "#11418b" }}>
            Submission Terbaru
          </Text>
          {submissions?.filter((s) => !s.is_graded).length > 0 && (
            <Badge
              count={submissions.filter((s) => !s.is_graded).length}
              style={{ backgroundColor: "#ff4d4f" }}
            />
          )}
        </Space>
      }
      style={{
        borderRadius: 16,
        marginBottom: 16,
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      }}
      bodyStyle={{ padding: "16px" }}
      extra={
        <Button
          type="link"
          size="small"
          onClick={() => navigate("/teacher/sessions")}
        >
          Lihat Semua
        </Button>
      }
    >
      {loading ? (
        <Skeleton active paragraph={{ rows: 4 }} />
      ) : sortedSubmissions && sortedSubmissions.length > 0 ? (
        <List
          itemLayout="horizontal"
          dataSource={sortedSubmissions}
          renderItem={(item) => {
            const priority = getPriorityLevel(item);
            const priorityColors = {
              high: "#ff4d4f",
              medium: "#faad14",
              low: "#52c41a",
            };

            return (
              <List.Item
                style={{
                  padding: "16px 12px",
                  background: !item.is_graded ? "#fff7e6" : "#fafafa",
                  borderRadius: 12,
                  marginBottom: 8,
                  border: `1px solid ${
                    !item.is_graded ? "#ffd591" : "#f0f0f0"
                  }`,
                  transition: "all 0.3s ease",
                }}
                className="submission-item"
                actions={[
                  <Tooltip title="Lihat Detail">
                    <Button
                      type="text"
                      icon={<EyeOutlined />}
                      size="small"
                      style={{ color: "#1677ff" }}
                    />
                  </Tooltip>,
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <Badge
                      dot
                      color={priorityColors[priority]}
                      offset={[-4, 4]}
                      style={{ display: !item.is_graded ? "block" : "none" }}
                    >
                      <Avatar
                        size={48}
                        icon={<UserOutlined />}
                        style={{
                          backgroundColor: getGradeColor(item.grade),
                          color: "white",
                        }}
                      />
                    </Badge>
                  }
                  title={
                    <div>
                      <Space>
                        <Text strong style={{ fontSize: 14 }}>
                          {item.student_name}
                        </Text>
                        {item.grade >= 90 && (
                          <StarOutlined style={{ color: "#faad14" }} />
                        )}
                      </Space>
                      <div style={{ marginTop: 4 }}>
                        <Text
                          type="secondary"
                          style={{ fontSize: 12 }}
                          ellipsis
                        >
                          {item.assignment_title}
                        </Text>
                      </div>
                    </div>
                  }
                  description={
                    <Space
                      direction="vertical"
                      size={8}
                      style={{ width: "100%" }}
                    >
                      <Space wrap>
                        <Tag
                          color="blue"
                          style={{ fontSize: 11, borderRadius: 12 }}
                        >
                          {item.subject_name}
                        </Tag>
                        <Space size={4}>
                          <ClockCircleOutlined
                            style={{ fontSize: 11, color: "#999" }}
                          />
                          <Text style={{ fontSize: 11, color: "#999" }}>
                            {formatTime(item.submission_date)}
                          </Text>
                        </Space>
                      </Space>

                      <div>
                        {item.is_graded ? (
                          <Space size={4}>
                            <CheckCircleOutlined
                              style={{
                                color: getGradeColor(item.grade),
                                fontSize: 12,
                              }}
                            />
                            <Text
                              style={{
                                fontSize: 12,
                                color: getGradeColor(item.grade),
                                fontWeight: 600,
                              }}
                            >
                              {item.grade}/100
                            </Text>
                            <Tag
                              color={getGradeColor(item.grade)}
                              style={{ fontSize: 10, borderRadius: 8 }}
                            >
                              {getGradeBadge(item.grade)}
                            </Tag>
                          </Space>
                        ) : (
                          <Space size={4}>
                            <ExclamationCircleOutlined
                              style={{ color: "#faad14", fontSize: 12 }}
                            />
                            <Text
                              style={{
                                fontSize: 12,
                                color: "#faad14",
                                fontWeight: 500,
                              }}
                            >
                              Menunggu Penilaian
                            </Text>
                            {priority === "high" && (
                              <Tag color="red" style={{ fontSize: 10 }}>
                                Urgent
                              </Tag>
                            )}
                          </Space>
                        )}
                      </div>
                    </Space>
                  }
                />
              </List.Item>
            );
          }}
        />
      ) : (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <div>
              <Text style={{ fontSize: 14, color: "#666" }}>
                Belum ada submission terbaru
              </Text>
              <br />
              <Text type="secondary" style={{ fontSize: 12 }}>
                Submission dari siswa akan muncul di sini
              </Text>
            </div>
          }
          style={{ padding: "40px 0" }}
        />
      )}

      <style jsx>{`
        .submission-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </Card>
  );
};

export default RecentSubmissionsCard;
