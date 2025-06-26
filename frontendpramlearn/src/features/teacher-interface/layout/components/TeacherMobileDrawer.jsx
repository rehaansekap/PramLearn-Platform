import React from "react";
import { Link } from "react-router-dom";
import { Drawer, Button, Menu, Avatar, Badge, Typography } from "antd";
import {
  DashboardOutlined,
  SettingOutlined,
  BarChartOutlined,
  UserOutlined,
  FileTextOutlined,
  TeamOutlined,
  LogoutOutlined,
  BookOutlined,
  CalendarOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

const TeacherMobileDrawer = ({
  open,
  onClose,
  user,
  selectedMenuKey,
  onLogout,
}) => {
  const userRolePath = user?.role === 1 ? "admin" : "teacher";
  const roleDisplayName = user?.role === 1 ? "Admin" : "Guru";

  const menuItems = [
    {
      key: `/${userRolePath}`,
      icon: <DashboardOutlined />,
      label: <Link to={`/${userRolePath}`}>Dashboard</Link>,
    },
    {
      key: `/${userRolePath}/management`,
      icon: <SettingOutlined />,
      label: <Link to={`/${userRolePath}/management`}>Management</Link>,
    },
    {
      key: `/${userRolePath}/sessions`,
      icon: <CalendarOutlined />,
      label: <Link to={`/${userRolePath}/sessions`}>Pertemuan</Link>,
    },
    {
      key: `/${userRolePath}/classes`,
      icon: <TeamOutlined />,
      label: <Link to={`/${userRolePath}/classes`}>Kelas Saya</Link>,
    },
    {
      key: `/${userRolePath}/subjects`,
      icon: <BookOutlined />,
      label: <Link to={`/${userRolePath}/subjects`}>Mata Pelajaran</Link>,
    },
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
    <Drawer
      title={null}
      placement="left"
      onClose={onClose}
      open={open}
      width={280}
      bodyStyle={{
        padding: 0,
        background: "#001529",
      }}
      headerStyle={{ display: "none" }}
      closable={false}
    >
      <div
        style={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          background: "#001529",
        }}
      >
        {/* HEADER PROFIL */}
        <div
          style={{
            padding: "24px 16px",
            borderBottom: "1px solid #303030",
            textAlign: "center",
          }}
        >
          <Avatar
            size={64}
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              marginBottom: 12,
              fontSize: "24px",
              fontWeight: "bold",
            }}
          >
            {user?.username?.charAt(0)?.toUpperCase() || "T"}
          </Avatar>
          <div
            style={{
              color: "#fff",
              fontWeight: 600,
              fontSize: "16px",
              marginBottom: 4,
            }}
          >
            {user?.username || user?.first_name || "Teacher"}
          </div>
          <div style={{ display: "flex", alignItems: "center" }}>
            <Badge status="success" />
            <span
              style={{
                color: "rgba(255, 255, 255, 0.8)",
                fontSize: "12px",
                marginLeft: 5,
              }}
            >
              Online - {roleDisplayName}
            </span>
          </div>
        </div>

        {/* NAVIGASI MENU */}
        <div style={{ padding: "0 16px", marginBottom: 8 }}>
          <Text
            style={{
              color: "rgba(255, 255, 255, 0.5)",
              fontSize: 12,
              fontWeight: 500,
            }}
          >
            NAVIGASI {roleDisplayName.toUpperCase()}
          </Text>
        </div>

        {/* Menu yang Ditingkatkan */}
        <div style={{ flex: 1, overflowY: "auto", padding: "0 16px" }}>
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[selectedMenuKey]}
            style={{
              borderRight: 0,
              background: "transparent",
              fontSize: "14px",
            }}
            items={menuItems.map((item) => ({
              ...item,
              style: {
                marginBottom: 4,
                borderRadius: 8,
                height: 44,
              },
              onClick: onClose,
            }))}
          />
        </div>

        {/* Tombol Keluar */}
        <div
          style={{
            padding: "16px",
            marginTop: "auto",
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <Button
            type="primary"
            danger
            size="large"
            icon={<LogoutOutlined />}
            onClick={onLogout}
            block
            style={{
              height: 46,
              fontWeight: 600,
              fontSize: "14px",
            }}
          >
            Keluar
          </Button>
        </div>
      </div>
    </Drawer>
  );
};

export default TeacherMobileDrawer;
