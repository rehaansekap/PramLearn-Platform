import React, { useState, useContext, useEffect } from "react";
import { Link, useNavigate, useLocation, Outlet } from "react-router-dom";
import { AuthContext } from "../../../context/AuthContext";
import {
  HomeIcon,
  BookOpenIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  UserGroupIcon,
  ArrowLeftOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import { Button, Layout, Menu, theme, Drawer, Avatar, Spin, Space } from "antd";
import {
  DashboardOutlined,
  BookOutlined,
  FileTextOutlined,
  BarChartOutlined,
  TeamOutlined,
  LogoutOutlined,
  UserOutlined,
  LoadingOutlined,
  TrophyOutlined, // Add this import
} from "@ant-design/icons";
import Swal from "sweetalert2";
import StudentBreadcrumb from "../components/StudentBreadcrumb";
import NotificationBell from "../notifications/components/NotificationBell";

const { Header, Sider, Content } = Layout;

const StudentLayout = () => {
  const [collapsed, setCollapsed] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const { user, logout, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // Role validation - redirect jika bukan student
  useEffect(() => {
    if (user && user.role !== 3) {
      Swal.fire({
        title: "Akses Ditolak",
        text: "Halaman ini khusus untuk siswa.",
        icon: "warning",
        confirmButtonText: "OK",
      }).then(() => {
        navigate("/management");
      });
    }
  }, [user, navigate]);

  // Responsive handler
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) {
        setMobileDrawerOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
        navigate("/login");
        Swal.fire(
          "Logout Berhasil!",
          "Anda telah keluar dari sistem.",
          "success"
        );
      }
    });
  };

  const menuItems = [
    {
      key: "/student",
      icon: <DashboardOutlined />,
      label: <Link to="/student">Dashboard</Link>,
    },
    {
      key: "/student/subjects",
      icon: <BookOutlined />,
      label: <Link to="/student/subjects">My Subjects</Link>,
    },
    {
      key: "/student/assessments",
      icon: <FileTextOutlined />,
      label: <Link to="/student/assessments">Assessments</Link>,
    },
    {
      key: "/student/assignments",
      icon: <FileTextOutlined />,
      label: <Link to="/student/assignments">Assignments</Link>,
    },
    {
      key: "/student/grades",
      icon: <TrophyOutlined />,
      label: <Link to="/student/grades">Grades & Results</Link>,
    },
    {
      key: "/student/progress",
      icon: <BarChartOutlined />,
      label: <Link to="/student/progress">My Progress</Link>,
    },
    {
      key: "/student/analytics",
      icon: <BarChartOutlined />,
      label: <Link to="/student/analytics">Learning Analytics</Link>,
    },
    {
      key: "/student/group",
      icon: <TeamOutlined />,
      label: <Link to="/student/group">My Group</Link>,
    },
  ];

  // Get selected menu key from current path
  const getMenuKeyFromPath = (pathname) => {
    // Handle exact matches first
    if (pathname === "/student" || pathname === "/student/") return "/student";
    if (pathname.startsWith("/student/subjects")) return "/student/subjects";
    if (pathname.startsWith("/student/assessments"))
      return "/student/assessments";
    if (pathname.startsWith("/student/assignments"))
      return "/student/assignments";
    if (pathname.startsWith("/student/grades")) return "/student/grades";
    if (pathname.startsWith("/student/progress")) return "/student/progress";
    return "/student";
  };

  const selectedMenuKey = getMenuKeyFromPath(location.pathname);

  // Loading state jika user belum dimuat atau bukan student
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

  // Redirect loading untuk non-student
  if (user.role !== 3) {
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
          tip="Mengalihkan..."
        />
      </div>
    );
  }

  // Sidebar content
  const sidebarContent = (
    <div style={{ height: "100%" }}>
      {/* Logo & User Info */}
      <div
        style={{
          padding: "16px",
          borderBottom: "1px solid #303030",
          textAlign: "center",
        }}
      >
        <div style={{ marginBottom: "12px" }}>
          <Avatar
            size={collapsed && !isMobile ? 32 : 48}
            icon={<UserOutlined />}
            style={{ backgroundColor: "#11418b" }}
          />
        </div>
        {(!collapsed || isMobile) && (
          <div>
            <div
              style={{
                color: "#ffffff",
                fontSize: "16px",
                fontWeight: 600,
                marginBottom: "4px",
              }}
            >
              {user.first_name || user.username}
            </div>
            <div
              style={{
                color: "#d9d9d9",
                fontSize: "12px",
              }}
            >
              Student Portal
            </div>
          </div>
        )}
      </div>

      {/* Navigation Menu */}
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[selectedMenuKey]}
        style={{ borderRight: 0, background: "transparent" }}
        items={menuItems.map((item) => ({
          ...item,
          label: (
            <span
              onClick={() => {
                if (isMobile) setMobileDrawerOpen(false);
              }}
            >
              {item.label}
            </span>
          ),
        }))}
      />

      {/* Logout Button */}
      <div
        style={{
          position: "absolute",
          bottom: "16px",
          left: "16px",
          right: "16px",
        }}
      >
        <Button
          type="primary"
          danger
          icon={<LogoutOutlined />}
          onClick={handleLogout}
          block
          style={{
            height: "40px",
            fontWeight: 600,
          }}
        >
          {(!collapsed || isMobile) && "Logout"}
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <Header
        style={
          {
            /* existing styles */
          }
        }
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ color: "#fff", fontWeight: 600, fontSize: "16px" }}>
            Student Portal
          </div>
          <Space>
            <NotificationBell
              onOpenCenter={() => navigate("/student/notifications")}
            />
            <Avatar
              size={32}
              icon={<UserOutlined />}
              style={{ backgroundColor: "#ffffff20" }}
            />
          </Space>
        </div>
      </Header>
      <Layout style={{ minHeight: "100vh" }}>
        {/* Desktop Sidebar */}
        {!isMobile && (
          <Sider
            theme="dark"
            collapsible
            collapsed={collapsed}
            onCollapse={setCollapsed}
            style={{
              background: "#001529",
              position: "fixed",
              height: "100vh",
              left: 0,
              top: 0,
              bottom: 0,
              zIndex: 100,
            }}
            width={250}
            collapsedWidth={80}
          >
            {sidebarContent}
          </Sider>
        )}

        {/* Mobile Drawer */}
        {isMobile && (
          <Drawer
            title="Student Menu"
            placement="left"
            closable={true}
            onClose={() => setMobileDrawerOpen(false)}
            open={mobileDrawerOpen}
            width={250}
            bodyStyle={{ padding: 0, background: "#001529" }}
            headerStyle={{
              background: "#001529",
              borderBottom: "1px solid #303030",
            }}
            style={{ background: "#001529" }}
          >
            {sidebarContent}
          </Drawer>
        )}

        {/* Main Layout */}
        <Layout
          style={{
            marginLeft: isMobile ? 0 : collapsed ? 80 : 250,
            transition: "margin-left 0.2s",
          }}
        >
          {/* Mobile Header */}
          {isMobile && (
            <Header
              style={{
                background: "#11418b",
                padding: "0 16px",
                position: "fixed",
                width: "100%",
                top: 0,
                zIndex: 99,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Button
                type="text"
                icon={
                  <Bars3Icon className="h-6 w-6" style={{ color: "#fff" }} />
                }
                onClick={() => setMobileDrawerOpen(true)}
                style={{ color: "#fff" }}
              />
              <div style={{ color: "#fff", fontWeight: 600, fontSize: "16px" }}>
                Student Portal
              </div>
              <Avatar
                size={32}
                icon={<UserOutlined />}
                style={{ backgroundColor: "#ffffff20" }}
              />
            </Header>
          )}

          {/* Breadcrumb */}
          <Content
            style={{
              margin: isMobile ? "64px 12px 0px 8px" : "12px 12px 0px 8px",
              paddingLeft: 24,
              paddingRight: 24,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            <StudentBreadcrumb />
          </Content>

          {/* Main Content */}
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
      </Layout>
    </>
  );
};

export default StudentLayout;
