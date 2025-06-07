import React, { useState, useEffect } from "react";
import { Modal } from "antd";
import {
  Card,
  Typography,
  Button,
  Dropdown,
  Menu,
  Checkbox,
  Spin,
  Alert,
} from "antd";
import { LoadingOutlined } from "@ant-design/icons"; // Tambahkan import ini
import UserFilters from "./components/UserFilters";
import UserTable from "./components/UserTable";
import UserForm from "./components/UserForm";
import UserInfoModal from "./components/UserInfoModal";
import useUserInfoModal from "./hooks/useUserInfoModal";
import useUserManagement from "./hooks/useUserManagement";
import Swal from "sweetalert2";
import { AuthContext } from "../../context/AuthContext";
import { useContext } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const { Title } = Typography;

const UserManagement = () => {
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [roleFilter, setRoleFilter] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0);
  const [searchText, setSearchText] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, token } = useContext(AuthContext);
  const [fetchError, setFetchError] = useState(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [emailSearchText, setEmailSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [fullNameSearchText, setFullNameSearchText] = useState("");
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState({});
  const [actionLoading, setActionLoading] = useState({}); // Tambahkan ini

  const { infoModalVisible, selectedUser, showInfoModal, closeInfoModal } =
    useUserInfoModal();

  const {
    users,
    roles,
    classes,
    deleteUser,
    fetchUsers,
    loading,
    rolesLoading,
    classesLoading,
  } = useUserManagement();

  const defaultVisibleColumns = [
    "username",
    "email",
    "role",
    "kelas",
    "status",
    "fullname",
    "actions",
  ];
  const [visibleColumns, setVisibleColumns] = useState(defaultVisibleColumns);
  const columnOptions = [
    { label: "Username", value: "username" },
    { label: "Full Name", value: "fullname" },
    { label: "Email", value: "email" },
    { label: "Role", value: "role" },
    { label: "Kelas", value: "kelas" },
    ...(user?.role !== 2 ? [{ label: "Status", value: "status" }] : []),
    { label: "Actions", value: "actions" },
  ];

  const isUserOnline = (userData) => {
    if (!userData.last_activity) return false;
    const lastActivity = new Date(userData.last_activity);
    const now = new Date();
    const diffMinutes = (now - lastActivity) / (1000 * 60);
    return userData.is_online && diffMinutes <= 5;
  };

  // Filter logic tetap sama...
  const filteredUsers = users.filter((user) => {
    const matchRole = !roleFilter || String(user.role) === String(roleFilter);
    const matchClass =
      !classFilter ||
      (Array.isArray(user.class_ids) &&
        user.class_ids.includes(Number(classFilter)));
    const matchUsername =
      !searchText ||
      (user.username &&
        user.username.toLowerCase().includes(searchText.toLowerCase()));
    const matchEmail =
      !emailSearchText ||
      (user.email &&
        user.email.toLowerCase().includes(emailSearchText.toLowerCase()));

    const matchStatus =
      !statusFilter ||
      (statusFilter === "online"
        ? isUserOnline(user)
        : statusFilter === "offline"
        ? !isUserOnline(user)
        : true);

    const matchFullName =
      !fullNameSearchText ||
      ([user.first_name, user.last_name].filter(Boolean).join(" ") || "")
        .toLowerCase()
        .includes(fullNameSearchText.toLowerCase());
    return (
      matchRole &&
      matchClass &&
      matchUsername &&
      matchEmail &&
      matchStatus &&
      matchFullName
    );
  });

  // Export dengan loading
  const exportToFile = async (type) => {
    const exportKey = `export_${type}`;
    setExportLoading((prev) => ({ ...prev, [exportKey]: true }));

    try {
      const data = filteredUsers.map((u) => ({
        Username: u.username,
        "Full Name": [u.first_name, u.last_name].filter(Boolean).join(" "),
        Email: u.email,
        Role: roles.find((r) => r.id === u.role)?.name || "Unknown",
        Kelas: classes
          .filter((cls) => u.class_ids?.includes(cls.id))
          .map((cls) => cls.name)
          .join(", "),
        Status: isUserOnline(u) ? "Online" : "Offline",
      }));

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Users");

      if (type === "csv") {
        const csv = XLSX.utils.sheet_to_csv(ws);
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        saveAs(blob, "users.csv");
      } else {
        const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
        saveAs(
          new Blob([wbout], { type: "application/octet-stream" }),
          "users.xlsx"
        );
      }

      Swal.fire({
        title: "Berhasil!",
        text: `Users berhasil di-export ke format ${type.toUpperCase()}.`,
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Export error:", error);
      Swal.fire("Error", "Failed to export data", "error");
    } finally {
      setExportLoading((prev) => ({ ...prev, [exportKey]: false }));
    }
  };

  const handleDeleteWithLoading = async (userId, userToDelete) => {
    // Validasi input - pastikan userToDelete ada dan memiliki properti yang diperlukan
    if (!userToDelete) {
      console.error("Error: userToDelete is undefined in UserManagement");
      Swal.fire({
        title: "Error!",
        text: "Data user tidak valid. Silakan refresh halaman dan coba lagi.",
        icon: "error",
        confirmButtonText: "OK",
      });
      return;
    }

    // Fallback untuk role jika tidak ada
    const userRole = userToDelete.role || 0;
    const userName = userToDelete.username || "Unknown User";
    const userEmail = userToDelete.email || "Unknown Email";

    // Peringatan khusus untuk admin/teacher
    const isImportantRole = userRole === 1 || userRole === 2;
    const roleText = roles.find((r) => r.id === userRole)?.name || "User";

    const result = await Swal.fire({
      title: `Yakin ingin menghapus ${roleText} ini?`,
      html: `
          <div style="text-align: left; margin: 20px 0;">
            <p><strong>Username:</strong> ${userName}</p>
            <p><strong>Email:</strong> ${userEmail}</p>
            <p><strong>Role:</strong> ${roleText}</p>
            ${
              isImportantRole
                ? '<div style="background: #fff2f0; border: 1px solid #ffccc7; border-radius: 4px; padding: 12px; margin-top: 16px;"><p style="color: #ff4d4f; margin: 0; font-weight: 500;">⚠️ Peringatan: Anda akan menghapus user dengan role penting!</p></div>'
                : ""
            }
          </div>
        `,
      icon: isImportantRole ? "error" : "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
      reverseButtons: true,
      width: 450,
    });

    if (result.isConfirmed) {
      const deleteKey = `delete_${userId}`;
      setActionLoading((prev) => ({ ...prev, [deleteKey]: true }));

      try {
        await deleteUser(userId);

        Swal.fire({
          title: "Berhasil!",
          text: `${roleText} "${userName}" telah dihapus.`,
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });

        fetchUsers(); // Refresh data setelah delete
      } catch (error) {
        console.error("Error deleting user:", error);

        Swal.fire({
          title: "Gagal!",
          text:
            error.response?.data?.detail ||
            "Terjadi kesalahan saat menghapus user.",
          icon: "error",
          confirmButtonText: "OK",
        });
      } finally {
        setActionLoading((prev) => ({ ...prev, [deleteKey]: false }));
      }
    }
  };

  // Bulk delete dengan loading dan konfirmasi yang lebih baik
  const handleBulkDelete = async () => {
    if (selectedRowKeys.length === 0) return;

    // Ambil nama users yang akan dihapus untuk ditampilkan
    const usersToDelete = filteredUsers.filter((u) =>
      selectedRowKeys.includes(u.id)
    );
    const usernames = usersToDelete.map((u) => u.username).join(", ");

    const confirm = await Swal.fire({
      title: "Hapus Multiple Users?",
      html: `
          <p>Anda akan menghapus <strong>${selectedRowKeys.length} users</strong>:</p>
          <div style="max-height: 150px; overflow-y: auto; margin: 10px 0; padding: 10px; background: #f5f5f5; border-radius: 4px;">
            <small>${usernames}</small>
          </div>
          <p style="color: #ff4d4f; font-weight: 500;">⚠️ Tindakan ini tidak dapat dibatalkan!</p>
        `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: `Ya, Hapus ${selectedRowKeys.length} Users!`,
      cancelButtonText: "Batal",
      reverseButtons: true,
      width: 500,
    });

    if (confirm.isConfirmed) {
      setBulkDeleteLoading(true);

      // Tampilkan progress
      Swal.fire({
        title: "Menghapus users...",
        text: "Mohon tunggu...",
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      try {
        let successCount = 0;
        let failedCount = 0;

        for (const userId of selectedRowKeys) {
          try {
            await deleteUser(userId);
            successCount++;
          } catch (error) {
            console.error(`Failed to delete user ${userId}:`, error);
            failedCount++;
          }
        }

        setSelectedRowKeys([]);
        fetchUsers();

        // Tampilkan hasil
        if (failedCount === 0) {
          Swal.fire({
            title: "Berhasil!",
            text: `${successCount} users berhasil dihapus.`,
            icon: "success",
            timer: 3000,
            showConfirmButton: false,
          });
        } else {
          Swal.fire({
            title: "Selesai dengan Peringatan",
            html: `
                <p>✅ <strong>${successCount}</strong> users berhasil dihapus</p>
                <p>❌ <strong>${failedCount}</strong> users gagal dihapus</p>
              `,
            icon: "warning",
            confirmButtonText: "OK",
          });
        }
      } catch (error) {
        console.error("Bulk delete error:", error);
        Swal.fire({
          title: "Error!",
          text: "Terjadi kesalahan saat menghapus users.",
          icon: "error",
          confirmButtonText: "OK",
        });
      } finally {
        setBulkDeleteLoading(false);
      }
    }
  };

  const handleSelectUser = (userId) => {
    setSelectedUserId(userId);
    setIsModalVisible(true);
  };

  const handleSuccess = () => {
    setSelectedUserId(null);
    setIsModalVisible(false);
    fetchUsers();
    Swal.fire({
      title: "Berhasil!",
      text: "User berhasil disimpan!",
      icon: "success",
      timer: 2000,
      showConfirmButton: false,
    });
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
  };

  const handleShowInfo = (user) => {
    showInfoModal(user);
  };

  const handleColumnVisibilityChange = (checkedValues) => {
    setVisibleColumns(checkedValues);
  };

  // Loading state untuk keseluruhan halaman
  const isPageLoading = loading || rolesLoading || classesLoading;
  const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

  return (
    <Card
      style={{
        maxWidth: 900,
        margin: "0 auto",
        background: "#fff",
        borderRadius: "12px",
        boxShadow: "0 2px 8px #f0f1f2",
        padding: 24,
      }}
    >
      <Title
        level={2}
        style={{
          textAlign: "center",
          marginBottom: 20,
          fontWeight: "bold",
          color: "#11418b",
        }}
      >
        User Management
      </Title>

      {fetchError && (
        <Alert
          message="Error"
          description={fetchError}
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {isPageLoading ? (
        <div style={{ textAlign: "center", margin: "40px 0" }}>
          <Spin indicator={antIcon} />
          <p style={{ marginTop: 16, color: "#666" }}>Memuat data users...</p>
        </div>
      ) : (
        <>
          <UserFilters
            roles={roles}
            classes={classes}
            roleFilter={roleFilter}
            classFilter={classFilter}
            rowsPerPage={rowsPerPage}
            searchText={searchText}
            handleRoleFilterChange={setRoleFilter}
            handleClassFilterChange={setClassFilter}
            handleRowsPerPageChange={setRowsPerPage}
            handleSearchTextChange={(e) => setSearchText(e.target.value)}
            handleAddUserClick={() => {
              setSelectedUserId(null);
              setIsModalVisible(true);
            }}
            emailSearchText={emailSearchText}
            statusFilter={statusFilter}
            handleEmailSearchTextChange={(e) =>
              setEmailSearchText(e.target.value)
            }
            handleStatusFilterChange={setStatusFilter}
            fullNameSearchText={fullNameSearchText}
            handleFullNameSearchTextChange={(e) =>
              setFullNameSearchText(e.target.value)
            }
          />
          <div
            className="user-action-buttons"
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 16,
            }}
          >
            <div>
              {user?.role !== 2 && (
                <Button
                  danger
                  disabled={selectedRowKeys.length === 0}
                  onClick={handleBulkDelete}
                  loading={bulkDeleteLoading}
                  style={{ marginRight: 8 }}
                >
                  {bulkDeleteLoading ? "Deleting..." : "Delete Selected"}
                </Button>
              )}
              <Dropdown
                overlay={
                  <Menu>
                    <Menu.Item>
                      <Checkbox.Group
                        options={
                          user?.role === 2
                            ? columnOptions.filter(
                                (opt) => opt.value !== "status"
                              )
                            : columnOptions
                        }
                        value={visibleColumns}
                        onChange={handleColumnVisibilityChange}
                      />
                    </Menu.Item>
                  </Menu>
                }
                trigger={["click"]}
              >
                <Button>Column Visibility</Button>
              </Dropdown>
            </div>
            <div>
              <Button
                className="export-btn"
                onClick={() => exportToFile("csv")}
                loading={exportLoading.export_csv}
                style={{ marginRight: 8 }}
              >
                {exportLoading.export_csv ? "Exporting..." : "Export CSV"}
              </Button>
              <Button
                className="export-btn"
                onClick={() => exportToFile("xlsx")}
                loading={exportLoading.export_xlsx}
              >
                {exportLoading.export_xlsx ? "Exporting..." : "Export Excel"}
              </Button>
            </div>
          </div>
          <UserTable
            users={filteredUsers}
            roles={roles}
            classes={classes}
            page={page}
            rowsPerPage={rowsPerPage}
            loading={false}
            {...(user?.role !== 2 && {
              rowSelection: {
                selectedRowKeys,
                onChange: setSelectedRowKeys,
              },
            })}
            handlePageChange={setPage}
            handleSelectUser={handleSelectUser}
            handleDeleteUser={handleDeleteWithLoading} // Pastikan ini mengirim function yang benar
            handleShowInfo={handleShowInfo}
            visibleColumns={visibleColumns}
            isUserOnline={isUserOnline}
            actionLoading={actionLoading} // Pass actionLoading state
          />

          {/* Modal Form */}
          <Modal
            open={isModalVisible}
            onCancel={handleModalCancel}
            footer={null}
            centered
            className="class-form-modal"
            destroyOnClose
          >
            <UserForm
              userId={selectedUserId}
              onSuccess={handleSuccess}
              isSubmitting={isSubmitting}
              setIsSubmitting={setIsSubmitting}
            />
          </Modal>

          {/* Info Modal */}
          <UserInfoModal
            className="ant-modal"
            open={infoModalVisible}
            onClose={closeInfoModal}
            user={selectedUser}
          />
        </>
      )}
    </Card>
  );
};

export default UserManagement;
