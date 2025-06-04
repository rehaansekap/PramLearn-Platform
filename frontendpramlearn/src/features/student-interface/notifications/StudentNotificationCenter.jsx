import React, { useState } from "react";
import {
  Card,
  Tabs,
  Typography,
  Space,
  Button,
  Input,
  Select,
  Row,
  Col,
} from "antd";
import {
  BellOutlined,
  SettingOutlined,
  SearchOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import NotificationList from "./components/NotificationList";
import AnnouncementList from "./components/AnnouncementList";
import NotificationSettings from "./components/NotificationSettings";
import CommunicationHub from "./components/CommunicationHub";
import useStudentNotifications from "./hooks/useStudentNotifications";
import useNotificationWebSocket from "./hooks/useNotificationWebSocket";

const { Title } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

const StudentNotificationCenter = () => {
  const [activeTab, setActiveTab] = useState("notifications");
  const [searchText, setSearchText] = useState("");
  const [filterType, setFilterType] = useState("all");

  const {
    notifications,
    announcements,
    notificationSettings,
    loading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    updateNotificationSettings,
    deleteNotification,
    addNotification,
  } = useStudentNotifications();

  // WebSocket connection for real-time notifications
  useNotificationWebSocket(addNotification);

  // Filter notifications based on search and type
  const filteredNotifications = notifications.filter((notification) => {
    const matchesSearch =
      notification.title.toLowerCase().includes(searchText.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchText.toLowerCase());

    const matchesType =
      filterType === "all" || notification.type === filterType;

    return matchesSearch && matchesType;
  });

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: 16 }}>
      {/* Header */}
      <div style={{ marginBottom: 24, textAlign: "center" }}>
        <Title level={2} style={{ color: "#11418b", marginBottom: 8 }}>
          <BellOutlined style={{ marginRight: 8 }} />
          Notification Center
        </Title>
        <Typography.Text type="secondary">
          Stay updated with all your learning activities and announcements
        </Typography.Text>
      </div>

      {/* Filters */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={16} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Input
              placeholder="Search notifications..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              style={{ width: "100%" }}
              placeholder="Filter by type"
              value={filterType}
              onChange={setFilterType}
            >
              <Option value="all">All Types</Option>
              <Option value="grade">Grades</Option>
              <Option value="deadline">Deadlines</Option>
              <Option value="announcement">Announcements</Option>
              <Option value="quiz">Quizzes</Option>
              <Option value="assignment">Assignments</Option>
            </Select>
          </Col>
          <Col xs={24} sm={24} md={10}>
            <Space style={{ float: "right" }}>
              <Typography.Text type="secondary">
                {unreadCount} unread
              </Typography.Text>
              {unreadCount > 0 && (
                <Button size="small" onClick={markAllAsRead}>
                  Mark all as read
                </Button>
              )}
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Tabs */}
      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          size="large"
          tabBarExtraContent={
            <Space>
              <Typography.Text type="secondary">
                Last updated: just now
              </Typography.Text>
            </Space>
          }
        >
          <TabPane
            tab={
              <Space>
                <BellOutlined />
                Notifications
                {unreadCount > 0 && (
                  <span
                    style={{
                      backgroundColor: "#ff4d4f",
                      color: "white",
                      borderRadius: "50%",
                      padding: "2px 6px",
                      fontSize: "11px",
                      minWidth: "18px",
                      textAlign: "center",
                    }}
                  >
                    {unreadCount}
                  </span>
                )}
              </Space>
            }
            key="notifications"
          >
            <NotificationList
              notifications={filteredNotifications}
              loading={loading}
              onMarkAsRead={markAsRead}
              onDelete={deleteNotification}
            />
          </TabPane>

          <TabPane tab={<Space>📢 Announcements</Space>} key="announcements">
            <AnnouncementList announcements={announcements} loading={loading} />
          </TabPane>

          <TabPane tab={<Space>💬 Messages</Space>} key="communication">
            <CommunicationHub />
          </TabPane>

          <TabPane
            tab={
              <Space>
                <SettingOutlined />
                Settings
              </Space>
            }
            key="settings"
          >
            <NotificationSettings
              settings={notificationSettings}
              onUpdateSettings={updateNotificationSettings}
            />
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default StudentNotificationCenter;
