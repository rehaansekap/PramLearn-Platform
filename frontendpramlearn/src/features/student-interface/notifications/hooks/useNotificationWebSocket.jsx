import { useEffect, useRef, useState, useContext } from "react";
import { AuthContext } from "../../../../context/AuthContext";
import { notification } from "antd";
import { WS_URL } from "../../../../api";

const useNotificationWebSocket = (onNotificationReceived) => {
  const { user, token } = useContext(AuthContext);
  const wsRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const maxReconnectAttempts = 5;

  const connect = () => {
    if (!user || !token) return;

    try {
      const wsUrl = `${WS_URL}/notifications/${user.id}/?token=${token}`;
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log("📢 Notification WebSocket connected");
        setConnected(true);
        setReconnectAttempts(0);
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("📢 Notification received:", data);

          if (data.type === "notification") {
            // Add to notifications list
            if (onNotificationReceived) {
              onNotificationReceived(data.notification);
            }

            // Show browser notification
            showBrowserNotification(data.notification);
          }
        } catch (error) {
          console.error("Error parsing notification message:", error);
        }
      };

      wsRef.current.onclose = (event) => {
        console.log("📢 Notification WebSocket disconnected", event.code);
        setConnected(false);

        // Attempt reconnection
        if (reconnectAttempts < maxReconnectAttempts) {
          const timeout = Math.pow(2, reconnectAttempts) * 1000; // Exponential backoff
          setTimeout(() => {
            setReconnectAttempts((prev) => prev + 1);
            connect();
          }, timeout);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error("📢 Notification WebSocket error:", error);
        setConnected(false);
      };
    } catch (error) {
      console.error("Error connecting to notification WebSocket:", error);
    }
  };

  const disconnect = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
      setConnected(false);
    }
  };

  const showBrowserNotification = (notificationData) => {
    // Show Ant Design notification
    notification.open({
      message: notificationData.title,
      description: notificationData.message,
      type: getNotificationType(notificationData.type),
      placement: "topRight",
      duration: 5,
    });

    // Request browser notification permission and show
    if ("Notification" in window) {
      if (Notification.permission === "granted") {
        new Notification(notificationData.title, {
          body: notificationData.message,
          icon: "/favicon.ico",
        });
      } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then((permission) => {
          if (permission === "granted") {
            new Notification(notificationData.title, {
              body: notificationData.message,
              icon: "/favicon.ico",
            });
          }
        });
      }
    }
  };

  const getNotificationType = (type) => {
    switch (type) {
      case "grade":
        return "success";
      case "deadline":
        return "warning";
      case "announcement":
        return "info";
      case "error":
        return "error";
      default:
        return "info";
    }
  };

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [user, token]);

  return {
    connected,
    reconnectAttempts,
    disconnect,
  };
};

export default useNotificationWebSocket;
