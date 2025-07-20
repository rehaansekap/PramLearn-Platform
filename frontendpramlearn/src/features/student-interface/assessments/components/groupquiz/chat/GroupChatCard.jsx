import React, { useState, useRef, useEffect } from "react";
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
  Tooltip,
  Collapse,
} from "antd";
import {
  SendOutlined,
  UserOutlined,
  TeamOutlined,
  WifiOutlined,
  DisconnectOutlined,
  CloseOutlined,
  DownOutlined,
  UpOutlined,
} from "@ant-design/icons";
import moment from "moment";

const { Text, Title } = Typography;
const { TextArea } = Input;
const { Panel } = Collapse;

const GroupChatCard = ({
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
  closing,
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

  if (loading) {
    return (
      <Card
        style={{
          position: "fixed",
          bottom: 100,
          right: 24,
          width: 400,
          height: 600,
          zIndex: 1001,
          borderRadius: 16,
          boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
        }}
        bodyStyle={{
          padding: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
        }}
      >
        <Spin size="large" tip="Memuat chat kelompok..." />
      </Card>
    );
  }

  if (!groupInfo) {
    return (
      <Card
        style={{
          position: "fixed",
          bottom: 100,
          right: 24,
          width: 400,
          height: 600,
          zIndex: 1001,
          borderRadius: 16,
          boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
        }}
        bodyStyle={{ padding: 16 }}
      >
        <Alert
          message="Anda belum terdaftar dalam kelompok"
          description="Silakan hubungi guru untuk pendaftaran kelompok."
          type="warning"
          showIcon
        />
      </Card>
    );
  }

  return (
    <Card
      style={{
        position: "fixed",
        bottom: 100,
        right: 24,
        width: 400,
        height: 600,
        zIndex: 1001,
        borderRadius: 16,
        boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
        overflow: "hidden",
        transition:
          "transform 0.35s cubic-bezier(.4,0,.2,1), opacity 0.35s cubic-bezier(.4,0,.2,1)",
        transform: closing ? "scale(0.8)" : "scale(1)",
        opacity: closing ? 0 : 1,
        pointerEvents: closing ? "none" : "auto",
        display: "flex",
        flexDirection: "column",
      }}
      bodyStyle={{
        padding: 0,
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: "linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)",
          padding: "16px 20px",
          color: "white",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -20,
            left: -20,
            width: 60,
            height: 60,
            borderRadius: "50%",
            background: "rgba(255, 255, 255, 0.1)",
          }}
        />

        <div style={{ position: "relative", zIndex: 1 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <Title level={5} style={{ color: "white", margin: 0 }}>
                <TeamOutlined style={{ marginRight: 8 }} />
                {groupInfo.name}
              </Title>
              <Space style={{ marginTop: 4 }}>
                {wsConnected ? (
                  <WifiOutlined style={{ color: "rgba(255, 255, 255, 0.9)" }} />
                ) : (
                  <DisconnectOutlined
                    style={{ color: "rgba(255, 255, 255, 0.9)" }}
                  />
                )}
                <Text
                  style={{ color: "rgba(255, 255, 255, 0.9)", fontSize: 12 }}
                >
                  {wsConnected ? "Terhubung" : "Terputus"}
                </Text>
              </Space>
            </div>
            <Button
              type="text"
              icon={<CloseOutlined />}
              onClick={onClose}
              style={{
                color: "white",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                background: "rgba(255, 255, 255, 0.1)",
              }}
              size="small"
            />
          </div>
        </div>
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
                maxHeight: "120px",
                overflowY: "auto",
                padding: "8px 0",
              }}
            >
              <List
                dataSource={members}
                renderItem={(member) => (
                  <List.Item style={{ padding: "4px 8px", border: "none" }}>
                    <List.Item.Meta
                      avatar={
                        <Badge
                          status={
                            isUserOnlineInChat(member) ? "success" : "default"
                          }
                          dot
                        >
                          <Avatar size="small" icon={<UserOutlined />} />
                        </Badge>
                      }
                      title={
                        <Space>
                          <Text
                            strong={member.is_current_user}
                            style={{ fontSize: 13 }}
                          >
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
                        <Text type="secondary" style={{ fontSize: 11 }}>
                          {isUserOnlineInChat(member) ? "Online" : "Offline"}
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
          height: "calc(100% - 200px)",
          background: "#f5f5f5",
          marginBottom: "auto",
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
                      : "flex-start", // ← ini kunci
                  }}
                >
                  <div
                    style={{
                      maxWidth: "70%",
                      background: message.is_current_user ? "#f5222d" : "#fff",
                      color: message.is_current_user ? "#fff" : "#000",
                      padding: "12px 16px",
                      borderRadius: message.is_current_user
                        ? "18px 18px 4px 18px"
                        : "18px 18px 18px 4px",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                      wordBreak: "break-word",
                      textAlign: "left", // ← pastikan text rata kiri
                    }}
                  >
                    {!message.is_current_user && (
                      <div
                        style={{
                          fontSize: 11,
                          color: "#f5222d",
                          marginBottom: 4,
                        }}
                      >
                        {message.sender_name || message.sender_username}
                      </div>
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
              minHeight: 32,
            }}
          />
        </Space.Compact>
      </div>
    </Card>
  );
};

export default GroupChatCard;
