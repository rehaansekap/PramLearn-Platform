import React from "react";
import { Link } from "react-router-dom";
import {
  DashboardOutlined,
  SettingOutlined,
  BarChartOutlined,
  UserOutlined,
  FileTextOutlined,
  TeamOutlined,
  LogoutOutlined,
  MenuOutlined,
  CloseOutlined,
  BookOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { Button, Menu } from "antd";

const TeacherSidebar = ({
  user,
  collapsed,
  isMobile,
  selectedMenuKey,
  onToggleCollapse,
  onLogout,
  onMobileMenuClose,
}) => {
  const userRolePath = user?.role === 1 ? "admin" : "teacher";
  const roleDisplayName = user?.role === 1 ? "Admin" : "Guru";

  const menuItems = [
    {
      key: `/${userRolePath}`,
      icon: <DashboardOutlined />,
      label: <Link to={`/${userRolePath}`}>Dashboard</Link>,
    },
    // {
    //   key: `/${userRolePath}/management`,
    //   icon: <SettingOutlined />,
    //   label: <Link to={`/${userRolePath}/management`}>Management</Link>,
    // },
    {
      key: `/${userRolePath}/sessions`,
      icon: <CalendarOutlined />,
      label: <Link to={`/${userRolePath}/sessions`}>Pertemuan</Link>,
    },
    // {
    //   key: `/${userRolePath}/classes`,
    //   icon: <TeamOutlined />,
    //   label: <Link to={`/${userRolePath}/classes`}>Kelas Saya</Link>,
    // },
    // {
    //   key: `/${userRolePath}/subjects`,
    //   icon: <BookOutlined />,
    //   label: <Link to={`/${userRolePath}/subjects`}>Mata Pelajaran</Link>,
    // },
    // Uncomment when these features are implemented
    // {
    //   key: `/${userRolePath}/analytics`,
    //   icon: <BarChartOutlined />,
    //   label: <Link to={`/${userRolePath}/analytics`}>Analytics</Link>,
    // },
    // {
    //   key: `/${userRolePath}/students`,
    //   icon: <UserOutlined />,
    //   label: <Link to={`/${userRolePath}/students`}>Students</Link>,
    // },
    // {
    //   key: `/${userRolePath}/reports`,
    //   icon: <FileTextOutlined />,
    //   label: <Link to={`/${userRolePath}/reports`}>Reports</Link>,
    // },
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
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
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
          {user?.username?.charAt(0)?.toUpperCase() || "T"}
        </div>
        {!collapsed && (
          <>
            <div style={{ color: "#fff", fontWeight: 600, fontSize: "16px" }}>
              {user?.username || "Teacher"}
            </div>
            <div style={{ color: "#bfbfbf", fontSize: "12px" }}>
              Portal {roleDisplayName}
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

export default TeacherSidebar;
