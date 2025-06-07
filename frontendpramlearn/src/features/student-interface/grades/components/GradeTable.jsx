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
} from "antd";
import {
  EyeOutlined,
  TrophyOutlined,
  BookOutlined,
  FileTextOutlined,
  CalendarOutlined,
  StarOutlined,
  StarFilled,
} from "@ant-design/icons";
import dayjs from "dayjs";

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

  const handleTableChange = (pagination, filters, sorter) => {
    setSortedInfo(sorter);
  };

  // Get performance indicator
  const getPerformanceIndicator = (grade) => {
    if (grade >= 90)
      return { icon: <StarFilled />, color: "#gold", text: "Excellent" };
    if (grade >= 80)
      return { icon: <StarOutlined />, color: "#52c41a", text: "Good" };
    if (grade >= 70)
      return { icon: <TrophyOutlined />, color: "#faad14", text: "Fair" };
    return { icon: null, color: "#ff4d4f", text: "Needs Improvement" };
  };

  const columns = [
    {
      title: "No",
      key: "no",
      render: (_, __, index) => index + 1,
      width: 60,
      align: "center",
      fixed: "left",
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
      responsive: ["md"],
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
      responsive: ["md"],
    },
    {
      title: "Feedback",
      dataIndex: "teacher_feedback",
      key: "teacher_feedback",
      render: (feedback) => (
        <Tooltip
          title={feedback || "Belum ada feedback"}
          placement="topLeft"
          overlayStyle={{ maxWidth: 300 }}
        >
          <div style={{ maxWidth: 150 }}>
            {feedback ? (
              <Text ellipsis style={{ color: "#52c41a" }}>
                ✓ {feedback}
              </Text>
            ) : (
              <Text type="secondary" style={{ fontSize: 12 }}>
                Belum ada feedback
              </Text>
            )}
          </div>
        </Tooltip>
      ),
      ellipsis: true,
      responsive: ["lg"],
      width: 160,
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
            onClick={() => onViewDetail(record)}
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
      fixed: "right",
    },
  ];

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
      <Card>
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <Spin size="large" tip="Memuat data nilai..." />
        </div>
      </Card>
    );
  }

  if (!grades || grades.length === 0) {
    return (
      <Card>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Belum ada data nilai"
          style={{ padding: "40px 0" }}
        />
      </Card>
    );
  }

  return (
    <Card
      title={
        <Space>
          <CalendarOutlined style={{ color: "#11418b" }} />
          <Text strong>Riwayat Nilai ({grades.length})</Text>
        </Space>
      }
      extra={
        <Space>
          <Text type="secondary">
            Rata-rata: <Text strong>{averageGrade.toFixed(1)}</Text>
          </Text>
        </Space>
      }
    >
      {/* Summary Stats */}
      <div style={{ marginBottom: 16 }}>
        <Space wrap>
          <Tag color="gold">Excellent: {gradeDistribution.excellent}</Tag>
          <Tag color="green">Good: {gradeDistribution.good}</Tag>
          <Tag color="orange">Fair: {gradeDistribution.fair}</Tag>
          <Tag color="red">Poor: {gradeDistribution.poor}</Tag>
        </Space>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        dataSource={grades.map((grade, index) => ({
          ...grade,
          key: grade.id || index,
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
        className="grade-table"
        style={{
          "& .ant-table-thead > tr > th": {
            backgroundColor: "#fafafa",
            fontWeight: 600,
          },
        }}
      />
    </Card>
  );
};

export default GradeTable;
