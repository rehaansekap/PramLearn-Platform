import React, { useState } from "react";
import {
  Table,
  Tag,
  Button,
  Space,
  Typography,
  Tooltip,
  Progress,
  Card,
  Empty,
  Spin,
  List,
  Row,
  Col,
  Statistic,
} from "antd";
import {
  EyeOutlined,
  TrophyOutlined,
  BookOutlined,
  FileTextOutlined,
  CalendarOutlined,
  StarOutlined,
  StarFilled,
  SearchOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import QuizResultsDetail from "./QuizResultsDetail";
import AssignmentFeedback from "./AssignmentFeedback";

const { Text } = Typography;

const GradeTable = ({
  grades,
  loading,
  onViewDetail,
  getGradeColor,
  getGradeLetter,
  pagination = true,
}) => {
  const [sortedInfo, setSortedInfo] = useState({});
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState(null);

  const handleViewDetail = (record) => {
    console.log("IsGroupQuiz:", record.is_group_quiz); // Debug log
    console.log("Viewing detail for:", record); // Debug log
    setSelectedGrade(record);
    setDetailModalVisible(true);
  };

  // Handler untuk menutup modal
  const handleCloseDetail = () => {
    setDetailModalVisible(false);
    setSelectedGrade(null);
  };

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleTableChange = (pagination, filters, sorter) => {
    setSortedInfo(sorter);
  };

  // Get performance indicator
  const getPerformanceIndicator = (grade) => {
    if (grade >= 90)
      return { icon: <StarFilled />, color: "#gold", text: "Sangat Baik" };
    if (grade >= 80)
      return { icon: <StarOutlined />, color: "#52c41a", text: "Baik" };
    if (grade >= 70)
      return { icon: <TrophyOutlined />, color: "#faad14", text: "Cukup" };
    return { icon: null, color: "#ff4d4f", text: "Perlu Ditingkatkan" };
  };

  // Calculate summary stats
  const averageGrade =
    grades.length > 0
      ? grades.reduce((sum, g) => sum + (g.grade || 0), 0) / grades.length
      : 0;

  const gradeDistribution = {
    excellent: grades.filter((g) => g.grade >= 90).length,
    good: grades.filter((g) => g.grade >= 80 && g.grade < 90).length,
    fair: grades.filter((g) => g.grade >= 60 && g.grade < 80).length,
    poor: grades.filter((g) => g.grade < 60).length,
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "60px 0" }}>
        <Spin size="large" tip="Memuat data nilai..." />
      </div>
    );
  }

  if (!grades || grades.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "60px 24px" }}>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <div>
              <Text style={{ fontSize: 16, color: "#666" }}>
                Belum ada data nilai
              </Text>
              <div style={{ marginTop: 12 }}>
                <Text type="secondary" style={{ fontSize: 14 }}>
                  Nilai akan muncul setelah quiz atau assignment dinilai
                </Text>
              </div>
            </div>
          }
        />
      </div>
    );
  }

  // Mobile Card View
  if (isMobile) {
    return (
      <div>
        {/* Summary Stats - Mobile */}
        <Card style={{ marginBottom: 16, borderRadius: 12 }}>
          <Row gutter={[8, 8]}>
            <Col span={12}>
              <div style={{ textAlign: "center" }}>
                <div
                  style={{ fontSize: 18, fontWeight: "bold", color: "#11418b" }}
                >
                  {averageGrade.toFixed(1)}
                </div>
                <div style={{ fontSize: 12, color: "#666" }}>Rata-rata</div>
              </div>
            </Col>
            <Col span={12}>
              <div style={{ textAlign: "center" }}>
                <div
                  style={{ fontSize: 18, fontWeight: "bold", color: "#52c41a" }}
                >
                  {grades.length}
                </div>
                <div style={{ fontSize: 12, color: "#666" }}>Total Nilai</div>
              </div>
            </Col>
          </Row>
        </Card>

        {/* Grade Cards */}
        <List
          grid={{ gutter: 16, xs: 1, sm: 1 }}
          dataSource={grades}
          renderItem={(grade, index) => {
            const performance = getPerformanceIndicator(grade.grade);
            return (
              <List.Item>
                <Card
                  style={{
                    borderRadius: 12,
                    boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                    overflow: "hidden",
                    border: "1px solid #e8e8e8",
                    transition: "all 0.3s ease",
                  }}
                  bodyStyle={{ padding: 0 }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow =
                      "0 8px 24px rgba(0,0,0,0.12)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow =
                      "0 4px 16px rgba(0,0,0,0.08)";
                  }}
                >
                  {/* Header */}
                  <div
                    style={{
                      background: getGradeColor(grade.grade),
                      padding: "16px 20px",
                      color: "white",
                      position: "relative",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <Text strong style={{ color: "white", fontSize: 16 }}>
                          {grade.title}
                        </Text>
                        <div style={{ marginTop: 4 }}>
                          <Tag
                            icon={
                              grade.type === "quiz" ? (
                                <BookOutlined />
                              ) : (
                                <FileTextOutlined />
                              )
                            }
                            color="rgba(255,255,255,0.2)"
                            style={{ color: "white", fontSize: 11 }}
                          >
                            {grade.type === "quiz" ? "Quiz" : "Assignment"}
                          </Tag>
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 24, fontWeight: "bold" }}>
                          {grade.grade?.toFixed(1)}
                        </div>
                        <div style={{ fontSize: 14, fontWeight: "bold" }}>
                          {getGradeLetter(grade.grade)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div style={{ padding: "16px 20px" }}>
                    <Space direction="vertical" style={{ width: "100%" }}>
                      {/* Subject & Date */}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Tag color="purple" style={{ margin: 0 }}>
                          {grade.subject_name}
                        </Tag>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {dayjs(grade.date).format("DD MMM YYYY")}
                        </Text>
                      </div>

                      {/* Performance Indicator */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        {performance.icon && (
                          <span style={{ color: performance.color }}>
                            {performance.icon}
                          </span>
                        )}
                        <Text
                          style={{
                            fontSize: 13,
                            color: performance.color,
                            fontWeight: 500,
                          }}
                        >
                          {performance.text}
                        </Text>
                      </div>

                      {/* Progress Bar */}
                      <Progress
                        percent={grade.grade}
                        size="small"
                        showInfo={false}
                        strokeColor={getGradeColor(grade.grade)}
                      />

                      {/* Feedback */}
                      {grade.teacher_feedback && (
                        <div
                          style={{
                            background: "#f6faff",
                            padding: "8px 12px",
                            borderRadius: 6,
                            borderLeft: "3px solid #1677ff",
                          }}
                        >
                          <Text style={{ fontSize: 12, color: "#666" }}>
                            Feedback: {grade.teacher_feedback.substring(0, 50)}
                            {grade.teacher_feedback.length > 50 && "..."}
                          </Text>
                        </div>
                      )}

                      {/* Action Button */}
                      <Button
                        type="primary"
                        icon={<EyeOutlined />}
                        onClick={() => {
                          console.log(
                            "Mobile button clicked for grade:",
                            grade
                          ); // Debug log
                          if (onViewDetail) {
                            onViewDetail(grade);
                          } else {
                            handleViewDetail(grade);
                          }
                        }}
                        style={{
                          width: "100%",
                          borderRadius: 8,
                          fontWeight: 500,
                        }}
                      >
                        Lihat Detail
                      </Button>
                    </Space>
                  </div>
                </Card>
              </List.Item>
            );
          }}
          pagination={
            pagination
              ? {
                  pageSize: 5,
                  showSizeChanger: false,
                  showQuickJumper: false,
                  showTotal: (total, range) =>
                    `${range[0]}-${range[1]} dari ${total} nilai`,
                  size: "small",
                }
              : false
          }
        />
      </div>
    );
  }

  // Desktop Table View
  const columns = [
    {
      title: "No",
      key: "no",
      render: (_, __, index) => index + 1,
      width: 60,
      align: "center",
    },
    {
      title: "Jenis",
      dataIndex: "type",
      key: "type",
      render: (type) => (
        <Tag
          icon={type === "quiz" ? <BookOutlined /> : <FileTextOutlined />}
          color={type === "quiz" ? "blue" : "green"}
        >
          {type === "quiz" ? "Quiz" : "Assignment"}
        </Tag>
      ),
      width: 100,
      filters: [
        { text: "Quiz", value: "quiz" },
        { text: "Assignment", value: "assignment" },
      ],
      onFilter: (value, record) => record.type === value,
    },
    {
      title: "Judul Assessment",
      dataIndex: "title",
      key: "title",
      render: (title, record) => (
        <div>
          <Text strong style={{ color: "#11418b" }}>
            {title}
          </Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.material_title || record.subject_name}
          </Text>
        </div>
      ),
      ellipsis: true,
      sorter: (a, b) => a.title.localeCompare(b.title),
      sortOrder: sortedInfo.columnKey === "title" && sortedInfo.order,
    },
    {
      title: "Mata Pelajaran",
      dataIndex: "subject_name",
      key: "subject_name",
      render: (subject) => (
        <Tag color="purple" style={{ fontWeight: 500 }}>
          {subject}
        </Tag>
      ),
      ellipsis: true,
      filters: [...new Set(grades.map((g) => g.subject_name))].map(
        (subject) => ({
          text: subject,
          value: subject,
        })
      ),
      onFilter: (value, record) => record.subject_name === value,
    },
    {
      title: "Nilai",
      dataIndex: "grade",
      key: "grade",
      render: (grade) => {
        const performance = getPerformanceIndicator(grade);
        return (
          <Space direction="vertical" size="small" style={{ width: "100%" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Tag
                color={getGradeColor(grade)}
                style={{
                  minWidth: 50,
                  textAlign: "center",
                  fontSize: 14,
                  fontWeight: "bold",
                }}
              >
                {grade?.toFixed(1)}
              </Tag>
              <Tag
                color={getGradeColor(grade)}
                style={{ fontWeight: "bold", fontSize: 16 }}
              >
                {getGradeLetter(grade)}
              </Tag>
              {performance.icon && (
                <span style={{ color: performance.color }}>
                  {performance.icon}
                </span>
              )}
            </div>
            <Progress
              percent={grade}
              size="small"
              showInfo={false}
              strokeColor={getGradeColor(grade)}
              style={{ width: "100%" }}
            />
            <Text
              type="secondary"
              style={{ fontSize: 11, textAlign: "center" }}
            >
              {performance.text}
            </Text>
          </Space>
        );
      },
      width: 140,
      sorter: (a, b) => (a.grade || 0) - (b.grade || 0),
      sortOrder: sortedInfo.columnKey === "grade" && sortedInfo.order,
      align: "center",
    },
    {
      title: "Tanggal",
      dataIndex: "date",
      key: "date",
      render: (date) => (
        <Space direction="vertical" size="small">
          <Text style={{ fontWeight: 500 }}>
            {dayjs(date).format("DD MMM YYYY")}
          </Text>
          <Text type="secondary" style={{ fontSize: 11 }}>
            {dayjs(date).format("HH:mm")}
          </Text>
        </Space>
      ),
      width: 120,
      sorter: (a, b) => dayjs(a.date).unix() - dayjs(b.date).unix(),
      sortOrder: sortedInfo.columnKey === "date" && sortedInfo.order,
    },
    {
      title: "Aksi",
      key: "action",
      render: (_, record) => (
        <Tooltip title="Lihat detail hasil">
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => {
              //console log isgroup quiz status
              console.log("IsGroupQuiz:", record.is_group_quiz); // Debug log
              console.log("Button clicked for record:", record); // Debug log
              if (onViewDetail) {
                onViewDetail(record);
              } else {
                handleViewDetail(record);
              }
            }}
            style={{
              borderRadius: 6,
              fontWeight: 500,
            }}
          >
            Detail
          </Button>
        </Tooltip>
      ),
      width: 80,
      align: "center",
    },
  ];

  return (
    <div>
      {/* Summary Stats - Desktop */}
      <Card style={{ marginBottom: 16, borderRadius: 12 }}>
        <Row gutter={16}>
          <Col span={6}>
            <Statistic
              title="Rata-rata Nilai"
              value={averageGrade.toFixed(1)}
              valueStyle={{ color: "#11418b" }}
            />
          </Col>
          <Col span={6}>
            <div style={{ textAlign: "center" }}>
              <Tag color="gold">Sangat Baik: {gradeDistribution.excellent}</Tag>
            </div>
          </Col>
          <Col span={6}>
            <div style={{ textAlign: "center" }}>
              <Tag color="green">Baik: {gradeDistribution.good}</Tag>
            </div>
          </Col>
          <Col span={6}>
            <div style={{ textAlign: "center" }}>
              <Tag color="orange">Cukup: {gradeDistribution.fair}</Tag>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Table */}
      <Card style={{ borderRadius: 12 }}>
        <Table
          columns={columns}
          dataSource={grades.map((grade, index) => ({
            ...grade,
            key: grade.id || index,
            is_group_quiz:
              typeof grade.is_group_quiz !== "undefined"
                ? grade.is_group_quiz
                : !!grade.group_data,
          }))}
          onChange={handleTableChange}
          pagination={
            pagination
              ? {
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) =>
                    `${range[0]}-${range[1]} dari ${total} nilai`,
                  size: "small",
                }
              : false
          }
          scroll={{ x: 1000 }}
          size="middle"
        />
      </Card>
      {/* Modal Components */}
      {selectedGrade && selectedGrade.type === "assignment" && (
        <AssignmentFeedback
          visible={detailModalVisible}
          onClose={handleCloseDetail}
          gradeId={selectedGrade.id} // Ubah nama prop untuk lebih jelas
          assignmentTitle={selectedGrade.title}
        />
      )}
      {selectedGrade && selectedGrade.type === "quiz" && (
        <QuizResultsDetail
          visible={detailModalVisible}
          onClose={handleCloseDetail}
          attemptId={selectedGrade.attempt_id || selectedGrade.id}
          quizTitle={selectedGrade.title}
          isGroupQuiz={selectedGrade.is_group_quiz || selectedGrade.group_data} // PERBAIKAN: Deteksi group quiz
          groupData={selectedGrade?.group_data || null}
        />
      )}
    </div>
  );
};

export default GradeTable;
