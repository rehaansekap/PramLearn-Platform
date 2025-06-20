import React from "react";
import { useNavigate } from "react-router-dom";
import {
  MenuOutlined,
  BellOutlined,
  DownOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { Button, Space, Avatar, Dropdown } from "antd";

const StudentHeader = ({ user, isMobile, onMobileMenuOpen, onLogout }) => {
  const navigate = useNavigate();

  const profileMenu = {
    items: [
      {
        key: "logout",
        icon: <LogoutOutlined />,
        label: "Keluar",
        onClick: onLogout,
        danger: true,
      },
    ],
  };

  return (
    <div
      style={{
        background:
          "linear-gradient(135deg, #001529 0%, #3a3f5c 60%, #43cea2 100%)",
        padding: isMobile ? "0 16px" : "0 24px",
        position: "fixed",
        width: "100vw",
        left: 0,
        right: 0,
        top: 0,
        zIndex: 1000,
        boxShadow: "0 4px 12px rgba(30, 58, 138, 0.15)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
        height: 64,
        boxSizing: "border-box",
      }}
    >
      {/* Bagian Kiri - Brand & Menu Mobile */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: isMobile ? 8 : 16,
        }}
      >
        {isMobile && (
          <Button
            type="text"
            icon={<MenuOutlined />}
            onClick={onMobileMenuOpen}
            style={{
              color: "#fff",
              fontSize: "16px",
              padding: 0,
              width: 32,
              height: 32,
            }}
          />
        )}

        {/* Brand & Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "8px",
              background: "linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
            }}
          >
            <span
              style={{
                fontSize: "20px",
                fontWeight: "800",
                background:
                  "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              P
            </span>
          </div>
          <div>
            <div
              style={{
                color: "#fff",
                fontSize: "18px",
                fontWeight: "700",
                lineHeight: "20px",
                textShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
              }}
            >
              PramLearn
            </div>
            <div
              style={{
                color: "rgba(255, 255, 255, 0.8)",
                fontSize: "11px",
                fontWeight: "500",
                lineHeight: "12px",
              }}
            >
              Portal Siswa
            </div>
          </div>
        </div>
      </div>

      {/* Bagian Kanan - Notifikasi & Profil */}
      <Space size={isMobile ? 8 : 16}>
        {/* Dropdown Profil */}
        <Dropdown
          menu={profileMenu}
          trigger={["click"]}
          placement="bottomRight"
        >
          <Button
            type="text"
            style={{
              padding: isMobile ? "4px 4px" : "4px 12px",
              height: isMobile ? 32 : "40px",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              borderRadius: "8px",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              gap: isMobile ? 4 : 8,
            }}
          >
            <Avatar
              size={isMobile ? 22 : 28}
              style={{
                background:
                  "linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)",
                color: "#1e3a8a",
                fontWeight: "bold",
                fontSize: isMobile ? 10 : "12px",
              }}
            >
              {user?.username?.charAt(0)?.toUpperCase() || "S"}
            </Avatar>
            {!isMobile && (
              <div style={{ textAlign: "left" }}>
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: "13px",
                    lineHeight: "16px",
                    color: "#fff",
                  }}
                >
                  {user?.username || user?.first_name || "Siswa"}
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    lineHeight: "12px",
                    color: "rgba(255, 255, 255, 0.8)",
                  }}
                >
                  Siswa
                </div>
              </div>
            )}
            <DownOutlined
              style={{ fontSize: "10px", color: "rgba(255, 255, 255, 0.8)" }}
            />
          </Button>
        </Dropdown>
      </Space>
    </div>
  );
};

export default StudentHeader;