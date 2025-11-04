import React, { useState } from "react";
import { Table, Button, Space, Spin } from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { useContext } from "react";
import { AuthContext } from "../../../context/AuthContext";
import Swal from "sweetalert2";

const ClassTable = ({
  classes,
  page,
  rowsPerPage,
  rowSelection,
  handlePageChange,
  handleSelectClass,
  handleDeleteClass,
  handleShowInfo,
  visibleColumns,
  loading = false,
  modalLoading = false,
  infoLoading = false,
}) => {
  const { user } = useContext(AuthContext);
  const [actionLoading, setActionLoading] = useState({});

  // Handle edit dengan loading
  const handleEditWithLoading = async (classId) => {
    const editKey = `edit_${classId}`;
    setActionLoading((prev) => ({ ...prev, [editKey]: true }));

    try {
      await handleSelectClass(classId);
    } catch (error) {
      console.error("Error editing class:", error);
      Swal.fire("Error", "Failed to load class data", "error");
    } finally {
      setActionLoading((prev) => ({ ...prev, [editKey]: false }));
    }
  };

  // Handle delete dengan loading dan konfirmasi - SAMAKAN dengan Users Management
  const handleDeleteWithLoading = async (classId, classData) => {
    const result = await Swal.fire({
      title: "Yakin ingin menghapus class ini?",
      text: `Class "${classData.name}" akan dihapus secara permanen!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      const deleteKey = `delete_${classId}`;
      setActionLoading((prev) => ({ ...prev, [deleteKey]: true }));

      try {
        await handleDeleteClass(classId);

        // Tampilkan pesan sukses
        Swal.fire({
          title: "Berhasil!",
          text: `Class "${classData.name}" telah dihapus.`,
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });
      } catch (error) {
        console.error("Error deleting class:", error);

        // Tampilkan pesan error
        Swal.fire({
          title: "Gagal!",
          text:
            error.response?.data?.detail ||
            "Terjadi kesalahan saat menghapus class.",
          icon: "error",
          confirmButtonText: "OK",
        });
      } finally {
        setActionLoading((prev) => ({ ...prev, [deleteKey]: false }));
      }
    }
  };

  // Handle info dengan loading
  const handleInfoWithLoading = async (classData) => {
    const infoKey = `info_${classData.id}`;
    setActionLoading((prev) => ({ ...prev, [infoKey]: true }));

    try {
      await handleShowInfo(classData);
    } catch (error) {
      console.error("Error showing class info:", error);
    } finally {
      setActionLoading((prev) => ({ ...prev, [infoKey]: false }));
    }
  };

  const columns = [
    visibleColumns.includes("name") && {
      title: "Class Name",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (text, record) => <div style={{ fontWeight: 500 }}>{text}</div>,
    },
    visibleColumns.includes("student_count") && {
      title: "Students",
      key: "student_count",
      render: (text, record) => (
        <span style={{ color: "#1890ff", fontWeight: 500 }}>
          {record.student_count || 0} students
        </span>
      ),
      align: "center",
      width: 120,
    },
    visibleColumns.includes("created_date") && {
      title: "Created",
      key: "created_date",
      render: (text, record) => {
        const date = record.created_at
          ? new Date(record.created_at).toLocaleDateString()
          : "-";
        return <span style={{ color: "#666" }}>{date}</span>;
      },
      responsive: ["md"],
      width: 120,
    },
    visibleColumns.includes("actions") && {
      title: "Actions",
      key: "actions",
      render: (text, record) =>
        user?.role === 2 ? (
          <Button
            icon={<InfoCircleOutlined />}
            onClick={() => handleInfoWithLoading(record)}
            loading={actionLoading[`info_${record.id}`] || infoLoading}
            style={{
              backgroundColor: "#1890ff",
              color: "#fff",
            }}
          >
            {actionLoading[`info_${record.id}`] ? "Loading..." : "Info"}
          </Button>
        ) : (
          <Space>
            <Button
              icon={<EditOutlined />}
              onClick={() => handleEditWithLoading(record.id)}
              loading={actionLoading[`edit_${record.id}`] || modalLoading}
              style={{
                backgroundColor: "#11418b",
                color: "#fff",
              }}
            >
              {actionLoading[`edit_${record.id}`] ? "Loading..." : "Edit"}
            </Button>
            <Button
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteWithLoading(record.id, record)}
              loading={actionLoading[`delete_${record.id}`]}
              danger
            >
              {actionLoading[`delete_${record.id}`] ? "Deleting..." : "Delete"}
            </Button>
          </Space>
        ),
      width: user?.role === 2 ? 100 : 180,
      align: "center",
    },
  ].filter(Boolean);

  const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

  return (
    <Table
      dataSource={classes}
      columns={columns}
      loading={{
        spinning: loading,
        indicator: antIcon,
        tip: "Loading classes...",
      }}
      rowKey="id"
      pagination={{
        current: page + 1,
        pageSize: rowsPerPage,
        total: classes.length,
        onChange: (page) => handlePageChange(page - 1),
        showSizeChanger: false,
        style: { textAlign: "center" },
        showTotal: (total, range) =>
          `${range[0]}-${range[1]} of ${total} classes`,
      }}
      rowSelection={rowSelection}
      className="user-table-responsive"
      style={{ width: "100%" }}
      scroll={{ x: 600 }}
      size="middle"
    />
  );
};

export default ClassTable;
