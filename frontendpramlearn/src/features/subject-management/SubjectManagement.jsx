import React, { useState, useCallback } from "react";
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
import SubjectFilters from "./components/SubjectFilters";
import SubjectTable from "./components/SubjectTable";
import SubjectForm from "./components/SubjectForm";
import useFetchSubjects from "./hooks/useFetchSubjects";
import useFetchClasses from "../class-management/hooks/useFetchClasses";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { useContext } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { LoadingOutlined } from "@ant-design/icons"; // Update import

const { Title } = Typography;
const defaultVisibleColumns = ["name", "kelas", "actions"];
const columnOptions = [
  { label: "Name", value: "name" },
  { label: "Kelas", value: "kelas" },
  { label: "Actions", value: "actions" },
];

const SubjectManagement = ({ classId }) => {
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [visibleColumns, setVisibleColumns] = useState(defaultVisibleColumns);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [classFilter, setClassFilter] = useState("");

  // Loading states yang konsisten dengan Class/Users Management
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState({});
  const [modalLoading, setModalLoading] = useState(false);

  const { classes: classList } = useFetchClasses();

  const { user } = useContext(AuthContext);
  const { subjects, deleteSubject, fetchSubjects, error, loading } =
    useFetchSubjects(classId);

  const navigate = useNavigate();

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const filteredSubjects = subjects.filter((subject) => {
    const matchName = subject.name
      .toLowerCase()
      .includes(searchText.toLowerCase());
    const matchClass =
      !classFilter ||
      String(subject.class_id) === String(classFilter) ||
      String(subject.class) === String(classFilter);
    const matchTeacher =
      user?.role !== 2 || String(subject.teacher) === String(user.id);
    return matchName && matchClass && matchTeacher;
  });

  const handleSelectSubject = async (subjectId) => {
    setModalLoading(true);
    try {
      setSelectedSubjectId(subjectId);
      // Simulasi loading saat fetch data subject untuk edit
      await new Promise((resolve) => setTimeout(resolve, 500));
      setIsModalVisible(true);
    } catch (error) {
      console.error("Error loading subject data:", error);
      Swal.fire({
        title: "Error!",
        text: "Failed to load subject data",
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally {
      setModalLoading(false);
    }
  };

  const handleAddSubjectClick = () => {
    setSelectedSubjectId(null);
    setIsModalVisible(true);
  };

  const handleSuccess = async () => {
    setSelectedSubjectId(null);
    setIsModalVisible(false);
    setPage(0);

    // Loading saat refresh data setelah sukses
    try {
      await fetchSubjects();
      Swal.fire({
        title: "Berhasil!",
        text: "Subject berhasil disimpan!",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Error refreshing subjects:", error);
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setSelectedSubjectId(null);
    setModalLoading(false);
  };

  const handleBulkDelete = async () => {
    if (selectedRowKeys.length === 0) return;

    // Ambil nama subjects yang akan dihapus untuk ditampilkan
    const subjectsToDelete = filteredSubjects.filter((subject) =>
      selectedRowKeys.includes(subject.id)
    );
    const subjectNames = subjectsToDelete
      .map((subject) => subject.name)
      .join(", ");

    const confirm = await Swal.fire({
      title: "Hapus Multiple Subjects?",
      html: `
        <p>Anda akan menghapus <strong>${selectedRowKeys.length} subjects</strong>:</p>
        <div style="max-height: 150px; overflow-y: auto; margin: 10px 0; padding: 10px; background: #f5f5f5; border-radius: 4px;">
          <small>${subjectNames}</small>
        </div>
        <p style="color: #ff4d4f; font-weight: 500;">⚠️ Tindakan ini tidak dapat dibatalkan!</p>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: `Ya, Hapus ${selectedRowKeys.length} Subjects!`,
      cancelButtonText: "Batal",
      reverseButtons: true,
      width: 500,
    });

    if (confirm.isConfirmed) {
      setBulkDeleteLoading(true);

      // Tampilkan progress
      Swal.fire({
        title: "Menghapus subjects...",
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

        for (const subjectId of selectedRowKeys) {
          try {
            await deleteSubject(subjectId);
            successCount++;
          } catch (error) {
            console.error(`Failed to delete subject ${subjectId}:`, error);
            failedCount++;
          }
        }

        setSelectedRowKeys([]);
        await fetchSubjects();

        // Tampilkan hasil
        if (failedCount === 0) {
          Swal.fire({
            title: "Berhasil!",
            text: `${successCount} subjects berhasil dihapus.`,
            icon: "success",
            timer: 3000,
            showConfirmButton: false,
          });
        } else {
          Swal.fire({
            title: "Selesai dengan Peringatan",
            html: `
              <p>✅ <strong>${successCount}</strong> subjects berhasil dihapus</p>
              <p>❌ <strong>${failedCount}</strong> subjects gagal dihapus</p>
            `,
            icon: "warning",
            confirmButtonText: "OK",
          });
        }
      } catch (error) {
        console.error("Bulk delete error:", error);
        Swal.fire({
          title: "Error!",
          text: "Terjadi kesalahan saat menghapus subjects.",
          icon: "error",
          confirmButtonText: "OK",
        });
      } finally {
        setBulkDeleteLoading(false);
      }
    }
  };

  const handleColumnVisibilityChange = (checkedValues) => {
    setVisibleColumns(checkedValues);
  };

  // Export dengan loading yang konsisten
  const exportToFile = async (format = "csv") => {
    const exportKey = `export_${format}`;
    setExportLoading((prev) => ({ ...prev, [exportKey]: true }));

    try {
      const exportData = filteredSubjects.map((subject) => ({
        Name: subject.name,
        Teacher: subject.teacher_name || subject.teacher || "Unknown",
        Class: subject.class_name || subject.class || "No Class",
        Created: subject.created_at
          ? new Date(subject.created_at).toLocaleDateString()
          : "-",
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Subjects");

      const fileType =
        format === "xlsx"
          ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          : "text/csv";
      const fileExt = format === "xlsx" ? ".xlsx" : ".csv";
      const buf =
        format === "xlsx"
          ? XLSX.write(wb, { bookType: "xlsx", type: "array" })
          : XLSX.write(wb, { bookType: "csv", type: "array" });

      saveAs(new Blob([buf], { type: fileType }), `subjects${fileExt}`);

      // Success feedback yang sama dengan Users/Class Management
      Swal.fire({
        title: "Berhasil!",
        text: `Subjects berhasil di-export ke format ${format.toUpperCase()}.`,
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Export error:", error);
      Swal.fire({
        title: "Gagal!",
        text: "Terjadi kesalahan saat export subjects.",
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally {
      setExportLoading((prev) => ({ ...prev, [exportKey]: false }));
    }
  };

  // Loading state untuk keseluruhan halaman
  const isPageLoading = loading; // Pastikan loading dari useFetchSubjects sudah benar
  const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

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
        Subject Management
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

      {isPageLoading ? (
        <div style={{ textAlign: "center", margin: "40px 0" }}>
          <Spin indicator={antIcon} />
          <p style={{ marginTop: 16, color: "#666" }}>
            Memuat data subjects...
          </p>
        </div>
      ) : (
        <>
          <SubjectFilters
            searchText={searchText}
            rowsPerPage={rowsPerPage}
            handleSearchTextChange={(e) => setSearchText(e.target.value)}
            handleRowsPerPageChange={setRowsPerPage}
            handleAddSubjectClick={handleAddSubjectClick}
            user={user}
            classFilter={classFilter}
            handleClassFilterChange={setClassFilter}
            classList={classList}
            loading={isPageLoading} // Pass loading state
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
                    ? `Menghapus ${selectedRowKeys.length} subjects...`
                    : `Hapus ${selectedRowKeys.length || 0} subjects`}
                </Button>
              )}
            </div>

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

          <SubjectTable
            subjects={filteredSubjects}
            page={page}
            rowsPerPage={rowsPerPage}
            handlePageChange={setPage}
            handleSelectSubject={handleSelectSubject}
            handleDeleteSubject={async (subjectId) => {
              await deleteSubject(subjectId);
              fetchSubjects();
            }}
            handleViewDetail={(subjectSlug) =>
              navigate(`/management/subject/${subjectSlug}`)
            }
            rowSelection={
              user?.role !== 2
                ? {
                    selectedRowKeys,
                    onChange: setSelectedRowKeys,
                  }
                : null
            }
            visibleColumns={visibleColumns}
            loading={false} // Table loading dihandle oleh parent
            modalLoading={modalLoading}
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
                  Memuat data subject...
                </p>
              </div>
            ) : (
              <SubjectForm
                subjectId={selectedSubjectId}
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

export default SubjectManagement;
