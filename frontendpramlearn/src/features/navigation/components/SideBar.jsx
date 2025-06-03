import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../../context/AuthContext";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  HomeIcon,
  UserPlusIcon,
  UsersIcon,
  BookOpenIcon,
  ArrowRightOnRectangleIcon,
  ArrowLeftOnRectangleIcon,
  UserIcon,
} from "@heroicons/react/24/solid";
import { Button, Layout, Menu, theme, Drawer } from "antd"; // Tambahkan Drawer
import Swal from "sweetalert2";
import reactLogo from "../../../assets/react.svg";
import SidebarHeader from "./SidebarHeader";
import AppBreadcrumb from "./AppBreadcrumb";
import { useLocation } from "react-router-dom";

const { Header, Sider, Content } = Layout;

const Sidebar = ({ children }) => {
  const [collapsed, setCollapsed] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [drawerVisible, setDrawerVisible] = useState(false); // State untuk Drawer
  const { token, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const location = useLocation();

  const handleResize = () => {
    setIsMobile(window.innerWidth <= 768);
    if (window.innerWidth > 768) setDrawerVisible(false);
  };

  React.useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleLogout = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You will be logged out!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, logout!",
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
        navigate("/login");
        Swal.fire("Logged out!", "You have been logged out.", "success");
      }
    });
  };

  const menuItems = token
    ? [
        {
          key: "1",
          icon: <HomeIcon className="h-5 w-5" />,
          label: <Link to="/">Home</Link>,
        },
        {
          key: "2",
          icon: <UsersIcon className="h-5 w-5" />,
          label: <Link to="/management">Management</Link>,
        },
      ]
    : [
        {
          key: "1",
          icon: <HomeIcon className="h-5 w-5" />,
          label: <Link to="/">Home</Link>,
        },
        {
          key: "2",
          icon: <ArrowLeftOnRectangleIcon className="h-5 w-5" />,
          label: <Link to="/login">Login</Link>,
        },
        {
          key: "3",
          icon: <UserPlusIcon className="h-5 w-5" />,
          label: <Link to="/register">Register</Link>,
        },
      ];

  // Mapping path ke key menu
  const getMenuKeyFromPath = (pathname) => {
    if (pathname.startsWith("/management")) return "2";
    if (pathname === "/") return "1";
    return "1"; // default ke Home
  };

  const selectedMenuKey = getMenuKeyFromPath(location.pathname);

  // Komponen menu sidebar
  const sidebarMenu = (
    <Menu
      theme="dark"
      mode="inline"
      selectedKeys={[selectedMenuKey]} // Ganti dari defaultSelectedKeys
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
            {children}
          </Content>
        </>
      ) : (
        <>
          <Sider
            trigger={null}
            width={"20%"}
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
              {children}
            </Content>
          </Layout>
        </>
      )}
    </Layout>
  );
};

export default Sidebar;
