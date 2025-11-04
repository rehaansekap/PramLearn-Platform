import React from "react";
import { Outlet, Navigate } from "react-router-dom";
import { Layout, theme, Card, Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

import StudentHeader from "./components/StudentHeader";
import StudentSidebar from "./components/StudentSidebar";
import StudentMobileDrawer from "./components/StudentMobileDrawer";
import StudentBreadcrumb from "../components/StudentBreadcrumb";
import PageLoading from "../../../components/PageLoading";
import { useStudentLayout } from "./hooks/useStudentLayout";

const { Content, Sider } = Layout;

const StudentLayout = () => {
  const {
    collapsed,
    isMobile,
    mobileDrawerOpen,
    user,
    token,
    selectedMenuKey,
    setCollapsed,
    setMobileDrawerOpen,
    handleLogout,
  } = useStudentLayout();

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // Loading state jika user belum dimuat atau bukan siswa
  if (!user || !token) {
    return <PageLoading message="Memuat data pengguna..." />;
  }

  // Redirect loading untuk non-siswa
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

  return (
    <>
      {/* Header Tetap */}
      <StudentHeader
        user={user}
        isMobile={isMobile}
        onMobileMenuOpen={() => setMobileDrawerOpen(true)}
        onLogout={handleLogout}
      />

      <Layout style={{ minHeight: "100vh", paddingTop: 64 }}>
        {/* Sidebar Desktop */}
        {!isMobile && (
          <Sider
            trigger={null}
            collapsible
            collapsed={collapsed}
            width={280}
            collapsedWidth={72}
            style={{
              background: "#001529",
              position: "fixed",
              height: "calc(100vh - 64px)",
              left: 0,
              top: 64,
              zIndex: 100,
              boxShadow: "2px 0 8px rgba(0,0,0,0.15)",
            }}
          >
            <StudentSidebar
              user={user}
              collapsed={collapsed}
              isMobile={isMobile}
              selectedMenuKey={selectedMenuKey}
              onToggleCollapse={() => setCollapsed(!collapsed)}
              onLogout={handleLogout}
            />
          </Sider>
        )}

        {/* Drawer Mobile */}
        <StudentMobileDrawer
          open={mobileDrawerOpen}
          onClose={() => setMobileDrawerOpen(false)}
          user={user}
          selectedMenuKey={selectedMenuKey}
          onLogout={handleLogout}
        />

        {/* Layout Utama */}
        <Layout
          style={{
            marginLeft: isMobile ? 0 : collapsed ? 0 : 0,
            transition: "margin-left 0.2s",
          }}
        >
          {/* Konten */}
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
                paddingBottom: 10,
                paddingTop: 10,
                paddingLeft: 16,
                paddingRight: 16,
              }}
            >
              <StudentBreadcrumb />
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

export default StudentLayout;
