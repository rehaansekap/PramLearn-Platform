import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { useParams, useNavigate } from "react-router-dom";
import { Spin, Alert, message, Modal } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import Swal from "sweetalert2";

// Import hooks
import useTeacherSessionDetail from "./hooks/useTeacherSessionDetail";
import useSessionMaterials from "./hooks/useSessionMaterials";

// Import refactored components
import SessionsDetailHeader from "./components/sessions-detail/SessionsDetailHeader";
import SessionsDetailTabs from "./components/sessions-detail/SessionsDetailTabs";
import SessionsDetailMaterialsGrid from "./components/sessions-detail/SessionsDetailMaterialsGrid";
import SessionsDetailAnalytics from "./components/sessions-detail/SessionsDetailAnalytics";
import SessionsDetailStudents from "./components/sessions-detail/SessionsDetailStudents";
import SessionMaterialForm from "./components/SessionMaterialForm";

const TeacherSessionDetail = () => {
  const { subjectSlug } = useParams();
  const navigate = useNavigate();
  const { sessionDetail, loading, error, refetch } =
    useTeacherSessionDetail(subjectSlug);

  // Material management hooks
  const {
    materials,
    loading: materialsLoading,
    fetchMaterials,
    deleteMaterial,
  } = useSessionMaterials(sessionDetail?.subject?.id);

  const [activeTab, setActiveTab] = useState("materials");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [actionLoading, setActionLoading] = useState({});
  const [refreshing, setRefreshing] = useState(false);

  // Material form modal states
  const [isMaterialModalVisible, setIsMaterialModalVisible] = useState(false);
  const [selectedMaterialId, setSelectedMaterialId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [materialLoading, setMaterialLoading] = useState(false);

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
      navigate(`/teacher/sessions/${subjectSlug}/${material.slug}`);
    } catch (err) {
      message.error("Gagal membuka materi");
    } finally {
      setActionLoading((prev) => ({ ...prev, [`view_${material.id}`]: false }));
    }
  };

  const handleAddMaterial = () => {
    setSelectedMaterialId(null);
    setIsMaterialModalVisible(true);
  };

  const handleEditMaterial = async (material) => {
    setActionLoading((prev) => ({ ...prev, [`edit_${material.id}`]: true }));
    try {
      setSelectedMaterialId(material.id);
      setIsMaterialModalVisible(true);
    } catch (error) {
      message.error("Gagal memuat data materi");
    } finally {
      setActionLoading((prev) => ({ ...prev, [`edit_${material.id}`]: false }));
    }
  };

  const handleDeleteMaterial = async (material) => {
    const result = await Swal.fire({
      title: "Yakin ingin menghapus materi ini?",
      text: `Materi "${material.title}" akan dihapus secara permanen!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      setActionLoading((prev) => ({
        ...prev,
        [`delete_${material.id}`]: true,
      }));
      try {
        await deleteMaterial(material.id);
        await Promise.all([refetch(), fetchMaterials()]);
        message.success(`Materi "${material.title}" berhasil dihapus`);
      } catch (error) {
        console.error("Error deleting material:", error);
        message.error("Gagal menghapus materi");
      } finally {
        setActionLoading((prev) => ({
          ...prev,
          [`delete_${material.id}`]: false,
        }));
      }
    }
  };

  const handleMaterialSuccess = async () => {
    setSelectedMaterialId(null);
    setIsMaterialModalVisible(false);
    try {
      await Promise.all([refetch(), fetchMaterials()]);
      message.success("Materi berhasil disimpan!");
    } catch (error) {
      console.error("Error refreshing data:", error);
    }
  };

  const handleMaterialModalCancel = () => {
    setIsMaterialModalVisible(false);
    setSelectedMaterialId(null);
    setMaterialLoading(false);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([refetch(), fetchMaterials()]);
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
            materials={sessionDetail.sessions || []}
            onViewMaterial={handleViewMaterial}
            onEditMaterial={handleEditMaterial}
            onDeleteMaterial={handleDeleteMaterial}
            onAddMaterial={handleAddMaterial}
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
      <Helmet>
        <title>
          {sessionDetail?.subject?.name
            ? `${sessionDetail.subject.name} | PramLearn`
            : "Sesi Pembelajaran | PramLearn"}
        </title>
      </Helmet>
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
            materialsCount={materials?.length || 0}
            isMobile={isMobile}
          />

          <div style={{ padding: isMobile ? "16px" : "24px" }}>
            {renderTabContent()}
          </div>
        </div>
      </div>

      {/* Material Form Modal */}
      <Modal
        open={isMaterialModalVisible}
        onCancel={handleMaterialModalCancel}
        footer={null}
        centered
        destroyOnClose
        width={800}
        className="session-material-modal"
        title={null}
        style={{ borderRadius: 16 }}
      >
        {materialLoading ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <Spin indicator={antIcon} />
            <p style={{ marginTop: 16, color: "#666" }}>
              Memuat data materi...
            </p>
          </div>
        ) : (
          <SessionMaterialForm
            materialId={selectedMaterialId}
            subjectId={sessionDetail?.subject?.id}
            onSuccess={handleMaterialSuccess}
            isSubmitting={isSubmitting}
            setIsSubmitting={setIsSubmitting}
          />
        )}
      </Modal>
    </div>
  );
};

export default TeacherSessionDetail;
