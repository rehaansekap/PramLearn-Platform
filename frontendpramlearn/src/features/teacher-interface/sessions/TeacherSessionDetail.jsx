import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Typography, Tabs, Alert, Spin, Button, Space } from "antd";
import {
  ArrowLeftOutlined,
  CalendarOutlined,
  LoadingOutlined,
  UnorderedListOutlined,
  BarChartOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import useTeacherSessionDetail from "./hooks/useTeacherSessionDetail";
import SessionDetailCard from "./components/SessionDetailCard";
import SessionMaterialManagement from "./components/SessionMaterialManagement"; // Import component baru

const { Title } = Typography;
const { TabPane } = Tabs;

const TeacherSessionDetail = () => {
  const { subjectSlug } = useParams();
  const navigate = useNavigate();
  const { sessionDetail, loading, error, refetch } =
    useTeacherSessionDetail(subjectSlug);

  const [activeTab, setActiveTab] = useState("materials");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleBack = () => {
    navigate("/teacher/sessions");
  };

  const handleViewMaterial = async (material) => {
    const viewKey = `view_${material.id}`;
    setActionLoading((prev) => ({ ...prev, [viewKey]: true }));

    try {
      // Navigate to sessions material detail page instead of regular material detail
      navigate(`/teacher/sessions/material/${material.slug}`);
    } catch (error) {
      console.error("Error viewing material:", error);
    } finally {
      setActionLoading((prev) => ({ ...prev, [viewKey]: false }));
    }
  };

  const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

  if (error) {
    return (
      <Card style={{ margin: "24px", borderRadius: 12 }}>
        <Alert
          message="Error"
          description="Gagal memuat detail pertemuan. Silakan coba lagi."
          type="error"
          showIcon
          action={
            <Space>
              <Button onClick={() => refetch()}>Coba Lagi</Button>
              <Button onClick={handleBack}>Kembali</Button>
            </Space>
          }
        />
      </Card>
    );
  }

  if (loading && !sessionDetail) {
    return (
      <div style={{ textAlign: "center", padding: "60px 0" }}>
        <Spin indicator={antIcon} />
        <p style={{ marginTop: 16, color: "#666" }}>
          Memuat detail pertemuan...
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: "24px", maxWidth: "1400px", margin: "0 auto" }}>
      {/* Back Button */}
      <div style={{ marginBottom: 16 }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={handleBack}
          style={{ borderRadius: 8 }}
        >
          Kembali ke Daftar Pertemuan
        </Button>
      </div>

      {/* Session Detail Header */}
      <SessionDetailCard sessionDetail={sessionDetail} loading={loading} />

      {/* Content Tabs */}
      <Card style={{ borderRadius: 12 }} bodyStyle={{ padding: 0 }}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          type="card"
          size="large"
          style={{ marginBottom: 0 }}
          tabBarStyle={{
            margin: 0,
            paddingLeft: 24,
            paddingRight: 24,
            paddingTop: 16,
            background: "#fafafa",
            borderRadius: "12px 12px 0 0",
          }}
        >
          <TabPane
            tab={
              <span>
                <UnorderedListOutlined />
                {!isMobile && " Manajemen Materi"}
              </span>
            }
            key="materials"
          >
            <div style={{ padding: "24px" }}>
              {sessionDetail && (
                <SessionMaterialManagement
                  subjectId={sessionDetail.subject.id}
                  subjectName={sessionDetail.subject.name}
                  className={sessionDetail.subject.class_name}
                />
              )}
            </div>
          </TabPane>

          <TabPane
            tab={
              <span>
                <BarChartOutlined />
                {!isMobile && " Analisis Performa"}
              </span>
            }
            key="analytics"
          >
            <div style={{ padding: "24px" }}>
              {/* Performance Analytics Component */}
              <div style={{ textAlign: "center", padding: "60px 0" }}>
                <BarChartOutlined
                  style={{ fontSize: 48, color: "#d9d9d9", marginBottom: 16 }}
                />
                <Title level={4} style={{ color: "#999" }}>
                  Analisis Performa
                </Title>
                <p style={{ color: "#666" }}>
                  Fitur analisis performa akan segera hadir
                </p>
              </div>
            </div>
          </TabPane>

          <TabPane
            tab={
              <span>
                <TeamOutlined />
                {!isMobile && " Performa Siswa"}
              </span>
            }
            key="students"
          >
            <div style={{ padding: "24px" }}>
              {/* Student Performance Component */}
              <div style={{ textAlign: "center", padding: "60px 0" }}>
                <TeamOutlined
                  style={{ fontSize: 48, color: "#d9d9d9", marginBottom: 16 }}
                />
                <Title level={4} style={{ color: "#999" }}>
                  Performa Siswa
                </Title>
                <p style={{ color: "#666" }}>
                  Detail performa siswa akan segera hadir
                </p>
              </div>
            </div>
          </TabPane>
        </Tabs>
      </Card>

      {/* Loading overlay untuk refresh */}
      {loading && sessionDetail && (
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
          <Spin indicator={antIcon} tip="Memperbarui data..." />
        </div>
      )}
    </div>
  );
};

export default TeacherSessionDetail;
