import React from "react";
import { List, Typography, Space, Avatar, Tag, Empty, Spin, Card } from "antd";
import {
  UserOutlined,
  CalendarOutlined,
  NotificationOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const { Title, Text, Paragraph } = Typography;

const AnnouncementList = ({ announcements, loading }) => {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "red";
      case "medium":
        return "orange";
      case "low":
        return "green";
      default:
        return "default";
    }
  };

  const getPriorityText = (priority) => {
    switch (priority) {
      case "high":
        return "High Priority";
      case "medium":
        return "Medium Priority";
      case "low":
        return "Low Priority";
      default:
        return "Normal";
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "40px 0" }}>
        <Spin size="large" />
        <p style={{ marginTop: 16, color: "#666" }}>Loading announcements...</p>
      </div>
    );
  }

  if (announcements.length === 0) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description="No announcements available"
        style={{ padding: "40px 0" }}
      />
    );
  }

  return (
    <div>
      {/* Header Info */}
      <Card
        size="small"
        style={{ marginBottom: 16, backgroundColor: "#f6faff" }}
      >
        <Space>
          <NotificationOutlined style={{ color: "#1890ff" }} />
          <Text type="secondary">
            Latest announcements from your teachers and administrators
          </Text>
        </Space>
      </Card>

      {/* Announcements List */}
      <List
        dataSource={announcements}
        renderItem={(announcement) => (
          <Card
            style={{
              marginBottom: 16,
              borderLeft:
                announcement.priority === "high"
                  ? "4px solid #ff4d4f"
                  : announcement.priority === "medium"
                  ? "4px solid #faad14"
                  : "4px solid #52c41a",
            }}
          >
            <List.Item>
              <List.Item.Meta
                avatar={
                  <Avatar
                    size="large"
                    icon={<UserOutlined />}
                    style={{ backgroundColor: "#1890ff" }}
                  />
                }
                title={
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <Title level={4} style={{ margin: 0, color: "#11418b" }}>
                        {announcement.title}
                      </Title>
                      <Space style={{ marginTop: 4 }}>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          By: {announcement.author_name || "Administrator"}
                        </Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          •
                        </Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          <CalendarOutlined style={{ marginRight: 4 }} />
                          {dayjs(announcement.created_at).format(
                            "MMM DD, YYYY"
                          )}
                        </Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          ({dayjs(announcement.created_at).fromNow()})
                        </Text>
                      </Space>
                    </div>
                    <Space>
                      {announcement.priority && (
                        <Tag color={getPriorityColor(announcement.priority)}>
                          {getPriorityText(announcement.priority)}
                        </Tag>
                      )}
                      {announcement.target_audience && (
                        <Tag color="blue">{announcement.target_audience}</Tag>
                      )}
                    </Space>
                  </div>
                }
                description={
                  <div style={{ marginTop: 12 }}>
                    <Paragraph
                      style={{
                        fontSize: 14,
                        lineHeight: "22px",
                        margin: 0,
                      }}
                    >
                      {announcement.content}
                    </Paragraph>

                    {announcement.attachments &&
                      announcement.attachments.length > 0 && (
                        <div style={{ marginTop: 12 }}>
                          <Text strong style={{ fontSize: 12 }}>
                            Attachments:
                          </Text>
                          <div style={{ marginTop: 4 }}>
                            {announcement.attachments.map(
                              (attachment, index) => (
                                <Tag
                                  key={index}
                                  color="blue"
                                  style={{
                                    margin: "2px 4px 2px 0",
                                    cursor: "pointer",
                                  }}
                                  onClick={() =>
                                    window.open(attachment.url, "_blank")
                                  }
                                >
                                  📎 {attachment.name}
                                </Tag>
                              )
                            )}
                          </div>
                        </div>
                      )}

                    {announcement.deadline && (
                      <div
                        style={{
                          marginTop: 12,
                          padding: 8,
                          backgroundColor: "#fff2e8",
                          borderRadius: 4,
                          border: "1px solid #faad14",
                        }}
                      >
                        <Text type="warning" style={{ fontSize: 12 }}>
                          ⏰ Important Deadline:{" "}
                          {dayjs(announcement.deadline).format(
                            "MMM DD, YYYY HH:mm"
                          )}
                        </Text>
                      </div>
                    )}
                  </div>
                }
              />
            </List.Item>
          </Card>
        )}
      />
    </div>
  );
};

export default AnnouncementList;
