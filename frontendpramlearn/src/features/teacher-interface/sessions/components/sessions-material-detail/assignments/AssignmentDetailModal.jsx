import React, { useState } from "react";
import {
  Modal,
  Table,
  Typography,
  Space,
  Button,
  Tag,
  Tabs,
  Card,
  Row,
  Col,
  Statistic,
  Input,
  Form,
  InputNumber,
  Spin,
  Avatar,
  Tooltip,
  Progress,
  Empty,
} from "antd";
import {
  FileTextOutlined,
  UserOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EditOutlined,
  SaveOutlined,
  EyeOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
  StarOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import SubmissionDetailModal from "./SubmissionDetailModal";

const { Title, Text } = Typography;
const { TextArea } = Input;

const AssignmentDetailModal = ({
  open,
  onClose,
  assignment,
  assignmentDetail,
  submissions,
  questions,
  students,
  loading,
  submissionsLoading,
  gradingLoading,
  onGradeSubmission,
  isMobile = false,
}) => {
  const [activeTab, setActiveTab] = useState("submissions");
  const [editingGrade, setEditingGrade] = useState(null);
  const [gradeForm] = Form.useForm();
  const [submissionDetailModalVisible, setSubmissionDetailModalVisible] =
    useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  const handleViewSubmissionDetail = (submission) => {
    setSelectedSubmission(submission);
    setSubmissionDetailModalVisible(true);
  };

  const handleCloseSubmissionDetail = () => {
    setSubmissionDetailModalVisible(false);
    setSelectedSubmission(null);
  };

  const handleGradeEdit = (submission) => {
    setEditingGrade(submission.id);
    gradeForm.setFieldsValue({
      grade: submission.grade,
      feedback: submission.teacher_feedback || "",
    });
  };

  const handleGradeSave = async (submissionId) => {
    try {
      const values = await gradeForm.validateFields();
      const success = await onGradeSubmission(
        assignmentDetail?.id,
        submissionId,
        values.grade,
        values.feedback
      );

      if (success) {
        setEditingGrade(null);
        gradeForm.resetFields();
      }
    } catch (error) {
      console.error("Grade validation error:", error);
    }
  };

  const handleGradeCancel = () => {
    setEditingGrade(null);
    gradeForm.resetFields();
  };

  const getGradeColor = (grade) => {
    if (grade >= 85) return "#52c41a";
    if (grade >= 70) return "#faad14";
    if (grade >= 60) return "#ff7a45";
    return "#ff4d4f";
  };

  const getSubmissionStatistics = () => {
    const totalSubmissions = submissions.length;
    const gradedCount = submissions.filter((s) => s.grade !== null).length;
    const pendingCount = submissions.filter((s) => s.grade === null).length;
    const lateSubmissions = submissions.filter((s) => s.is_late).length;

    const averageGrade =
      gradedCount > 0
        ? submissions
            .filter((s) => s.grade !== null)
            .reduce((sum, s) => sum + s.grade, 0) / gradedCount
        : 0;

    const excellentCount = submissions.filter((s) => s.grade >= 85).length;

    return {
      totalSubmissions,
      gradedCount,
      pendingCount,
      lateSubmissions,
      excellentCount,
      averageGrade: Math.round(averageGrade * 10) / 10,
    };
  };

  const stats = getSubmissionStatistics();

  const submissionColumns = [
    {
      title: "#",
      key: "index",
      render: (_, __, index) => (
        <div
          style={{
            width: 24,
            height: 24,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 10,
            fontWeight: 600,
          }}
        >
          {index + 1}
        </div>
      ),
      width: 40,
      align: "center",
    },
    {
      title: "Siswa",
      key: "student",
      render: (_, record) => (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Avatar
            size={isMobile ? "small" : "default"}
            icon={<UserOutlined />}
            style={{
              background: "linear-gradient(135deg, #52c41a 0%, #73d13d 100%)",
              border: "2px solid white",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          />
          <div>
            <Text strong style={{ fontSize: isMobile ? 12 : 14 }}>
              {record.student?.full_name || record.student?.username}
            </Text>
            <br />
            <Text type="secondary" style={{ fontSize: 11 }}>
              {record.student?.username}
            </Text>
          </div>
        </div>
      ),
      width: isMobile ? 120 : 150,
    },
    {
      title: "Waktu Submit",
      key: "submission_date",
      render: (_, record) => (
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              marginBottom: 2,
            }}
          >
            <ClockCircleOutlined style={{ color: "#1890ff", fontSize: 10 }} />
            <Text style={{ fontSize: 12, fontWeight: 600 }}>
              {dayjs(record.submission_date).format("DD MMM YYYY")}
            </Text>
          </div>
          <Text type="secondary" style={{ fontSize: 10 }}>
            {dayjs(record.submission_date).format("HH:mm")}
          </Text>
          {record.is_late && (
            <Tag
              color="red"
              size="small"
              style={{
                marginTop: 4,
                fontSize: 9,
                borderRadius: 8,
              }}
            >
              ⚠️ Terlambat
            </Tag>
          )}
        </div>
      ),
      width: 120,
    },
    {
      title: "Nilai",
      key: "grade",
      render: (_, record) => {
        const isEditing = editingGrade === record.id;
        const isGrading =
          gradingLoading[`${assignmentDetail?.id}_${record.id}`];

        if (isEditing) {
          return (
            <Form form={gradeForm} layout="vertical">
              <Form.Item
                name="grade"
                rules={[
                  { required: true, message: "Nilai wajib diisi" },
                  { type: "number", min: 0, max: 100, message: "Nilai 0-100" },
                ]}
                style={{ marginBottom: 8 }}
              >
                <InputNumber
                  min={0}
                  max={100}
                  size="small"
                  placeholder="0-100"
                  style={{ width: "100%", borderRadius: 6 }}
                />
              </Form.Item>
              <Form.Item name="feedback" style={{ marginBottom: 12 }}>
                <TextArea
                  size="small"
                  rows={2}
                  placeholder="Feedback untuk siswa..."
                  style={{ borderRadius: 6 }}
                />
              </Form.Item>
              <Space size="small">
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  size="small"
                  onClick={() => handleGradeSave(record.id)}
                  loading={isGrading}
                  style={{
                    borderRadius: 6,
                    background:
                      "linear-gradient(135deg, #52c41a 0%, #73d13d 100%)",
                    border: "none",
                  }}
                >
                  Simpan
                </Button>
                <Button
                  size="small"
                  onClick={handleGradeCancel}
                  style={{ borderRadius: 6 }}
                >
                  Batal
                </Button>
              </Space>
            </Form>
          );
        }

        return (
          <div style={{ minWidth: 100 }}>
            {record.grade !== null ? (
              <div>
                <div
                  style={{
                    background: `linear-gradient(135deg, ${getGradeColor(
                      record.grade
                    )} 0%, ${getGradeColor(record.grade)}dd 100%)`,
                    borderRadius: 12,
                    padding: "8px 12px",
                    color: "white",
                    textAlign: "center",
                    marginBottom: 4,
                  }}
                >
                  <Text strong style={{ color: "white", fontSize: 16 }}>
                    {record.grade}
                  </Text>
                </div>
                <div style={{ textAlign: "center" }}>
                  <Button
                    type="text"
                    icon={<EditOutlined />}
                    size="small"
                    onClick={() => handleGradeEdit(record)}
                    style={{
                      color: "#667eea",
                      padding: "2px 6px",
                      height: "auto",
                      borderRadius: 6,
                    }}
                  >
                    Edit
                  </Button>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: "center" }}>
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  size="small"
                  onClick={() => handleGradeEdit(record)}
                  loading={isGrading}
                  style={{
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    border: "none",
                    borderRadius: 8,
                    fontWeight: 600,
                  }}
                >
                  Beri Nilai
                </Button>
              </div>
            )}
          </div>
        );
      },
      width: 120,
      align: "center",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Tooltip title="Lihat Detail Jawaban">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleViewSubmissionDetail(record)}
            style={{
              color: "#1890ff",
              borderRadius: 6,
            }}
          />
        </Tooltip>
      ),
      width: 60,
      align: "center",
    },
  ];

  const questionColumns = [
    {
      title: "#",
      key: "index",
      render: (_, __, index) => (
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          {index + 1}
        </div>
      ),
      width: 50,
      align: "center",
    },
    {
      title: "Pertanyaan",
      key: "question",
      render: (_, record) => (
        <div>
          <Text
            strong
            style={{ display: "block", marginBottom: 8, fontSize: 14 }}
          >
            {record.text}
          </Text>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 4,
              marginBottom: 8,
            }}
          >
            {["A", "B", "C", "D"].map((choice) => {
              const isCorrect = choice === record.correct_choice;
              const choiceText = record[`choice_${choice.toLowerCase()}`];

              return (
                <div
                  key={choice}
                  style={{
                    border: `2px solid ${isCorrect ? "#52c41a" : "#f0f0f0"}`,
                    borderRadius: 8,
                    padding: "4px 8px",
                    background: isCorrect ? "#f6ffed" : "#fafafa",
                    minWidth: "45%",
                    margin: "2px 0",
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 4 }}
                  >
                    <div
                      style={{
                        background: isCorrect ? "#52c41a" : "#d9d9d9",
                        color: "white",
                        borderRadius: "50%",
                        width: 18,
                        height: 18,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 11,
                        fontWeight: "bold",
                        flexShrink: 0,
                      }}
                    >
                      {choice}
                    </div>
                    <Text style={{ fontSize: 12, flex: 1 }}>{choiceText}</Text>
                    {isCorrect && (
                      <CheckCircleOutlined
                        style={{ color: "#52c41a", fontSize: 12 }}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {record.explanation && (
            <div
              style={{
                background: "#fff7e6",
                border: "1px solid #ffd591",
                borderRadius: 8,
                padding: "8px 12px",
                marginTop: 8,
              }}
            >
              <Text style={{ fontSize: 12, color: "#d46b08" }}>
                💡 <strong>Penjelasan:</strong> {record.explanation}
              </Text>
            </div>
          )}
        </div>
      ),
    },
  ];

  const renderStatisticsCards = () => (
    <Row gutter={[12, 12]} style={{ marginBottom: 24 }}>
      <Col xs={12} sm={6}>
        <Card size="small" style={{ textAlign: "center", borderRadius: 12 }}>
          <Statistic
            title="Total Submission"
            value={stats.totalSubmissions}
            prefix={<FileTextOutlined style={{ color: "#667eea" }} />}
            valueStyle={{ color: "#667eea", fontSize: isMobile ? 16 : 20 }}
            titleStyle={{ fontSize: isMobile ? 10 : 12 }}
          />
        </Card>
      </Col>
      <Col xs={12} sm={6}>
        <Card size="small" style={{ textAlign: "center", borderRadius: 12 }}>
          <Statistic
            title="Sudah Dinilai"
            value={stats.gradedCount}
            prefix={<CheckCircleOutlined style={{ color: "#52c41a" }} />}
            valueStyle={{ color: "#52c41a", fontSize: isMobile ? 16 : 20 }}
            titleStyle={{ fontSize: isMobile ? 10 : 12 }}
          />
        </Card>
      </Col>
      <Col xs={12} sm={6}>
        <Card size="small" style={{ textAlign: "center", borderRadius: 12 }}>
          <Statistic
            title="Menunggu"
            value={stats.pendingCount}
            prefix={<ClockCircleOutlined style={{ color: "#faad14" }} />}
            valueStyle={{ color: "#faad14", fontSize: isMobile ? 16 : 20 }}
            titleStyle={{ fontSize: isMobile ? 10 : 12 }}
          />
        </Card>
      </Col>
      <Col xs={12} sm={6}>
        <Card size="small" style={{ textAlign: "center", borderRadius: 12 }}>
          <Statistic
            title="Rata-rata"
            value={stats.averageGrade}
            prefix={<TrophyOutlined style={{ color: "#722ed1" }} />}
            valueStyle={{ color: "#722ed1", fontSize: isMobile ? 16 : 20 }}
            titleStyle={{ fontSize: isMobile ? 10 : 12 }}
          />
        </Card>
      </Col>
    </Row>
  );

  const tabItems = [
    {
      key: "submissions",
      label: (
        <span>
          <UserOutlined />
          Submissions ({submissions.length})
        </span>
      ),
      children: (
        <div>
          {renderStatisticsCards()}

          {submissionsLoading ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <Spin size="large" />
              <p style={{ marginTop: 16, color: "#666" }}>
                Memuat data submissions...
              </p>
            </div>
          ) : submissions.length > 0 ? (
            <Card
              style={{
                borderRadius: 16,
                border: "none",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              }}
              bodyStyle={{ padding: 0 }}
            >
              <Table
                columns={submissionColumns}
                dataSource={submissions.map((submission) => ({
                  ...submission,
                  key: submission.id,
                }))}
                pagination={{
                  pageSize: isMobile ? 5 : 10,
                  showSizeChanger: !isMobile,
                  showTotal: (total, range) =>
                    `${range[0]}-${range[1]} dari ${total} submissions`,
                }}
                scroll={{ x: isMobile ? 600 : undefined }}
                size={isMobile ? "small" : "middle"}
              />
            </Card>
          ) : (
            <Card
              style={{
                borderRadius: 16,
                border: "2px dashed #d9d9d9",
                textAlign: "center",
                padding: "40px 20px",
              }}
            >
              <Empty
                description="Belum ada submission yang masuk"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            </Card>
          )}
        </div>
      ),
    },
    {
      key: "questions",
      label: (
        <span>
          <FileTextOutlined />
          Soal ({questions.length})
        </span>
      ),
      children: (
        <div>
          {questions.length > 0 ? (
            <Card
              style={{
                borderRadius: 16,
                border: "none",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              }}
              bodyStyle={{ padding: 0 }}
            >
              <Table
                columns={questionColumns}
                dataSource={questions.map((question, index) => ({
                  ...question,
                  key: question.id || index,
                }))}
                pagination={false}
                scroll={{ x: isMobile ? 500 : undefined }}
                size={isMobile ? "small" : "middle"}
              />
            </Card>
          ) : (
            <Card
              style={{
                borderRadius: 16,
                border: "2px dashed #d9d9d9",
                textAlign: "center",
                padding: "40px 20px",
              }}
            >
              <Empty
                description="Tidak ada soal ditemukan"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            </Card>
          )}
        </div>
      ),
    },
  ];

  if (!assignment) return null;

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={isMobile ? "95%" : "90%"}
      style={{ maxWidth: 1200 }}
      centered
      destroyOnClose
      title={
        <div
          style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            margin: "-24px -24px 0",
            padding: "20px 24px",
            borderRadius: "8px 8px 0 0",
            color: "white",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
            }}
          >
            <div>
              <Title level={4} style={{ margin: 0, color: "white" }}>
                📝 {assignment.title}
              </Title>
              <Text style={{ color: "rgba(255,255,255,0.9)", fontSize: 14 }}>
                Assignment Detail & Grading
              </Text>
            </div>
          </div>
        </div>
      }
    >
      <div style={{ padding: "20px 0" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <Spin size="large" />
            <p style={{ marginTop: 16, color: "#666" }}>
              Memuat detail assignment...
            </p>
          </div>
        ) : (
          <>
            {/* Assignment Info */}
            <Card
              style={{
                marginBottom: 24,
                borderRadius: 16,
                background: "linear-gradient(135deg, #f8faff 0%, #e6f3ff 100%)",
                border: "1px solid #e6f7ff",
              }}
            >
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <div>
                    <Text strong style={{ color: "#667eea", fontSize: 12 }}>
                      DESKRIPSI ASSIGNMENT
                    </Text>
                    <div style={{ marginTop: 8 }}>
                      <Text style={{ fontSize: 14, lineHeight: 1.6 }}>
                        {assignmentDetail?.description ||
                          assignment.description}
                      </Text>
                    </div>
                  </div>
                </Col>
                <Col xs={24} sm={12}>
                  <div>
                    <Text strong style={{ color: "#667eea", fontSize: 12 }}>
                      DEADLINE
                    </Text>
                    <div style={{ marginTop: 8 }}>
                      {assignment.due_date ? (
                        <div>
                          <Text style={{ fontSize: 14, fontWeight: 600 }}>
                            📅{" "}
                            {dayjs(assignment.due_date).format("DD MMMM YYYY")}
                          </Text>
                          <br />
                          <Text style={{ fontSize: 12, color: "#666" }}>
                            🕒 {dayjs(assignment.due_date).format("HH:mm")} WIB
                          </Text>
                        </div>
                      ) : (
                        <Tag color="blue" style={{ borderRadius: 12 }}>
                          Tanpa Deadline
                        </Tag>
                      )}
                    </div>
                  </div>
                </Col>
              </Row>
            </Card>

            {/* Tabs */}
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              items={tabItems}
              style={{
                background: "white",
                borderRadius: 16,
                padding: "0 24px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              }}
            />
          </>
        )}
      </div>

      {/* Submission Detail Modal */}
      <SubmissionDetailModal
        open={submissionDetailModalVisible}
        onClose={handleCloseSubmissionDetail}
        submission={selectedSubmission}
        questions={questions}
        isMobile={isMobile}
      />
    </Modal>
  );
};

export default AssignmentDetailModal;
