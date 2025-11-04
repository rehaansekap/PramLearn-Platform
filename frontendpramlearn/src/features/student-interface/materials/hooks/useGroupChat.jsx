import { useState, useEffect, useRef, useCallback, useContext } from "react";
import { message } from "antd";
import { AuthContext } from "../../../../context/AuthContext";
import { useOnlineStatus } from "../../../../context/OnlineStatusContext";
import api, { WS_URL } from "../../../../api";

const useGroupChat = (materialSlug) => {
  const { token, user } = useContext(AuthContext);
  const { isUserOnline, forceUpdate } = useOnlineStatus();
  const [loading, setLoading] = useState(true);
  const [groupInfo, setGroupInfo] = useState(null);
  const [members, setMembers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [wsConnected, setWsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [onlineUsers, setOnlineUsers] = useState(new Set());

  // Refs untuk cleanup dan prevent duplicate execution
  const wsRef = useRef(null);
  const mountedRef = useRef(true);
  const typingTimeoutRef = useRef(null);
  const pendingMessagesRef = useRef(new Set());
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 3; // Kurangi dari 5 ke 3

  // Flag untuk prevent duplicate initialization
  const initializeRef = useRef(false);
  const dataFetchedRef = useRef(false);

  // Fetch initial data - gunakan useCallback dengan dependencies yang minimal
  const fetchGroupChat = useCallback(async () => {
    if (!materialSlug || !token || dataFetchedRef.current) return;

    try {
      setLoading(true);
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      const response = await api.get(`student/group-chat/${materialSlug}/`);
      const data = response.data;

      if (mountedRef.current) {
        setGroupInfo(data.group_info);
        setMembers(data.members);

        const processedMessages = data.messages.map((msg) => ({
          ...msg,
          is_current_user: msg.sender_id === user?.id,
        }));
        setMessages(processedMessages);

        const initialOnlineUsers = new Set(
          data.members
            .filter((member) => isUserOnline(member))
            .map((member) => member.student_id)
        );
        setOnlineUsers(initialOnlineUsers);

        // Mark data as fetched
        dataFetchedRef.current = true;
      }
    } catch (error) {
      console.error("Error fetching group chat:", error);
      if (mountedRef.current) {
        message.error("Gagal memuat data chat kelompok");
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [materialSlug, token]); // Hapus dependencies yang tidak perlu

  // Connect to WebSocket dengan improved reconnection logic
  const connectWebSocket = useCallback(() => {
    if (!materialSlug || !token || wsRef.current) return;

    try {
      const wsUrl = `${WS_URL}/group-chat/${materialSlug}/?token=${token}`;
      console.log("🔗 Connecting to group chat WebSocket:", wsUrl);

      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        if (mountedRef.current) {
          console.log("✅ Group chat WebSocket connected");
          setWsConnected(true);
          reconnectAttemptsRef.current = 0;
        }
      };

      wsRef.current.onmessage = (event) => {
        if (!mountedRef.current) return;

        try {
          const data = JSON.parse(event.data);
          console.log("📨 Group chat message received:", data);

          switch (data.type) {
            case "pong":
              console.log("💓 Received pong from group chat server");
              break;

            case "chat_message":
              const newMessage = data.message;

              if (pendingMessagesRef.current.has(newMessage.id)) {
                console.log(
                  "⚠️ Skipping duplicate message from WebSocket:",
                  newMessage.id
                );
                pendingMessagesRef.current.delete(newMessage.id);
                return;
              }

              if (newMessage.sender_id !== user?.id) {
                setMessages((prev) => {
                  const exists = prev.some((msg) => msg.id === newMessage.id);
                  if (exists) return prev;

                  const messageWithCorrectFlag = {
                    ...newMessage,
                    is_current_user: newMessage.sender_id === user?.id,
                  };

                  return [...prev, messageWithCorrectFlag];
                });
              }
              break;

            case "user_status":
              if (data.status === "joined") {
                setOnlineUsers((prev) => new Set([...prev, data.user_id]));
                // Update members list juga
                setMembers((prevMembers) =>
                  prevMembers.map((member) =>
                    member.student_id === data.user_id
                      ? {
                          ...member,
                          is_online: true,
                          last_activity: new Date().toISOString(),
                        }
                      : member
                  )
                );
                if (data.user_id !== user?.id) {
                  message.success(`${data.username} bergabung ke chat`, 2);
                }
              } else if (data.status === "left") {
                setOnlineUsers((prev) => {
                  const newSet = new Set(prev);
                  newSet.delete(data.user_id);
                  return newSet;
                });
                // Update members list juga
                setMembers((prevMembers) =>
                  prevMembers.map((member) =>
                    member.student_id === data.user_id
                      ? {
                          ...member,
                          is_online: false,
                          last_activity: new Date().toISOString(),
                        }
                      : member
                  )
                );
                if (data.user_id !== user?.id) {
                  message.info(`${data.username} meninggalkan chat`, 2);
                }
              }
              break;

            case "typing_indicator":
              if (data.is_typing) {
                setTypingUsers((prev) => new Set([...prev, data.user_id]));
              } else {
                setTypingUsers((prev) => {
                  const newSet = new Set(prev);
                  newSet.delete(data.user_id);
                  return newSet;
                });
              }
              break;

            default:
              console.log("❓ Unknown group chat message type:", data.type);
          }
        } catch (error) {
          console.error("❌ Error parsing group chat message:", error);
        }
      };

      wsRef.current.onclose = (event) => {
        if (mountedRef.current) {
          console.log(
            "🔌 Group chat WebSocket disconnected:",
            event.code,
            event.reason
          );
          setWsConnected(false);

          // PERBAIKAN: Lebih restrictive reconnection
          const shouldReconnect =
            event.code !== 1000 && // Normal closure
            event.code !== 1001 && // Going away
            event.code !== 1005 && // No status received
            event.code !== 4000 && // Custom close codes
            mountedRef.current &&
            reconnectAttemptsRef.current < maxReconnectAttempts;

          if (shouldReconnect) {
            reconnectAttemptsRef.current += 1;
            const delay = Math.min(5000 * reconnectAttemptsRef.current, 15000); // Lebih lambat

            console.log(
              `🔄 Attempting to reconnect in ${
                delay / 1000
              } seconds... (attempt ${
                reconnectAttemptsRef.current
              }/${maxReconnectAttempts})`
            );

            if (reconnectTimeoutRef.current) {
              clearTimeout(reconnectTimeoutRef.current);
            }

            reconnectTimeoutRef.current = setTimeout(() => {
              if (mountedRef.current && !wsRef.current) {
                connectWebSocket();
              }
            }, delay);
          } else if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
            console.log("❌ Max reconnection attempts reached.");
            message.warning(
              "Koneksi chat terputus. Silakan refresh halaman jika diperlukan."
            );
          }
        }
      };

      wsRef.current.onerror = (error) => {
        console.error("❌ Group chat WebSocket error:", error);
        if (mountedRef.current) {
          setWsConnected(false);
        }
      };
    } catch (error) {
      console.error("❌ Error creating group chat WebSocket:", error);
    }
  }, [materialSlug, token]); // Hapus user?.id dari dependencies

  // Send message
  const sendMessage = useCallback(
    async (messageText) => {
      if (!messageText.trim() || !materialSlug) return;

      try {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        const response = await api.post(`student/group-chat/${materialSlug}/`, {
          message: messageText.trim(),
        });

        const newMessage = response.data;
        pendingMessagesRef.current.add(newMessage.id);

        setMessages((prev) => {
          const exists = prev.some((msg) => msg.id === newMessage.id);
          if (exists) return prev;

          const messageWithCorrectFlag = {
            ...newMessage,
            is_current_user: true,
            sender_id: user?.id,
          };

          return [...prev, messageWithCorrectFlag];
        });

        setTimeout(() => {
          pendingMessagesRef.current.delete(newMessage.id);
        }, 5000);
      } catch (error) {
        console.error("Error sending message:", error);
        message.error("Gagal mengirim pesan");
      }
    },
    [materialSlug, token, user?.id]
  );

  // Send typing indicator
  const sendTyping = useCallback((isTyping) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: "typing",
          is_typing: isTyping,
        })
      );
    }
  }, []);

  // Handle typing with debounce
  const handleTyping = useCallback(() => {
    sendTyping(true);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      sendTyping(false);
    }, 1000);
  }, [sendTyping]);

  useEffect(() => {
    // Update online users berdasarkan OnlineStatusContext
    if (members.length > 0) {
      const updatedOnlineUsers = new Set(
        members
          .filter((member) => isUserOnline(member))
          .map((member) => member.student_id)
      );
      setOnlineUsers(updatedOnlineUsers);
    }
  }, [members, forceUpdate, isUserOnline]);

  // PERBAIKAN: Initialize hanya sekali
  useEffect(() => {
    // Prevent double execution in React StrictMode
    if (initializeRef.current || !materialSlug) {
      return;
    }

    initializeRef.current = true;
    mountedRef.current = true;
    dataFetchedRef.current = false;

    console.log("🚀 Initializing useGroupChat for", materialSlug);

    // Fetch data with delay to prevent StrictMode issues
    const fetchTimer = setTimeout(() => {
      if (mountedRef.current) {
        fetchGroupChat();
      }
    }, 100);

    return () => {
      clearTimeout(fetchTimer);
      mountedRef.current = false;
    };
  }, [materialSlug]); // Hanya materialSlug sebagai dependency

  // PERBAIKAN: Connect WebSocket setelah data loaded, tetapi hanya sekali
  useEffect(() => {
    if (!loading && groupInfo && mountedRef.current && !wsRef.current) {
      console.log("🔗 Starting WebSocket connection...");

      const wsTimer = setTimeout(() => {
        if (mountedRef.current && !wsRef.current) {
          connectWebSocket();
        }
      }, 500); // Delay lebih lama

      return () => {
        clearTimeout(wsTimer);
      };
    }
  }, [loading, groupInfo]); // Hapus connectWebSocket dari dependencies

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log("🧹 Cleaning up useGroupChat...");

      // Close WebSocket
      if (wsRef.current) {
        wsRef.current.close(1000); // Normal closure
        wsRef.current = null;
      }

      // Clear timeouts
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Reset flags
      mountedRef.current = false;
      initializeRef.current = false;
      dataFetchedRef.current = false;
    };
  }, []);

  // PERBAIKAN: Heartbeat dengan rate limiting
  useEffect(() => {
    if (!wsConnected) return;

    const interval = setInterval(() => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: "ping" }));
        console.log("💓 Sending heartbeat ping");
      }
    }, 60000); // Kurangi frequency ke 60 detik

    return () => clearInterval(interval);
  }, [wsConnected]);

  useEffect(() => {
    const handleGlobalUserStatus = (event) => {
      const { user_id, is_online, last_activity } = event.detail;

      // Update members data
      setMembers((prevMembers) =>
        prevMembers.map((member) =>
          member.student_id === user_id
            ? { ...member, is_online, last_activity }
            : member
        )
      );

      // Update online users set
      setOnlineUsers((prev) => {
        const newSet = new Set(prev);
        if (is_online) {
          newSet.add(user_id);
        } else {
          newSet.delete(user_id);
        }
        return newSet;
      });
    };

    window.addEventListener("userStatusUpdate", handleGlobalUserStatus);

    return () => {
      window.removeEventListener("userStatusUpdate", handleGlobalUserStatus);
    };
  }, []);

  const manualRefresh = useCallback(async () => {
    console.log("🔄 Manual refresh triggered");

    // Reset data fetched flag to allow refetch
    dataFetchedRef.current = false;

    // Clear current data
    setMessages([]);
    setMembers([]);
    setGroupInfo(null);

    // Refetch data
    await fetchGroupChat();
  }, [fetchGroupChat]);

  // Force reconnect function
  const forceReconnect = useCallback(() => {
    console.log("🔌 Force reconnect triggered");

    // Close existing connection
    if (wsRef.current) {
      wsRef.current.close(1000);
      wsRef.current = null;
    }

    // Reset connection state
    setWsConnected(false);
    reconnectAttemptsRef.current = 0;

    // Clear any pending reconnection
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    // Reconnect after a short delay
    setTimeout(() => {
      if (mountedRef.current) {
        connectWebSocket();
      }
    }, 1000);
  }, [connectWebSocket]);

  return {
    loading,
    groupInfo,
    members,
    messages,
    wsConnected,
    typingUsers,
    onlineUsers,
    sendMessage,
    handleTyping,
    isUserOnline,
    manualRefresh,
    forceReconnect,
  };
};

export default useGroupChat;
