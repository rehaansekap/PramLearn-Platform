import React, { useState, useRef, useEffect } from "react";
import {
  Drawer,
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
  Collapse,
} from "antd";
import {
  SendOutlined,
  UserOutlined,
  TeamOutlined,
  WifiOutlined,
  DisconnectOutlined,
  DownOutlined,
  UpOutlined,
} from "@ant-design/icons";
import moment from "moment";

const { Text, Title } = Typography;
const { TextArea } = Input;
const { Panel } = Collapse;

const GroupChatDrawer = ({
  open,
  onClose,
  loading,
  groupInfo,
  members,
  messages,
  wsConnected,
  typingUsers,
  onlineUsers,
  sendMessage,
  handleTyping,
  user,
  isUserOnline,
}) => {
  const [messageText, setMessageText] = useState("");
  const [membersCollapsed, setMembersCollapsed] = useState(true);
  const messagesEndRef = useRef(null);
  const textAreaRef = useRef(null);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0 && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
        inline: "nearest",
      });
    }
  }, [messages.length]);

  const getUserColor = (senderId) => {
    const colors = [
      "#1890ff",
      "#52c41a",
      "#faad14",
      "#f5222d",
      "#722ed1",
      "#13c2c2",
      "#eb2f96",
      "#fa541c",
      "#a0d911",
      "#2f54eb",
    ];
    return colors[senderId % colors.length];
  };

  const getUserTextColor = (bgColor) => {
    return "#ffffff";
  };

  const isUserOnlineInChat = (member) => {
    return onlineUsers.has(member.student_id) || isUserOnline(member);
  };

  const handleSendMessage = async () => {
    if (!messageText.trim()) return;
    try {
      await sendMessage(messageText);
      setMessageText("");
      if (textAreaRef.current) {
        textAreaRef.current.focus();
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    } else {
      handleTyping();
    }
  };

  const getTypingDisplay = () => {
    const typingArray = Array.from(typingUsers);
    const otherTypingUsers = typingArray.filter((id) => id !== user?.id);

    if (otherTypingUsers.length === 0) return null;

    const typingMembers = members.filter((m) =>
      otherTypingUsers.includes(m.student_id)
    );

    if (typingMembers.length === 1) {
      return `${typingMembers[0].student_name} sedang mengetik...`;
    } else if (typingMembers.length > 1) {
      return `${typingMembers.length} orang sedang mengetik...`;
    }
    return null;
  };

  return (
    <Drawer
      title={null}
      placement="bottom"
      height="80vh"
      open={open}
      onClose={onClose}
      closable={false}
      headerStyle={{ display: "none" }}
      bodyStyle={{
        padding: 0,
        background: "#f5f5f5",
      }}
      style={{
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        overflow: "hidden",
      }}
    >
      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <Spin size="large" tip="Memuat chat kelompok..." />
        </div>
      ) : !groupInfo ? (
        <div style={{ padding: 16 }}>
          <Alert
            message="Anda belum terdaftar dalam kelompok"
            description="Silakan hubungi guru untuk pendaftaran kelompok."
            type="warning"
            showIcon
          />
        </div>
      ) : (
        <>
          {/* Header */}
          <div
            style={{
              background: "linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)",
              padding: "20px 16px 16px",
              color: "white",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: -30,
                right: -30,
                width: 80,
                height: 80,
                borderRadius: "50%",
                background: "rgba(255, 255, 255, 0.1)",
              }}
            />

            <div
              style={{ position: "relative", zIndex: 1, textAlign: "center" }}
            >
              <Title level={4} style={{ color: "white", margin: 0 }}>
                <TeamOutlined style={{ marginRight: 8 }} />
                {groupInfo.name}
              </Title>
              <Space style={{ marginTop: 8 }}>
                {wsConnected ? (
                  <WifiOutlined style={{ color: "rgba(255, 255, 255, 0.9)" }} />
                ) : (
                  <DisconnectOutlined
                    style={{ color: "rgba(255, 255, 255, 0.9)" }}
                  />
                )}
                <Text style={{ color: "rgba(255, 255, 255, 0.9)" }}>
                  {wsConnected ? "Terhubung Real-time" : "Koneksi Terputus"}
                </Text>
              </Space>
            </div>

            {/* Handle bar */}
            <div
              style={{
                position: "absolute",
                top: 8,
                left: "50%",
                transform: "translateX(-50%)",
                width: 40,
                height: 4,
                borderRadius: 2,
                background: "rgba(255, 255, 255, 0.5)",
              }}
            />
          </div>

          {/* Members List */}
          <div
            style={{
              backgroundColor: "#fafafa",
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
                    maxHeight: "150px",
                    overflowY: "auto",
                    padding: "8px 0",
                  }}
                >
                  <List
                    dataSource={members}
                    renderItem={(member) => (
                      <List.Item
                        style={{ padding: "8px 12px", border: "none" }}
                      >
                        <List.Item.Meta
                          avatar={
                            <Badge
                              status={
                                isUserOnlineInChat(member)
                                  ? "success"
                                  : "default"
                              }
                              dot
                            >
                              <Avatar icon={<UserOutlined />} />
                            </Badge>
                          }
                          title={
                            <Space>
                              <Text strong={member.is_current_user}>
                                {member.student_name || member.student_username}
                              </Text>
                              {member.is_current_user && (
                                <Tag color="blue" size="small">
                                  Anda
                                </Tag>
                              )}
                            </Space>
                          }
                          description={
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              {isUserOnlineInChat(member)
                                ? "Online"
                                : "Offline"}
                            </Text>
                          }
                        />
                      </List.Item>
                    )}
                  />
                </div>
              </Panel>
            </Collapse>
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "16px",
              height: "calc(80vh - 280px)",
              background: "#f5f5f5",
            }}
          >
            {messages.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 20px" }}>
                <Text type="secondary">Belum ada pesan. Mulai percakapan!</Text>
              </div>
            ) : (
              <List
                dataSource={messages}
                renderItem={(message) => (
                  <List.Item style={{ padding: "8px 0", border: "none" }}>
                    <div
                      style={{
                        width: "100%",
                        display: "flex",
                        justifyContent: message.is_current_user
                          ? "flex-end"
                          : "flex-start",
                      }}
                    >
                      <div
                        style={{
                          maxWidth: "80%",
                          background: message.is_current_user
                            ? getUserColor(message.sender_id)
                            : "#ffffff",
                          color: message.is_current_user
                            ? getUserTextColor(getUserColor(message.sender_id))
                            : "#000000",
                          padding: "12px 16px",
                          borderRadius: message.is_current_user
                            ? "18px 18px 4px 18px"
                            : "18px 18px 18px 4px",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                          wordBreak: "break-word",
                        }}
                      >
                        {!message.is_current_user && (
                          <Text
                            strong
                            style={{
                              fontSize: 11,
                              color: getUserColor(message.sender_id),
                              display: "block",
                              marginBottom: 4,
                            }}
                          >
                            {message.sender_name || message.sender_username}
                          </Text>
                        )}
                        <div style={{ fontSize: 14 }}>{message.message}</div>
                        <div
                          style={{
                            fontSize: 10,
                            opacity: 0.7,
                            textAlign: "right",
                            marginTop: 4,
                          }}
                        >
                          {moment(message.created_at).format("HH:mm")}
                        </div>
                      </div>
                    </div>
                  </List.Item>
                )}
              />
            )}
            <div ref={messagesEndRef} />

            {/* Typing indicator */}
            {getTypingDisplay() && (
              <div style={{ padding: "8px 0" }}>
                <Text
                  type="secondary"
                  style={{ fontSize: 12, fontStyle: "italic" }}
                >
                  {getTypingDisplay()}
                </Text>
              </div>
            )}
          </div>

          {/* Input */}
          <div
            style={{
              padding: "16px",
              background: "white",
              borderTop: "1px solid #f0f0f0",
              position: "sticky",
              bottom: 0,
            }}
          >
            <Space.Compact style={{ width: "100%" }}>
              <TextArea
                ref={textAreaRef}
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ketik pesan..."
                autoSize={{ minRows: 1, maxRows: 3 }}
                style={{
                  borderRadius: "20px 0 0 20px",
                  resize: "none",
                }}
              />
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={handleSendMessage}
                disabled={!messageText.trim()}
                style={{
                  borderRadius: "0 20px 20px 0",
                  height: "auto",
                  minHeight: 40,
                }}
                size="large"
              />
            </Space.Compact>
          </div>
        </>
      )}
    </Drawer>
  );
};

export default GroupChatDrawer;
