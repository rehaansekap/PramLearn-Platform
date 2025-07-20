import React from "react";
import { Typography, Button, Space, Tooltip, Dropdown } from "antd";
import {
  CloseOutlined,
  ReloadOutlined,
  WifiOutlined,
  DisconnectOutlined,
  MoreOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

const GroupChatHeader = ({
  groupInfo,
  wsConnected,
  onClose,
  manualRefresh,
  forceReconnect,
  loading,
}) => {
  const refreshMenuItems = [
    {
      key: "refresh",
      icon: <ReloadOutlined />,
      label: "Refresh Data & Koneksi",
      onClick: manualRefresh,
      disabled: loading,
    },
    {
      key: "reconnect",
      icon: <WifiOutlined />,
      label: "Reconnect WebSocket",
      onClick: forceReconnect,
      disabled: loading,
    },
  ];

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "12px 16px",
        borderBottom: "1px solid #f0f0f0",
        backgroundColor: "#fafafa",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <Text strong style={{ fontSize: "14px" }}>
          {groupInfo?.name || "Group Chat"}
        </Text>
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          {wsConnected ? (
            <Tooltip title="Terhubung">
              <WifiOutlined style={{ color: "#52c41a", fontSize: "12px" }} />
            </Tooltip>
          ) : (
            <Tooltip title="Tidak terhubung">
              <DisconnectOutlined
                style={{ color: "#ff4d4f", fontSize: "12px" }}
              />
            </Tooltip>
          )}
        </div>
      </div>

      <Space size="small">
        <Dropdown
          menu={{ items: refreshMenuItems }}
          trigger={["click"]}
          placement="bottomRight"
        >
          <Button
            type="text"
            size="small"
            icon={<MoreOutlined />}
            loading={loading}
            style={{ padding: "4px" }}
          />
        </Dropdown>

        <Button
          type="text"
          size="small"
          icon={<CloseOutlined />}
          onClick={onClose}
          style={{ padding: "4px" }}
        />
      </Space>
    </div>
  );
};

export default GroupChatHeader;
