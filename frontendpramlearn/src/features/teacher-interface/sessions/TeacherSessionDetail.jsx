import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Spin, Alert, message } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

// Import hooks
import useTeacherSessionDetail from "./hooks/useTeacherSessionDetail";

// Import refactored components
import SessionsDetailHeader from "./components/sessions-detail/SessionsDetailHeader";
import SessionsDetailTabs from "./components/sessions-detail/SessionsDetailTabs";
import SessionsDetailMaterialsGrid from "./components/sessions-detail/SessionsDetailMaterialsGrid";
import SessionsDetailAnalytics from "./components/sessions-detail/SessionsDetailAnalytics";
import SessionsDetailStudents from "./components/sessions-detail/SessionsDetailStudents";

const TeacherSessionDetail = () => {
  const { subjectSlug } = useParams();
  const navigate = useNavigate();
  const { sessionDetail, loading, error, refetch } =
    useTeacherSessionDetail(subjectSlug);

  const [activeTab, setActiveTab] = useState("materials");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [actionLoading, setActionLoading] = useState({});
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleBack = () => {
    navigate("/teacher/sessions");
  };

  const handleViewMaterial = async (material) => {
    try {
      setActionLoading((prev) => ({ ...prev, [`view_${material.id}`]: true }));
      // Add your view material logic here
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
      navigate(`/teacher/sessions/${subjectSlug}/${material.slug}`);
    } catch (err) {
      message.error("Gagal membuka materi");
    } finally {
      setActionLoading((prev) => ({ ...prev, [`view_${material.id}`]: false }));
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
      message.success("Data berhasil diperbarui");
    } catch (err) {
      message.error("Gagal memperbarui data");
    } finally {
      setRefreshing(false);
    }
  };

  const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

  if (error) {
    return (
      <div
        style={{
          minHeight: "calc(100vh - 64px)",
          background: "linear-gradient(135deg, #f8fafc 0%, #e6f3ff 100%)",
          padding: "24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Alert
          message="Error"
          description="Gagal memuat data session. Silakan coba lagi."
          type="error"
          showIcon
          style={{
            borderRadius: 16,
            maxWidth: 500,
            width: "100%",
          }}
        />
      </div>
    );
  }

  if (loading && !sessionDetail) {
    return (
      <div
        style={{
          minHeight: "calc(100vh - 64px)",
          background: "linear-gradient(135deg, #f8fafc 0%, #e6f3ff 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Spin
          indicator={antIcon}
          size="large"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
          }}
        />
      </div>
    );
  }

  if (!sessionDetail) {
    return (
      <div
        style={{
          minHeight: "calc(100vh - 64px)",
          background: "linear-gradient(135deg, #f8fafc 0%, #e6f3ff 100%)",
          padding: "24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Alert
          message="Data Tidak Ditemukan"
          description="Session yang Anda cari tidak ditemukan."
          type="warning"
          showIcon
          style={{
            borderRadius: 16,
            maxWidth: 500,
            width: "100%",
          }}
        />
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "materials":
        return (
          <SessionsDetailMaterialsGrid
            materials={sessionDetail.sessions_data || []}
            onViewMaterial={handleViewMaterial}
            actionLoading={actionLoading}
            isMobile={isMobile}
          />
        );
      case "analytics":
        return (
          <SessionsDetailAnalytics
            sessionDetail={sessionDetail}
            isMobile={isMobile}
          />
        );
      case "students":
        return (
          <SessionsDetailStudents
            sessionDetail={sessionDetail}
            isMobile={isMobile}
            onRefresh={handleRefresh}
            refreshing={refreshing}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div
      className="sessions-list-container"
      style={{
        // background: "linear-gradient(135deg, #f8fafc 0%, #e6f3ff 100%)",
        minHeight: "calc(100vh - 64px)",
        padding: isMobile ? "16px" : "24px",
      }}
    >
      <div style={{ maxWidth: 1400, margin: "0 auto" }}>
        <SessionsDetailHeader
          sessionDetail={sessionDetail}
          onBack={handleBack}
          onRefresh={handleRefresh}
          refreshing={refreshing}
          isMobile={isMobile}
        />

        <div
          style={{
            background: "white",
            borderRadius: 16,
            boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
            overflow: "hidden",
          }}
        >
          <SessionsDetailTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            sessionDetail={sessionDetail}
            isMobile={isMobile}
          />

          <div style={{ padding: isMobile ? "16px" : "24px" }}>
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherSessionDetail;
