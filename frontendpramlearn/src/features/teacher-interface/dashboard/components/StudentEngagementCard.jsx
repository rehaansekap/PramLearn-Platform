import React from "react";
import {
  Card,
  Row,
  Col,
  Progress,
  Typography,
  Space,
  Avatar,
  List,
  Tag,
  Tooltip,
  Empty,
  Spin,
} from "antd";
import {
  UserOutlined,
  FireOutlined,
  ClockCircleOutlined,
  TrophyOutlined,
  BookOutlined,
  MessageOutlined,
  HeartOutlined,
  StarOutlined,
  RiseOutlined,
  TeamOutlined,
  FileTextOutlined,
} from "@ant-design/icons";

const { Text, Title } = Typography;

const StudentEngagementCard = ({ engagement, loading }) => {
  const getEngagementColor = (level) => {
    if (level >= 80) return "#52c41a";
    if (level >= 60) return "#faad14";
    if (level >= 40) return "#fa8c16";
    return "#ff4d4f";
  };

  const getEngagementLabel = (level) => {
    if (level >= 80) return "Sangat Aktif";
    if (level >= 60) return "Aktif";
    if (level >= 40) return "Cukup Aktif";
    return "Kurang Aktif";
  };

  const getActivityIcon = (type) => {
    const iconMap = {
      quiz_completed: <TrophyOutlined style={{ color: "#faad14" }} />,
      material_accessed: <BookOutlined style={{ color: "#1677ff" }} />,
      assignment_submitted: <FileTextOutlined style={{ color: "#52c41a" }} />,
      discussion_participated: <MessageOutlined style={{ color: "#722ed1" }} />,
      collaboration: <TeamOutlined style={{ color: "#13c2c2" }} />,
    };
    return iconMap[type] || <UserOutlined style={{ color: "#8c8c8c" }} />;
  };

  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return "Tidak diketahui";
    const now = new Date();
    const time = new Date(timestamp);
    const diffHours = (now - time) / (1000 * 60 * 60);

    if (diffHours < 1) return "Baru saja";
    if (diffHours < 24) return `${Math.floor(diffHours)} jam lalu`;
    if (diffHours < 48) return "Kemarin";
    return time.toLocaleDateString("id-ID", { day: "2-digit", month: "short" });
  };

  if (loading) {
    return (
      <Card
        title={
          <Space>
            <FireOutlined style={{ color: "#11418b" }} />
            <Text strong style={{ color: "#11418b" }}>
              Keterlibatan Siswa
            </Text>
          </Space>
        }
        style={{
          borderRadius: 16,
          marginBottom: 16,
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <Spin size="large" tip="Memuat data keterlibatan..." />
        </div>
      </Card>
    );
  }

  if (!engagement) {
    return (
      <Card
        title={
          <Space>
            <FireOutlined style={{ color: "#11418b" }} />
            <Text strong style={{ color: "#11418b" }}>
              Keterlibatan Siswa
            </Text>
          </Space>
        }
        style={{
          borderRadius: 16,
          marginBottom: 16,
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Data keterlibatan tidak tersedia"
          style={{ padding: "40px 0" }}
        />
      </Card>
    );
  }

  const {
    overall_engagement = 0,
    most_active_students = [],
    recent_activities = [],
    engagement_trends = {},
    weekly_stats = {},
  } = engagement;

  return (
    <Card
      title={
        <Space>
          <FireOutlined style={{ color: "#11418b" }} />
          <Text strong style={{ color: "#11418b" }}>
            Keterlibatan Siswa
          </Text>
        </Space>
      }
      style={{
        borderRadius: 16,
        marginBottom: 16,
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      }}
      bodyStyle={{ padding: "16px" }}
    >
      {/* Overall Engagement */}
      <div
        style={{
          background: `linear-gradient(135deg, ${getEngagementColor(
            overall_engagement
          )}15 0%, ${getEngagementColor(overall_engagement)}05 100%)`,
          borderRadius: 12,
          padding: 16,
          marginBottom: 16,
          border: `1px solid ${getEngagementColor(overall_engagement)}30`,
        }}
      >
        <Row align="middle" gutter={16}>
          <Col flex="auto">
            <Space direction="vertical" size={4} style={{ width: "100%" }}>
              <Text style={{ fontSize: 12, color: "#666" }}>
                Tingkat Keterlibatan Keseluruhan
              </Text>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Progress
                  type="circle"
                  percent={overall_engagement}
                  size={60}
                  strokeColor={getEngagementColor(overall_engagement)}
                  format={(percent) => (
                    <span style={{ fontSize: 12, fontWeight: 600 }}>
                      {percent}%
                    </span>
                  )}
                />
                <div>
                  <Text
                    strong
                    style={{
                      fontSize: 16,
                      color: getEngagementColor(overall_engagement),
                      display: "block",
                    }}
                  >
                    {getEngagementLabel(overall_engagement)}
                  </Text>
                  <Space size={4}>
                    <RiseOutlined style={{ color: "#52c41a", fontSize: 12 }} />
                    <Text style={{ fontSize: 11, color: "#52c41a" }}>
                      +{engagement_trends.weekly_change || 0}% minggu ini
                    </Text>
                  </Space>
                </div>
              </div>
            </Space>
          </Col>
        </Row>
      </div>

      {/* Weekly Stats */}
      <Row gutter={8} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <div
            style={{
              textAlign: "center",
              padding: "12px 8px",
              background: "#f0f7ff",
              borderRadius: 8,
              border: "1px solid #d6e4ff",
            }}
          >
            <div style={{ fontSize: 18, fontWeight: "bold", color: "#1677ff" }}>
              {weekly_stats.active_students || 0}
            </div>
            <Text style={{ fontSize: 11, color: "#666" }}>Siswa Aktif</Text>
          </div>
        </Col>
        <Col span={8}>
          <div
            style={{
              textAlign: "center",
              padding: "12px 8px",
              background: "#f6ffed",
              borderRadius: 8,
              border: "1px solid #b7eb8f",
            }}
          >
            <div style={{ fontSize: 18, fontWeight: "bold", color: "#52c41a" }}>
              {weekly_stats.total_interactions || 0}
            </div>
            <Text style={{ fontSize: 11, color: "#666" }}>Interaksi</Text>
          </div>
        </Col>
        <Col span={8}>
          <div
            style={{
              textAlign: "center",
              padding: "12px 8px",
              background: "#fff7e6",
              borderRadius: 8,
              border: "1px solid #ffd591",
            }}
          >
            <div style={{ fontSize: 18, fontWeight: "bold", color: "#fa8c16" }}>
              {weekly_stats.avg_session_time || 0}m
            </div>
            <Text style={{ fontSize: 11, color: "#666" }}>Rata-rata</Text>
          </div>
        </Col>
      </Row>

      {/* Most Active Students */}
      <div style={{ marginBottom: 16 }}>
        <Text
          strong
          style={{
            fontSize: 13,
            color: "#333",
            display: "block",
            marginBottom: 8,
          }}
        >
          <StarOutlined style={{ color: "#faad14", marginRight: 4 }} />
          Siswa Paling Aktif
        </Text>

        {most_active_students && most_active_students.length > 0 ? (
          <List
            size="small"
            dataSource={most_active_students.slice(0, 3)}
            renderItem={(student, index) => (
              <List.Item
                style={{
                  padding: "8px 12px",
                  background: index === 0 ? "#fff7e6" : "#fafafa",
                  borderRadius: 8,
                  marginBottom: 4,
                  border: `1px solid ${index === 0 ? "#ffd591" : "#f0f0f0"}`,
                }}
              >
                <List.Item.Meta
                  avatar={
                    <div style={{ position: "relative" }}>
                      <Avatar
                        size={32}
                        icon={<UserOutlined />}
                        style={{
                          backgroundColor: index === 0 ? "#faad14" : "#1677ff",
                          color: "white",
                        }}
                      />
                      {index === 0 && (
                        <div
                          style={{
                            position: "absolute",
                            top: -4,
                            right: -4,
                            background: "#faad14",
                            borderRadius: "50%",
                            width: 16,
                            height: 16,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <TrophyOutlined
                            style={{ color: "white", fontSize: 10 }}
                          />
                        </div>
                      )}
                    </div>
                  }
                  title={
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Text strong style={{ fontSize: 12 }}>
                        {student.name || student.username}
                      </Text>
                      <Space size={4}>
                        <HeartOutlined
                          style={{ color: "#ff4d4f", fontSize: 10 }}
                        />
                        <Text style={{ fontSize: 11, color: "#666" }}>
                          {student.engagement_score || 0}%
                        </Text>
                      </Space>
                    </div>
                  }
                  description={
                    <Space size={12} wrap>
                      <Space size={4}>
                        <ClockCircleOutlined
                          style={{ fontSize: 10, color: "#999" }}
                        />
                        <Text style={{ fontSize: 10, color: "#999" }}>
                          {student.total_time_spent || 0}m
                        </Text>
                      </Space>
                      <Space size={4}>
                        <BookOutlined style={{ fontSize: 10, color: "#999" }} />
                        <Text style={{ fontSize: 10, color: "#999" }}>
                          {student.activities_count || 0} aktivitas
                        </Text>
                      </Space>
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        ) : (
          <div
            style={{
              textAlign: "center",
              padding: "16px",
              background: "#fafafa",
              borderRadius: 8,
              border: "1px dashed #d9d9d9",
            }}
          >
            <Text style={{ fontSize: 12, color: "#999" }}>
              Belum ada data aktivitas siswa
            </Text>
          </div>
        )}
      </div>

      {/* Recent Activities */}
      <div>
        <Text
          strong
          style={{
            fontSize: 13,
            color: "#333",
            display: "block",
            marginBottom: 8,
          }}
        >
          <FireOutlined style={{ color: "#ff4d4f", marginRight: 4 }} />
          Aktivitas Terbaru
        </Text>

        {recent_activities && recent_activities.length > 0 ? (
          <div style={{ maxHeight: 200, overflowY: "auto" }}>
            {recent_activities.slice(0, 5).map((activity, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "8px 12px",
                  background: "#fafafa",
                  borderRadius: 8,
                  marginBottom: 6,
                  border: "1px solid #f0f0f0",
                }}
              >
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    background: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "1px solid #f0f0f0",
                    flexShrink: 0,
                  }}
                >
                  {getActivityIcon(activity.type)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Text
                    style={{
                      fontSize: 12,
                      color: "#333",
                      display: "block",
                      lineHeight: 1.3,
                    }}
                    ellipsis
                  >
                    <Text strong>{activity.student_name}</Text>{" "}
                    {activity.description}
                  </Text>
                  <Text style={{ fontSize: 10, color: "#999" }}>
                    {formatTimeAgo(activity.timestamp)}
                  </Text>
                </div>
                {activity.score && (
                  <Tag
                    color={
                      activity.score >= 80
                        ? "green"
                        : activity.score >= 60
                        ? "orange"
                        : "red"
                    }
                    style={{ fontSize: 10, margin: 0 }}
                  >
                    {activity.score}
                  </Tag>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div
            style={{
              textAlign: "center",
              padding: "16px",
              background: "#fafafa",
              borderRadius: 8,
              border: "1px dashed #d9d9d9",
            }}
          >
            <Text style={{ fontSize: 12, color: "#999" }}>
              Belum ada aktivitas terbaru
            </Text>
          </div>
        )}
      </div>
    </Card>
  );
};

export default StudentEngagementCard;
