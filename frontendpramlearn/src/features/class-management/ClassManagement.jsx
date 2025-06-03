import React, { useState, useEffect, useCallback, useContext } from "react";
import {
  Card,
  Typography,
  Button,
  Modal,
  Space,
  Dropdown,
  Menu,
  Checkbox,
  Alert,
  Spin,
  Row,
  Col,
  Select,
  Input,
} from "antd";
import { PlusOutlined, LoadingOutlined } from "@ant-design/icons";
import ClassTable from "./components/ClassTable";
import ClassForm from "./components/ClassForm";
import useClassManagement from "./hooks/useClassManagement";
import useFetchClasses from "./hooks/useFetchClasses";
import api from "../../api";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import ClassInfoModal from "./components/ClassInfoModal";
import ClassFilters from "./components/ClassFilters";
import Swal from "sweetalert2";
import { AuthContext } from "../../context/AuthContext";

const { Title } = Typography;
const { Option } = Select;
const defaultVisibleColumns = ["name", "actions"];
const columnOptions = [
  { label: "Name", value: "name" },
  { label: "Actions", value: "actions" },
];

const ClassManagement = () => {
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchText, setSearchText] = useState("");
  const { deleteClass } = useClassManagement();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [visibleColumns, setVisibleColumns] = useState(defaultVisibleColumns);
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Loading states yang lebih detail
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState({});
  const [modalLoading, setModalLoading] = useState(false);
  const [infoLoading, setInfoLoading] = useState(false);

  const { user } = useContext(AuthContext);
  const {
    classes: classList,
    error: fetchError,
    loading,
    fetchClasses,
  } = useFetchClasses();

  // Handle window resize to detect mobile/desktop view
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const filteredClasses = classList.filter((cls) =>
    cls.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleSelectClass = async (classId) => {
    setModalLoading(true);
    try {
      setSelectedClassId(classId);
      // Simulasi loading saat fetch data class untuk edit
      await new Promise((resolve) => setTimeout(resolve, 500));
      setIsModalVisible(true);
    } catch (error) {
      console.error("Error loading class data:", error);
      Swal.fire("Error", "Failed to load class data", "error");
    } finally {
      setModalLoading(false);
    }
  };

  const handleAddClassClick = () => {
    setSelectedClassId(null);
    setIsModalVisible(true);
  };

  const handleSuccess = async () => {
    setSelectedClassId(null);
    setIsModalVisible(false);
    setPage(0);

    // Loading saat refresh data setelah sukses
    try {
      await fetchClasses();
      Swal.fire({
        title: "Berhasil!",
        text: "Class berhasil disimpan!",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Error refreshing classes:", error);
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setModalLoading(false);
  };

  const handleDeleteClass = async (deletedId) => {
    try {
      await deleteClass(deletedId);
      await fetchClasses();
    } catch (error) {
      console.error("Error deleting class:", error);
      Swal.fire("Error", "Failed to delete class", "error");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedRowKeys.length === 0) return;

    // Ambil nama classes yang akan dihapus untuk ditampilkan
    const classesToDelete = filteredClasses.filter((cls) =>
      selectedRowKeys.includes(cls.id)
    );
    const classNames = classesToDelete.map((cls) => cls.name).join(", ");

    const confirm = await Swal.fire({
      title: "Hapus Multiple Classes?",
      html: `
        <p>Anda akan menghapus <strong>${selectedRowKeys.length} classes</strong>:</p>
        <div style="max-height: 150px; overflow-y: auto; margin: 10px 0; padding: 10px; background: #f5f5f5; border-radius: 4px;">
          <small>${classNames}</small>
        </div>
        <p style="color: #ff4d4f; font-weight: 500;">⚠️ Tindakan ini tidak dapat dibatalkan!</p>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: `Ya, Hapus ${selectedRowKeys.length} Classes!`,
      cancelButtonText: "Batal",
      reverseButtons: true,
      width: 500,
    });

    if (confirm.isConfirmed) {
      setBulkDeleteLoading(true);

      // Tampilkan progress
      Swal.fire({
        title: "Menghapus classes...",
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

        for (const classId of selectedRowKeys) {
          try {
            await deleteClass(classId);
            successCount++;
          } catch (error) {
            console.error(`Failed to delete class ${classId}:`, error);
            failedCount++;
          }
        }

        setSelectedRowKeys([]);
        await fetchClasses();

        // Tampilkan hasil
        if (failedCount === 0) {
          Swal.fire({
            title: "Berhasil!",
            text: `${successCount} classes berhasil dihapus.`,
            icon: "success",
            timer: 3000,
            showConfirmButton: false,
          });
        } else {
          Swal.fire({
            title: "Selesai dengan Peringatan",
            html: `
              <p>✅ <strong>${successCount}</strong> classes berhasil dihapus</p>
              <p>❌ <strong>${failedCount}</strong> classes gagal dihapus</p>
            `,
            icon: "warning",
            confirmButtonText: "OK",
          });
        }
      } catch (error) {
        console.error("Bulk delete error:", error);
        Swal.fire({
          title: "Error!",
          text: "Terjadi kesalahan saat menghapus classes.",
          icon: "error",
          confirmButtonText: "OK",
        });
      } finally {
        setBulkDeleteLoading(false);
      }
    }
  };

  const handleShowInfo = async (classItem) => {
    setInfoLoading(true);
    try {
      // Simulasi loading saat fetch detail class info
      await new Promise((resolve) => setTimeout(resolve, 300));
      setSelectedClass(classItem);
      setInfoModalVisible(true);
    } catch (error) {
      console.error("Error loading class info:", error);
      Swal.fire("Error", "Failed to load class information", "error");
    } finally {
      setInfoLoading(false);
    }
  };

  const handleInfoModalCancel = () => {
    setInfoModalVisible(false);
    setSelectedClass(null);
    setInfoLoading(false);
  };

  const handleColumnVisibilityChange = (checkedValues) => {
    setVisibleColumns(checkedValues);
  };

  // Export dengan loading yang lebih detail
  const exportToFile = async (format = "csv") => {
    const exportKey = `export_${format}`;
    setExportLoading((prev) => ({ ...prev, [exportKey]: true }));

    try {
      const exportData = filteredClasses.map((cls) => ({
        Name: cls.name,
        "Created Date": cls.created_at
          ? new Date(cls.created_at).toLocaleDateString()
          : "-",
        "Student Count": cls.student_count || 0,
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Classes");

      const fileType =
        format === "xlsx"
          ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          : "text/csv";
      const fileExt = format === "xlsx" ? ".xlsx" : ".csv";
      const buf =
        format === "xlsx"
          ? XLSX.write(wb, { bookType: "xlsx", type: "array" })
          : XLSX.write(wb, { bookType: "csv", type: "array" });

      saveAs(new Blob([buf], { type: fileType }), `classes${fileExt}`);

      // Success feedback yang sama dengan Users Management
      Swal.fire({
        title: "Berhasil!",
        text: `Classes berhasil di-export ke format ${format.toUpperCase()}.`,
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Export error:", error);
      Swal.fire({
        title: "Gagal!",
        text: "Terjadi kesalahan saat export classes.",
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally {
      setExportLoading((prev) => ({ ...prev, [exportKey]: false }));
    }
  };

  const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;
  const isPageLoading = loading;

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
        Class Management
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

      {loading ? (
        <div style={{ textAlign: "center", margin: "40px 0" }}>
          <Spin indicator={antIcon} />
          <p style={{ marginTop: 16, color: "#666" }}>
            Loading classes data...
          </p>
        </div>
      ) : (
        <>
          <ClassFilters
            searchText={searchText}
            rowsPerPage={rowsPerPage}
            handleSearchTextChange={(e) => setSearchText(e.target.value)}
            handleRowsPerPageChange={setRowsPerPage}
            handleAddClassClick={handleAddClassClick}
            user={user}
            style={{
              width: "100%",
              height: 40,
              fontWeight: 600,
              borderRadius: 8,
              backgroundColor: "#11418b",
              borderColor: "#11418b",
            }}
          />

          <div
            className="user-action-buttons"
            style={{
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              gap: 12,
              marginBottom: 16,
              alignItems: isMobile ? "stretch" : "center",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: isMobile ? "column" : "row",
                gap: isMobile ? 8 : 12,
                width: isMobile ? "100%" : "auto",
              }}
            >
              {user?.role !== 2 && (
                <Button
                  danger
                  disabled={selectedRowKeys.length === 0}
                  onClick={handleBulkDelete}
                  loading={bulkDeleteLoading}
                  style={{
                    minWidth: isMobile ? "100%" : 120,
                  }}
                >
                  {bulkDeleteLoading ? "Deleting..." : "Delete Selected"}
                </Button>
              )}
              <Dropdown
                overlay={
                  <Menu>
                    <Menu.Item>
                      <Checkbox.Group
                        options={columnOptions}
                        value={visibleColumns}
                        onChange={handleColumnVisibilityChange}
                      />
                    </Menu.Item>
                  </Menu>
                }
                trigger={["click"]}
              >
                <Button style={{ minWidth: isMobile ? "100%" : 140 }}>
                  Column Visibility
                </Button>
              </Dropdown>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: isMobile ? "column" : "row",
                gap: isMobile ? 8 : 12,
                width: isMobile ? "100%" : "auto",
              }}
            >
              <Button
                className="export-btn"
                onClick={() => exportToFile("csv")}
                loading={exportLoading.export_csv}
                style={{ minWidth: isMobile ? "100%" : 100 }}
              >
                {exportLoading.export_csv ? "Exporting..." : "Export CSV"}
              </Button>
              <Button
                className="export-btn"
                onClick={() => exportToFile("xlsx")}
                loading={exportLoading.export_xlsx}
                style={{ minWidth: isMobile ? "100%" : 110 }}
              >
                {exportLoading.export_xlsx ? "Exporting..." : "Export Excel"}
              </Button>
            </div>
          </div>

          <ClassTable
            classes={filteredClasses}
            page={page}
            rowsPerPage={rowsPerPage}
            handlePageChange={setPage}
            handleSelectClass={handleSelectClass}
            handleDeleteClass={handleDeleteClass}
            rowSelection={
              user?.role !== 2
                ? {
                    selectedRowKeys,
                    onChange: setSelectedRowKeys,
                  }
                : null
            }
            visibleColumns={visibleColumns}
            handleShowInfo={handleShowInfo}
            loading={false} // Table loading dihandle oleh parent
            modalLoading={modalLoading}
            infoLoading={infoLoading}
          />

          <ClassInfoModal
            open={infoModalVisible}
            onClose={handleInfoModalCancel}
            classItem={selectedClass}
            loading={infoLoading}
          />

          <Modal
            open={isModalVisible}
            onCancel={handleModalCancel}
            footer={null}
            centered
            destroyOnClose
            className="class-form-modal"
          >
            {modalLoading ? (
              <div style={{ textAlign: "center", padding: "60px 0" }}>
                <Spin indicator={antIcon} />
                <p style={{ marginTop: 16, color: "#666" }}>
                  Loading class data...
                </p>
              </div>
            ) : (
              <ClassForm
                classId={selectedClassId}
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

export default ClassManagement;
