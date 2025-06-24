import React from "react";
import { Outlet } from "react-router-dom";
import { Layout, theme, Card, Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

import TeacherHeader from "./components/TeacherHeader";
import TeacherSidebar from "./components/TeacherSidebar";
import TeacherMobileDrawer from "./components/TeacherMobileDrawer";
import TeacherBreadcrumb from "../components/TeacherBreadcrumb";
import PageLoading from "../../../components/PageLoading";
import { useTeacherLayout } from "./hooks/useTeacherLayout";

const { Content, Sider } = Layout;

const TeacherLayout = () => {
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
  } = useTeacherLayout();

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // Loading state jika user belum dimuat
  if (!user || !token) {
    return <PageLoading message="Memuat data pengguna..." />;
  }

  // Redirect loading untuk non-teacher/admin
  if (user.role !== 2 && user.role !== 1) {
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
      <TeacherHeader
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
            <TeacherSidebar
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
        <TeacherMobileDrawer
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
              <TeacherBreadcrumb />
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

export default TeacherLayout;
