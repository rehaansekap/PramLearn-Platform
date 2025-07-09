import React, { useState } from "react";
import { message } from "antd";
import { useOnlineStatus } from "../../../../../context/OnlineStatusContext";
import api from "../../../../../api";

// Import new components
import StudentsHeader from "./students/StudentsHeader";
import StudentsStatsCards from "./students/StudentsStatsCards";
import StudentsControlPanel from "./students/StudentsControlPanel";
import StudentsTable from "./students/StudentsTable";

const SessionsMaterialStudentsTab = ({
  materialDetail,
  isMobile,
  onRefresh,
  refreshing,
  onDataUpdate,
}) => {
  const [searchText, setSearchText] = useState("");
  const [sortOrder, setSortOrder] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [updating, setUpdating] = useState({});
  const { isUserOnline } = useOnlineStatus();

  if (!materialDetail) {
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
          <div
            style={{
              fontSize: 64,
              marginBottom: 16,
            }}
          >
            😔
          </div>
          <div
            style={{
              fontSize: isMobile ? 16 : 18,
              color: "#666",
              fontWeight: 500,
            }}
          >
            Data siswa tidak tersedia
          </div>
        </div>
      </div>
    );
  }

  const { students = [] } = materialDetail;
  const onlineCount = students.filter((s) => isUserOnline(s)).length;

  const handleAttendanceChange = async (studentId, newStatus) => {
    setUpdating((prev) => ({ ...prev, [studentId]: true }));
    try {
      await api.post(
        `teacher/sessions/material/${materialDetail.material.slug}/attendance/${studentId}/`,
        { status: newStatus }
      );
      message.success("Kehadiran berhasil diupdate");
      if (onDataUpdate) {
        await onDataUpdate();
      }
    } catch (error) {
      message.error("Gagal mengupdate kehadiran");
      console.error("Error updating attendance:", error);
    } finally {
      setUpdating((prev) => ({ ...prev, [studentId]: false }));
    }
  };

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
      <StudentsHeader isMobile={isMobile} studentsCount={students.length} />

      {/* Statistics Cards */}
      <StudentsStatsCards
        students={students}
        onlineCount={onlineCount}
        isMobile={isMobile}
      />

      {/* Control Panel */}
      <StudentsControlPanel
        searchText={searchText}
        onSearchChange={setSearchText}
        onRefresh={onRefresh}
        refreshing={refreshing}
        sortOrder={sortOrder}
        onSortChange={setSortOrder}
        filterStatus={filterStatus}
        onFilterChange={setFilterStatus}
        isMobile={isMobile}
      />

      {/* Students Table */}
      <StudentsTable
        students={students}
        searchText={searchText}
        sortOrder={sortOrder}
        filterStatus={filterStatus}
        updating={updating}
        onAttendanceChange={handleAttendanceChange}
        isMobile={isMobile}
      />
    </div>
  );
};

export default SessionsMaterialStudentsTab;
