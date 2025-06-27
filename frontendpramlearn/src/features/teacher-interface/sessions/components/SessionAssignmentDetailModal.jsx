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
  Divider,
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
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { TextArea } = Input;

const SessionAssignmentDetailModal = ({
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
}) => {
  const [activeTab, setActiveTab] = useState("submissions");
  const [editingGrade, setEditingGrade] = useState(null);
  const [gradeForm] = Form.useForm();

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
    if (grade >= 80) return "#52c41a";
    if (grade >= 70) return "#faad14";
    if (grade >= 60) return "#ff7a45";
    return "#ff4d4f";
  };

  const submissionColumns = [
    {
      title: "No",
      key: "no",
      render: (_, __, index) => index + 1,
      width: 50,
      align: "center",
    },
    {
      title: "Siswa",
      key: "student",
      render: (_, record) => (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Avatar size="small" icon={<UserOutlined />} />
          <div>
            <Text strong>{record.student.full_name}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 11 }}>
              {record.student.username}
            </Text>
          </div>
        </div>
      ),
      width: 150,
    },
    {
      title: "Waktu Submit",
      key: "submission_date",
      render: (_, record) => (
        <div>
          <div>{dayjs(record.submission_date).format("DD MMM YYYY")}</div>
          <Text type="secondary" style={{ fontSize: 11 }}>
            {dayjs(record.submission_date).format("HH:mm")}
          </Text>
          {record.is_late && (
            <Tag color="red" size="small" style={{ marginTop: 4 }}>
              Terlambat
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
            <Form form={gradeForm} layout="inline">
              <Form.Item
                name="grade"
                rules={[
                  { required: true, message: "Nilai wajib diisi" },
                  { type: "number", min: 0, max: 100, message: "Nilai 0-100" },
                ]}
                style={{ marginBottom: 0, width: 80 }}
              >
                <InputNumber
                  min={0}
                  max={100}
                  size="small"
                  placeholder="0-100"
                />
              </Form.Item>
              <Space size="small">
                <Button
                  type="primary"
                  size="small"
                  icon={<SaveOutlined />}
                  onClick={() => handleGradeSave(record.id)}
                  loading={isGrading}
                />
                <Button
                  size="small"
                  onClick={handleGradeCancel}
                  disabled={isGrading}
                >
                  Batal
                </Button>
              </Space>
            </Form>
          );
        }

        return (
          <div style={{ textAlign: "center" }}>
            {record.grade !== null ? (
              <div>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: getGradeColor(record.grade),
                  }}
                >
                  {record.grade}
                </div>
                <Button
                  type="link"
                  size="small"
                  icon={<EditOutlined />}
                  onClick={() => handleGradeEdit(record)}
                  style={{ padding: 0, height: "auto" }}
                >
                  Edit
                </Button>
              </div>
            ) : (
              <Button
                type="primary"
                size="small"
                icon={<EditOutlined />}
                onClick={() => handleGradeEdit(record)}
                loading={isGrading}
              >
                Beri Nilai
              </Button>
            )}
          </div>
        );
      },
      width: 120,
      align: "center",
    },
    {
      title: "Feedback",
      key: "feedback",
      render: (_, record) => {
        const isEditing = editingGrade === record.id;

        if (isEditing) {
          return (
            <Form.Item name="feedback" style={{ marginBottom: 0 }}>
              <TextArea
                rows={2}
                placeholder="Feedback untuk siswa (opsional)"
                style={{ fontSize: 12 }}
              />
            </Form.Item>
          );
        }

        return record.teacher_feedback ? (
          <Text style={{ fontSize: 12 }}>{record.teacher_feedback}</Text>
        ) : (
          <Text type="secondary" style={{ fontSize: 12 }}>
            Belum ada feedback
          </Text>
        );
      },
      ellipsis: true,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Button
          type="link"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => {
            // TODO: Implement view submission detail
            console.log("View submission detail:", record);
          }}
        >
          Detail
        </Button>
      ),
      width: 80,
    },
  ];

  const questionColumns = [
    {
      title: "No",
      key: "no",
      render: (_, __, index) => index + 1,
      width: 50,
      align: "center",
    },
    {
      title: "Pertanyaan",
      dataIndex: "text",
      key: "text",
      ellipsis: true,
    },
    {
      title: "Pilihan Jawaban",
      key: "choices",
      render: (_, record) => (
        <div>
          <div style={{ marginBottom: 2 }}>
            <Text style={{ fontSize: 12 }}>A. {record.choice_a}</Text>
          </div>
          <div style={{ marginBottom: 2 }}>
            <Text style={{ fontSize: 12 }}>B. {record.choice_b}</Text>
          </div>
          <div style={{ marginBottom: 2 }}>
            <Text style={{ fontSize: 12 }}>C. {record.choice_c}</Text>
          </div>
          <div style={{ marginBottom: 2 }}>
            <Text style={{ fontSize: 12 }}>D. {record.choice_d}</Text>
          </div>
        </div>
      ),
      width: 250,
    },
    {
      title: "Jawaban Benar",
      key: "correct_choice",
      render: (_, record) => (
        <Tag color="green" style={{ fontSize: 12, fontWeight: 600 }}>
          {record.correct_choice}
        </Tag>
      ),
      width: 100,
      align: "center",
    },
    {
      title: "Penjelasan",
      dataIndex: "explanation",
      key: "explanation",
      render: (explanation) => (
        <Text style={{ fontSize: 12 }}>
          {explanation || "Tidak ada penjelasan"}
        </Text>
      ),
      ellipsis: true,
    },
  ];

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

    return {
      totalSubmissions,
      gradedCount,
      pendingCount,
      lateSubmissions,
      averageGrade: Math.round(averageGrade * 10) / 10,
    };
  };

  const stats = getSubmissionStatistics();

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={1200}
      centered
      destroyOnClose
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <FileTextOutlined style={{ color: "#11418b", fontSize: 20 }} />
          <div>
            <span style={{ color: "#11418b", fontSize: 18, fontWeight: 600 }}>
              {assignment?.title}
            </span>
            <div style={{ fontSize: 12, color: "#666", fontWeight: 400 }}>
              Detail Assignment & Submissions
            </div>
          </div>
        </div>
      }
    >
      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <Spin size="large" />
          <p style={{ marginTop: 16, color: "#666" }}>
            Memuat detail assignment...
          </p>
        </div>
      ) : (
        <div style={{ maxHeight: "70vh", overflowY: "auto" }}>
          {/* Assignment Info */}
          <Card size="small" style={{ marginBottom: 16 }}>
            <Row gutter={16}>
              <Col span={12}>
                <Text strong>Deskripsi:</Text>
                <p style={{ marginTop: 4, marginBottom: 0 }}>
                  {assignmentDetail?.description || "Tidak ada deskripsi"}
                </p>
              </Col>
              <Col span={6}>
                <Text strong>Total Soal:</Text>
                <p style={{ marginTop: 4, marginBottom: 0 }}>
                  {assignmentDetail?.questions?.length || 0} pertanyaan
                </p>
              </Col>
              <Col span={6}>
                <Text strong>Deadline:</Text>
                <p style={{ marginTop: 4, marginBottom: 0 }}>
                  {assignmentDetail?.due_date
                    ? dayjs(assignmentDetail.due_date).format(
                        "DD MMM YYYY HH:mm"
                      )
                    : "Tanpa deadline"}
                </p>
              </Col>
            </Row>
          </Card>

          {/* Statistics */}
          <Card size="small" style={{ marginBottom: 16 }}>
            <Row gutter={16}>
              <Col xs={12} sm={6}>
                <Statistic
                  title="Total Submission"
                  value={stats.totalSubmissions}
                  prefix={<UserOutlined />}
                  valueStyle={{ color: "#11418b", fontSize: 16 }}
                />
              </Col>
              <Col xs={12} sm={6}>
                <Statistic
                  title="Sudah Dinilai"
                  value={stats.gradedCount}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: "#52c41a", fontSize: 16 }}
                />
              </Col>
              <Col xs={12} sm={6}>
                <Statistic
                  title="Pending"
                  value={stats.pendingCount}
                  prefix={<ClockCircleOutlined />}
                  valueStyle={{ color: "#faad14", fontSize: 16 }}
                />
              </Col>
              <Col xs={12} sm={6}>
                <Statistic
                  title="Rata-rata Nilai"
                  value={stats.averageGrade}
                  precision={1}
                  prefix={<TrophyOutlined />}
                  valueStyle={{ color: "#1890ff", fontSize: 16 }}
                />
              </Col>
            </Row>
          </Card>

          {/* Tabs Content */}
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={[
              {
                key: "submissions",
                label: `Submissions (${submissions.length})`,
                children: (
                  <Card size="small">
                    {submissionsLoading ? (
                      <div style={{ textAlign: "center", padding: "40px 0" }}>
                        <Spin />
                        <p style={{ marginTop: 16 }}>
                          Memuat data submissions...
                        </p>
                      </div>
                    ) : (
                      <Table
                        dataSource={submissions.map((submission, idx) => ({
                          ...submission,
                          key: submission.id,
                          no: idx + 1,
                        }))}
                        columns={submissionColumns}
                        pagination={{
                          pageSize: 8,
                          showSizeChanger: false,
                          showTotal: (total, range) =>
                            `${range[0]}-${range[1]} dari ${total} submission`,
                        }}
                        size="small"
                        scroll={{ x: 800 }}
                      />
                    )}
                  </Card>
                ),
              },
              {
                key: "questions",
                label: `Soal (${questions.length})`,
                children: (
                  <Card size="small">
                    <Table
                      dataSource={questions.map((question, idx) => ({
                        ...question,
                        key: question.id,
                        no: idx + 1,
                      }))}
                      columns={questionColumns}
                      pagination={{
                        pageSize: 5,
                        showSizeChanger: false,
                        showTotal: (total, range) =>
                          `${range[0]}-${range[1]} dari ${total} soal`,
                      }}
                      size="small"
                      scroll={{ x: 800 }}
                    />
                  </Card>
                ),
              },
            ]}
          />
        </div>
      )}
    </Modal>
  );
};

export default SessionAssignmentDetailModal;
