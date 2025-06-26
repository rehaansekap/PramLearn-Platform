import React, { useState, useEffect } from "react";
import { Card, Typography, Row, Col, Empty, Spin, Space, Alert } from "antd";
import {
  CalendarOutlined,
  LoadingOutlined,
  BookOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import useTeacherSessions from "./hooks/useTeacherSessions";
import SessionCard from "./components/SessionCard";
import SessionFilters from "./components/SessionFilters";

const { Title, Text } = Typography;

const TeacherSessions = () => {
  const navigate = useNavigate();
  const { sessions, availableClasses, loading, error, refetch } =
    useTeacherSessions();

  const [searchText, setSearchText] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSearch = (search) => {
    setSearchText(search);
    refetch({ search, class: classFilter });
  };

  const handleClassFilter = (classId) => {
    setClassFilter(classId);
    refetch({ search: searchText, class: classId });
  };

  const handleSessionClick = (session) => {
    navigate(`/teacher/sessions/${session.slug}`);
  };

  const filteredSessions = sessions.filter((session) => {
    const matchSearch =
      searchText === "" ||
      session.name.toLowerCase().includes(searchText.toLowerCase()) ||
      session.class_name.toLowerCase().includes(searchText.toLowerCase());

    const matchClass =
      classFilter === "" || session.class_id === parseInt(classFilter);

    return matchSearch && matchClass;
  });

  const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

  if (error && !sessions.length) {
    return (
      <Card style={{ margin: "24px", borderRadius: 12 }}>
        <Alert
          message="Error"
          description="Gagal memuat data pertemuan. Silakan coba lagi."
          type="error"
          showIcon
          action={<button onClick={() => refetch()}>Coba Lagi</button>}
        />
      </Card>
    );
  }

  return (
    <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Header */}
      <Card
        style={{
          marginBottom: 24,
          borderRadius: 12,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          border: "none",
          color: "white",
        }}
        bodyStyle={{ padding: "32px" }}
      >
        <Row align="middle">
          <Col flex="auto">
            <Space direction="vertical" size="small">
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <CalendarOutlined style={{ fontSize: 32, color: "white" }} />
                <Title level={2} style={{ color: "white", margin: 0 }}>
                  Pertemuan & Sesi Pembelajaran
                </Title>
              </div>
              <Text style={{ color: "rgba(255, 255, 255, 0.8)", fontSize: 16 }}>
                Kelola dan pantau pertemuan pembelajaran untuk setiap mata
                pelajaran
              </Text>
            </Space>
          </Col>
          <Col>
            <div
              style={{
                background: "rgba(255, 255, 255, 0.2)",
                borderRadius: 12,
                padding: "12px 20px",
                textAlign: "center",
              }}
            >
              <Title level={3} style={{ color: "white", margin: 0 }}>
                {sessions.length}
              </Title>
              <Text style={{ color: "rgba(255, 255, 255, 0.8)" }}>
                Mata Pelajaran
              </Text>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Filters */}
      <Card style={{ marginBottom: 24, borderRadius: 12 }}>
        <SessionFilters
          searchText={searchText}
          classFilter={classFilter}
          availableClasses={availableClasses}
          onSearchChange={handleSearch}
          onClassFilterChange={handleClassFilter}
          loading={loading}
        />
      </Card>

      {/* Content */}
      <Card style={{ borderRadius: 12 }} bodyStyle={{ padding: "24px" }}>
        {loading && !sessions.length ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <Spin indicator={antIcon} />
            <p style={{ marginTop: 16, color: "#666" }}>
              Memuat data pertemuan...
            </p>
          </div>
        ) : filteredSessions.length > 0 ? (
          <Row gutter={[0, 16]}>
            {filteredSessions.map((session) => (
              <Col key={session.id} span={24}>
                <SessionCard
                  session={session}
                  onClick={() => handleSessionClick(session)}
                />
              </Col>
            ))}
          </Row>
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <div>
                <BookOutlined
                  style={{ fontSize: 48, color: "#d9d9d9", marginBottom: 16 }}
                />
                <Text style={{ fontSize: 16, color: "#666", display: "block" }}>
                  {searchText || classFilter
                    ? "Tidak ada pertemuan yang sesuai dengan filter"
                    : "Belum ada mata pelajaran yang diampu"}
                </Text>
                <Text type="secondary" style={{ fontSize: 14 }}>
                  {searchText || classFilter
                    ? "Coba ubah kata kunci pencarian atau filter"
                    : "Hubungi admin untuk menambahkan mata pelajaran"}
                </Text>
              </div>
            }
          />
        )}
      </Card>

      {/* Loading overlay untuk refresh */}
      {loading && sessions.length > 0 && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(255, 255, 255, 0.8)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <Spin indicator={antIcon} tip="Memperbarui data pertemuan..." />
        </div>
      )}
    </div>
  );
};

export default TeacherSessions;
