import React, { useState, useEffect } from "react";
import { Spin, Alert, Button, Space } from "antd";
import { LoadingOutlined, ReloadOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

// Import hooks
import useTeacherSessions from "./hooks/useTeacherSessions";

// Import components
import SessionsHeader from "./components/sessions-list/SessionsHeader";
import SessionsFilters from "./components/sessions-list/SessionsFilters";
import SessionsStats from "./components/sessions-list/SessionsStats";
import SessionsGrid from "./components/sessions-list/SessionsGrid";
import SessionsEmptyState from "./components/sessions-list/SessionsEmptyState";

const TeacherSessions = () => {
  const navigate = useNavigate();
  const { sessions, availableClasses, loading, error, refetch } =
    useTeacherSessions();

  // Local state
  const [searchText, setSearchText] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [refreshing, setRefreshing] = useState(false);

  // Responsive handler
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Filter sessions
  const filteredSessions = sessions.filter((session) => {
    const matchSearch =
      searchText === "" ||
      session.name.toLowerCase().includes(searchText.toLowerCase()) ||
      session.class_name.toLowerCase().includes(searchText.toLowerCase());

    const matchClass =
      classFilter === "" || session.class_id === parseInt(classFilter);

    return matchSearch && matchClass;
  });

  // Handlers
  const handleSearch = (search) => {
    setSearchText(search);
  };

  const handleClassFilter = (classId) => {
    setClassFilter(classId);
  };

  const handleSessionClick = (session) => {
    navigate(`/teacher/sessions/${session.slug}`);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } catch (error) {
      console.error("Error refreshing sessions:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleClearFilters = () => {
    setSearchText("");
    setClassFilter("");
  };

  const hasFilters = searchText !== "" || classFilter !== "";
  const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

  // Error state
  if (error && !sessions.length) {
    return (
      <div
        style={{
          minHeight: "calc(100vh - 200px)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "24px",
        }}
      >
        <Alert
          message="Gagal Memuat Data Sesi"
          description="Terjadi kesalahan saat mengambil data sesi pembelajaran. Silakan coba lagi."
          type="error"
          showIcon
          style={{
            maxWidth: 500,
            borderRadius: 12,
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}
          action={
            <Space>
              <Button
                type="primary"
                icon={<ReloadOutlined />}
                onClick={handleRefresh}
                loading={refreshing}
                style={{ borderRadius: 8 }}
              >
                Coba Lagi
              </Button>
            </Space>
          }
        />
      </div>
    );
  }

  // Loading state
  if (loading && !sessions.length) {
    return (
      <div
        style={{
          minHeight: "calc(100vh - 200px)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "#fafafa",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <Spin indicator={antIcon} style={{ marginBottom: 16 }} />
          <div style={{ color: "#666", fontSize: 16 }}>
            Memuat data sesi pembelajaran...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "calc(100vh - 64px)",
        // background: "#f8fafc",
        padding: isMobile ? "16px" : "24px",
      }}
    >
      <div
        style={{
          maxWidth: 1400,
          margin: "0 auto",
        }}
      >
        \
        <SessionsHeader
          onRefresh={handleRefresh}
          refreshing={refreshing}
          sessionsCount={sessions.length}
          isMobile={isMobile}
        />
        {/* Filters */}
        {/* <SessionsFilters
          searchText={searchText}
          classFilter={classFilter}
          availableClasses={availableClasses}
          onSearchChange={handleSearch}
          onClassFilterChange={handleClassFilter}
          loading={loading}
          isMobile={isMobile}
        /> */}
        {/* Statistics - Only show if there are sessions */}
        {sessions.length > 0 && (
          <SessionsStats sessions={sessions} isMobile={isMobile} />
        )}
        {/* Content */}
        {filteredSessions.length > 0 ? (
          <SessionsGrid
            sessions={filteredSessions}
            onSessionClick={handleSessionClick}
            isMobile={isMobile}
          />
        ) : (
          <SessionsEmptyState
            hasFilters={hasFilters}
            onClearFilters={handleClearFilters}
          />
        )}
      </div>
    </div>
  );
};

export default TeacherSessions;
