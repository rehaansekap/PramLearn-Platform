import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Spin, Alert, message } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

// Import hooks
import useSessionMaterialDetail from "./hooks/useSessionMaterialDetail";

// Import refactored components
import {
  SessionsMaterialDetailHeader,
  SessionsMaterialDetailTabs,
  SessionsMaterialContentTab,
  SessionsMaterialStudentsTab,
  SessionsMaterialGroupsTab,
  SessionsMaterialQuizzesTab,
  SessionsMaterialAssignmentsTab,
  SessionsMaterialARCSTab,
  SessionsMaterialAnalyticsTab,
} from "./components/sessions-material-detail";

const TeacherSessionMaterialDetailPage = () => {
  const { subjectSlug, materialSlug } = useParams();
  const navigate = useNavigate();
  const { materialDetail, loading, error, refetch } =
    useSessionMaterialDetail(materialSlug);

  const [activeTab, setActiveTab] = useState("content");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleBack = () => {
    navigate(`/teacher/sessions/${subjectSlug}`);
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

  const handleDataUpdate = async () => {
    await refetch();
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
          description="Gagal memuat data material. Silakan coba lagi."
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

  if (loading && !materialDetail) {
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
        <div style={{ textAlign: "center" }}>
          <Spin indicator={antIcon} size="large" />
          <div style={{ marginTop: 16, color: "#666", fontSize: 16 }}>
            Memuat detail material...
          </div>
        </div>
      </div>
    );
  }

  if (!materialDetail) {
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
          description="Material yang Anda cari tidak ditemukan."
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
      case "content":
        return (
          <SessionsMaterialContentTab
            materialSlug={materialSlug}
            materialDetail={materialDetail}
            isMobile={isMobile}
          />
        );
      case "students":
        return (
          <SessionsMaterialStudentsTab
            materialDetail={materialDetail}
            isMobile={isMobile}
            onRefresh={handleRefresh}
            refreshing={refreshing}
            onDataUpdate={handleDataUpdate}
          />
        );
      case "groups":
        return (
          <SessionsMaterialGroupsTab
            materialSlug={materialSlug}
            groups={materialDetail.groups || []}
            students={materialDetail.students || []}
            materialDetail={materialDetail}
            isMobile={isMobile}
          />
        );
      case "quizzes":
        return (
          <SessionsMaterialQuizzesTab
            materialSlug={materialSlug}
            materialDetail={materialDetail}
            isMobile={isMobile}
          />
        );
      case "assignments":
        return (
          <SessionsMaterialAssignmentsTab
            materialSlug={materialSlug}
            materialDetail={materialDetail}
            isMobile={isMobile}
          />
        );
      case "arcs":
        return (
          <SessionsMaterialARCSTab
            materialSlug={materialSlug}
            materialDetail={materialDetail}
            isMobile={isMobile}
          />
        );
      case "analytics":
        return (
          <SessionsMaterialAnalyticsTab
            materialDetail={materialDetail}
            isMobile={isMobile}
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
      <Helmet>
        <title>
          {materialDetail.name
            ? `${materialDetail.name} | PramLearn`
            : "Detail Materi | PramLearn"}
        </title>
      </Helmet>
      <div style={{ maxWidth: 1400, margin: "0 auto" }}>
        <SessionsMaterialDetailHeader
          materialDetail={materialDetail}
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
          <SessionsMaterialDetailTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            materialDetail={materialDetail}
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

export default TeacherSessionMaterialDetailPage;
