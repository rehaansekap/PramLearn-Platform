import React from "react";
import {
  List,
  Typography,
  Space,
  Button,
  Tag,
  Empty,
  Spin,
  Tooltip,
  Popconfirm,
} from "antd";
import { CheckOutlined, DeleteOutlined, EyeOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const { Text } = Typography;

const NotificationList = ({
  notifications,
  loading,
  onMarkAsRead,
  onDelete,
}) => {
  const getNotificationIcon = (type) => {
    switch (type) {
      case "grade":
        return "🎯";
      case "deadline":
        return "⏰";
      case "announcement":
        return "📢";
      case "quiz":
        return "📝";
      case "assignment":
        return "📋";
      default:
        return "ℹ️";
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "grade":
        return "green";
      case "deadline":
        return "orange";
      case "announcement":
        return "blue";
      case "quiz":
        return "purple";
      case "assignment":
        return "cyan";
      default:
        return "default";
    }
  };

  const getTypeName = (type) => {
    switch (type) {
      case "grade":
        return "Grade";
      case "deadline":
        return "Deadline";
      case "announcement":
        return "Announcement";
      case "quiz":
        return "Quiz";
      case "assignment":
        return "Assignment";
      default:
        return "Notification";
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.is_read) {
      onMarkAsRead(notification.id);
    }

    // Handle navigation
    if (notification.related_url) {
      window.location.href = notification.related_url;
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "40px 0" }}>
        <Spin size="large" />
        <p style={{ marginTop: 16, color: "#666" }}>Loading notifications...</p>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description="No notifications found"
        style={{ padding: "40px 0" }}
      />
    );
  }

  return (
    <List
      dataSource={notifications}
      renderItem={(notification) => (
        <List.Item
          style={{
            padding: "16px 0",
            borderLeft: notification.is_read ? "none" : "4px solid #1890ff",
            paddingLeft: notification.is_read ? 0 : 12,
            backgroundColor: notification.is_read ? "transparent" : "#fafafa",
            borderRadius: notification.is_read ? 0 : 8,
            marginBottom: 8,
          }}
          actions={[
            <Tooltip title="View details">
              <Button
                type="text"
                size="small"
                icon={<EyeOutlined />}
                onClick={() => handleNotificationClick(notification)}
              />
            </Tooltip>,
            !notification.is_read && (
              <Tooltip title="Mark as read">
                <Button
                  type="text"
                  size="small"
                  icon={<CheckOutlined />}
                  onClick={() => onMarkAsRead(notification.id)}
                />
              </Tooltip>
            ),
            <Popconfirm
              title="Delete this notification?"
              onConfirm={() => onDelete(notification.id)}
              okText="Yes"
              cancelText="No"
            >
              <Tooltip title="Delete">
                <Button
                  type="text"
                  size="small"
                  icon={<DeleteOutlined />}
                  danger
                />
              </Tooltip>
            </Popconfirm>,
          ].filter(Boolean)}
        >
          <List.Item.Meta
            avatar={
              <div
                style={{
                  fontSize: 24,
                  width: 40,
                  height: 40,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#f5f5f5",
                  borderRadius: "50%",
                }}
              >
                {getNotificationIcon(notification.type)}
              </div>
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
                  <Text
                    strong={!notification.is_read}
                    style={{
                      fontSize: 16,
                      cursor: "pointer",
                    }}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    {notification.title}
                  </Text>
                  <div style={{ marginTop: 4 }}>
                    <Tag color={getTypeColor(notification.type)} size="small">
                      {getTypeName(notification.type)}
                    </Tag>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {dayjs(notification.created_at).format(
                        "MMM DD, YYYY HH:mm"
                      )}
                    </Text>
                    <Text
                      type="secondary"
                      style={{ fontSize: 12, marginLeft: 8 }}
                    >
                      ({dayjs(notification.created_at).fromNow()})
                    </Text>
                  </div>
                </div>
                {!notification.is_read && (
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      backgroundColor: "#1890ff",
                      borderRadius: "50%",
                      marginLeft: 12,
                      marginTop: 4,
                    }}
                  />
                )}
              </div>
            }
            description={
              <div style={{ marginTop: 8 }}>
                <Text
                  style={{
                    fontSize: 14,
                    lineHeight: "20px",
                    color: "#666",
                  }}
                >
                  {notification.message}
                </Text>
                {notification.deadline && (
                  <div style={{ marginTop: 8 }}>
                    <Text type="warning" style={{ fontSize: 12 }}>
                      ⏰ Due:{" "}
                      {dayjs(notification.deadline).format(
                        "MMM DD, YYYY HH:mm"
                      )}
                    </Text>
                  </div>
                )}
              </div>
            }
          />
        </List.Item>
      )}
    />
  );
};

export default NotificationList;
