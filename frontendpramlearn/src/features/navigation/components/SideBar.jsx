import React, { useState, useContext, useEffect } from "react";
import { Link, useNavigate, useLocation, Outlet } from "react-router-dom";
import { AuthContext } from "../../../context/AuthContext";
import {
  HomeOutlined,
  SettingOutlined,
  LogoutOutlined,
  MenuOutlined,
  CloseOutlined,
  UserOutlined,
  BellOutlined,
  SearchOutlined,
  DownOutlined,
} from "@ant-design/icons";
import {
  Button,
  Layout,
  Menu,
  theme,
  Drawer,
  Spin,
  Card,
  Avatar,
  Space,
  Input,
  Dropdown,
  Typography,
  Badge,
} from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import Swal from "sweetalert2";
import AppBreadcrumb from "./AppBreadcrumb";
import PageLoading from "../../../components/PageLoading";

const { Header, Sider, Content } = Layout;
const { Search } = Input;
const { Text, Title } = Typography;

const SideBar = () => {
  const [collapsed, setCollapsed] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const { token, logout, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // Responsive handler
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) {
        setMobileDrawerOpen(false);
      }
      // Auto-collapse pada layar kecil
      if (mobile) {
        setCollapsed(true);
      }
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
      title: "Konfirmasi Logout",
      text: "Apakah Anda yakin ingin keluar?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, Keluar",
      cancelButtonText: "Batal",
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
        // navigate("/login");
        Swal.fire(
          "Logout Berhasil!",
          "Anda telah keluar dari sistem.",
          "success"
        );
      }
    });
  };

  // Handle search functionality
  const handleSearch = (value) => {
    if (!value.trim()) return;

    // Search logic - navigate based on search terms
    const searchTerm = value.toLowerCase();

    if (searchTerm.includes("user") || searchTerm.includes("pengguna")) {
      navigate(`/${userRolePath}/management`);
    } else if (
      searchTerm.includes("subject") ||
      searchTerm.includes("mata pelajaran")
    ) {
      navigate(`/${userRolePath}/management`);
    } else if (searchTerm.includes("class") || searchTerm.includes("kelas")) {
      navigate(`/${userRolePath}/management`);
    } else if (
      searchTerm.includes("material") ||
      searchTerm.includes("materi")
    ) {
      navigate(`/${userRolePath}/management`);
    } else {
      // Default search - go to management page
      navigate(`/${userRolePath}/management`);
    }

    // Close mobile drawer if open
    if (isMobile && mobileDrawerOpen) {
      setMobileDrawerOpen(false);
    }
  };

  // Profile dropdown menu
  const profileMenu = {
    items: [
      {
        key: "profile",
        icon: <UserOutlined />,
        label: "Profile",
        onClick: () => navigate(`/${userRolePath}/profile`),
      },
      {
        key: "settings",
        icon: <SettingOutlined />,
        label: "Settings",
        onClick: () => navigate(`/${userRolePath}/settings`),
      },
      {
        type: "divider",
      },
      {
        key: "logout",
        icon: <LogoutOutlined />,
        label: "Logout",
        onClick: handleLogout,
        danger: true,
      },
    ],
  };

  // Menu items dengan icon yang lebih baik
  const menuItems = [
    {
      key: `/${userRolePath}`,
      icon: <HomeOutlined />,
      label: <Link to={`/${userRolePath}`}>Dashboard</Link>,
    },
    {
      key: `/${userRolePath}/management`,
      icon: <SettingOutlined />,
      label: <Link to={`/${userRolePath}/management`}>Management</Link>,
    },
  ];

  // Get selected menu key from current path
  const getMenuKeyFromPath = (pathname) => {
    if (pathname === `/${userRolePath}` || pathname === `/${userRolePath}/`)
      return `/${userRolePath}`;
    if (pathname.startsWith(`/${userRolePath}/management`))
      return `/${userRolePath}/management`;
    return `/${userRolePath}`;
  };

  const selectedMenuKey = getMenuKeyFromPath(location.pathname);

  // Loading state jika user belum dimuat
  if (!user || !token) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "#f5f5f5",
        }}
      >
        <Spin
          indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}
          tip="Memuat data user..."
        />
      </div>
    );
  }

  // Sidebar content dengan perbaikan layout
  const sidebarContent = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Header Profile */}
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
          {user?.username?.charAt(0)?.toUpperCase() || "A"}
        </div>
        {!collapsed && (
          <>
            <div style={{ color: "#fff", fontWeight: 600, fontSize: "16px" }}>
              {user?.username || "User"}
            </div>
            <div style={{ color: "#bfbfbf", fontSize: "12px" }}>
              {getRoleDisplayName(user?.role)}
            </div>
          </>
        )}
      </div>

      {/* Menu Items */}
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
                  if (isMobile) setMobileDrawerOpen(false);
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

      {/* Logout Button */}
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
          onClick={handleLogout}
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
          title={collapsed ? "Logout" : undefined}
        >
          {!collapsed && "Logout"}
        </Button>
      </div>

      {/* Toggle Button untuk Desktop */}
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
            onClick={() => setCollapsed(!collapsed)}
            style={{
              width: "100%",
              color: "#fff",
              borderColor: "transparent",
              fontSize: "12px",
              height: "32px",
            }}
            title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {!collapsed && (collapsed ? "Expand" : "Collapse")}
          </Button>
        </div>
      )}
    </div>
  );

  if (!user || !token) {
    return <PageLoading message="Memuat data user..." />;
  }

  if (!user || !token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      {/* Fixed Header dengan gradient yang lebih soft */}
      <Header
        style={{
          background:
            "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #1e40af 100%)",
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
        {/* Left Side - Brand & Mobile Menu */}
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
              onClick={() => setMobileDrawerOpen(true)}
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
                {getRoleDisplayName(user?.role)} Portal
              </div>
            </div>
          </div>
        </div>

        {/* Center - Search Bar (Hidden on mobile) */}
        {!isMobile && (
          <div style={{ flex: 1, maxWidth: 400, marginTop: 28 }}>
            <Search
              placeholder="Cari users, subjects, materials..."
              allowClear
              enterButton={<SearchOutlined />}
              size="middle"
              onSearch={handleSearch}
              style={{
                width: "100%",
              }}
              styles={{
                input: {
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  borderRadius: "8px",
                },
              }}
            />
          </div>
        )}

        {/* Right Side - Notifications & Profile */}
        <Space size={isMobile ? 8 : 16}>
          {/* Notifications */}
          {/* <Button
            type="text"
            icon={<BellOutlined />}
            style={{
              color: "#fff",
              fontSize: "16px",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              borderRadius: "8px",
              width: isMobile ? 32 : "40px",
              height: isMobile ? 32 : "40px",
              padding: 0,
            }}
            onClick={() => navigate(`/${userRolePath}/notifications`)}
          /> */}

          {/* Profile Dropdown */}
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
                {user?.username?.charAt(0)?.toUpperCase() || "A"}
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
                    {user?.username}
                  </div>
                  <div
                    style={{
                      fontSize: "11px",
                      lineHeight: "12px",
                      color: "rgba(255, 255, 255, 0.8)",
                    }}
                  >
                    {getRoleDisplayName(user?.role)}
                  </div>
                </div>
              )}
              <DownOutlined
                style={{ fontSize: "10px", color: "rgba(255, 255, 255, 0.8)" }}
              />
            </Button>
          </Dropdown>
        </Space>
      </Header>

      <Layout style={{ minHeight: "100vh", paddingTop: 64 }}>
        {/* Desktop Sidebar */}
        {!isMobile && (
          <Sider
            trigger={null}
            collapsible
            collapsed={collapsed}
            width={220}
            collapsedWidth={72}
            style={{
              background: "#11418b",
              position: "fixed",
              height: "calc(100vh - 64px)",
              left: 0,
              top: 64,
              zIndex: 100,
              boxShadow: "2px 0 8px rgba(0,0,0,0.15)",
            }}
          >
            {sidebarContent}
          </Sider>
        )}

        {/* Mobile Drawer - IMPROVED UI/UX - MENGHAPUS ITEM NAVIGASI YANG TIDAK DIPERLUKAN */}
        <Drawer
          title={null} // Remove default title
          placement="left"
          open={mobileDrawerOpen}
          onClose={() => setMobileDrawerOpen(false)}
          closable={false} // Remove default close button
          headerStyle={{ display: "none" }} // Hide header
          bodyStyle={{
            background: "#11418b",
            padding: 0,
            display: "flex",
            flexDirection: "column",
            height: "100%",
          }}
          width={300}
        >
          {/* Custom Drawer Header */}
          <div
            style={{
              background: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)",
              padding: "16px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "8px",
                  background:
                    "linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)",
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
                    fontSize: "16px",
                    fontWeight: "700",
                    lineHeight: "18px",
                  }}
                >
                  PramLearn
                </div>
                <div
                  style={{
                    color: "rgba(255, 255, 255, 0.8)",
                    fontSize: "11px",
                    fontWeight: "500",
                    lineHeight: "14px",
                  }}
                >
                  {getRoleDisplayName(user?.role)} Portal
                </div>
              </div>
            </div>
            <Button
              type="text"
              icon={<CloseOutlined />}
              onClick={() => setMobileDrawerOpen(false)}
              style={{
                color: "#fff",
                fontSize: 16,
                padding: 0,
                width: 32,
                height: 32,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            />
          </div>

          {/* Search in drawer */}
          <div
            style={{ padding: "16px", background: "rgba(255, 255, 255, 0.05)" }}
          >
            <Search
              placeholder="Cari di sistem..."
              allowClear
              enterButton={<SearchOutlined />}
              size="middle"
              onSearch={handleSearch}
              style={{ width: "100%" }}
            />
          </div>

          {/* User Profile Card */}
          <div
            style={{
              padding: "20px 16px",
              display: "flex",
              alignItems: "center",
              gap: 12,
              background: "rgba(255, 255, 255, 0.05)",
              margin: "0 16px 16px",
              borderRadius: 12,
              marginTop: 16,
            }}
          >
            <Avatar
              size={48}
              style={{
                background: "linear-gradient(135deg, #1890ff 0%, #52c41a 100%)",
                color: "#fff",
                fontWeight: "bold",
                fontSize: "18px",
              }}
            >
              {user?.username?.charAt(0)?.toUpperCase() || "A"}
            </Avatar>
            <div>
              <div
                style={{
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: "15px",
                  marginBottom: 2,
                }}
              >
                {user?.username || "User"}
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
                  Online - {getRoleDisplayName(user?.role)}
                </span>
              </div>
            </div>
          </div>

          {/* MENU SIMPLIFIKASI - HANYA MAIN NAVIGATION */}
          <div style={{ padding: "0 16px", marginBottom: 8 }}>
            <Text
              style={{
                color: "rgba(255, 255, 255, 0.5)",
                fontSize: 12,
                fontWeight: 500,
              }}
            >
              MAIN NAVIGATION
            </Text>
          </div>

          {/* Enhanced Menu - DISEDERHANAKAN */}
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
              items={[
                {
                  key: `/${userRolePath}`,
                  icon: <HomeOutlined style={{ fontSize: 16 }} />,
                  label: "Dashboard",
                  onClick: () => {
                    navigate(`/${userRolePath}`);
                    setMobileDrawerOpen(false);
                  },
                },
                {
                  key: `/${userRolePath}/management`,
                  icon: <SettingOutlined style={{ fontSize: 16 }} />,
                  label: "Management",
                  onClick: () => {
                    navigate(`/${userRolePath}/management`);
                    setMobileDrawerOpen(false);
                  },
                },
              ].map((item) => ({
                ...item,
                style: {
                  marginBottom: 4,
                  borderRadius: 8,
                  height: 44,
                  display: "flex",
                  alignItems: "center",
                },
              }))}
            />
          </div>

          {/* Logout Button */}
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
              onClick={handleLogout}
              block
              style={{
                height: 46,
                fontSize: 16,
                fontWeight: 600,
                borderRadius: 8,
              }}
            >
              Logout
            </Button>
          </div>
        </Drawer>

        {/* Main Layout */}
        <Layout
          style={{
            marginLeft: isMobile ? 0 : collapsed ? 0 : 0,
            transition: "margin-left 0.2s",
          }}
        >
          {/* Content */}
          <Content
            style={{
              margin: 0,
              paddingTop: 16,
              paddingLeft: isMobile ? 16 : 24,
              paddingRight: isMobile ? 16 : 24,
              minHeight: "calc(100vh - 80px)",
              background: "#f5f5f5",
            }}
          >
            <Card
              style={{
                background: colorBgContainer,
                borderRadius: borderRadiusLG,
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                marginBottom: 12,
              }}
              bodyStyle={{
                paddingBottom: 0,
                paddingTop: 10,
                paddingLeft: 16,
                paddingRight: 16,
              }}
            >
              <AppBreadcrumb />
            </Card>
            <Card
              style={{
                background: colorBgContainer,
                borderRadius: borderRadiusLG,
                minHeight: "calc(100vh - 160px)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              }}
              bodyStyle={{ padding: isMobile ? 16 : 24 }}
            >
              <Outlet />
            </Card>
          </Content>
        </Layout>
      </Layout>
    </>
  );
};

export default SideBar;
