import React, { useState } from "react";
import {
  Card,
  Tabs,
  Space,
  Typography,
  Button,
  Row,
  Col,
  Table,
  Tag,
  Tooltip,
  Select,
  DatePicker,
  Input,
  Modal,
  Spin,
  Empty,
  Alert,
} from "antd";
import {
  TrophyOutlined,
  BarChartOutlined,
  FileTextOutlined,
  SearchOutlined,
  DownloadOutlined,
  EyeOutlined,
  FilterOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import StudentGradeOverview from "./components/StudentGradeOverview";
import QuizResultsDetail from "./components/QuizResultsDetail";
import AssignmentFeedback from "./components/AssignmentFeedback";
import GradeChart from "./components/GradeChart";
import useStudentGrades from "./hooks/useStudentGrades";
import dayjs from "dayjs";

const { Title } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { RangePicker } = DatePicker;

const StudentGrades = () => {
  const {
    grades,
    subjects,
    analytics,
    filters,
    loading,
    analyticsLoading,
    error,
    gpa,
    gradeStats,
    recentGrades,
    performanceTrend,
    fetchGrades,
    updateFilters,
    clearFilters,
    getSubjectGPA,
    getGradePoint,
    getGradeLetter,
  } = useStudentGrades();

  // UI State
  const [activeTab, setActiveTab] = useState("overview");
  const [searchText, setSearchText] = useState("");
  const [showQuizDetail, setShowQuizDetail] = useState(false);
  const [showAssignmentFeedback, setShowAssignmentFeedback] = useState(false);
  const [selectedQuizAttempt, setSelectedQuizAttempt] = useState(null);
  const [selectedAssignmentSubmission, setSelectedAssignmentSubmission] =
    useState(null);

  // Filter grades based on search and filters
  const filteredGrades = grades.filter((grade) => {
    const matchesSearch =
      !searchText ||
      grade.title.toLowerCase().includes(searchText.toLowerCase()) ||
      grade.subject_name.toLowerCase().includes(searchText.toLowerCase());

    return matchesSearch;
  });

  // Group grades for table display
  const tableData = filteredGrades.map((grade) => ({
    key: grade.id,
    ...grade,
    grade_letter: getGradeLetter(grade.score),
    grade_point: getGradePoint(grade.score),
  }));

  // Table columns
  const tableColumns = [
    {
      title: "Assessment",
      dataIndex: "title",
      key: "title",
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{text}</div>
          <div style={{ fontSize: 12, color: "#666" }}>
            {record.subject_name}
          </div>
        </div>
      ),
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      render: (type) => (
        <Tag color={type === "quiz" ? "blue" : "green"}>
          {type === "quiz" ? "Quiz" : "Assignment"}
        </Tag>
      ),
    },
    {
      title: "Score",
      dataIndex: "score",
      key: "score",
      render: (score, record) => (
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: 16,
              fontWeight: "bold",
              color:
                score >= 80 ? "#52c41a" : score >= 60 ? "#faad14" : "#ff4d4f",
            }}
          >
            {score.toFixed(1)}
          </div>
          <Tag
            color={score >= 80 ? "success" : score >= 60 ? "warning" : "error"}
            size="small"
          >
            {record.grade_letter}
          </Tag>
        </div>
      ),
      sorter: (a, b) => a.score - b.score,
    },
    {
      title: "GPA Points",
      dataIndex: "grade_point",
      key: "grade_point",
      render: (points) => (
        <div style={{ textAlign: "center", fontWeight: 500 }}>
          {points.toFixed(1)}
        </div>
      ),
      sorter: (a, b) => a.grade_point - b.grade_point,
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (date) => dayjs(date).format("DD MMM YYYY"),
      sorter: (a, b) => dayjs(a.date).unix() - dayjs(b.date).unix(),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() => {
                if (record.type === "quiz") {
                  setSelectedQuizAttempt(record);
                  setShowQuizDetail(true);
                } else {
                  setSelectedAssignmentSubmission(record);
                  setShowAssignmentFeedback(true);
                }
              }}
            />
          </Tooltip>
          <Tooltip title="Download Report">
            <Button
              size="small"
              icon={<DownloadOutlined />}
              onClick={() => handleDownloadReport(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Handle download report
  const handleDownloadReport = (record) => {
    // Implement download functionality
    console.log("Download report for:", record);
  };

  // Filter controls
  const FilterControls = () => (
    <Card size="small" style={{ marginBottom: 16 }}>
      <Row gutter={16} align="middle">
        <Col xs={24} sm={8}>
          <Input
            placeholder="Search assessments..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
          />
        </Col>
        <Col xs={24} sm={6}>
          <Select
            placeholder="Subject"
            value={filters.subject}
            onChange={(value) => updateFilters({ subject: value })}
            style={{ width: "100%" }}
            allowClear
          >
            {subjects.map((subject) => (
              <Option key={subject.id} value={subject.id}>
                {subject.name}
              </Option>
            ))}
          </Select>
        </Col>
        <Col xs={24} sm={6}>
          <Select
            placeholder="Type"
            value={filters.assessmentType}
            onChange={(value) => updateFilters({ assessmentType: value })}
            style={{ width: "100%" }}
            allowClear
          >
            <Option value="quiz">Quiz</Option>
            <Option value="assignment">Assignment</Option>
          </Select>
        </Col>
        <Col xs={24} sm={4}>
          <Button
            icon={<FilterOutlined />}
            onClick={clearFilters}
            style={{ width: "100%" }}
          >
            Clear
          </Button>
        </Col>
      </Row>
    </Card>
  );

  if (error) {
    return (
      <div style={{ padding: 24 }}>
        <Alert
          message="Failed to load grades"
          description={error.message}
          type="error"
          showIcon
          action={<Button onClick={fetchGrades}>Retry</Button>}
        />
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0, color: "#11418b" }}>
          <TrophyOutlined style={{ marginRight: 8 }} />
          My Grades & Results
        </Title>
      </div>

      {/* Main Content */}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        type="card"
        style={{ backgroundColor: "#fff", borderRadius: 8 }}
      >
        {/* Overview Tab */}
        <TabPane
          tab={
            <Space>
              <BarChartOutlined />
              <span>Overview</span>
            </Space>
          }
          key="overview"
        >
          <StudentGradeOverview
            grades={grades}
            subjects={subjects}
            gpa={gpa}
            gradeStats={gradeStats}
            performanceTrend={performanceTrend}
            getSubjectGPA={getSubjectGPA}
            loading={loading}
          />
        </TabPane>

        {/* All Grades Tab */}
        <TabPane
          tab={
            <Space>
              <FileTextOutlined />
              <span>All Grades ({grades.length})</span>
            </Space>
          }
          key="allgrades"
        >
          <div>
            <FilterControls />

            <Card style={{ borderRadius: 8 }}>
              <Table
                columns={tableColumns}
                dataSource={tableData}
                loading={loading}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) =>
                    `${range[0]}-${range[1]} of ${total} assessments`,
                }}
                scroll={{ x: 800 }}
                locale={{
                  emptyText: (
                    <Empty
                      description="No grades found"
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                  ),
                }}
              />
            </Card>
          </div>
        </TabPane>

        {/* Analytics Tab */}
        <TabPane
          tab={
            <Space>
              <BarChartOutlined />
              <span>Analytics</span>
            </Space>
          }
          key="analytics"
        >
          <Card style={{ borderRadius: 8 }}>
            <GradeChart
              grades={grades} // ✅ PASTIKAN GRADES DITERUSKAN
              subjects={subjects}
              analytics={analytics}
              loading={loading}
              analyticsLoading={analyticsLoading}
            />
          </Card>
        </TabPane>
      </Tabs>

      {/* Quiz Detail Modal */}
      <QuizResultsDetail
        visible={showQuizDetail}
        onClose={() => {
          setShowQuizDetail(false);
          setSelectedQuizAttempt(null);
        }}
        attemptId={selectedQuizAttempt?.id}
        quizTitle={selectedQuizAttempt?.title}
        onDownloadReport={handleDownloadReport}
      />

      {/* Assignment Feedback Modal */}
      <AssignmentFeedback
        visible={showAssignmentFeedback}
        onClose={() => {
          setShowAssignmentFeedback(false);
          setSelectedAssignmentSubmission(null);
        }}
        submissionId={selectedAssignmentSubmission?.id}
        assignmentTitle={selectedAssignmentSubmission?.title}
        onDownloadReport={handleDownloadReport}
      />
    </div>
  );
};

export default StudentGrades;
