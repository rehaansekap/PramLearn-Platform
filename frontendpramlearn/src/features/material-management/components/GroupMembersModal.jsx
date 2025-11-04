import React, { useState, useEffect } from "react";
import { Modal, Table, Avatar, Tag, Spin } from "antd";
import { UserOutlined, TeamOutlined, LoadingOutlined } from "@ant-design/icons";

const GroupMembersModal = ({
  open,
  onClose,
  group,
  members,
  studentDetails,
  loading = false,
}) => {
  const [localLoading, setLocalLoading] = useState(false);

  // Reset loading saat modal dibuka/ditutup
  useEffect(() => {
    if (open && group) {
      setLocalLoading(true);
      const timer = setTimeout(() => {
        setLocalLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [open, group]);

  if (!group) return null;

  // Pastikan data berbentuk array
  const safeMembers = Array.isArray(members) ? members : [];
  const safeStudentDetails = Array.isArray(studentDetails)
    ? studentDetails
    : [];

  // Karena struktur data members sudah berupa array detail siswa langsung,
  // tidak perlu melakukan mapping lagi
  const membersWithDetails = safeMembers.map((member) => ({
    ...member,
    studentDetail: member,
  }));

  const columns = [
    {
      title: "No",
      key: "no",
      render: (_, __, index) => index + 1,
      width: 60,
      align: "center",
    },
    {
      title: "Foto",
      key: "avatar",
      render: () => <Avatar icon={<UserOutlined />} size="default" />,
      width: 80,
      align: "center",
    },
    {
      title: "Username",
      dataIndex: "username",
      key: "username",
      render: (username) => (
        <div style={{ fontWeight: 500 }}>{username || "-"}</div>
      ),
    },
    {
      title: "Nama Lengkap",
      key: "fullName",
      render: (_, record) => {
        const { first_name, last_name } = record;
        const fullName = [first_name, last_name].filter(Boolean).join(" ");
        return (
          <div style={{ whiteSpace: "normal", wordBreak: "break-word" }}>
            {fullName || "-"}
          </div>
        );
      },
      ellipsis: true,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (email) => (
        <div style={{ whiteSpace: "normal", wordBreak: "break-word" }}>
          {email || "-"}
        </div>
      ),
      ellipsis: true,
      responsive: ["md"],
    },
    {
      title: "Status",
      key: "status",
      render: (_, record) => {
        const isOnline = record.is_online;
        return (
          <Tag color={isOnline ? "green" : "red"}>
            {isOnline ? "Online" : "Offline"}
          </Tag>
        );
      },
      width: 100,
      align: "center",
    },
  ];

  // Gabungkan loading props dan local loading
  // Gabungkan loading props dan local loading
  const isLoading = loading || localLoading;
  const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={900}
      centered
      className="group-members-modal"
      destroyOnClose
    >
      {/* Header dengan style konsisten */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginBottom: 24,
          paddingTop: 16,
        }}
      >
        <TeamOutlined
          style={{ fontSize: 28, color: "#11418b", marginBottom: 8 }}
        />
        <h3
          className="text-lg font-semibold text-gray-800 mb-1"
          style={{
            marginBottom: 4,
            fontSize: "20px",
            fontWeight: 700,
            color: "#11418b",
          }}
        >
          Detail Anggota Kelompok
        </h3>
        <p
          className="text-sm text-gray-600"
          style={{
            marginBottom: 16,
            fontSize: "14px",
            color: "#666",
            textAlign: "center",
          }}
        >
          Daftar anggota dalam kelompok dengan kode{" "}
          <b style={{ color: "#11418b" }}>{group.code}</b>
        </p>

        {/* Tags info - hanya tampil jika tidak loading */}
        {!isLoading && (
          <div style={{ display: "flex", gap: 8, marginBottom: 0 }}>
            <Tag color="blue" style={{ fontSize: "14px", padding: "4px 8px" }}>
              {group.name}
            </Tag>
            <Tag color="green" style={{ fontSize: "14px", padding: "4px 8px" }}>
              Total Anggota: {membersWithDetails.length}
            </Tag>
          </div>
        )}
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <Spin indicator={antIcon} />
          <p style={{ fontSize: "16px", color: "#666", marginTop: 16 }}>
            Memuat data anggota kelompok...
          </p>
        </div>
      ) : (
        /* Table dengan style konsisten */
        <>
          {membersWithDetails.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <UserOutlined style={{ fontSize: 48, color: "#d9d9d9" }} />
              <p style={{ fontSize: "16px", color: "#666", marginTop: 16 }}>
                Belum ada anggota dalam kelompok ini
              </p>
            </div>
          ) : (
            <Table
              dataSource={membersWithDetails.map((member, idx) => ({
                ...member,
                key: member.id || idx,
              }))}
              columns={columns}
              pagination={false}
              className="assignment-table user-table-responsive"
              style={{ width: "100%" }}
              scroll={{ x: 600 }}
              size="middle"
            />
          )}
        </>
      )}
    </Modal>
  );
};

export default GroupMembersModal;
