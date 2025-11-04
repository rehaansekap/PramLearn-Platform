import React, { useState, useEffect } from "react";
import {
  Card,
  Button,
  Table,
  Space,
  Tag,
  Modal,
  Spin,
  Empty,
  Row,
  Col,
  Statistic,
  Typography,
  Input,
  Select,
  Checkbox,
  message,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  LoadingOutlined,
  FileTextOutlined,
  SearchOutlined,
  DownloadOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import useSessionMaterials from "../hooks/useSessionMaterials";
import SessionMaterialForm from "./SessionMaterialForm";
import SessionMaterialDetail from "./SessionMaterialDetail";
import Swal from "sweetalert2";
import { useNavigate, useParams } from "react-router-dom";

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

const SessionMaterialManagement = ({ subjectId, subjectName, className }) => {
  const {
    materials,
    loading,
    error,
    fetchMaterials,
    deleteMaterial,
    bulkDeleteMaterials,
  } = useSessionMaterials(subjectId);
  const navigate = useNavigate();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedMaterialId, setSelectedMaterialId] = useState(null);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [materialLoading, setMaterialLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState({});
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);
  const { subjectSlug } = useParams();

  // Filters and table states
  const [searchText, setSearchText] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [visibleColumns, setVisibleColumns] = useState([
    "title",
    "created_at",
    "pdf_count",
    "video_count",
    "quiz_count",
    "assignment_count",
    "actions",
  ]);

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Filter materials based on search
  const filteredMaterials = materials.filter((material) =>
    material.title.toLowerCase().includes(searchText.toLowerCase())
  );

  // Handle add material
  const handleAddMaterial = () => {
    setSelectedMaterialId(null);
    setIsModalVisible(true);
  };

  // Handle edit material
  const handleEditMaterial = async (materialId) => {
    setMaterialLoading(true);
    try {
      setSelectedMaterialId(materialId);
      await new Promise((resolve) => setTimeout(resolve, 500));
      setIsModalVisible(true);
    } catch (error) {
      console.error("Error loading material data:", error);
      message.error("Failed to load material data");
    } finally {
      setMaterialLoading(false);
    }
  };

  // Handle view material detail
  const handleViewMaterial = async (material) => {
    setActionLoading((prev) => ({ ...prev, [`view_${material.id}`]: true }));
    try {
      navigate(`/teacher/sessions/${subjectSlug}/${material.slug}`);
    } catch (error) {
      console.error("Error viewing material:", error);
    } finally {
      setActionLoading((prev) => ({ ...prev, [`view_${material.id}`]: false }));
    }
  };

  // Handle delete material
  const handleDeleteMaterial = async (materialId, materialTitle) => {
    const result = await Swal.fire({
      title: "Yakin ingin menghapus materi ini?",
      text: `Materi "${materialTitle}" akan dihapus secara permanen!`,
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
        message.success(`Materi "${materialTitle}" berhasil dihapus`);
      } catch (error) {
        console.error("Error deleting material:", error);
        message.error("Gagal menghapus materi");
      } finally {
        setActionLoading((prev) => ({ ...prev, [deleteKey]: false }));
      }
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedRowKeys.length === 0) return;

    const materialsToDelete = filteredMaterials.filter((material) =>
      selectedRowKeys.includes(material.id)
    );
    const materialTitles = materialsToDelete
      .map((material) => material.title)
      .join(", ");

    const confirm = await Swal.fire({
      title: "Hapus Multiple Materi?",
      html: `
        <p>Anda akan menghapus <strong>${selectedRowKeys.length} materi</strong>:</p>
        <div style="max-height: 150px; overflow-y: auto; margin: 10px 0; padding: 10px; background: #f5f5f5; border-radius: 4px;">
          <small>${materialTitles}</small>
        </div>
        <p style="color: #ff4d4f; font-weight: 500;">⚠️ Tindakan ini tidak dapat dibatalkan!</p>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: `Ya, Hapus ${selectedRowKeys.length} Materi!`,
      cancelButtonText: "Batal",
      reverseButtons: true,
      width: 500,
    });

    if (confirm.isConfirmed) {
      setBulkDeleteLoading(true);

      try {
        await bulkDeleteMaterials(selectedRowKeys);
        setSelectedRowKeys([]);
        message.success(`${selectedRowKeys.length} materi berhasil dihapus`);
      } catch (error) {
        console.error("Bulk delete error:", error);
        message.error("Gagal menghapus materi");
      } finally {
        setBulkDeleteLoading(false);
      }
    }
  };

  // Handle success
  const handleSuccess = async () => {
    setSelectedMaterialId(null);
    setIsModalVisible(false);
    try {
      await fetchMaterials();
      message.success("Materi berhasil disimpan!");
    } catch (error) {
      console.error("Error refreshing materials:", error);
    }
  };

  // Handle modal cancel
  const handleModalCancel = () => {
    setIsModalVisible(false);
    setSelectedMaterialId(null);
    setMaterialLoading(false);
  };

  // Table columns
  const columns = [
    visibleColumns.includes("title") && {
      title: "Judul Materi",
      dataIndex: "title",
      key: "title",
      sorter: (a, b) => a.title.localeCompare(b.title),
      render: (text) => (
        <div style={{ fontWeight: 500, color: "#11418b" }}>{text}</div>
      ),
      ellipsis: true,
    },
    visibleColumns.includes("created_at") && {
      title: "Tanggal Dibuat",
      dataIndex: "created_at",
      key: "created_at",
      render: (date) =>
        date ? new Date(date).toLocaleDateString("id-ID") : "-",
      width: 120,
      responsive: ["md"],
    },
    visibleColumns.includes("pdf_count") && {
      title: "PDF Files",
      key: "pdf_count",
      render: (_, record) => (
        <Tag color="blue">{record.pdf_files?.length || 0} File</Tag>
      ),
      width: 100,
      align: "center",
      responsive: ["lg"],
    },
    visibleColumns.includes("video_count") && {
      title: "Video",
      key: "video_count",
      render: (_, record) => (
        <Tag color="orange">{record.youtube_videos?.length || 0} Video</Tag>
      ),
      width: 80,
      align: "center",
      responsive: ["lg"],
    },
    visibleColumns.includes("quiz_count") && {
      title: "Quiz",
      key: "quiz_count",
      render: (_, record) => (
        <Tag color="green">{record.quizzes?.length || 0} Quiz</Tag>
      ),
      width: 80,
      align: "center",
      responsive: ["lg"],
    },
    visibleColumns.includes("assignment_count") && {
      title: "Tugas",
      key: "assignment_count",
      render: (_, record) => (
        <Tag color="purple">{record.assignments?.length || 0} Tugas</Tag>
      ),
      width: 80,
      align: "center",
      responsive: ["lg"],
    },
    visibleColumns.includes("actions") && {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="small">
          <Button
            icon={<EyeOutlined />}
            size="small"
            onClick={() => handleViewMaterial(record)}
            loading={actionLoading[`view_${record.id}`]}
            style={{ backgroundColor: "#1890ff", color: "#fff" }}
          >
            {!isMobile && "Detail"}
          </Button>
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEditMaterial(record.id)}
            loading={actionLoading[`edit_${record.id}`] || materialLoading}
            style={{ backgroundColor: "#52c41a", color: "#fff" }}
          >
            {!isMobile && "Edit"}
          </Button>
          <Button
            icon={<DeleteOutlined />}
            size="small"
            danger
            onClick={() => handleDeleteMaterial(record.id, record.title)}
            loading={actionLoading[`delete_${record.id}`]}
          >
            {!isMobile && "Hapus"}
          </Button>
        </Space>
      ),
      width: isMobile ? 120 : 200,
      fixed: "right",
    },
  ].filter(Boolean);

  const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

  if (error && !materials.length) {
    return (
      <Card style={{ borderRadius: 12 }}>
        <Empty
          description="Gagal memuat data materi. Silakan coba lagi."
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </Card>
    );
  }

  return (
    <div>
      {/* Header */}
      <Card
        style={{
          marginBottom: 24,
          borderRadius: 12,
          background: "linear-gradient(135deg, #11418b 0%, #1677ff 100%)",
          border: "none",
          color: "white",
        }}
        bodyStyle={{ padding: "24px" }}
      >
        <Row align="middle" justify="space-between">
          <Col>
            <Space direction="vertical" size="small">
              <Title level={4} style={{ color: "white", margin: 0 }}>
                <FileTextOutlined style={{ marginRight: 8 }} />
                Manajemen Materi Pembelajaran
              </Title>
              <Text style={{ color: "rgba(255, 255, 255, 0.8)" }}>
                {subjectName} - {className}
              </Text>
            </Space>
          </Col>
          <Col>
            <Statistic
              title="Total Materi"
              value={materials.length}
              valueStyle={{ color: "white", fontSize: 24 }}
            />
          </Col>
        </Row>
      </Card>

      {/* Filters & Actions */}
      <Card style={{ marginBottom: 24, borderRadius: 12 }}>
        <Row gutter={[16, 16]} align="middle">
          {/* Search */}
          <Col xs={24} sm={12} md={8}>
            <Search
              placeholder="Cari materi pembelajaran..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: "100%" }}
              enterButton={<SearchOutlined />}
            />
          </Col>

          {/* Rows per page */}
          <Col xs={24} sm={6} md={4}>
            <Select
              value={rowsPerPage}
              onChange={setRowsPerPage}
              style={{ width: "100%" }}
            >
              <Option value={5}>5 per halaman</Option>
              <Option value={10}>10 per halaman</Option>
              <Option value={20}>20 per halaman</Option>
              <Option value={50}>50 per halaman</Option>
            </Select>
          </Col>

          {/* Actions */}
          <Col xs={24} sm={6} md={12}>
            <Row gutter={8} justify={isMobile ? "center" : "end"}>
              {selectedRowKeys.length > 0 && (
                <Col>
                  <Button
                    type="primary"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={handleBulkDelete}
                    loading={bulkDeleteLoading}
                  >
                    Hapus {selectedRowKeys.length}
                  </Button>
                </Col>
              )}
              <Col>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleAddMaterial}
                  style={{ backgroundColor: "#11418b" }}
                >
                  Tambah Materi
                </Button>
              </Col>
            </Row>
          </Col>
        </Row>
      </Card>

      {/* Materials Table */}
      <Card style={{ borderRadius: 12 }} bodyStyle={{ padding: "24px" }}>
        {loading && !materials.length ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <Spin indicator={antIcon} />
            <p style={{ marginTop: 16, color: "#666" }}>
              Memuat data materi...
            </p>
          </div>
        ) : (
          <Table
            dataSource={filteredMaterials.map((material) => ({
              ...material,
              key: material.id,
            }))}
            columns={columns}
            pagination={{
              pageSize: rowsPerPage,
              showSizeChanger: false,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} dari ${total} materi`,
              style: { textAlign: "center" },
            }}
            rowSelection={{
              selectedRowKeys,
              onChange: setSelectedRowKeys,
            }}
            className="session-material-table"
            style={{ width: "100%" }}
            scroll={{ x: isMobile ? 800 : undefined }}
            size="middle"
            loading={loading && materials.length > 0}
          />
        )}
      </Card>

      {/* Add/Edit Material Modal */}
      <Modal
        open={isModalVisible}
        onCancel={handleModalCancel}
        footer={null}
        centered
        destroyOnClose
        width={800}
        className="session-material-modal"
      >
        {materialLoading ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <Spin indicator={antIcon} />
            <p style={{ marginTop: 16, color: "#666" }}>
              Memuat data materi...
            </p>
          </div>
        ) : (
          <SessionMaterialForm
            materialId={selectedMaterialId}
            subjectId={subjectId}
            onSuccess={handleSuccess}
            isSubmitting={isSubmitting}
            setIsSubmitting={setIsSubmitting}
          />
        )}
      </Modal>

      {/* Material Detail Modal */}
      <Modal
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        footer={null}
        centered
        destroyOnClose
        width={1000}
        className="session-material-detail-modal"
      >
        {selectedMaterial && (
          <SessionMaterialDetail material={selectedMaterial} />
        )}
      </Modal>

      {/* Loading overlay for refresh */}
      {loading && materials.length > 0 && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(255, 255, 255, 0.8)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <Spin indicator={antIcon} tip="Memperbarui data materi..." />
        </div>
      )}
    </div>
  );
};

export default SessionMaterialManagement;
