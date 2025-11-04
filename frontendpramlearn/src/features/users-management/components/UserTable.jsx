import React, { useState } from "react";
import { Table, Button, Space, Tag, Spin } from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { useContext } from "react";
import { AuthContext } from "../../../context/AuthContext";
import Swal from "sweetalert2";

const UserTable = ({
  users,
  roles,
  classes,
  page,
  rowsPerPage,
  rowSelection,
  handlePageChange,
  handleSelectUser,
  handleDeleteUser,
  handleShowInfo,
  visibleColumns,
  isUserOnline,
  loading = false,
  actionLoading = {}, // Tambahkan default value
}) => {
  const { user } = useContext(AuthContext);
  const [localActionLoading, setLocalActionLoading] = useState({});

  // Gabungkan actionLoading dari props dan local state
  const combinedActionLoading = { ...actionLoading, ...localActionLoading };

  // Handle delete dengan loading dan konfirmasi SweetAlert
  const handleDeleteWithLoading = async (userId, userToDelete) => {
    // Validasi input - pastikan userToDelete ada
    if (!userToDelete) {
      console.error("Error: userToDelete is undefined");
      Swal.fire({
        title: "Error!",
        text: "Data user tidak valid. Silakan refresh halaman dan coba lagi.",
        icon: "error",
        confirmButtonText: "OK",
      });
      return;
    }

    // Tampilkan konfirmasi SweetAlert
    const result = await Swal.fire({
      title: "Yakin ingin menghapus user ini?",
      text: `User "${
        userToDelete.username || "Unknown"
      }" akan dihapus secara permanen!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
      reverseButtons: true,
    });

    // Jika user mengkonfirmasi
    if (result.isConfirmed) {
      const deleteKey = `delete_${userId}`;
      setLocalActionLoading((prev) => ({ ...prev, [deleteKey]: true }));

      try {
        // Panggil function handleDeleteUser dari parent dengan parameter yang benar
        await handleDeleteUser(userId, userToDelete);

        // Tampilkan pesan sukses
        Swal.fire({
          title: "Berhasil!",
          text: `User "${userToDelete.username}" telah dihapus.`,
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });
      } catch (error) {
        console.error("Error deleting user:", error);

        // Tampilkan pesan error
        Swal.fire({
          title: "Gagal!",
          text: "Terjadi kesalahan saat menghapus user.",
          icon: "error",
          confirmButtonText: "OK",
        });
      } finally {
        setLocalActionLoading((prev) => ({ ...prev, [deleteKey]: false }));
      }
    }
  };

  // Handle select dengan loading
  const handleSelectWithLoading = async (userId) => {
    const selectKey = `select_${userId}`;
    setLocalActionLoading((prev) => ({ ...prev, [selectKey]: true }));

    try {
      await handleSelectUser(userId);
    } catch (error) {
      console.error("Error selecting user:", error);
    } finally {
      setLocalActionLoading((prev) => ({ ...prev, [selectKey]: false }));
    }
  };

  // Handle info dengan loading
  const handleInfoWithLoading = async (record) => {
    const infoKey = `info_${record.id}`;
    setLocalActionLoading((prev) => ({ ...prev, [infoKey]: true }));

    try {
      setTimeout(() => {
        handleShowInfo(record);
        setLocalActionLoading((prev) => ({ ...prev, [infoKey]: false }));
      }, 300);
    } catch (error) {
      console.error("Error showing info:", error);
      setLocalActionLoading((prev) => ({ ...prev, [infoKey]: false }));
    }
  };

  const columns = [
    visibleColumns.includes("username") && {
      title: "Username",
      dataIndex: "username",
      key: "username",
      sorter: (a, b) => a.username.localeCompare(b.username),
    },
    visibleColumns.includes("fullname") && {
      title: "Full Name",
      key: "fullname",
      render: (text, record) => {
        const fullName = [record.first_name, record.last_name]
          .filter(Boolean)
          .join(" ");
        return fullName || "-";
      },
      sorter: (a, b) =>
        (
          [a.first_name, a.last_name].filter(Boolean).join(" ") || ""
        ).localeCompare(
          [b.first_name, b.last_name].filter(Boolean).join(" ") || ""
        ),
    },
    visibleColumns.includes("email") && {
      title: "Email",
      dataIndex: "email",
      key: "email",
      responsive: ["lg"],
      sorter: (a, b) => a.email.localeCompare(b.email),
    },
    visibleColumns.includes("role") &&
      user?.role !== 2 && {
        title: "Role",
        key: "role",
        responsive: ["lg"],
        sorter: (a, b) => {
          const roleA = roles.find((r) => r.id === a.role)?.name || "";
          const roleB = roles.find((r) => r.id === b.role)?.name || "";
          return roleA.localeCompare(roleB);
        },
        render: (text, record) => {
          const role = roles.find((role) => role.id === record.role);
          return role ? role.name : "Unknown";
        },
      },
    visibleColumns.includes("kelas") && {
      title: "Kelas",
      key: "kelas",
      responsive: ["lg"],
      render: (text, record) => {
        const userClasses = classes.filter((cls) =>
          record.class_ids?.includes(cls.id)
        );
        return userClasses.length > 0
          ? userClasses.map((cls) => cls.name).join(", ")
          : "-";
      },
    },
    visibleColumns.includes("status") &&
      user?.role !== 2 && {
        title: "Status",
        key: "status",
        responsive: ["lg"],
        render: (text, record) => {
          const online = isUserOnline(record);
          return online ? (
            <span style={{ color: "#52c41a", fontWeight: "bold" }}>
              🟢 Online
            </span>
          ) : (
            <span style={{ color: "#f5222d", fontWeight: "bold" }}>
              🔴 Offline
            </span>
          );
        },
      },
    visibleColumns.includes("actions") && {
      title: "Actions",
      key: "actions",
      render: (text, record) =>
        user?.role === 2 ? (
          <Button
            icon={<InfoCircleOutlined />}
            onClick={() => handleInfoWithLoading(record)}
            loading={combinedActionLoading[`info_${record.id}`]}
            style={{
              backgroundColor: "#1890ff",
              color: "#fff",
              marginRight: 8,
            }}
          >
            Info
          </Button>
        ) : (
          <Space>
            <Button
              icon={<EditOutlined />}
              onClick={() => handleSelectWithLoading(record.id)}
              loading={combinedActionLoading[`select_${record.id}`]}
              style={{
                backgroundColor: "#11418b",
                color: "#fff",
              }}
            >
              Edit
            </Button>
            <Button
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteWithLoading(record.id, record)} // Pastikan record dikirim sebagai userToDelete
              loading={combinedActionLoading[`delete_${record.id}`]}
              danger
            >
              Delete
            </Button>
          </Space>
        ),
    },
  ].filter(Boolean);

  const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

  return (
    <Table
      dataSource={users}
      columns={columns}
      loading={{
        spinning: loading,
        indicator: antIcon,
        tip: "Memuat data users...",
      }}
      rowKey="id"
      pagination={{
        current: page + 1,
        pageSize: rowsPerPage,
        total: users.length,
        onChange: (page) => handlePageChange(page - 1),
        showSizeChanger: false,
        style: { textAlign: "center" },
        showTotal: (total, range) =>
          `${range[0]}-${range[1]} dari ${total} users`,
      }}
      rowSelection={rowSelection}
      className="user-table-responsive"
      style={{ width: "100%" }}
      scroll={{ x: 600 }}
      size="middle"
    />
  );
};

export default UserTable;
