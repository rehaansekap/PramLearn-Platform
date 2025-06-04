import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Typography,
  Button,
  Dropdown,
  Menu,
  Checkbox,
  Modal,
  Alert,
  Spin,
} from "antd";
import MaterialFilters from "../material-management/components/MaterialFilters";
import MaterialTable from "../material-management/components/MaterialTable";
import MaterialForm from "../material-management/components/MaterialForm";
import { useParams } from "react-router-dom";
import useFetchSubjectDetail from "./hooks/useFetchSubjectDetail";
import api from "../../api";
import { AuthContext } from "../../context/AuthContext";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { LoadingOutlined } from "@ant-design/icons";

const { Title } = Typography;
const defaultVisibleColumns = ["title", "actions"];
const columnOptions = [
  { label: "Title", value: "title" },
  { label: "Actions", value: "actions" },
];

const SubjectDetailPage = () => {
  const { subjectSlug } = useParams();
  const [subjectId, setSubjectId] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedMaterialId, setSelectedMaterialId] = useState(null);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const {
    subjectDetail,
    fetchSubjectDetail,
    deleteMaterial,
    error,
    loading: subjectDetailLoading,
  } = useFetchSubjectDetail(subjectId);
  const { token } = useContext(AuthContext);
  const [searchText, setSearchText] = useState("");
  const { user } = useContext(AuthContext);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [visibleColumns, setVisibleColumns] = useState(defaultVisibleColumns);
  const [materialLoading, setMaterialLoading] = useState(false);
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState({});
  const [initialLoading, setInitialLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const navigate = useNavigate();
  const getRolePath = (roleId) => {
    switch (roleId) {
      case 1:
        return "admin";
      case 2:
        return "teacher";
      default:
        return "management";
    }
  };
  const userRolePath = user ? getRolePath(user.role) : "management";

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    console.log("Received subjectSlug:", subjectSlug);
    const fetchSubjectId = async () => {
      setInitialLoading(true);
      try {
        if (token) {
          api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
          console.log(`Fetching subject with slug: ${subjectSlug}`);
          const response = await api.get(`subjects/?slug=${subjectSlug}`);
          console.log("API Response:", response.data);
          const filteredSubject = response.data.find(
            (subject) => subject.slug === subjectSlug
          );
          if (filteredSubject) {
            setSubjectId(filteredSubject.id);
          } else {
            console.error("No subject found with the given slug");
          }
        } else {
          console.error("Token is not available");
        }
      } catch (error) {
        console.error("Error fetching subject ID:", error);
      } finally {
        setInitialLoading(false);
      }
    };

    if (subjectSlug) {
      fetchSubjectId();
    }
  }, [subjectSlug, token]);

  const filteredMaterials =
    subjectDetail && subjectDetail.materials
      ? subjectDetail.materials.filter((material) =>
          material.title.toLowerCase().includes(searchText.trim().toLowerCase())
        )
      : [];

  const handleSuccess = async () => {
    setSelectedMaterialId(null);
    setIsModalVisible(false);

    try {
      await fetchSubjectDetail();
      Swal.fire({
        title: "Berhasil!",
        text: "Material berhasil disimpan!",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Error refreshing materials:", error);
    }
  };

  // Export handler dengan loading yang konsisten
  const exportToFile = async (format = "csv") => {
    const exportKey = `export_${format}`;
    setExportLoading((prev) => ({ ...prev, [exportKey]: true }));

    try {
      const exportData = filteredMaterials.map((material) => ({
        Title: material.title,
        Created: material.created_at
          ? new Date(material.created_at).toLocaleDateString()
          : "-",
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Materials");

      const fileType =
        format === "xlsx"
          ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          : "text/csv";
      const fileExt = format === "xlsx" ? ".xlsx" : ".csv";
      const buf =
        format === "xlsx"
          ? XLSX.write(wb, { bookType: "xlsx", type: "array" })
          : XLSX.write(wb, { bookType: "csv", type: "array" });

      saveAs(new Blob([buf], { type: fileType }), `materials${fileExt}`);

      Swal.fire({
        title: "Berhasil!",
        text: `Materials berhasil di-export ke format ${format.toUpperCase()}.`,
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Export error:", error);
      Swal.fire({
        title: "Gagal!",
        text: "Terjadi kesalahan saat export materials.",
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally {
      setExportLoading((prev) => ({ ...prev, [exportKey]: false }));
    }
  };

  // Bulk delete handler dengan loading yang konsisten
  const handleBulkDelete = async () => {
    if (selectedRowKeys.length === 0) return;

    // Ambil nama materials yang akan dihapus untuk ditampilkan
    const materialsToDelete = filteredMaterials.filter((material) =>
      selectedRowKeys.includes(material.id)
    );
    const materialTitles = materialsToDelete
      .map((material) => material.title)
      .join(", ");

    const confirm = await Swal.fire({
      title: "Hapus Multiple Materials?",
      html: `
        <p>Anda akan menghapus <strong>${selectedRowKeys.length} materials</strong>:</p>
        <div style="max-height: 150px; overflow-y: auto; margin: 10px 0; padding: 10px; background: #f5f5f5; border-radius: 4px;">
          <small>${materialTitles}</small>
        </div>
        <p style="color: #ff4d4f; font-weight: 500;">⚠️ Tindakan ini tidak dapat dibatalkan!</p>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: `Ya, Hapus ${selectedRowKeys.length} Materials!`,
      cancelButtonText: "Batal",
      reverseButtons: true,
      width: 500,
    });

    if (confirm.isConfirmed) {
      setBulkDeleteLoading(true);

      // Tampilkan progress
      Swal.fire({
        title: "Menghapus materials...",
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

        for (const materialId of selectedRowKeys) {
          try {
            await deleteMaterial(materialId);
            successCount++;
          } catch (error) {
            console.error(`Failed to delete material ${materialId}:`, error);
            failedCount++;
          }
        }

        setSelectedRowKeys([]);
        await fetchSubjectDetail();

        // Tampilkan hasil
        if (failedCount === 0) {
          Swal.fire({
            title: "Berhasil!",
            text: `${successCount} materials berhasil dihapus.`,
            icon: "success",
            timer: 3000,
            showConfirmButton: false,
          });
        } else {
          Swal.fire({
            title: "Selesai dengan Peringatan",
            html: `
              <p>✅ <strong>${successCount}</strong> materials berhasil dihapus</p>
              <p>❌ <strong>${failedCount}</strong> materials gagal dihapus</p>
            `,
            icon: "warning",
            confirmButtonText: "OK",
          });
        }
      } catch (error) {
        console.error("Bulk delete error:", error);
        Swal.fire({
          title: "Error!",
          text: "Terjadi kesalahan saat menghapus materials.",
          icon: "error",
          confirmButtonText: "OK",
        });
      } finally {
        setBulkDeleteLoading(false);
      }
    }
  };

  const handleAddMaterialClick = () => {
    setSelectedMaterialId(null);
    setIsModalVisible(true);
  };

  const handleEditMaterial = async (materialId) => {
    setMaterialLoading(true);
    try {
      setSelectedMaterialId(materialId);
      // Simulasi loading saat fetch data material untuk edit
      await new Promise((resolve) => setTimeout(resolve, 500));
      setIsModalVisible(true);
    } catch (error) {
      console.error("Error loading material data:", error);
      Swal.fire({
        title: "Error!",
        text: "Failed to load material data",
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally {
      setMaterialLoading(false);
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setSelectedMaterialId(null);
    setMaterialLoading(false);
  };

  const handleColumnVisibilityChange = (checkedValues) => {
    setVisibleColumns(checkedValues);
  };

  const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

  // Loading state untuk keseluruhan halaman
  const isPageLoading = initialLoading || subjectDetailLoading;

  // Initial loading screen - konsisten dengan ClassManagement loading
  if (initialLoading) {
    return (
      <Card
        style={{
          maxWidth: 900,
          margin: "0 auto",
          background: "#fff",
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
          Subject Detail
        </Title>

        <div style={{ textAlign: "center", margin: "40px 0" }}>
          <Spin indicator={antIcon} />
          <p style={{ marginTop: 16, color: "#666" }}>
            Loading subject detail...
          </p>
        </div>
      </Card>
    );
  }

  if (!subjectId) {
    return (
      <Card
        style={{
          maxWidth: 900,
          margin: "0 auto",
          background: "#fff",
          boxShadow: "0 2px 8px #f0f1f2",
          padding: 24,
        }}
      >
        <Alert
          message="Error"
          description="Subject tidak ditemukan"
          type="error"
          showIcon
        />
      </Card>
    );
  }

  return (
    <Card
      style={{
        maxWidth: 900,
        margin: "0 auto",
        background: "#fff",
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
        {subjectDetail?.name || "Subject Detail"}
      </Title>

      {error && (
        <Alert
          message="Error"
          description={error.message}
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {/* Loading untuk materials data - konsisten dengan ClassManagement */}
      {subjectDetailLoading ? (
        <div style={{ textAlign: "center", margin: "40px 0" }}>
          <Spin indicator={antIcon} />
          <p style={{ marginTop: 16, color: "#666" }}>
            Loading materials data...
          </p>
        </div>
      ) : (
        <>
          <MaterialFilters
            searchText={searchText}
            rowsPerPage={rowsPerPage}
            handleSearchTextChange={(e) => setSearchText(e.target.value)}
            handleRowsPerPageChange={setRowsPerPage}
            handleAddMaterialClick={handleAddMaterialClick}
            user={user}
            loading={isPageLoading}
          />

          <div
            className="material-action-buttons"
            style={{
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              gap: 12,
              marginBottom: 16,
              alignItems: isMobile ? "stretch" : "center",
              justifyContent: "space-between",
            }}
          >
            {user?.role !== 2 && (
              <div
                style={{
                  display: "flex",
                  flexDirection: isMobile ? "column" : "row",
                  gap: isMobile ? 8 : 12,
                  width: isMobile ? "100%" : "auto",
                }}
              >
                <Button
                  type="primary"
                  danger
                  onClick={handleBulkDelete}
                  disabled={selectedRowKeys.length === 0}
                  loading={bulkDeleteLoading}
                  style={{
                    height: 40,
                    fontWeight: 600,
                    borderRadius: 8,
                    padding: "0 24px",
                    minWidth: 140,
                  }}
                >
                  {bulkDeleteLoading
                    ? `Menghapus ${selectedRowKeys.length} materials...`
                    : `Hapus ${selectedRowKeys.length || 0} materials`}
                </Button>
              </div>
            )}

            <div
              style={{
                display: "flex",
                flexDirection: isMobile ? "column" : "row",
                gap: isMobile ? 8 : 12,
                width: isMobile ? "100%" : "auto",
              }}
            >
              <Dropdown
                overlay={
                  <Menu>
                    {columnOptions.map((option) => (
                      <Menu.Item key={option.value}>
                        <Checkbox
                          checked={visibleColumns.includes(option.value)}
                          onChange={(e) => {
                            const newColumns = e.target.checked
                              ? [...visibleColumns, option.value]
                              : visibleColumns.filter(
                                  (col) => col !== option.value
                                );
                            handleColumnVisibilityChange(newColumns);
                          }}
                        >
                          {option.label}
                        </Checkbox>
                      </Menu.Item>
                    ))}
                  </Menu>
                }
                trigger={["click"]}
              >
                <Button
                  style={{
                    height: 40,
                    borderRadius: 8,
                    padding: "0 16px",
                  }}
                >
                  Column Visibility
                </Button>
              </Dropdown>

              <Button
                className="export-btn"
                onClick={() => exportToFile("csv")}
                loading={exportLoading.export_csv}
                style={{
                  height: 40,
                  borderRadius: 8,
                  padding: "0 16px",
                }}
              >
                {exportLoading.export_csv ? "Exporting..." : "Export CSV"}
              </Button>

              <Button
                className="export-btn"
                onClick={() => exportToFile("xlsx")}
                loading={exportLoading.export_xlsx}
                style={{
                  height: 40,
                  borderRadius: 8,
                  padding: "0 16px",
                }}
              >
                {exportLoading.export_xlsx ? "Exporting..." : "Export Excel"}
              </Button>
            </div>
          </div>

          <MaterialTable
            subjectDetail={subjectDetail}
            deleteMaterial={deleteMaterial}
            fetchSubjectDetail={fetchSubjectDetail}
            onEditMaterial={handleEditMaterial}
            rowSelection={
              user?.role !== 2
                ? {
                    selectedRowKeys,
                    onChange: setSelectedRowKeys,
                  }
                : null
            }
            visibleColumns={visibleColumns}
            rowsPerPage={rowsPerPage}
            loading={false} // Table loading dihandle oleh parent
            modalLoading={materialLoading}
            userRolePath={userRolePath}
          />

          {/* Modal dengan loading overlay yang konsisten */}
          <Modal
            open={isModalVisible}
            onCancel={handleModalCancel}
            footer={null}
            centered
            destroyOnClose
            className="class-form-modal"
          >
            {materialLoading ? (
              <div style={{ textAlign: "center", padding: "60px 0" }}>
                <Spin indicator={antIcon} />
                <p style={{ marginTop: 16, color: "#666" }}>
                  Loading material data...
                </p>
              </div>
            ) : (
              <MaterialForm
                materialId={selectedMaterialId}
                subjectId={subjectId}
                onSuccess={handleSuccess}
                isSubmitting={isSubmitting}
                setIsSubmitting={setIsSubmitting}
              />
            )}
          </Modal>
        </>
      )}
    </Card>
  );
};

export default SubjectDetailPage;
