import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Space,
  Tag,
  Card,
  Empty,
  Spin,
  Typography,
  Alert,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  AppstoreAddOutlined,
  BarChartOutlined,
  LoadingOutlined,
  ReloadOutlined, // Tambahkan icon yang benar
} from "@ant-design/icons";
import QuizRankingModal from "./components/QuizRankingModal";
import dayjs from "dayjs";

const QuizzesTab = ({
  quizzes,
  selectedQuiz,
  onCreateQuiz,
  onEditQuiz,
  onDeleteQuiz,
  onSelectQuiz,
  onViewRanking,
  loading,
  materialId,
  groupQuizAssignments,
  refetchGroupQuizAssignments,
}) => {
  const [selectedQuizForRanking, setSelectedQuizForRanking] = useState(null);
  const [actionLoading, setActionLoading] = useState({}); // Loading untuk actions individual
  const [refreshing, setRefreshing] = useState(false); // Loading untuk refresh manual
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Hitung ulang assignedGroups setiap kali groupQuizAssignments berubah
  const quizzesWithAssignedGroups = React.useMemo(() => {
    console.log("Recalculating assigned groups:", {
      quizzes,
      groupQuizAssignments,
    });
    return quizzes.map((quiz) => {
      const assignedGroups = groupQuizAssignments
        .filter((gq) => gq.quiz === quiz.id)
        .map((gq) => gq.group);
      return {
        ...quiz,
        assignedGroups,
        assigned_groups_count: assignedGroups.length,
      };
    });
  }, [quizzes, groupQuizAssignments]);

  // Handle refresh manual - PERBAIKAN
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetchGroupQuizAssignments();
    } catch (error) {
      console.error("Error refreshing quiz assignments:", error);
    } finally {
      setRefreshing(false); // Pastikan loading direset
    }
  };

  // Handle edit dengan loading - PERBAIKAN
  const handleEditWithLoading = async (quiz) => {
    const editKey = `edit_${quiz.id}`;
    setActionLoading((prev) => ({ ...prev, [editKey]: true }));
    try {
      await onEditQuiz(quiz);
    } catch (error) {
      console.error("Error editing quiz:", error);
    } finally {
      setActionLoading((prev) => ({ ...prev, [editKey]: false }));
    }
  };

  // Handle delete dengan loading - PERBAIKAN
  const handleDeleteWithLoading = async (quizId) => {
    const deleteKey = `delete_${quizId}`;
    setActionLoading((prev) => ({ ...prev, [deleteKey]: true }));
    try {
      await onDeleteQuiz(quizId);
    } catch (error) {
      console.error("Error deleting quiz:", error);
    } finally {
      setActionLoading((prev) => ({ ...prev, [deleteKey]: false }));
    }
  };

  const columns = [
    {
      title: "No",
      key: "no",
      render: (_, __, idx) => idx + 1,
      width: 60,
      align: "center",
    },
    {
      title: "Judul Quiz",
      dataIndex: "title",
      key: "title",
      render: (title, record) => (
        <div>
          <div style={{ fontWeight: 500, marginBottom: 4 }}>{title}</div>
          <div style={{ fontSize: "12px", color: "#666" }}>
            {record.content
              ? record.content.substring(0, 50) + "..."
              : "Tidak ada deskripsi"}
          </div>
        </div>
      ),
      ellipsis: true,
    },
    {
      title: "Jumlah Soal",
      key: "question_count",
      render: (_, record) => (
        <Tag color="blue">{record.questions?.length || 0} Soal</Tag>
      ),
      width: 120,
      align: "center",
    },
    {
      title: "Kelompok Assigned",
      key: "assigned_groups",
      render: (_, record) => (
        <Tag color="green">{record.assigned_groups_count || 0} Kelompok</Tag>
      ),
      width: 140,
      align: "center",
      responsive: ["md"],
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Button
            icon={<BarChartOutlined />}
            style={{
              backgroundColor: "#1890ff",
              color: "#fff",
              minWidth: 32,
              height: 32,
              borderRadius: 6,
            }}
            onClick={() => setSelectedQuizForRanking(record)}
            title="Ranking"
          />
          <Button
            icon={<EditOutlined />}
            style={{
              backgroundColor: "#4CAF50",
              color: "#fff",
              minWidth: 32,
              height: 32,
              borderRadius: 6,
            }}
            onClick={() => handleEditWithLoading(record)}
            title="Edit"
            loading={actionLoading[`edit_${record.id}`]}
          />
          <Button
            icon={<DeleteOutlined />}
            style={{
              backgroundColor: "#f44336",
              color: "#fff",
              minWidth: 32,
              height: 32,
              borderRadius: 6,
            }}
            onClick={() => handleDeleteWithLoading(record.id)}
            title="Delete"
            loading={actionLoading[`delete_${record.id}`]}
          />
        </Space>
      ),
      align: "right",
    },
  ];

  const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

  if (loading) {
    return (
      <Card className="rounded-lg shadow-sm">
        <div className="flex justify-center items-center py-10">
          <Spin indicator={antIcon} />
          <span className="ml-3 text-gray-500">Memuat data quiz...</span>
        </div>
      </Card>
    );
  }

  return (
    <div>
      {/* Header dengan icon dan tombol create */}
      <div
        style={{
          width: "100%",
          textAlign: "center",
          marginBottom: 24,
        }}
      >
        <AppstoreAddOutlined
          style={{
            fontSize: isMobile ? 24 : 32,
            color: "#11418b",
            marginBottom: isMobile ? 8 : 12,
          }}
        />
        <h3
          className="text-lg font-semibold text-gray-800 mb-1"
          style={{
            marginBottom: 4,
            fontSize: isMobile ? "16px" : "20px",
          }}
        >
          Quiz Management
        </h3>
        <p
          className="text-sm text-gray-600"
          style={{
            marginBottom: 16,
            fontSize: isMobile ? "12px" : "14px",
          }}
        >
          Kelola quiz dan lihat ranking kelompok
        </p>
        <div
          style={{
            display: "flex",
            gap: 12,
            flexDirection: isMobile ? "column" : "row",
            justifyContent: "center",
          }}
        >
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={onCreateQuiz}
            style={{
              height: 40,
              fontSize: 16,
              fontWeight: 600,
              borderRadius: 8,
              padding: "0 24px",
              minWidth: isMobile ? "100%" : 140,
            }}
          >
            Buat Quiz Baru
          </Button>
          <Button
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
            loading={refreshing}
            style={{
              height: 40,
              fontSize: 16,
              fontWeight: 600,
              borderRadius: 8,
              padding: "0 24px",
              minWidth: isMobile ? "100%" : 140,
            }}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* No data state */}
      {quizzesWithAssignedGroups.length === 0 ? (
        <Card className="rounded-lg shadow-sm">
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <div>
                <p style={{ fontSize: "16px", marginBottom: "8px" }}>
                  Belum ada quiz yang dibuat
                </p>
                <p style={{ fontSize: "14px", color: "#666" }}>
                  Buat quiz pertama Anda untuk memulai
                </p>
              </div>
            }
          >
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={onCreateQuiz}
            >
              Buat Quiz Pertama
            </Button>
          </Empty>
        </Card>
      ) : (
        /* Table */
        <Table
          dataSource={quizzesWithAssignedGroups.map((quiz, idx) => ({
            ...quiz,
            key: quiz.id,
            no: idx + 1,
          }))}
          loading={refreshing}
          columns={columns}
          pagination={{
            pageSize: 10,
            showSizeChanger: false,
            style: { textAlign: "center" },
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} dari ${total} quiz`,
          }}
          style={{ width: "100%" }}
          className="user-table-responsive"
          scroll={{ x: isMobile ? 600 : undefined }} // Tambahkan scroll horizontal untuk mobile
          size="middle"
        />
      )}

      {/* Quiz Ranking Modal */}
      {selectedQuizForRanking && (
        <QuizRankingModal
          open={!!selectedQuizForRanking}
          onClose={() => setSelectedQuizForRanking(null)}
          quiz={selectedQuizForRanking}
          materialId={materialId}
        />
      )}
    </div>
  );
};

export default QuizzesTab;
