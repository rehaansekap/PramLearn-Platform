import React, { useState, useEffect } from "react";
import { message } from "antd";
import useSessionGroupFormation from "../../hooks/useSessionGroupFormation";

// Import new components
import GroupsHeader from "./groups/GroupsHeader";
import GroupsStatsCards from "./groups/GroupsStatsCards";
import GroupControlPanel from "./groups/GroupControlPanel";
import GroupsTable from "./groups/GroupsTable";
import GroupFormationSection from "./groups/GroupFormationSection";
import GroupMembersModal from "./groups/GroupMembersModal";

const SessionsMaterialGroupsTab = ({
  materialSlug,
  groups,
  students,
  onGroupsChanged,
  refreshing: parentRefreshing,
}) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [membersModalVisible, setMembersModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localRefreshing, setLocalRefreshing] = useState(false);

  // Get export functionality from hook
  const { exportingPdf, handleExportAnalysis } = useSessionGroupFormation(
    materialSlug,
    onGroupsChanged
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleShowMembers = (group) => {
    setSelectedGroup(group);
    setMembersModalVisible(true);
  };

  const handleCloseMembersModal = () => {
    setMembersModalVisible(false);
    setSelectedGroup(null);
  };

  const handleRefreshGroups = async () => {
    setLocalRefreshing(true);
    try {
      if (onGroupsChanged) {
        await onGroupsChanged();
      }
      message.success("Data kelompok berhasil diperbarui");
    } catch (error) {
      console.error("Error refreshing groups:", error);
      message.error("Gagal memperbarui data kelompok");
    } finally {
      setLocalRefreshing(false);
    }
  };

  const handleGroupsUpdate = async () => {
    setLoading(true);
    try {
      if (onGroupsChanged) {
        await onGroupsChanged();
      }
    } catch (error) {
      console.error("Error updating groups:", error);
    } finally {
      setLoading(false);
    }
  };

  const isRefreshing = parentRefreshing || localRefreshing;

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
      <GroupsHeader isMobile={isMobile} groupsCount={groups?.length || 0} />

      {/* Statistics Cards */}
      <GroupsStatsCards groups={groups || []} isMobile={isMobile} />

      {/* Control Panel */}
      <GroupControlPanel
        onRefresh={handleRefreshGroups}
        refreshing={isRefreshing}
        onExportAnalysis={handleExportAnalysis}
        exportingPdf={exportingPdf}
        hasGroups={groups && groups.length > 0}
        isMobile={isMobile}
      />

      {/* Groups Table */}
      <GroupsTable
        groups={groups || []}
        onShowMembers={handleShowMembers}
        loading={isRefreshing}
        isMobile={isMobile}
      />

      {/* Group Formation Section */}
      <GroupFormationSection
        materialSlug={materialSlug}
        students={students}
        onGroupsChanged={handleGroupsUpdate}
        isMobile={isMobile}
      />

      {/* Group Members Modal */}
      <GroupMembersModal
        open={membersModalVisible}
        onClose={handleCloseMembersModal}
        group={selectedGroup}
        students={students}
        isMobile={isMobile}
      />
    </div>
  );
};

export default SessionsMaterialGroupsTab;
