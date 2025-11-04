import React, { useState } from "react";
import { Table, Button, Space, Spin } from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { useContext } from "react";
import { AuthContext } from "../../../context/AuthContext";
import Swal from "sweetalert2";

const SubjectTable = ({
  subjects,
  page,
  rowsPerPage,
  rowSelection,
  handlePageChange,
  handleSelectSubject,
  handleDeleteSubject,
  handleViewDetail,
  visibleColumns,
  loading = false,
  modalLoading = false,
}) => {
  const { user } = useContext(AuthContext);
  const [actionLoading, setActionLoading] = useState({});

  // Handle edit dengan loading
  const handleEditWithLoading = async (subjectId) => {
    const editKey = `edit_${subjectId}`;
    setActionLoading((prev) => ({ ...prev, [editKey]: true }));

    try {
      await handleSelectSubject(subjectId);
    } catch (error) {
      console.error("Error editing subject:", error);
      Swal.fire({
        title: "Error!",
        text: "Failed to load subject data",
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally {
      setActionLoading((prev) => ({ ...prev, [editKey]: false }));
    }
  };

  // Handle delete dengan loading dan konfirmasi - SAMAKAN dengan Users/Class Management
  const handleDeleteWithLoading = async (subjectId, subjectData) => {
    const result = await Swal.fire({
      title: "Yakin ingin menghapus subject ini?",
      text: `Subject "${subjectData.name}" akan dihapus secara permanen!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      const deleteKey = `delete_${subjectId}`;
      setActionLoading((prev) => ({ ...prev, [deleteKey]: true }));

      try {
        await handleDeleteSubject(subjectId);

        // Tampilkan pesan sukses
        Swal.fire({
          title: "Berhasil!",
          text: `Subject "${subjectData.name}" telah dihapus.`,
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });
      } catch (error) {
        console.error("Error deleting subject:", error);

        // Tampilkan pesan error
        Swal.fire({
          title: "Gagal!",
          text:
            error.response?.data?.detail ||
            "Terjadi kesalahan saat menghapus subject.",
          icon: "error",
          confirmButtonText: "OK",
        });
      } finally {
        setActionLoading((prev) => ({ ...prev, [deleteKey]: false }));
      }
    }
  };

  // Handle view detail dengan loading
  const handleViewWithLoading = async (subjectSlug) => {
    const viewKey = `view_${subjectSlug}`;
    setActionLoading((prev) => ({ ...prev, [viewKey]: true }));

    try {
      await handleViewDetail(subjectSlug);
    } catch (error) {
      console.error("Error viewing subject detail:", error);
    } finally {
      setActionLoading((prev) => ({ ...prev, [viewKey]: false }));
    }
  };

  const columns = [
    visibleColumns.includes("name") && {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (text, record) => <div style={{ fontWeight: 500 }}>{text}</div>,
    },
    visibleColumns.includes("kelas") && {
      title: "Kelas",
      key: "kelas",
      render: (text, record) => (
        <span
          style={{
            color: "#666", // Ubah dari "#1890ff" ke warna abu-abu
            fontWeight: 500,
          }}
        >
          {record.class_name || record.class || "No Class"}
        </span>
      ),
    },
    visibleColumns.includes("actions") && {
      title: "Actions",
      key: "actions",
      render: (text, record) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            onClick={() => handleViewWithLoading(record.slug)}
            loading={actionLoading[`view_${record.slug}`]}
            style={{
              backgroundColor: "#1890ff",
              color: "#fff",
              marginRight: 8,
            }}
          >
            {actionLoading[`view_${record.slug}`] ? "Loading..." : "Detail"}
          </Button>
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
      width: user?.role === 2 ? 100 : 240,
      align: "center",
    },
  ].filter(Boolean);

  const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

  return (
    <Table
      dataSource={subjects}
      columns={columns}
      loading={{
        spinning: loading,
        indicator: antIcon,
      }}
      rowKey="id"
      rowSelection={rowSelection}
      pagination={{
        current: page + 1,
        pageSize: rowsPerPage,
        total: subjects.length,
        onChange: (newPage) => handlePageChange(newPage - 1),
        showSizeChanger: false,
        style: { textAlign: "center" },
      }}
      style={{ width: "100%" }}
    />
  );
};

export default SubjectTable;
