import React, { useState, useEffect } from "react";
import { message, Spin, Alert, Button } from "antd";
import { ReloadOutlined, LoadingOutlined } from "@ant-design/icons";

import useSessionAssignmentManagement from "../../hooks/useSessionAssignmentManagement";

// Import new components
import AssignmentsHeader from "./assignments/AssignmentsHeader";
import AssignmentsStatsCards from "./assignments/AssignmentsStatsCards";
import AssignmentControlPanel from "./assignments/AssignmentControlPanel";
import AssignmentsTable from "./assignments/AssignmentsTable";
import AssignmentFormModal from "./assignments/AssignmentFormModal";
import AssignmentDetailModal from "./assignments/AssignmentDetailModal";

const SessionsMaterialAssignmentsTab = ({
  materialSlug,
  materialDetail,
  isMobile = false,
}) => {
  const [isAssignmentModalVisible, setIsAssignmentModalVisible] =
    useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [actionLoading, setActionLoading] = useState({});
  const [refreshing, setRefreshing] = useState(false);

  const {
    assignments,
    selectedAssignment,
    setSelectedAssignment,
    assignmentDetail,
    submissions,
    questions,
    students,
    statistics,
    loading,
    detailLoading,
    submissionsLoading,
    gradingLoading,
    fetchAssignments,
    fetchAssignmentDetail,
    fetchAssignmentForEdit,
    createAssignment,
    updateAssignment,
    deleteAssignment,
    gradeSubmission,
  } = useSessionAssignmentManagement(materialSlug);

  useEffect(() => {
    const handleResize = () => {
      // Update mobile state if needed
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Handle create assignment
  const handleAddAssignment = () => {
    setEditingAssignment(null);
    setIsAssignmentModalVisible(true);
  };

  // Handle edit assignment
  const handleEditAssignment = async (assignment) => {
    try {
      setActionLoading((prev) => ({
        ...prev,
        [`edit_${assignment.id}`]: true,
      }));

      const editData = await fetchAssignmentForEdit(assignment.id);
      setEditingAssignment(editData);
      setIsAssignmentModalVisible(true);
    } catch (error) {
      console.error("Error fetching assignment for edit:", error);
      message.error("Gagal memuat data assignment untuk diedit");
    } finally {
      setActionLoading((prev) => ({
        ...prev,
        [`edit_${assignment.id}`]: false,
      }));
    }
  };

  // Handle delete assignment
  const handleDeleteAssignment = async (assignment) => {
    try {
      setActionLoading((prev) => ({
        ...prev,
        [`delete_${assignment.id}`]: true,
      }));
      await deleteAssignment(assignment.id);
    } catch (error) {
      console.error("Error deleting assignment:", error);
    } finally {
      setActionLoading((prev) => ({
        ...prev,
        [`delete_${assignment.id}`]: false,
      }));
    }
  };

  // Handle view assignment detail
  const handleViewDetail = async (assignment) => {
    try {
      setActionLoading((prev) => ({
        ...prev,
        [`view_${assignment.id}`]: true,
      }));

      setSelectedAssignment(assignment);
      setIsDetailModalVisible(true);

      // Fetch detailed data
      await fetchAssignmentDetail(assignment.id);
    } catch (error) {
      console.error("Error fetching assignment detail:", error);
      message.error("Gagal memuat detail assignment");
    } finally {
      setActionLoading((prev) => ({
        ...prev,
        [`view_${assignment.id}`]: false,
      }));
    }
  };

  // Handle assignment form submission
  const handleAssignmentSubmit = async (assignmentData) => {
    try {
      if (editingAssignment) {
        await updateAssignment(editingAssignment.id, assignmentData);
        message.success("Assignment berhasil diperbarui");
      } else {
        await createAssignment(assignmentData);
        message.success("Assignment berhasil dibuat");
      }
      setIsAssignmentModalVisible(false);
      setEditingAssignment(null);
    } catch (error) {
      console.error("Error submitting assignment:", error);
      message.error(
        editingAssignment
          ? "Gagal memperbarui assignment"
          : "Gagal membuat assignment"
      );
    }
  };

  // Handle grade submission
  const handleGradeSubmission = async (
    assignmentId,
    submissionId,
    grade,
    feedback
  ) => {
    try {
      await gradeSubmission(assignmentId, submissionId, grade, feedback);
      message.success("Nilai berhasil disimpan");
      return true;
    } catch (error) {
      console.error("Error grading submission:", error);
      message.error("Gagal menyimpan nilai");
      return false;
    }
  };

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchAssignments();
      message.success("Data assignments berhasil diperbarui");
    } catch (error) {
      console.error("Error refreshing assignments:", error);
      message.error("Gagal memperbarui data assignments");
    } finally {
      setRefreshing(false);
    }
  };

  // Error state
  if (loading && assignments.length === 0) {
    return (
      <div
        style={{
          background: "linear-gradient(135deg, #f8fafc 0%, #e6f3ff 100%)",
          minHeight: "400px",
          borderRadius: 16,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 20px",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <Spin
            indicator={<LoadingOutlined style={{ fontSize: 32 }} spin />}
            size="large"
          />
          <div style={{ marginTop: 16, color: "#666", fontSize: 16 }}>
            Memuat data assignments...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        // background: "linear-gradient(135deg, #f8fafc 0%, #e6f3ff 100%)",
        minHeight: "100vh",
        padding: isMobile ? 16 : 24,
        borderRadius: 16,
      }}
    >
      {/* Header */}
      <AssignmentsHeader
        isMobile={isMobile}
        assignmentsCount={assignments.length}
      />

      {/* Statistics Cards */}
      <AssignmentsStatsCards assignments={assignments} isMobile={isMobile} />

      {/* Control Panel */}
      <AssignmentControlPanel
        onCreateAssignment={handleAddAssignment}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        hasAssignments={assignments.length > 0}
        isMobile={isMobile}
      />

      {/* Assignments Table */}
      <AssignmentsTable
        assignments={assignments}
        students={materialDetail?.students || []}
        onViewDetail={handleViewDetail}
        onEditAssignment={handleEditAssignment}
        onDeleteAssignment={handleDeleteAssignment}
        actionLoading={actionLoading}
        isMobile={isMobile}
      />

      {/* Modals */}
      <AssignmentFormModal
        open={isAssignmentModalVisible}
        onClose={() => {
          setIsAssignmentModalVisible(false);
          setEditingAssignment(null);
        }}
        materialSlug={materialSlug}
        editingAssignment={editingAssignment}
        onSuccess={handleAssignmentSubmit}
      />

      <AssignmentDetailModal
        open={isDetailModalVisible}
        onClose={() => {
          setIsDetailModalVisible(false);
          setSelectedAssignment(null);
        }}
        assignment={selectedAssignment}
        assignmentDetail={assignmentDetail}
        submissions={submissions}
        questions={questions}
        students={students}
        loading={detailLoading}
        submissionsLoading={submissionsLoading}
        gradingLoading={gradingLoading}
        onGradeSubmission={handleGradeSubmission}
        isMobile={isMobile}
      />
    </div>
  );
};

export default SessionsMaterialAssignmentsTab;
