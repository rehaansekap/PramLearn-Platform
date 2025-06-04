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
import { useNavigate } from "react-router-dom";

const MaterialTable = ({
  subjectDetail,
  deleteMaterial,
  fetchSubjectDetail,
  onEditMaterial,
  rowSelection,
  visibleColumns,
  rowsPerPage,
  loading = false,
  modalLoading = false,
  userRolePath,
}) => {
  const { user } = useContext(AuthContext);
  const [actionLoading, setActionLoading] = useState({});
  const navigate = useNavigate();

  // Handle edit dengan loading
  const handleEditWithLoading = async (materialId) => {
    const editKey = `edit_${materialId}`;
    setActionLoading((prev) => ({ ...prev, [editKey]: true }));

    try {
      await onEditMaterial(materialId);
    } catch (error) {
      console.error("Error editing material:", error);
      Swal.fire({
        title: "Error!",
        text: "Failed to load material data",
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally {
      setActionLoading((prev) => ({ ...prev, [editKey]: false }));
    }
  };

  // Handle delete dengan loading dan konfirmasi
  const handleDeleteWithLoading = async (materialId, materialData) => {
    const result = await Swal.fire({
      title: "Yakin ingin menghapus material ini?",
      text: `Material "${materialData.title}" akan dihapus secara permanen!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      const deleteKey = `delete_${materialId}`;
      setActionLoading((prev) => ({ ...prev, [deleteKey]: true }));

      try {
        await deleteMaterial(materialId);
        await fetchSubjectDetail();

        // Tampilkan pesan sukses
        Swal.fire({
          title: "Berhasil!",
          text: `Material "${materialData.title}" telah dihapus.`,
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });
      } catch (error) {
        console.error("Error deleting material:", error);

        // Tampilkan pesan error
        Swal.fire({
          title: "Gagal!",
          text:
            error.response?.data?.detail ||
            "Terjadi kesalahan saat menghapus material.",
          icon: "error",
          confirmButtonText: "OK",
        });
      } finally {
        setActionLoading((prev) => ({ ...prev, [deleteKey]: false }));
      }
    }
  };

  // Handle view detail dengan loading - PERBAIKAN DI SINI
  const handleViewWithLoading = async (materialSlug) => {
    const viewKey = `view_${materialSlug}`;
    setActionLoading((prev) => ({ ...prev, [viewKey]: true }));

    try {
      // GUNAKAN materialSlug bukan materialId
      navigate(`/${userRolePath}/management/material/${materialSlug}`);
    } catch (error) {
      console.error("Error viewing material detail:", error);
    } finally {
      setActionLoading((prev) => ({ ...prev, [viewKey]: false }));
    }
  };

  const columns = [
    visibleColumns.includes("title") && {
      title: "Title",
      dataIndex: "title",
      key: "title",
      sorter: (a, b) => a.title.localeCompare(b.title),
      render: (text, record) => <div style={{ fontWeight: 500 }}>{text}</div>,
    },
    visibleColumns.includes("actions") && {
      title: "Actions",
      key: "actions",
      render: (text, record) => (
        <Space size="small">
          <Button
            icon={<EyeOutlined />}
            onClick={() => handleViewWithLoading(record.slug)} // Pastikan menggunakan record.slug
            loading={actionLoading[`view_${record.slug}`]}
            style={{
              backgroundColor: "#1890ff",
              color: "#fff",
            }}
          >
            {actionLoading[`view_${record.slug}`] ? "Loading..." : "Detail"}
          </Button>
          {user?.role !== 2 && (
            <>
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
                {actionLoading[`delete_${record.id}`]
                  ? "Deleting..."
                  : "Delete"}
              </Button>
            </>
          )}
        </Space>
      ),
      width: user?.role === 2 ? 120 : 240,
      align: "center",
    },
  ].filter(Boolean);

  const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

  return (
    <Table
      dataSource={subjectDetail?.materials || []}
      columns={columns}
      loading={{
        spinning: loading,
        indicator: antIcon,
        tip: "Loading materials...",
      }}
      rowKey="id"
      rowSelection={rowSelection}
      pagination={{
        pageSize: rowsPerPage,
        showSizeChanger: false,
        showQuickJumper: false,
        showTotal: (total, range) =>
          `${range[0]}-${range[1]} dari ${total} materials`,
        style: { textAlign: "center" },
      }}
      className="user-table-responsive"
      style={{ width: "100%" }}
      scroll={{ x: 600 }}
      size="middle"
    />
  );
};

export default MaterialTable;
