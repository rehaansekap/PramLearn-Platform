import React, { useState, useRef, useEffect, useContext } from "react";
import {
  Card,
  List,
  Input,
  Button,
  Avatar,
  Space,
  Typography,
  Badge,
  Tag,
  Spin,
  Alert,
  Divider,
  Tooltip,
  Row,
  Col,
  Collapse,
} from "antd";
import {
  SendOutlined,
  UserOutlined,
  TeamOutlined,
  WifiOutlined,
  DisconnectOutlined,
  MessageOutlined,
  DownOutlined,
  UpOutlined,
} from "@ant-design/icons";
import { AuthContext } from "../../../../../context/AuthContext";
import useGroupChat from "../../hooks/useGroupChat";
import { useOnlineStatus } from "../../../../../context/OnlineStatusContext";
import moment from "moment";

const { Text } = Typography;
const { TextArea } = Input;
const { Panel } = Collapse;

const GroupChatTab = ({ materialSlug }) => {
  const { user } = useContext(AuthContext);
  const [messageText, setMessageText] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [membersCollapsed, setMembersCollapsed] = useState(true);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const textAreaRef = useRef(null);
  const { isUserOnline, forceUpdate } = useOnlineStatus();

  useEffect(() => {}, [forceUpdate]);

  // Responsive handler
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Ref untuk prevent multiple initializations
  const initializedRef = useRef(false);

  const {
    loading,
    groupInfo,
    members,
    messages,
    wsConnected,
    typingUsers,
    onlineUsers,
    sendMessage,
    handleTyping,
  } = useGroupChat(materialSlug);

  // PERBAIKAN: Debug logs dengan rate limiting
  useEffect(() => {
    if (!initializedRef.current) {
      console.log("🔍 GroupChatTab initialized:", {
        user: user?.id,
        username: user?.username,
        materialSlug,
      });
      initializedRef.current = true;
    }
  }, [user?.id, user?.username, materialSlug]);

  // Auto scroll to bottom when new messages arrive - DIPERBAIKI
  useEffect(() => {
    if (messages.length > 0 && messagesEndRef.current) {
      // Menggunakan scrollIntoView dengan behavior smooth dan block: "end"
      messagesEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
        inline: "nearest",
      });
    }
  }, [messages.length]);

  function getUserColor(senderId) {
    // Palet warna pastel terang dan vivid, tidak gelap
    const colors = [
      "#ffd6e0",
      "#ffe7a9",
      "#b7eaff",
      "#caffbf",
      "#ffd6a5",
      "#d0bfff",
      "#f9c6c9",
      "#f7f7b6",
      "#b5ead7",
      "#f3c6e0",
      "#c2f0fc",
      "#fff1ba",
      "#e2f0cb",
      "#f1cbff",
      "#ffb7b2",
      "#b5b9ff",
      "#ffe5b4",
      "#baffc9",
    ];
    if (!senderId) return "#f5f5f5";
    const idx = Math.abs(Number(senderId)) % colors.length;
    return colors[idx];
  }

  // Fungsi agar teks selalu kontras dengan background
  function getUserTextColor(bgColor) {
    function luminance(hex) {
      hex = hex.replace("#", "");
      const r = parseInt(hex.substr(0, 2), 16) / 255;
      const g = parseInt(hex.substr(2, 2), 16) / 255;
      const b = parseInt(hex.substr(4, 2), 16) / 255;
      return 0.299 * r + 0.587 * g + 0.114 * b;
    }
    return luminance(bgColor) > 0.7 ? "#11418b" : "#222";
  }

  const isUserOnlineInChat = (member) => {
    if (onlineUsers.has(member.student_id)) {
      return true;
    }
    return isUserOnline(member);
  };

  // Handle send message
  const handleSendMessage = async () => {
    if (!messageText.trim()) return;

    await sendMessage(messageText);
    setMessageText("");
    textAreaRef.current?.focus();
  };

  // Handle key press
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    } else {
      handleTyping();
    }
  };

  // Get typing users display
  const getTypingDisplay = () => {
    const typingUsersList = Array.from(typingUsers)
      .map((userId) => members.find((m) => m.student_id === userId))
      .filter(Boolean)
      .filter((member) => member.student_id !== user?.id);

    if (typingUsersList.length === 0) return null;

    const names = typingUsersList.map(
      (m) => m.student_name || m.student_username
    );
    return `${names.join(", ")} sedang mengetik...`;
  };

  if (loading) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: isMobile ? "40px 16px" : "60px 0",
        }}
      >
        <Spin size="large" tip="Memuat chat kelompok..." />
      </div>
    );
  }

  if (!groupInfo) {
    return (
      <Alert
        message="Tidak dalam Kelompok"
        description="Anda belum terdaftar dalam kelompok untuk materi ini."
        type="warning"
        showIcon
        style={{
          margin: isMobile ? "16px 0" : "24px 0",
          borderRadius: 12,
        }}
      />
    );
  }

  // Members List Component untuk Mobile
  const MembersList = () => (
    <div
      style={{
        backgroundColor: "#fafafa",
        padding: isMobile ? "12px" : "16px",
        borderBottom: "1px solid #f0f0f0",
      }}
    >
      <Collapse
        ghost
        activeKey={membersCollapsed ? [] : ["members"]}
        onChange={() => setMembersCollapsed(!membersCollapsed)}
        expandIcon={({ isActive }) =>
          isActive ? <UpOutlined /> : <DownOutlined />
        }
      >
        <Panel
          header={
            <Space>
              <TeamOutlined style={{ color: "#1890ff" }} />
              <Text strong>Anggota Kelompok</Text>
              <Badge count={members.length} />
            </Space>
          }
          key="members"
        >
          <div
            style={{
              maxHeight: isMobile ? "150px" : "200px",
              overflowY: "auto",
              padding: "8px 0",
            }}
          >
            <List
              dataSource={members}
              renderItem={(member) => {
                const isOnline = isUserOnlineInChat(member);
                const isCurrentUser = member.is_current_user;

                return (
                  <List.Item
                    style={{
                      padding: isMobile ? "8px 0" : "6px 0",
                      border: "none",
                    }}
                  >
                    <Space size="small" style={{ width: "100%" }}>
                      <Badge status={isOnline ? "success" : "default"} dot>
                        <Avatar
                          size={isMobile ? "small" : "small"}
                          icon={<UserOutlined />}
                          style={{
                            backgroundColor: isCurrentUser
                              ? "#1890ff"
                              : "#f5f5f5",
                            color: isCurrentUser ? "white" : "#999",
                          }}
                        />
                      </Badge>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div>
                          <Text
                            strong={isCurrentUser}
                            style={{
                              fontSize: isMobile ? 13 : 14,
                              display: "block",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {member.student_name || member.student_username}
                          </Text>
                        </div>
                        <Text
                          type="secondary"
                          style={{ fontSize: isMobile ? 11 : 12 }}
                        >
                          {isOnline ? "Online" : "Offline"}
                        </Text>
                      </div>
                      {isCurrentUser && (
                        <Tag color="blue" size="small">
                          Anda
                        </Tag>
                      )}
                    </Space>
                  </List.Item>
                );
              }}
            />
          </div>
        </Panel>
      </Collapse>
    </div>
  );

  return (
    <div
      style={{
        height: isMobile ? "calc(100vh - 200px)" : "600px",
        display: "flex",
        flexDirection: "column",
        padding: isMobile ? "0 8px" : 0,
      }}
    >
      {/* Header - Responsive */}
      <Card
        size="small"
        style={{
          marginBottom: isMobile ? 12 : 16,
          borderRadius: isMobile ? 8 : 12,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
        bodyStyle={{
          padding: isMobile ? "12px 16px" : "16px 24px",
        }}
      >
        <Row justify="space-between" align="middle">
          <Col flex="auto">
            <Space size={isMobile ? "small" : "middle"}>
              <TeamOutlined
                style={{
                  color: "#1890ff",
                  fontSize: isMobile ? 16 : 18,
                }}
              />
              <div>
                <Text strong style={{ fontSize: isMobile ? 14 : 16 }}>
                  {groupInfo.name}
                </Text>
                <br />
                <Text type="secondary" style={{ fontSize: isMobile ? 11 : 12 }}>
                  Kode: {groupInfo.code}
                </Text>
              </div>
            </Space>
          </Col>

          <Col>
            <Space size={isMobile ? "small" : "middle"}>
              {/* Connection Status */}
              <Space size={4}>
                {wsConnected ? (
                  <WifiOutlined
                    style={{
                      color: "#52c41a",
                      fontSize: isMobile ? 14 : 16,
                    }}
                  />
                ) : (
                  <DisconnectOutlined
                    style={{
                      color: "#ff4d4f",
                      fontSize: isMobile ? 14 : 16,
                    }}
                  />
                )}
                <Text
                  style={{
                    color: wsConnected ? "#52c41a" : "#ff4d4f",
                    fontSize: isMobile ? 11 : 12,
                  }}
                >
                  {wsConnected ? "Terhubung" : "Terputus"}
                </Text>
              </Space>
            </Space>
          </Col>
        </Row>
      </Card>

      <div
        style={{
          display: "flex",
          gap: isMobile ? 0 : 16,
          flex: 1,
          flexDirection: isMobile ? "column" : "row",
        }}
      >
        {/* Chat Messages - Full width on mobile */}
        <Card
          title={
            <Space>
              <MessageOutlined style={{ color: "#722ed1" }} />
              <span style={{ fontSize: isMobile ? 14 : 16 }}>
                Chat Kelompok
              </span>
            </Space>
          }
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            borderRadius: isMobile ? 8 : 12,
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
          bodyStyle={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            padding: 0,
          }}
          headStyle={{
            padding: isMobile ? "12px 16px" : "16px 24px",
            minHeight: "auto",
          }}
        >
          {/* Members List - Mobile Only */}
          {isMobile && <MembersList />}

          {/* Messages List */}
          <div
            ref={messagesContainerRef}
            style={{
              flex: 1,
              overflow: "auto",
              padding: isMobile ? "12px" : "16px",
              maxHeight: isMobile ? "calc(100vh - 400px)" : "350px",
              // PERBAIKAN: Tambahkan scroll-behavior untuk smooth scrolling
              scrollBehavior: "smooth",
            }}
          >
            {messages.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  color: "#999",
                  padding: isMobile ? "20px 0" : "40px 0",
                }}
              >
                <MessageOutlined
                  style={{
                    fontSize: isMobile ? 20 : 24,
                    marginBottom: isMobile ? 6 : 8,
                  }}
                />
                <br />
                <Text style={{ fontSize: isMobile ? 13 : 14 }}>
                  Belum ada pesan. Mulai percakapan!
                </Text>
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <div
                    key={`${message.id}-${message.created_at}`}
                    style={{
                      marginBottom: isMobile ? 10 : 12,
                      display: "flex",
                      justifyContent: message.is_current_user
                        ? "flex-end"
                        : "flex-start",
                    }}
                  >
                    <div
                      style={{
                        maxWidth: isMobile ? "85%" : "70%",
                        padding: isMobile ? "8px 10px" : "8px 12px",
                        borderRadius: isMobile ? 10 : 12,
                        backgroundColor: message.is_current_user
                          ? "#1890ff"
                          : getUserColor(message.sender_id),
                        color: message.is_current_user ? "white" : "black",
                        position: "relative",
                        fontSize: isMobile ? 14 : 15,
                      }}
                    >
                      {!message.is_current_user && (
                        <Text
                          strong
                          style={{
                            fontSize: isMobile ? 11 : 12,
                            color: "#1890ff",
                            textAlign: "left",
                            display: "block",
                          }}
                        >
                          {message.sender_name || message.sender_username}
                        </Text>
                      )}
                      <div
                        style={{
                          marginTop: !message.is_current_user ? 4 : 0,
                          textAlign: "justify",
                          lineHeight: isMobile ? 1.4 : 1.5,
                        }}
                      >
                        {message.message}
                      </div>
                      <div
                        style={{
                          fontSize: isMobile ? 9 : 10,
                          opacity: 0.7,
                          marginTop: 4,
                          textAlign: message.is_current_user ? "right" : "left",
                        }}
                      >
                        {moment(message.created_at).format("HH:mm")}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Typing Indicator */}
          {getTypingDisplay() && (
            <div
              style={{
                padding: isMobile ? "6px 12px" : "8px 16px",
                fontSize: isMobile ? 11 : 12,
                color: "#999",
                fontStyle: "italic",
                borderTop: "1px solid #f0f0f0",
              }}
            >
              {getTypingDisplay()}
            </div>
          )}

          {/* Message Input - Responsive */}
          <div
            style={{
              padding: isMobile ? 12 : 16,
              borderTop: "1px solid #f0f0f0",
              backgroundColor: "#fafafa",
            }}
          >
            <Space.Compact style={{ width: "100%" }}>
              <TextArea
                ref={textAreaRef}
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ketik pesan..."
                rows={isMobile ? 1 : 2}
                style={{
                  resize: "none",
                  fontSize: isMobile ? 14 : 15,
                }}
                disabled={!wsConnected}
                autoSize={{ minRows: 1, maxRows: isMobile ? 3 : 4 }}
              />
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={handleSendMessage}
                disabled={!messageText.trim() || !wsConnected}
                style={{
                  height: "auto",
                  minHeight: isMobile ? 36 : 40,
                  padding: isMobile ? "8px 12px" : "8px 16px",
                }}
              >
                {isMobile ? "" : "Kirim"}
              </Button>
            </Space.Compact>
          </div>
        </Card>

        {/* Members Sidebar - Desktop only */}
        {!isMobile && (
          <Card
            title={
              <Space>
                <UserOutlined style={{ color: "#1890ff" }} />
                <span>Anggota Kelompok</span>
                <Badge count={members.length} />
              </Space>
            }
            style={{
              width: 280,
              borderRadius: 12,
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          >
            <List
              dataSource={members}
              renderItem={(member) => {
                const isOnline = isUserOnlineInChat(member);
                const isCurrentUser = member.is_current_user;

                return (
                  <List.Item style={{ padding: "8px 0" }}>
                    <Space>
                      <Badge status={isOnline ? "success" : "default"} dot>
                        <Avatar
                          size="small"
                          icon={<UserOutlined />}
                          style={{
                            backgroundColor: isCurrentUser
                              ? "#1890ff"
                              : "#f5f5f5",
                            color: isCurrentUser ? "white" : "#999",
                          }}
                        />
                      </Badge>
                      <div style={{ flex: 1 }}>
                        <div>
                          <Text strong={isCurrentUser} style={{ fontSize: 14 }}>
                            {member.student_name || member.student_username}
                          </Text>
                          {isCurrentUser && (
                            <Tag
                              color="blue"
                              size="small"
                              style={{ marginLeft: 4 }}
                            >
                              Anda
                            </Tag>
                          )}
                        </div>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {isOnline ? "Online" : "Offline"}
                        </Text>
                      </div>
                    </Space>
                  </List.Item>
                );
              }}
            />
          </Card>
        )}
      </div>
    </div>
  );
};

export default GroupChatTab;
