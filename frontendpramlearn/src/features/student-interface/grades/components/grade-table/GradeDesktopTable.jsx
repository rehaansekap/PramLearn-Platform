import React from "react";
import {
  Table,
  Tag,
  Button,
  Space,
  Typography,
  Tooltip,
  Progress,
  Card,
} from "antd";
import { EyeOutlined, BookOutlined, FileTextOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { Text } = Typography;

const GradeDesktopTable = ({
  grades,
  pagination,
  sortedInfo,
  getGradeColor,
  getGradeLetter,
  getPerformanceIndicator,
  onViewDetail,
  onTableChange,
}) => {
  const columns = [
    {
      title: "No",
      key: "no",
      render: (_, __, index) => (
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: "#f0f0f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 600,
            color: "#666",
          }}
        >
          {index + 1}
        </div>
      ),
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
          style={{
            fontWeight: 500,
            fontSize: 12,
            padding: "4px 12px",
            borderRadius: 8,
          }}
        >
          {type === "quiz" ? "Kuis" : "Tugas"}
        </Tag>
      ),
      width: 100,
      filters: [
        { text: "Kuis", value: "quiz" },
        { text: "Tugas", value: "assignment" },
      ],
      onFilter: (value, record) => record.type === value,
    },
    {
      title: "Judul Assessment",
      dataIndex: "title",
      key: "title",
      render: (title, record) => (
        <div>
          <Text strong style={{ color: "#11418b", fontSize: 14 }}>
            {title}
          </Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            📖 {record.material_title || record.subject_name}
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
        <Tag
          color="purple"
          style={{
            fontWeight: 500,
            padding: "6px 12px",
            borderRadius: 8,
            fontSize: 12,
          }}
        >
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
      title: "Nilai & Performa",
      dataIndex: "grade",
      key: "grade",
      render: (grade) => {
        const performance = getPerformanceIndicator(grade);
        return (
          <div style={{ textAlign: "center" }}>
            <div style={{ marginBottom: 8 }}>
              <Space size={8}>
                <Tag
                  color={getGradeColor(grade)}
                  style={{
                    minWidth: 50,
                    textAlign: "center",
                    fontSize: 14,
                    fontWeight: "bold",
                    borderRadius: 6,
                    padding: "4px 8px",
                  }}
                >
                  {grade?.toFixed(1)}
                </Tag>
                <Tag
                  style={{
                    fontWeight: "bold",
                    fontSize: 16,
                    color: getGradeColor(grade),
                    background: `${getGradeColor(grade)}15`,
                    border: `1px solid ${getGradeColor(grade)}30`,
                    borderRadius: 6,
                  }}
                >
                  {getGradeLetter(grade)}
                </Tag>
              </Space>
            </div>

            <Progress
              percent={grade}
              size="small"
              showInfo={false}
              strokeColor={{
                "0%": getGradeColor(grade),
                "100%": getGradeColor(grade) + "AA",
              }}
              strokeWidth={6}
              style={{ marginBottom: 8 }}
            />

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
              }}
            >
              {performance.icon && (
                <span style={{ color: performance.color, fontSize: 14 }}>
                  {performance.icon}
                </span>
              )}
              <Text
                style={{
                  fontSize: 11,
                  color: performance.color,
                  fontWeight: 500,
                }}
              >
                {performance.text}
              </Text>
            </div>
          </div>
        );
      },
      width: 160,
      sorter: (a, b) => (a.grade || 0) - (b.grade || 0),
      sortOrder: sortedInfo.columnKey === "grade" && sortedInfo.order,
      align: "center",
    },
    {
      title: "Tanggal",
      dataIndex: "date",
      key: "date",
      render: (date) => (
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              padding: "8px 12px",
              background: "#f6faff",
              borderRadius: 8,
              border: "1px solid #d6e4ff",
            }}
          >
            <Text style={{ fontWeight: 600, fontSize: 13, color: "#11418b" }}>
              {dayjs(date).format("DD MMM YYYY")}
            </Text>
            <br />
            <Text type="secondary" style={{ fontSize: 11 }}>
              {dayjs(date).format("HH:mm")} WIB
            </Text>
          </div>
        </div>
      ),
      width: 140,
      sorter: (a, b) => dayjs(a.date).unix() - dayjs(b.date).unix(),
      sortOrder: sortedInfo.columnKey === "date" && sortedInfo.order,
    },
    {
      title: "Aksi",
      key: "action",
      render: (_, record) => (
        <Tooltip title="Lihat detail hasil dan feedback">
          <Button
            type="primary"
            size="middle"
            icon={<EyeOutlined />}
            onClick={() => onViewDetail(record)}
            style={{
              borderRadius: 8,
              fontWeight: 600,
              height: 36,
              background: "linear-gradient(135deg, #11418b 0%, #1890ff 100%)",
              border: "none",
            }}
          >
            Detail
          </Button>
        </Tooltip>
      ),
      width: 100,
      align: "center",
    },
  ];

  return (
    <Card
      style={{
        borderRadius: 16,
        boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
      }}
    >
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
        onChange={onTableChange}
        pagination={
          pagination
            ? {
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `Menampilkan ${range[0]}-${range[1]} dari ${total} nilai`,
                size: "default",
              }
            : false
        }
        scroll={{ x: 1000 }}
        size="middle"
      />
    </Card>
  );
};

export default GradeDesktopTable;
