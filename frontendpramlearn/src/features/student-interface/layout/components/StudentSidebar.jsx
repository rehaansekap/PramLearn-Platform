import React from "react";
import { Link } from "react-router-dom";
import {
  DashboardOutlined,
  BookOutlined,
  FileTextOutlined,
  TrophyOutlined,
  LogoutOutlined,
  MenuOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { Button, Menu } from "antd";

const StudentSidebar = ({
  user,
  collapsed,
  isMobile,
  selectedMenuKey,
  onToggleCollapse,
  onLogout,
  onMobileMenuClose,
}) => {
  const menuItems = [
    {
      key: "/student",
      icon: <DashboardOutlined />,
      label: <Link to="/student">Dasbor</Link>,
    },
    {
      key: "/student/subjects",
      icon: <BookOutlined />,
      label: <Link to="/student/subjects">Mata Pelajaran Saya</Link>,
    },
    {
      key: "/student/assessments",
      icon: <FileTextOutlined />,
      label: <Link to="/student/assessments">Penilaian</Link>,
    },
    {
      key: "/student/assignments",
      icon: <FileTextOutlined />,
      label: <Link to="/student/assignments">Tugas</Link>,
    },
    {
      key: "/student/grades",
      icon: <TrophyOutlined />,
      label: <Link to="/student/grades">Nilai & Hasil</Link>,
    },
  ];

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Tombol Toggle untuk Desktop */}
      {!isMobile && (
        <div
          style={{
            padding: collapsed ? "8px" : "8px 16px",
            borderTop: "1px solid #303030",
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuOutlined /> : <CloseOutlined />}
            onClick={onToggleCollapse}
            style={{
              width: "100%",
              color: "#fff",
              borderColor: "transparent",
              fontSize: "12px",
              height: "32px",
            }}
            title={collapsed ? "Perluas Sidebar" : "Ciutkan Sidebar"}
          >
            {!collapsed && (collapsed ? "Perluas" : "Ciutkan")}
          </Button>
        </div>
      )}

      {/* Header Profil */}
      <div
        style={{
          padding: collapsed ? "16px 8px" : "24px 16px",
          borderBottom: "1px solid #303030",
          textAlign: "center",
          transition: "padding 0.2s",
        }}
      >
        <div
          style={{
            width: collapsed ? 40 : 64,
            height: collapsed ? 40 : 64,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #1890ff 0%, #52c41a 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 12px",
            color: "#fff",
            fontSize: collapsed ? "18px" : "24px",
            fontWeight: "bold",
            transition: "all 0.2s",
          }}
        >
          {user?.username?.charAt(0)?.toUpperCase() || "S"}
        </div>
        {!collapsed && (
          <>
            <div style={{ color: "#fff", fontWeight: 600, fontSize: "16px" }}>
              {user?.username || "Siswa"}
            </div>
            <div style={{ color: "#bfbfbf", fontSize: "12px" }}>
              Portal Siswa
            </div>
          </>
        )}
      </div>

      {/* Item Menu */}
      <div style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedMenuKey]}
          inlineCollapsed={collapsed}
          style={{
            borderRight: 0,
            background: "transparent",
            fontSize: "14px",
          }}
          items={menuItems.map((item) => ({
            ...item,
            style: {
              marginBottom: "4px",
              borderRadius: collapsed ? "0" : "8px",
              marginLeft: collapsed ? "0" : "8px",
              marginRight: collapsed ? "0" : "8px",
            },
            label: (
              <span
                onClick={() => {
                  if (isMobile && onMobileMenuClose) onMobileMenuClose();
                }}
                style={{
                  fontWeight: selectedMenuKey === item.key ? 600 : 400,
                }}
              >
                {item.label}
              </span>
            ),
          }))}
        />
      </div>

      {/* Tombol Keluar */}
      <div
        style={{
          padding: collapsed ? "12px 8px" : "16px",
          borderTop: "1px solid #303030",
        }}
      >
        <Button
          type="primary"
          danger
          icon={<LogoutOutlined />}
          onClick={onLogout}
          block={!collapsed}
          size={collapsed ? "small" : "middle"}
          style={{
            height: collapsed ? "36px" : "40px",
            fontWeight: 600,
            fontSize: collapsed ? "12px" : "14px",
            ...(collapsed && {
              width: "36px",
              padding: 0,
            }),
          }}
          title={collapsed ? "Keluar" : undefined}
        >
          {!collapsed && "Keluar"}
        </Button>
      </div>
    </div>
  );
};

export default StudentSidebar;
