import React, { createContext, useContext, useEffect, useState } from "react";
import { WS_URL } from "../api";

const OnlineStatusContext = createContext();

export const OnlineStatusProvider = ({ children }) => {
  const [userStatuses, setUserStatuses] = useState({});
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const maxReconnectAttempts = 5;

  useEffect(() => {
    let ws = null;
    let reconnectTimeout = null;

    const connectWebSocket = () => {
      // Jangan reconnect jika sudah terlalu banyak attempts
      if (connectionAttempts >= maxReconnectAttempts) {
        console.log(
          `❌ Max reconnection attempts (${maxReconnectAttempts}) reached. Stopping.`
        );
        return;
      }

      try {
        console.log(
          `🔌 Attempting to connect to WebSocket... (attempt ${
            connectionAttempts + 1
          })`
        );
        ws = new WebSocket(`${WS_URL}/user-status/`);

        ws.onopen = () => {
          console.log("✅ WebSocket connected successfully!");
          setSocket(ws);
          setIsConnected(true);
          setConnectionAttempts(0); // Reset attempts on successful connection
          window.userStatusSocket = ws;
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);

            if (data.type === "user_status_update") {
              setUserStatuses((prev) => ({
                ...prev,
                [data.user_id]: {
                  is_online: data.is_online,
                  last_activity: data.last_activity,
                },
              }));
            }
          } catch (e) {
            console.error("❌ Error parsing WebSocket message:", e);
          }
        };

        ws.onclose = (event) => {
          console.log(
            "📪 WebSocket disconnected, code:",
            event.code,
            "reason:",
            event.reason
          );
          setSocket(null);
          setIsConnected(false);
          window.userStatusSocket = null;

          // Auto-reconnect dengan backoff
          if (
            event.code !== 1000 &&
            connectionAttempts < maxReconnectAttempts
          ) {
            const delay = Math.min(
              1000 * Math.pow(2, connectionAttempts),
              10000
            ); // Exponential backoff, max 10s
            console.log(
              `🔄 Will attempt to reconnect in ${
                delay / 1000
              } seconds... (attempt ${connectionAttempts + 1})`
            );

            reconnectTimeout = setTimeout(() => {
              setConnectionAttempts((prev) => prev + 1);
              connectWebSocket();
            }, delay);
          }
        };

        ws.onerror = (error) => {
          console.error("❌ WebSocket error:", error);
          setIsConnected(false);
        };
      } catch (error) {
        console.error("❌ WebSocket connection failed:", error);
        setIsConnected(false);
      }
    };

    // Start connection
    connectWebSocket();

    // Cleanup
    return () => {
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (ws && ws.readyState === WebSocket.OPEN)
        ws.close(1000, "Component unmounting");
      if (window.userStatusSocket) window.userStatusSocket = null;
    };
  }, [connectionAttempts, maxReconnectAttempts]);

  const isUserOnline = (userData) => {
    // Check real-time status first
    const realtimeStatus = userStatuses[userData.id];
    if (realtimeStatus !== undefined) {
      if (!realtimeStatus.last_activity) return false;
      const lastActivity = new Date(realtimeStatus.last_activity);
      const now = new Date();
      const diffMinutes = (now - lastActivity) / (1000 * 60);
      return realtimeStatus.is_online && diffMinutes <= 5;
    }

    // Fallback to userData from API
    if (!userData.last_activity) return false;
    const lastActivity = new Date(userData.last_activity);
    const now = new Date();
    const diffMinutes = (now - lastActivity) / (1000 * 60);
    return userData.is_online && diffMinutes <= 5;
  };

  const value = {
    userStatuses,
    isUserOnline,
    socket,
    isConnected,
    connectionAttempts,
  };

  return (
    <OnlineStatusContext.Provider value={value}>
      {children}
    </OnlineStatusContext.Provider>
  );
};

export const useOnlineStatus = () => {
  const context = useContext(OnlineStatusContext);
  if (!context) {
    throw new Error("useOnlineStatus must be used within OnlineStatusProvider");
  }
  return context;
};
