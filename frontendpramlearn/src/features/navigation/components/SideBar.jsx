import React, { useState, useContext, useEffect } from "react";
import { Link, useNavigate, useLocation, Outlet } from "react-router-dom";
import { AuthContext } from "../../../context/AuthContext";
import {
  HomeOutlined,
  SettingOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { Button, Layout, Menu, theme, Drawer } from "antd";
import Swal from "sweetalert2";
import reactLogo from "../../../assets/react.svg";
import SidebarHeader from "./SidebarHeader";
import AppBreadcrumb from "./AppBreadcrumb";

const { Header, Sider, Content } = Layout;

const SideBar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const { token, logout, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // Responsive handler
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) setDrawerVisible(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getRolePath = (roleId) => {
    switch (roleId) {
      case 1:
        return "admin";
      case 2:
        return "teacher";
      case 3:
        return "student";
      default:
        return "user";
    }
  };

  const userRolePath = user ? getRolePath(user.role) : "management";
  const getRoleDisplayName = (roleId) => {
    switch (roleId) {
      case 1:
        return "Admin";
      case 2:
        return "Teacher";
      case 3:
        return "Student";
      default:
        return "User";
    }
  };

  const handleLogout = () => {
    Swal.fire({
      title: "Logout",
      text: "Anda yakin ingin keluar?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, Logout",
      cancelButtonText: "Batal",
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
        navigate("/login");
        Swal.fire("Logout Berhasil!", "Anda telah keluar.", "success");
      }
    });
  };

  // Sidebar menu: hanya Home dan Management
  const menuItems = [
    {
      key: "1",
      icon: <HomeOutlined />,
      label: <Link to={`/${userRolePath}`}>Home</Link>,
    },
    {
      key: "2",
      icon: <SettingOutlined />,
      label: <Link to={`/${userRolePath}/management`}>Management</Link>,
    },
  ];

  // Mapping path ke key menu
  const getMenuKeyFromPath = (pathname) => {
    if (pathname === `/${userRolePath}` || pathname === `/${userRolePath}/`)
      return "1";
    if (pathname.startsWith(`/${userRolePath}/management`)) return "2";
    return "1";
  };

  const selectedMenuKey = getMenuKeyFromPath(location.pathname);

  // Sidebar menu component
  const sidebarMenu = (
    <Menu
      theme="dark"
      mode="inline"
      selectedKeys={[selectedMenuKey]}
      items={menuItems.map((item) => ({
        ...item,
        icon: React.cloneElement(item.icon, {
          style: { color: "#ffffff" },
        }),
        label: <span style={{ color: "#ffffff" }}>{item.label}</span>,
      }))}
      style={{ textAlign: "left", background: "#11418b" }}
    />
  );

  return (
    <Layout>
      {isMobile ? (
        <>
          <Drawer
            title={
              <img
                src={reactLogo}
                alt="Vite Logo"
                style={{ height: "32px", margin: "0 auto" }}
              />
            }
            placement="left"
            onClose={() => setDrawerVisible(false)}
            open={drawerVisible}
            bodyStyle={{ padding: 0, background: "#11418b" }}
            width={220}
          >
            {sidebarMenu}
          </Drawer>
          <SidebarHeader
            isMobile={true}
            setDrawerVisible={setDrawerVisible}
            onLogout={handleLogout}
            token={token}
          />
          <Content
            style={{
              margin: "12px 16px 0px 16px",
              paddingLeft: 24,
              paddingRight: 24,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            <AppBreadcrumb />
          </Content>
          <Content
            style={{
              margin: "12px 16px",
              padding: 24,
              minHeight: "calc(100vh - 112px)",
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            <Outlet />
          </Content>
        </>
      ) : (
        <>
          <Sider
            trigger={null}
            width={220}
            collapsible
            collapsed={collapsed}
            style={{
              background: "#11418b",
              boxShadow: "2px 0 5px rgba(0, 0, 0, 0.1)",
            }}
          >
            <div
              className="logo"
              style={{ padding: "16px", textAlign: "center" }}
            >
              <img
                src={reactLogo}
                alt="Vite Logo"
                style={{ height: "32px", margin: "0 auto" }}
              />
            </div>
            {sidebarMenu}
          </Sider>
          <Layout>
            <SidebarHeader
              className="sidebar-header-sticky"
              isMobile={false}
              collapsed={collapsed}
              setCollapsed={setCollapsed}
              onLogout={handleLogout}
              token={token}
            />
            <Content
              style={{
                margin: "12px 12px 0px 8px",
                paddingLeft: 24,
                paddingRight: 24,
                background: colorBgContainer,
                borderRadius: borderRadiusLG,
              }}
            >
              <AppBreadcrumb />
            </Content>
            <Content
              style={{
                margin: "12px 12px 8px 8px",
                padding: 24,
                minHeight: "calc(100vh - 112px)",
                background: colorBgContainer,
                borderRadius: borderRadiusLG,
              }}
            >
              <Outlet />
            </Content>
          </Layout>
        </>
      )}
    </Layout>
  );
};

export default SideBar;
