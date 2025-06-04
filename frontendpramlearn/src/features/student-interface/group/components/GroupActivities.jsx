import React, { useState } from "react";
import {
  Card,
  Timeline,
  Tag,
  Space,
  Typography,
  Row,
  Col,
  Avatar,
  Badge,
  Button,
  Select,
  Empty,
  Tooltip,
} from "antd";
import {
  CalendarOutlined,
  TeamOutlined,
  TrophyOutlined,
  BookOutlined,
  UserAddOutlined,
  FireOutlined,
  FilterOutlined,
  HistoryOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/id";

dayjs.extend(relativeTime);
dayjs.locale("id");

const { Text, Title } = Typography;
const { Option } = Select;

const GroupActivities = ({ activities, achievements, loading }) => {
  const [filter, setFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState("all");

  if (loading) {
    return (
      <Card loading title="📈 Aktivitas Kelompok">
        <div style={{ height: 400 }} />
      </Card>
    );
  }

  const getActivityIcon = (type) => {
    const iconMap = {
      quiz_completed: <TrophyOutlined style={{ color: "#faad14" }} />,
      member_joined: <UserAddOutlined style={{ color: "#52c41a" }} />,
      study_session: <BookOutlined style={{ color: "#1890ff" }} />,
      achievement: <FireOutlined style={{ color: "#ff4d4f" }} />,
      collaboration: <TeamOutlined style={{ color: "#722ed1" }} />,
    };
    return iconMap[type] || <CalendarOutlined style={{ color: "#8c8c8c" }} />;
  };

  const getActivityColor = (type) => {
    const colorMap = {
      quiz_completed: "#faad14",
      member_joined: "#52c41a",
      study_session: "#1890ff",
      achievement: "#ff4d4f",
      collaboration: "#722ed1",
    };
    return colorMap[type] || "#8c8c8c";
  };

  const getActivityEmoji = (type) => {
    const emojiMap = {
      quiz_completed: "🏆",
      member_joined: "👥",
      study_session: "📚",
      achievement: "🎉",
      collaboration: "🤝",
    };
    return emojiMap[type] || "📅";
  };

  // Filter activities
  const filteredActivities = activities.filter((activity) => {
    if (filter !== "all" && activity.type !== filter) return false;

    if (timeFilter !== "all") {
      const activityDate = dayjs(activity.timestamp);
      const now = dayjs();

      switch (timeFilter) {
        case "today":
          return activityDate.isSame(now, "day");
        case "week":
          return activityDate.isAfter(now.subtract(7, "day"));
        case "month":
          return activityDate.isAfter(now.subtract(30, "day"));
        default:
          return true;
      }
    }

    return true;
  });

  // Activity type options
  const activityTypes = [
    { value: "all", label: "Semua Aktivitas", icon: "📋" },
    { value: "quiz_completed", label: "Quiz Selesai", icon: "🏆" },
    { value: "member_joined", label: "Anggota Bergabung", icon: "👥" },
    { value: "study_session", label: "Sesi Belajar", icon: "📚" },
    { value: "achievement", label: "Pencapaian", icon: "🎉" },
  ];

  const timeFilters = [
    { value: "all", label: "Semua Waktu" },
    { value: "today", label: "Hari Ini" },
    { value: "week", label: "Minggu Ini" },
    { value: "month", label: "Bulan Ini" },
  ];

  // Calculate activity statistics
  const activityStats = {
    total: activities.length,
    thisWeek: activities.filter((a) =>
      dayjs(a.timestamp).isAfter(dayjs().subtract(7, "day"))
    ).length,
    quizzes: activities.filter((a) => a.type === "quiz_completed").length,
    studySessions: activities.filter((a) => a.type === "study_session").length,
  };

  return (
    <div>
      {/* Activity Statistics */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col xs={12} sm={6}>
            <div style={{ textAlign: "center" }}>
              <div
                style={{ fontSize: 24, fontWeight: "bold", color: "#1890ff" }}
              >
                {activityStats.total}
              </div>
              <Text type="secondary">Total Aktivitas</Text>
            </div>
          </Col>
          <Col xs={12} sm={6}>
            <div style={{ textAlign: "center" }}>
              <div
                style={{ fontSize: 24, fontWeight: "bold", color: "#52c41a" }}
              >
                {activityStats.thisWeek}
              </div>
              <Text type="secondary">Minggu Ini</Text>
            </div>
          </Col>
          <Col xs={12} sm={6}>
            <div style={{ textAlign: "center" }}>
              <div
                style={{ fontSize: 24, fontWeight: "bold", color: "#faad14" }}
              >
                {activityStats.quizzes}
              </div>
              <Text type="secondary">Quiz Selesai</Text>
            </div>
          </Col>
          <Col xs={12} sm={6}>
            <div style={{ textAlign: "center" }}>
              <div
                style={{ fontSize: 24, fontWeight: "bold", color: "#722ed1" }}
              >
                {activityStats.studySessions}
              </div>
              <Text type="secondary">Sesi Belajar</Text>
            </div>
          </Col>
        </Row>
      </Card>

      <Row gutter={16}>
        {/* Activities Timeline */}
        <Col xs={24} lg={16}>
          <Card
            title={
              <Space>
                <HistoryOutlined style={{ color: "#1890ff" }} />
                <span>📈 Timeline Aktivitas</span>
              </Space>
            }
            extra={
              <Space>
                <Select
                  value={filter}
                  onChange={setFilter}
                  style={{ width: 150 }}
                  size="small"
                >
                  {activityTypes.map((type) => (
                    <Option key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </Option>
                  ))}
                </Select>
                <Select
                  value={timeFilter}
                  onChange={setTimeFilter}
                  style={{ width: 120 }}
                  size="small"
                >
                  {timeFilters.map((time) => (
                    <Option key={time.value} value={time.value}>
                      {time.label}
                    </Option>
                  ))}
                </Select>
              </Space>
            }
          >
            {filteredActivities.length === 0 ? (
              <Empty
                description="Tidak ada aktivitas yang ditemukan"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ) : (
              <Timeline mode="left" style={{ marginTop: 16 }}>
                {filteredActivities.map((activity) => (
                  <Timeline.Item
                    key={activity.id}
                    dot={
                      <Avatar
                        size="small"
                        style={{
                          backgroundColor: getActivityColor(activity.type),
                        }}
                        icon={getActivityIcon(activity.type)}
                      />
                    }
                    color={getActivityColor(activity.type)}
                  >
                    <Card
                      size="small"
                      style={{
                        marginBottom: 8,
                        borderLeft: `4px solid ${getActivityColor(
                          activity.type
                        )}`,
                      }}
                    >
                      <div style={{ marginBottom: 8 }}>
                        <Space>
                          <Text strong>
                            {getActivityEmoji(activity.type)} {activity.title}
                          </Text>
                          <Tag
                            color={getActivityColor(activity.type)}
                            size="small"
                          >
                            {activity.type.replace("_", " ").toUpperCase()}
                          </Tag>
                        </Space>
                      </div>

                      <Text
                        type="secondary"
                        style={{ display: "block", marginBottom: 8 }}
                      >
                        {activity.description}
                      </Text>

                      {activity.participants &&
                        activity.participants.length > 0 && (
                          <div style={{ marginBottom: 8 }}>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              Peserta:
                            </Text>
                            <div style={{ marginTop: 4 }}>
                              <Space wrap size="small">
                                {activity.participants.map(
                                  (participant, idx) => (
                                    <Tag key={idx} size="small" color="blue">
                                      {participant}
                                    </Tag>
                                  )
                                )}
                              </Space>
                            </div>
                          </div>
                        )}

                      {activity.achievement_unlocked && (
                        <div style={{ marginBottom: 8 }}>
                          <Badge
                            count="NEW"
                            size="small"
                            style={{ backgroundColor: "#ff4d4f" }}
                          >
                            <Tag color="gold" icon={<TrophyOutlined />}>
                              🎉 {activity.achievement_unlocked}
                            </Tag>
                          </Badge>
                        </div>
                      )}

                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Space size="small">
                          <CalendarOutlined style={{ color: "#8c8c8c" }} />
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {dayjs(activity.timestamp).format(
                              "DD MMM YYYY, HH:mm"
                            )}
                          </Text>
                        </Space>
                        <Text type="secondary" style={{ fontSize: 11 }}>
                          {dayjs(activity.timestamp).fromNow()}
                        </Text>
                      </div>
                    </Card>
                  </Timeline.Item>
                ))}
              </Timeline>
            )}
          </Card>
        </Col>

        {/* Achievements */}
        <Col xs={24} lg={8}>
          <Card
            title={
              <Space>
                <TrophyOutlined style={{ color: "#faad14" }} />
                <span>🏆 Pencapaian Kelompok</span>
              </Space>
            }
          >
            <Space direction="vertical" style={{ width: "100%" }}>
              {achievements?.map((achievement) => (
                <Card
                  key={achievement.id}
                  size="small"
                  style={{
                    backgroundColor: achievement.unlocked
                      ? "#f6ffed"
                      : "#fafafa",
                    border: `1px solid ${
                      achievement.unlocked ? "#52c41a" : "#d9d9d9"
                    }`,
                  }}
                >
                  <Space
                    style={{ width: "100%" }}
                    direction="vertical"
                    size="small"
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Space>
                        <span style={{ fontSize: 20 }}>{achievement.icon}</span>
                        <Text
                          strong
                          style={{
                            color: achievement.unlocked ? "#52c41a" : "#8c8c8c",
                          }}
                        >
                          {achievement.title}
                        </Text>
                      </Space>
                      {achievement.unlocked ? (
                        <Badge
                          count="✓"
                          style={{ backgroundColor: "#52c41a" }}
                        />
                      ) : (
                        <Badge
                          count={`${achievement.progress || 0}%`}
                          style={{ backgroundColor: "#faad14" }}
                        />
                      )}
                    </div>

                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {achievement.description}
                    </Text>

                    {!achievement.unlocked &&
                      achievement.progress !== undefined && (
                        <div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              marginBottom: 4,
                            }}
                          >
                            <Text type="secondary" style={{ fontSize: 11 }}>
                              Progress
                            </Text>
                            <Text type="secondary" style={{ fontSize: 11 }}>
                              {achievement.requirement}
                            </Text>
                          </div>
                          <div
                            style={{
                              width: "100%",
                              backgroundColor: "#f0f0f0",
                              borderRadius: 4,
                              height: 6,
                            }}
                          >
                            <div
                              style={{
                                width: `${achievement.progress}%`,
                                backgroundColor: "#1890ff",
                                borderRadius: 4,
                                height: 6,
                              }}
                            />
                          </div>
                        </div>
                      )}

                    {achievement.unlocked && achievement.unlock_date && (
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        🎉 Diraih pada:{" "}
                        {dayjs(achievement.unlock_date).format("DD MMM YYYY")}
                      </Text>
                    )}
                  </Space>
                </Card>
              ))}
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default GroupActivities;
