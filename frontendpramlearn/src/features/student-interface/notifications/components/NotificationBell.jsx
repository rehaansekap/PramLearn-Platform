import React, { useState } from "react";
import {
  Badge,
  Button,
  Dropdown,
  List,
  Typography,
  Empty,
  Spin,
  Space,
  Divider,
} from "antd";
import {
  BellOutlined,
  CheckOutlined,
  DeleteOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import useStudentNotifications from "../hooks/useStudentNotifications";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const { Text } = Typography;

const NotificationBell = ({ onOpenCenter }) => {
  const { notifications, loading, unreadCount, markAsRead, markAllAsRead } =
    useStudentNotifications();

  const [dropdownVisible, setDropdownVisible] = useState(false);

  // Get recent notifications (latest 5)
  const recentNotifications = notifications.slice(0, 5);

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

  const getNotificationColor = (type, isRead) => {
    if (isRead) return "#f5f5f5";

    switch (type) {
      case "grade":
        return "#f6ffed";
      case "deadline":
        return "#fff2e8";
      case "announcement":
        return "#e6f7ff";
      default:
        return "#fafafa";
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
    setDropdownVisible(false);

    // Handle navigation based on notification type
    if (notification.related_url) {
      window.location.href = notification.related_url;
    }
  };

  const dropdownContent = (
    <div style={{ width: 360, maxHeight: 400, overflow: "auto" }}>
      {/* Header */}
      <div
        style={{
          padding: "12px 16px",
          borderBottom: "1px solid #f0f0f0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text strong>Notifications</Text>
        <Space>
          {unreadCount > 0 && (
            <Button
              type="link"
              size="small"
              icon={<CheckOutlined />}
              onClick={markAllAsRead}
            >
              Mark all read
            </Button>
          )}
          <Button
            type="link"
            size="small"
            icon={<SettingOutlined />}
            onClick={() => {
              setDropdownVisible(false);
              onOpenCenter?.();
            }}
          >
            Settings
          </Button>
        </Space>
      </div>

      {/* Notifications List */}
      {loading ? (
        <div style={{ padding: 20, textAlign: "center" }}>
          <Spin />
        </div>
      ) : recentNotifications.length === 0 ? (
        <div style={{ padding: 20 }}>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="No notifications"
          />
        </div>
      ) : (
        <List
          dataSource={recentNotifications}
          renderItem={(notification) => (
            <List.Item
              style={{
                padding: "12px 16px",
                cursor: "pointer",
                backgroundColor: getNotificationColor(
                  notification.type,
                  notification.is_read
                ),
                borderLeft: notification.is_read ? "none" : "3px solid #1890ff",
              }}
              onClick={() => handleNotificationClick(notification)}
            >
              <List.Item.Meta
                avatar={
                  <span style={{ fontSize: 18 }}>
                    {getNotificationIcon(notification.type)}
                  </span>
                }
                title={
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <Text
                      strong={!notification.is_read}
                      style={{
                        fontSize: 13,
                        lineHeight: "18px",
                        flex: 1,
                      }}
                    >
                      {notification.title}
                    </Text>
                    {!notification.is_read && (
                      <div
                        style={{
                          width: 8,
                          height: 8,
                          backgroundColor: "#1890ff",
                          borderRadius: "50%",
                          marginLeft: 8,
                          marginTop: 2,
                        }}
                      />
                    )}
                  </div>
                }
                description={
                  <div>
                    <Text
                      type="secondary"
                      style={{
                        fontSize: 12,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {notification.message}
                    </Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 11 }}>
                      {dayjs(notification.created_at).fromNow()}
                    </Text>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      )}

      {/* Footer */}
      {recentNotifications.length > 0 && (
        <>
          <Divider style={{ margin: 0 }} />
          <div style={{ padding: "8px 16px", textAlign: "center" }}>
            <Button
              type="link"
              onClick={() => {
                setDropdownVisible(false);
                onOpenCenter?.();
              }}
            >
              View all notifications
            </Button>
          </div>
        </>
      )}
    </div>
  );

  return (
    <Dropdown
      overlay={dropdownContent}
      trigger={["click"]}
      placement="bottomRight"
      open={dropdownVisible}
      onOpenChange={setDropdownVisible}
    >
      <Badge count={unreadCount} size="small" offset={[-2, 2]}>
        <Button
          type="text"
          icon={<BellOutlined />}
          style={{
            border: "none",
            boxShadow: "none",
            color: "#666",
          }}
        />
      </Badge>
    </Dropdown>
  );
};

export default NotificationBell;
