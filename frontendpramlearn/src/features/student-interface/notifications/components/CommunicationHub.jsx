import React, { useState } from "react";
import {
  Card,
  Typography,
  Space,
  Button,
  Empty,
  Avatar,
  List,
  Input,
  Modal,
  Form,
  Select,
  message,
} from "antd";
import {
  MessageOutlined,
  PlusOutlined,
  UserOutlined,
  SendOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const CommunicationHub = () => {
  const [messageModalVisible, setMessageModalVisible] = useState(false);
  const [form] = Form.useForm();

  // Mock data - replace with real data
  const conversations = [
    {
      id: 1,
      participants: ["Dr. Smith", "You"],
      lastMessage: "Your assignment has been graded. Please check...",
      timestamp: "2 hours ago",
      unreadCount: 1,
    },
    {
      id: 2,
      participants: ["Course Administrator", "You"],
      lastMessage: "Welcome to the new semester! Please review...",
      timestamp: "1 day ago",
      unreadCount: 0,
    },
  ];

  const teachers = [
    { id: 1, name: "Dr. Smith", subject: "Mathematics" },
    { id: 2, name: "Prof. Johnson", subject: "Physics" },
    { id: 3, name: "Dr. Williams", subject: "Chemistry" },
  ];

  const handleSendMessage = async (values) => {
    try {
      // API call to send message
      console.log("Sending message:", values);
      message.success("Message sent successfully!");
      form.resetFields();
      setMessageModalVisible(false);
    } catch (error) {
      message.error("Failed to send message");
    }
  };

  return (
    <div>
      {/* Header */}
      <Card
        size="small"
        style={{ marginBottom: 16, backgroundColor: "#f6faff" }}
      >
        <Space style={{ width: "100%", justifyContent: "space-between" }}>
          <Space>
            <MessageOutlined style={{ color: "#1890ff" }} />
            <Text type="secondary">
              Communicate with your teachers and get help when needed
            </Text>
          </Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setMessageModalVisible(true)}
          >
            New Message
          </Button>
        </Space>
      </Card>

      {/* Conversations */}
      {conversations.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="No conversations yet"
          style={{ padding: "40px 0" }}
        >
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setMessageModalVisible(true)}
          >
            Start a conversation
          </Button>
        </Empty>
      ) : (
        <List
          dataSource={conversations}
          renderItem={(conversation) => (
            <Card
              style={{
                marginBottom: 16,
                cursor: "pointer",
                border:
                  conversation.unreadCount > 0
                    ? "1px solid #1890ff"
                    : undefined,
              }}
              hoverable
            >
              <List.Item>
                <List.Item.Meta
                  avatar={
                    <Avatar
                      size="large"
                      icon={<UserOutlined />}
                      style={{ backgroundColor: "#52c41a" }}
                    />
                  }
                  title={
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Text strong={conversation.unreadCount > 0}>
                        {conversation.participants
                          .filter((p) => p !== "You")
                          .join(", ")}
                      </Text>
                      <Space>
                        {conversation.unreadCount > 0 && (
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
                            {conversation.unreadCount}
                          </span>
                        )}
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {conversation.timestamp}
                        </Text>
                      </Space>
                    </div>
                  }
                  description={
                    <Text
                      type="secondary"
                      style={{
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {conversation.lastMessage}
                    </Text>
                  }
                />
              </List.Item>
            </Card>
          )}
        />
      )}

      {/* New Message Modal */}
      <Modal
        title="Send New Message"
        open={messageModalVisible}
        onCancel={() => {
          setMessageModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSendMessage}>
          <Form.Item
            name="recipient"
            label="Send to"
            rules={[{ required: true, message: "Please select a recipient" }]}
          >
            <Select
              placeholder="Select teacher or administrator"
              showSearch
              filterOption={(input, option) =>
                option.children.toLowerCase().includes(input.toLowerCase())
              }
            >
              {teachers.map((teacher) => (
                <Option key={teacher.id} value={teacher.id}>
                  {teacher.name} - {teacher.subject}
                </Option>
              ))}
              <Option value="admin">Course Administrator</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="subject"
            label="Subject"
            rules={[{ required: true, message: "Please enter a subject" }]}
          >
            <Input placeholder="Enter message subject" />
          </Form.Item>

          <Form.Item
            name="message"
            label="Message"
            rules={[{ required: true, message: "Please enter your message" }]}
          >
            <TextArea
              rows={6}
              placeholder="Type your message here..."
              showCount
              maxLength={1000}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
            <Space>
              <Button onClick={() => setMessageModalVisible(false)}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" icon={<SendOutlined />}>
                Send Message
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CommunicationHub;
