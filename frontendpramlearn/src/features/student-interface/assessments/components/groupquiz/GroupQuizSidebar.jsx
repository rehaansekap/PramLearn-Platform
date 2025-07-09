import React from "react";
import { Card, Space, Typography, Badge, Avatar, Tag, Progress } from "antd";
import {
  WifiOutlined,
  DisconnectOutlined,
  TeamOutlined,
  UserOutlined,
  TrophyOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

const GroupQuizSidebar = ({
  wsConnected,
  groupMembers,
  isUserOnline,
  answeredCount,
  totalQuestions,
  progress,
}) => (
  <Space direction="vertical" size={16} style={{ width: "100%" }}>
    {/* Status Koneksi */}
    <Card
      size="small"
      style={{
        borderRadius: 12,
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <Space>
          {wsConnected ? (
            <WifiOutlined style={{ color: "#52c41a", fontSize: 16 }} />
          ) : (
            <DisconnectOutlined style={{ color: "#ff4d4f", fontSize: 16 }} />
          )}
          <Text strong style={{ color: wsConnected ? "#52c41a" : "#ff4d4f" }}>
            {wsConnected ? "Terhubung Real-time" : "Koneksi Terputus"}
          </Text>
        </Space>
      </div>
    </Card>

    {/* Anggota Kelompok */}
    <Card
      title={
        <Space>
          <TeamOutlined style={{ color: "#722ed1" }} />
          <span>Anggota Kelompok</span>
        </Space>
      }
      size="small"
      style={{
        borderRadius: 12,
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      }}
    >
      <Space direction="vertical" style={{ width: "100%" }} size="small">
        {groupMembers.map((member) => (
          <div
            key={member.id}
            style={{
              display: "flex",
              gap: 12,
              padding: "8px 12px",
              borderRadius: 8,
              background: member.is_current_user ? "#f0f8ff" : "#fafafa",
              border: member.is_current_user
                ? "2px solid #1890ff"
                : "1px solid #f0f0f0",
            }}
          >
            <Badge status={isUserOnline(member) ? "success" : "default"} dot>
              <Avatar size="small" icon={<UserOutlined />} />
            </Badge>
            <div style={{ flex: 1 }}>
              <Text strong={member.is_current_user}>
                {member.full_name ||
                  `${member.first_name} ${member.last_name}` ||
                  member.username}
              </Text>
              {member.is_current_user && (
                <Tag color="blue" size="small" style={{ marginLeft: 4 }}>
                  Anda
                </Tag>
              )}
              <br />
              <Text type="secondary" style={{ fontSize: 11 }}>
                {isUserOnline(member) ? "Online" : "Offline"}
              </Text>
            </div>
          </div>
        ))}
      </Space>
    </Card>

    {/* Progress Kuis */}
    <Card
      title={
        <Space>
          <TrophyOutlined style={{ color: "#faad14" }} />
          <span>Progress Kuis</span>
        </Space>
      }
      size="small"
      style={{
        borderRadius: 12,
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      }}
    >
      <Space direction="vertical" style={{ width: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: 12 }}>
          <Text strong style={{ fontSize: 16 }}>
            {answeredCount} / {totalQuestions}
          </Text>
          <br />
          <Text type="secondary">Soal Terjawab</Text>
        </div>
        <Progress
          percent={progress.toFixed(1)}
          strokeColor={{
            "0%": "#722ed1",
            "100%": "#9254de",
          }}
          style={{ marginBottom: 8 }}
        />
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Progress: {progress.toFixed(1)}%
          </Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {totalQuestions - answeredCount} tersisa
          </Text>
        </div>
      </Space>
    </Card>
  </Space>
);

export default GroupQuizSidebar;
