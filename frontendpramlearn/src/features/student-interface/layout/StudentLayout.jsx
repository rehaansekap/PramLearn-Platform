import React, { useContext, useEffect, useState } from "react";
import { Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import { Layout, Menu, Button, Drawer, theme, Breadcrumb, Card } from "antd";
import {
  MenuOutlined,
  CloseOutlined,
  DashboardOutlined,
  BookOutlined,
  FileTextOutlined,
  TrophyOutlined,
  BarChartOutlined,
  TeamOutlined,
  BellOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { AuthContext } from "../../../context/AuthContext";
import Swal from "sweetalert2";
import StudentBreadcrumb from "../components/StudentBreadcrumb";
import StudentNotFound from "../../../components/StudentNotFound"; // Import StudentNotFound

const { Header, Content, Sider } = Layout;

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
      label: <Link to="/student/grades">My Grades</Link>,
    },
    {
      key: "/student/progress",
      icon: <BarChartOutlined />,
      label: <Link to="/student/progress">Progress</Link>,
    },
    {
      key: "/student/group",
      icon: <TeamOutlined />,
      label: <Link to="/student/group">My Group</Link>,
    },
  ];

  // Get selected menu key from current path
  const getMenuKeyFromPath = (pathname) => {
    if (pathname === "/student" || pathname === "/student/") return "/student";
    if (pathname.startsWith("/student/subjects")) return "/student/subjects";
    if (pathname.startsWith("/student/assessments"))
      return "/student/assessments";
    if (pathname.startsWith("/student/assignments"))
      return "/student/assignments";
    if (pathname.startsWith("/student/grades")) return "/student/grades";
    if (pathname.startsWith("/student/progress")) return "/student/progress";
    if (pathname.startsWith("/student/group")) return "/student/group";
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

  // Sidebar content - MODIFIKASI LAYOUT UNTUK PINDAHKAN LOGOUT
  const sidebarContent = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Header Profile */}
      <div
        style={{
          padding: "24px 16px",
          borderBottom: "1px solid #303030",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #1890ff 0%, #52c41a 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 12px",
            color: "#fff",
            fontSize: "24px",
            fontWeight: "bold",
          }}
        >
          {user?.username?.charAt(0)?.toUpperCase() || "S"}
        </div>
        <div style={{ color: "#fff", fontWeight: 600, fontSize: "16px" }}>
          {user?.username || "Student"}
        </div>
        <div style={{ color: "#bfbfbf", fontSize: "12px" }}>Student</div>
      </div>

      {/* Menu Items */}
      <div style={{ flex: 1, overflowY: "auto" }}>
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
      </div>

      {/* Logout Button - DIPINDAH KE ATAS TOGGLE BUTTON */}
      <div
        style={{
          padding: "16px",
          borderTop: "1px solid #303030",
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
          Logout
        </Button>
      </div>

      {/* Toggle Button untuk Desktop - DIPINDAH KE PALING BAWAH */}
      {!isMobile && (
        <div
          style={{
            padding: "8px 16px",
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
            }}
          >
            {collapsed ? "Expand" : "Collapse"}
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Desktop Sidebar */}
      {!isMobile && (
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          width={280}
          style={{
            background: "#11418b",
            position: "fixed",
            height: "100vh",
            left: 0,
            top: 0,
            zIndex: 100,
          }}
        >
          {sidebarContent}
        </Sider>
      )}

      {/* Mobile Drawer */}
      <Drawer
        title={
          <div style={{ textAlign: "center", color: "#fff" }}>
            <div style={{ fontSize: "18px", fontWeight: "bold" }}>
              PramLearn
            </div>
            <div style={{ fontSize: "12px", opacity: 0.8 }}>Student Portal</div>
          </div>
        }
        placement="left"
        open={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        headerStyle={{
          background: "#11418b",
          borderBottom: "1px solid #303030",
        }}
        bodyStyle={{
          background: "#11418b",
          padding: 0,
        }}
        width={280}
      >
        {sidebarContent}
      </Drawer>

      {/* Main Layout */}
      <Layout
        style={{
          marginLeft: isMobile ? 0 : collapsed ? 80 : 280,
          transition: "margin-left 0.2s",
        }}
      >
        {/* Header */}
        <Header
          style={{
            padding: 0,
            background: colorBgContainer,
            borderBottom: "1px solid #f0f0f0",
            position: "sticky",
            top: 0,
            zIndex: 10,
            boxShadow: "0 2px 8px #f0f1f2",
          }}
        >
          <div
            style={{
              padding: "0 24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              {isMobile && (
                <Button
                  type="text"
                  icon={<MenuOutlined />}
                  onClick={() => setMobileDrawerOpen(true)}
                  style={{ marginRight: 16 }}
                />
              )}
              <h2
                style={{
                  margin: 0,
                  color: "#11418b",
                  fontWeight: "bold",
                }}
              >
                PramLearn - Student Portal
              </h2>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <Button
                type="text"
                icon={<BellOutlined />}
                onClick={() => navigate("/student/notifications")}
              />
              <div style={{ fontSize: "14px", color: "#666" }}>
                Welcome, <strong>{user?.username}</strong>
              </div>
            </div>
          </div>
        </Header>

        {/* Content */}
        <Content
          style={{
            margin: 0,
            padding: 24,
            minHeight: "calc(100vh - 64px)",
            background: "#f5f5f5",
          }}
        >
          <StudentBreadcrumb />
          <Card
            style={{
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
              minHeight: "calc(100vh - 160px)",
            }}
            bodyStyle={{ padding: 0 }}
          >
            {/* Gunakan StudentNotFound untuk 404 routes dalam student area */}
            {location.pathname !== "/student" &&
            !location.pathname.startsWith("/student/subjects") &&
            !location.pathname.startsWith("/student/materials") &&
            !location.pathname.startsWith("/student/assessments") &&
            !location.pathname.startsWith("/student/quiz") &&
            !location.pathname.startsWith("/student/assignments") &&
            !location.pathname.startsWith("/student/grades") &&
            !location.pathname.startsWith("/student/progress") &&
            !location.pathname.startsWith("/student/group") &&
            !location.pathname.startsWith("/student/notifications") ? (
              <StudentNotFound />
            ) : (
              <Outlet />
            )}
          </Card>
        </Content>
      </Layout>
    </Layout>
  );
};

export default StudentLayout;
