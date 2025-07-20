import React, { useState, useEffect } from "react";
import { Button, Badge } from "antd";
import {
  MessageOutlined,
  CloseOutlined,
  TeamOutlined,
} from "@ant-design/icons";

const GroupChatFloatingButton = ({
  onClick,
  isOpen = false,
  unreadCount = 0,
  wsConnected = false,
}) => {
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    // Hanya pulse jika ada pesan belum dibaca dan chat tidak terbuka
    if (!isOpen && unreadCount > 0) {
      const interval = setInterval(() => {
        setPulse(true);
        setTimeout(() => setPulse(false), 1000);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [isOpen, unreadCount]);

  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 1000,
      }}
    >
      <div
        style={{
          position: "relative",
          display: "inline-block",
        }}
      >
        {/* Pulse Animation Ring - hanya muncul jika ada pesan baru */}
        {pulse && !isOpen && unreadCount > 0 && (
          <div
            style={{
              position: "absolute",
              top: -8,
              left: -8,
              right: -8,
              bottom: -8,
              borderRadius: "50%",
              border: `3px solid #1890ff`,
              animation: "pulse 1s ease-out",
              opacity: 0,
            }}
          />
        )}

        <Badge
          count={
            // Hanya tampilkan badge jika ada pesan belum dibaca dan chat tidak terbuka
            !isOpen && unreadCount > 0 ? (
              <div
                style={{
                  background: "#ff4d4f",
                  color: "white",
                  fontSize: 11,
                  padding: "4px 8px",
                  borderRadius: 12,
                  fontWeight: 600,
                  boxShadow: "0 4px 12px rgba(255, 77, 79, 0.4)",
                  border: "2px solid white",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  minWidth: 24,
                  justifyContent: "center",
                }}
              >
                {unreadCount > 99 ? "99+" : unreadCount}
              </div>
            ) : null
          }
          offset={[-12, 12]}
        >
          <Button
            type="primary"
            shape="circle"
            size="large"
            icon={isOpen ? <CloseOutlined /> : <MessageOutlined />}
            onClick={onClick}
            style={{
              width: 64,
              height: 64,
              fontSize: 24,
              background: isOpen
                ? "linear-gradient(135deg, #ff4757 0%, #ff3742 100%)"
                : wsConnected
                ? "linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)"
                : "linear-gradient(135deg, #8c8c8c 0%, #bfbfbf 100%)",
              border: "none",
              boxShadow: isOpen
                ? "0 8px 24px rgba(255, 71, 87, 0.4), 0 4px 12px rgba(0, 0, 0, 0.1)"
                : wsConnected
                ? "0 8px 24px rgba(24, 144, 255, 0.4), 0 4px 12px rgba(0, 0, 0, 0.1)"
                : "0 8px 24px rgba(140, 140, 140, 0.4), 0 4px 12px rgba(0, 0, 0, 0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = isOpen
                ? "scale(1.1) translateY(-2px) rotate(90deg)"
                : "scale(1.1) translateY(-2px) rotate(0deg)";
              e.currentTarget.style.boxShadow = isOpen
                ? "0 12px 32px rgba(255, 71, 87, 0.5), 0 6px 16px rgba(0, 0, 0, 0.15)"
                : wsConnected
                ? "0 12px 32px rgba(24, 144, 255, 0.5), 0 6px 16px rgba(0, 0, 0, 0.15)"
                : "0 12px 32px rgba(140, 140, 140, 0.5), 0 6px 16px rgba(0, 0, 0, 0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = isOpen
                ? "scale(1) translateY(0) rotate(90deg)"
                : "scale(1) translateY(0) rotate(0deg)";
              e.currentTarget.style.boxShadow = isOpen
                ? "0 8px 24px rgba(255, 71, 87, 0.4), 0 4px 12px rgba(0, 0, 0, 0.1)"
                : wsConnected
                ? "0 8px 24px rgba(24, 144, 255, 0.4), 0 4px 12px rgba(0, 0, 0, 0.1)"
                : "0 8px 24px rgba(140, 140, 140, 0.4), 0 4px 12px rgba(0, 0, 0, 0.1)";
            }}
          />
        </Badge>

        {/* Status indicator */}
        <div
          style={{
            position: "absolute",
            bottom: -4,
            right: -4,
            width: 16,
            height: 16,
            borderRadius: "50%",
            background: wsConnected ? "#52c41a" : "#ff4d4f",
            border: "2px solid white",
            boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
          }}
        />
      </div>

      <style jsx>{`
        @keyframes pulse {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          100% {
            transform: scale(1.4);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default GroupChatFloatingButton;
