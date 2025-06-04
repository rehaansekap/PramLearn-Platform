import { useState, useEffect, useContext } from "react";
import api from "../../../../api";
import { AuthContext } from "../../../../context/AuthContext";
import { message } from "antd";

const useStudentNotifications = () => {
  const { user, token } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [notificationSettings, setNotificationSettings] = useState({
    email_grades: true,
    email_deadlines: true,
    email_announcements: true,
    push_notifications: true,
    daily_digest: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!user || !token) return;

    setLoading(true);
    setError(null);

    try {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      const response = await api.get("student/notifications/");

      setNotifications(response.data.results || response.data || []);

      // Count unread notifications
      const unread = (response.data.results || response.data || []).filter(
        (notif) => !notif.is_read
      ).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch announcements
  const fetchAnnouncements = async () => {
    if (!user || !token) return;

    try {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      const response = await api.get("student/announcements/");
      setAnnouncements(response.data.results || response.data || []);
    } catch (error) {
      console.error("Error fetching announcements:", error);
    }
  };

  // Fetch notification settings
  const fetchNotificationSettings = async () => {
    if (!user || !token) return;

    try {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      const response = await api.get("student/notification-settings/");
      setNotificationSettings(response.data);
    } catch (error) {
      console.error("Error fetching notification settings:", error);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      await api.put(`student/notifications/${notificationId}/read/`);

      // Update local state
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === notificationId ? { ...notif, is_read: true } : notif
        )
      );

      // Update unread count
      setUnreadCount((prev) => Math.max(0, prev - 1));

      message.success("Notification marked as read");
    } catch (error) {
      console.error("Error marking notification as read:", error);
      message.error("Failed to mark notification as read");
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      await api.put("student/notifications/mark-all-read/");

      // Update local state
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, is_read: true }))
      );
      setUnreadCount(0);

      message.success("All notifications marked as read");
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      message.error("Failed to mark all notifications as read");
    }
  };

  // Update notification settings
  const updateNotificationSettings = async (settings) => {
    try {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      const response = await api.put(
        "student/notification-settings/",
        settings
      );
      setNotificationSettings(response.data);
      message.success("Notification settings updated");
    } catch (error) {
      console.error("Error updating notification settings:", error);
      message.error("Failed to update notification settings");
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId) => {
    try {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      await api.delete(`student/notifications/${notificationId}/`);

      // Update local state
      setNotifications((prev) =>
        prev.filter((notif) => notif.id !== notificationId)
      );

      message.success("Notification deleted");
    } catch (error) {
      console.error("Error deleting notification:", error);
      message.error("Failed to delete notification");
    }
  };

  // Add new notification (from WebSocket)
  const addNotification = (newNotification) => {
    setNotifications((prev) => [newNotification, ...prev]);
    setUnreadCount((prev) => prev + 1);
  };

  useEffect(() => {
    if (user && token) {
      fetchNotifications();
      fetchAnnouncements();
      fetchNotificationSettings();
    }
  }, [user, token]);

  return {
    notifications,
    announcements,
    notificationSettings,
    loading,
    error,
    unreadCount,
    fetchNotifications,
    fetchAnnouncements,
    markAsRead,
    markAllAsRead,
    updateNotificationSettings,
    deleteNotification,
    addNotification,
  };
};

export default useStudentNotifications;
