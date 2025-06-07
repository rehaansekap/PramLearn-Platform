import React, { useState, useEffect } from "react";
import { Card, Table, Tag, Empty, Spin, Typography } from "antd";
import { LoadingOutlined, TeamOutlined } from "@ant-design/icons";
import GroupMembersModal from "./GroupMembersModal";
import GroupFormationSection from "./GroupFormationSection";
import useGroupFormation from "../hooks/useGroupFormation";

const GroupsTab = ({
  groups,
  groupMembers,
  quizzes,
  loading,
  groupQuizAssignments,
  studentDetails,
  materialId, // Add this prop
  onGroupsChanged, // Add this prop
}) => {
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [membersModalVisible, setMembersModalVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Add group formation hook
  const { groupMessage, groupProcessing, handleAutoGroup } = useGroupFormation(
    materialId,
    onGroupsChanged
  );

  // Pastikan semua data yang diperlukan tersedia dan berbentuk array
  const safeGroups = Array.isArray(groups) ? groups : [];
  const safeGroupMembers = groupMembers || {};
  const safeQuizzes = Array.isArray(quizzes) ? quizzes : [];
  const safeStudentDetails = Array.isArray(studentDetails)
    ? studentDetails
    : [];
  const safeGroupQuizAssignments = Array.isArray(groupQuizAssignments)
    ? groupQuizAssignments
    : [];

  // Fungsi untuk menghitung jumlah quiz yang di-assign ke kelompok tertentu
  const getAssignedQuizCount = (groupId) => {
    if (!safeGroupQuizAssignments || safeGroupQuizAssignments.length === 0) {
      return 0;
    }

    return safeGroupQuizAssignments.filter(
      (assignment) =>
        assignment.group === groupId || assignment.group_id === groupId
    ).length;
  };

  // Fungsi untuk mendapatkan anggota kelompok berdasarkan struktur data yang sebenarnya
  const getGroupMembers = (groupId) => {
    if (
      groupMembers &&
      typeof groupMembers === "object" &&
      !Array.isArray(groupMembers)
    ) {
      return groupMembers[groupId] || [];
    }

    if (Array.isArray(groupMembers)) {
      return groupMembers.filter(
        (member) => member.group === groupId || member.group_id === groupId
      );
    }

    return [];
  };

  // Handler untuk membuka modal detail anggota
  const handleShowMembers = (group) => {
    const membersForThisGroup = getGroupMembers(group.id);
    setSelectedGroup(group);
    setMembersModalVisible(true);
  };

  // Handler untuk menutup modal
  const handleCloseMembersModal = () => {
    setMembersModalVisible(false);
    setSelectedGroup(null);
  };

  const columns = [
    {
      title: "Nama Kelompok",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Kode Kelompok",
      dataIndex: "code",
      key: "code",
    },
    {
      title: "Jumlah Anggota",
      key: "member_count",
      render: (text, record) => {
        const members = getGroupMembers(record.id);
        const memberCount = members.length;

        return (
          <Tag
            color="blue"
            style={{ cursor: "pointer" }}
            onClick={() => handleShowMembers(record)}
            title="Klik untuk melihat detail anggota"
          >
            {memberCount} Anggota
          </Tag>
        );
      },
    },
    {
      title: "Jumlah Quiz",
      key: "quiz_count",
      render: (text, record) => {
        const quizCount = getAssignedQuizCount(record.id);
        return (
          <Tag color={quizCount > 0 ? "blue" : "default"}>{quizCount} Quiz</Tag>
        );
      },
    },
  ].filter(Boolean);

  const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

  if (loading) {
    return (
      <Card className="rounded-lg shadow-sm">
        <div className="flex justify-center items-center py-10">
          <Spin indicator={antIcon} />
          <span className="ml-3 text-gray-500">Memuat data kelompok...</span>
        </div>
      </Card>
    );
  }

  return (
    <div>
      {/* Header - dengan layout yang disesuaikan */}
      <div
        style={{
          width: "100%",
          textAlign: "center",
          marginBottom: 24,
        }}
      >
        <TeamOutlined
          style={{
            fontSize: isMobile ? 24 : 32,
            color: "#11418b",
            marginBottom: isMobile ? 8 : 12,
          }}
        />
        <div style={{ marginBottom: 16 }}>
          <Typography.Title
            level={isMobile ? 5 : 4}
            style={{
              marginBottom: 8,
              fontSize: isMobile ? "16px" : "20px",
              fontWeight: 700,
              color: "#11418b",
            }}
          >
            Daftar Kelompok
          </Typography.Title>
          <Typography.Text
            type="secondary"
            style={{
              fontSize: isMobile ? "12px" : "14px",
              color: "#666",
            }}
          >
            Kelompok yang terbentuk dalam materi ini
          </Typography.Text>
        </div>
      </div>

      {safeGroups.length > 0 && (
        <Table
          columns={columns}
          dataSource={safeGroups.map((group) => ({
            ...group,
            key: group.id,
          }))}
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: false,
            style: { textAlign: "center" },
          }}
          style={{ width: "100%" }}
          scroll={{ x: isMobile ? 600 : undefined }} // Tambahkan scroll horizontal untuk mobile
          size="middle"
        />
      )}

      {/* Group Formation Section - Dipindah ke bawah */}
      <div style={{ marginTop: 48 }}>
        <GroupFormationSection
          onCreateHomogen={() => handleAutoGroup("homogen")}
          onCreateHeterogen={() => handleAutoGroup("heterogen")}
          loading={groupProcessing}
          message={groupMessage}
          isMobile={isMobile}
        />
      </div>

      {/* Modal Detail Anggota */}
      <GroupMembersModal
        open={membersModalVisible}
        onClose={handleCloseMembersModal}
        group={selectedGroup}
        members={selectedGroup ? getGroupMembers(selectedGroup.id) : []}
        studentDetails={safeStudentDetails}
        loading={loading}
      />
    </div>
  );
};

export default GroupsTab;
