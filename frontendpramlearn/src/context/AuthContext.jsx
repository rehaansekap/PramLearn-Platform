import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import api from "../api";
import { useOnlineStatus } from "./OnlineStatusContext";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(null);
  const activityTimeout = useRef(null); // Tambahkan baris ini

  // Update activity dengan WebSocket notification
  const updateActivity = useCallback(async () => {
    if (token && user) {
      if (activityTimeout.current) clearTimeout(activityTimeout.current);
      activityTimeout.current = setTimeout(async () => {
        try {
          await api.patch(`users/me/`, {
            is_online: true,
            last_activity: new Date().toISOString(),
          });

          // Broadcast via WebSocket
          if (
            window.userStatusSocket &&
            window.userStatusSocket.readyState === WebSocket.OPEN
          ) {
            window.userStatusSocket.send(
              JSON.stringify({
                type: "user_activity_update",
                user_id: user.id,
                is_online: true,
                last_activity: new Date().toISOString(),
              })
            );
          }
        } catch (error) {
          console.error("❌ Error updating activity:", error);
        }
      }, 2000);
    }
  }, [token, user]);

  // Set offline dengan WebSocket notification
  const setOffline = useCallback(async () => {
    if (token && user) {
      try {
        await api.patch(`users/me/`, {
          is_online: false,
        });

        // Emit WebSocket event for real-time update
        if (
          window.userStatusSocket &&
          window.userStatusSocket.readyState === WebSocket.OPEN
        ) {
          window.userStatusSocket.send(
            JSON.stringify({
              type: "user_activity_update",
              user_id: user.id,
              is_online: false,
              last_activity: new Date().toISOString(),
            })
          );
        }
      } catch (error) {
        console.error("Error setting offline:", error);
      }
    }
  }, [token, user]);

  useEffect(() => {
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      api
        .get("users/me/")
        .then(async (res) => {
          setUser(res.data);
          // Set online saat login
          await api.patch(`users/me/`, {
            is_online: true,
            last_activity: new Date().toISOString(),
          });
        })
        .catch(() => setUser(null));
    } else {
      setUser(null);
    }
  }, [token]);

  // Interval updateActivity (misal setiap 1 menit)
  useEffect(() => {
    if (token && user) {
      const interval = setInterval(() => {
        updateActivity();
      }, 60000); // 1 menit
      return () => clearInterval(interval);
    }
  }, [token, user, updateActivity]);

  // Track user activity (mouse move, click, keyboard)
  useEffect(() => {
    if (token && user) {
      const handleActivity = () => updateActivity();

      window.addEventListener("mousemove", handleActivity);
      window.addEventListener("click", handleActivity);
      window.addEventListener("keypress", handleActivity);

      return () => {
        window.removeEventListener("mousemove", handleActivity);
        window.removeEventListener("click", handleActivity);
        window.removeEventListener("keypress", handleActivity);
        if (activityTimeout.current) clearTimeout(activityTimeout.current);
      };
    }
  }, [token, user, updateActivity]);

  // Set offline saat window close/unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (token && user) {
        // Gunakan sendBeacon untuk request yang reliable saat page unload
        const data = JSON.stringify({ is_online: false });
        const blob = new Blob([data], { type: "application/json" });
        navigator.sendBeacon("/api/users/me/", blob);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [token, user]);

  // Store socket reference globally for easy access
  useEffect(() => {
    return () => {
      if (window.userStatusSocket) {
        window.userStatusSocket = null;
      }
    };
  }, []);

  const login = async (username, password) => {
    try {
      const response = await api.post("login/", { username, password });
      setToken(response.data.access);
      localStorage.setItem("token", response.data.access);
      api.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${response.data.access}`;

      const userRes = await api.get("users/me/");
      setUser(userRes.data);

      // Set online status
      await api.patch(`users/me/`, {
        is_online: true,
        last_activity: new Date().toISOString(),
      });

      return userRes.data;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    console.log("🚪 Logging out user:", user?.username);

    // Set offline SEBELUM clear token dan user
    if (token && user) {
      try {
        // Update database
        await api.patch(`users/me/`, {
          is_online: false,
          last_activity: new Date().toISOString(),
        });

        // Broadcast via WebSocket untuk real-time update
        if (
          window.userStatusSocket &&
          window.userStatusSocket.readyState === WebSocket.OPEN
        ) {
          window.userStatusSocket.send(
            JSON.stringify({
              type: "user_activity_update",
              user_id: user.id,
              is_online: false,
              last_activity: new Date().toISOString(),
            })
          );
          console.log("📡 Sent offline status via WebSocket");
        }

        console.log("✅ Successfully set user offline");
      } catch (error) {
        console.error("❌ Error setting offline during logout:", error);
      }
    }

    // Clear local state SETELAH set offline
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    delete api.defaults.headers.common["Authorization"];

    // Clear timeout
    if (activityTimeout.current) {
      clearTimeout(activityTimeout.current);
    }
  };

  return (
    <AuthContext.Provider
      value={{ token, user, login, logout, updateActivity }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
