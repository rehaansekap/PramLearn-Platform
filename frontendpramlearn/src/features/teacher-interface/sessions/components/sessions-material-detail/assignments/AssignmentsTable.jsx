import React from "react";
import {
  Card,
  Table,
  Tag,
  Typography,
  Button,
  Dropdown,
  Progress,
  Tooltip,
  Empty,
} from "antd";
import {
  FileTextOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  CalendarOutlined,
  UserOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  BarChartOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Text } = Typography;

const AssignmentsTable = ({
  assignments = [],
  students = [],
  onViewDetail,
  onEditAssignment,
  onDeleteAssignment,
  actionLoading = {},
  isMobile = false,
}) => {
  // Utility functions
  const getStatusTag = (assignment) => {
    const now = dayjs();
    const dueDate = assignment.due_date ? dayjs(assignment.due_date) : null;

    if (!dueDate) {
      return (
        <Tag color="blue" style={{ borderRadius: 12, fontWeight: 600 }}>
          Tanpa Deadline
        </Tag>
      );
    }

    const isOverdue = now.isAfter(dueDate);
    const isUpcoming = dueDate.diff(now, "hours") <= 24 && !isOverdue;

    if (isOverdue) {
      return (
        <Tag
          color="red"
          icon={<ExclamationCircleOutlined />}
          style={{ borderRadius: 12, fontWeight: 600 }}
        >
          Overdue
        </Tag>
      );
    } else if (isUpcoming) {
      return (
        <Tag
          color="orange"
          icon={<ClockCircleOutlined />}
          style={{ borderRadius: 12, fontWeight: 600 }}
        >
          Segera Berakhir
        </Tag>
      );
    } else {
      return (
        <Tag
          color="green"
          icon={<CheckCircleOutlined />}
          style={{ borderRadius: 12, fontWeight: 600 }}
        >
          Aktif
        </Tag>
      );
    }
  };

  const getSubmissionProgress = (assignment) => {
    const totalStudents = students.length;
    const submissionRate =
      totalStudents > 0
        ? Math.round((assignment.total_submissions / totalStudents) * 100)
        : 0;

    return {
      rate: submissionRate,
      color:
        submissionRate >= 80
          ? "#52c41a"
          : submissionRate >= 50
          ? "#faad14"
          : "#ff4d4f",
    };
  };

  const getMenuItems = (record) => [
    {
      key: "edit",
      label: "Edit Assignment",
      icon: <EditOutlined />,
      onClick: () => onEditAssignment(record),
    },
    {
      key: "analytics",
      label: "Lihat Analytics",
      icon: <BarChartOutlined />,
      onClick: () => console.log("Analytics:", record),
    },
    {
      key: "delete",
      label: "Hapus Assignment",
      icon: <DeleteOutlined />,
      danger: true,
      onClick: () => onDeleteAssignment(record),
    },
  ];

  const columns = [
    {
      title: "#",
      key: "index",
      render: (_, __, index) => (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
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
        </div>
      ),
      width: 80,
      align: "center",
    },
    {
      title: "Assignment",
      key: "assignment",
      render: (_, record) => (
        <div style={{ minWidth: 200 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 4,
            }}
          >
            <div
              style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                borderRadius: "50%",
                width: isMobile ? 32 : 36,
                height: isMobile ? 32 : 36,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <FileTextOutlined
                style={{
                  color: "white",
                  fontSize: isMobile ? 14 : 16,
                }}
              />
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <Text
                strong
                style={{
                  display: "block",
                  fontSize: isMobile ? 14 : 16,
                  color: "#262626",
                  marginBottom: 2,
                }}
              >
                {record.title}
              </Text>
            </div>
          </div>

          <Text
            type="secondary"
            style={{
              fontSize: isMobile ? 11 : 12,
              display: "block",
              lineHeight: 1.4,
              marginBottom: 8,
            }}
          >
            {record.description
              ? record.description.length > 80
                ? `${record.description.substring(0, 80)}...`
                : record.description
              : "Tidak ada deskripsi"}
          </Text>

          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <Tag
              color="blue"
              size="small"
              style={{
                fontSize: 12,
                borderRadius: 8,
                fontWeight: 600,
              }}
            >
              📝 {record.question_count || 0} Soal
            </Tag>
            {record.graded_submissions > 0 && (
              <Tag
                color="green"
                size="small"
                style={{
                  fontSize: 12,
                  borderRadius: 8,
                  fontWeight: 600,
                }}
              >
                ⭐ {record.average_grade}
              </Tag>
            )}
          </div>
        </div>
      ),
      width: isMobile ? 220 : 280,
    },
    {
      title: "Deadline & Status",
      key: "deadline",
      render: (_, record) => (
        <div style={{ minWidth: 140 }}>
          {record.due_date ? (
            <>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  marginBottom: 8,
                }}
              >
                <CalendarOutlined style={{ color: "#1890ff", fontSize: 24 }} />
                <div>
                  <Text style={{ fontSize: 12, fontWeight: 600 }}>
                    {dayjs(record.due_date).format("DD MMM YYYY")}
                  </Text>
                  <Text
                    style={{ fontSize: 12, color: "#666", display: "block" }}
                  >
                    {dayjs(record.due_date).format("HH:mm")}
                  </Text>
                </div>
              </div>
              {getStatusTag(record)}
            </>
          ) : (
            <Tag color="blue" style={{ borderRadius: 12, fontWeight: 600 }}>
              Tanpa Deadline
            </Tag>
          )}
        </div>
      ),
      width: 160,
      // responsive: ["sm"],
    },
    {
      title: "Progress Submission",
      key: "submissions",
      render: (_, record) => {
        const progress = getSubmissionProgress(record);

        return (
          <div style={{ minWidth: 120 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                <Tag
                  color="green"
                  size="small"
                  style={{ fontSize: 12, margin: 0 }}
                >
                  ✓ {record.total_submissions}
                </Tag>
                <Tag
                  color="orange"
                  size="small"
                  style={{ fontSize: 12, margin: 0 }}
                >
                  ⏳ {record.pending_submissions}
                </Tag>
              </div>
            </div>

            <div style={{ marginBottom: 4 }}>
              <Text style={{ fontSize: 11, color: "#666" }}>
                Progress: {progress.rate.toFixed(1)}%
              </Text>
            </div>

            <Progress
              percent={progress.rate}
              size="small"
              strokeColor={progress.color}
              showInfo={false}
              strokeWidth={6}
              trailColor="#f0f0f0"
            />
          </div>
        );
      },
      width: 160,
      align: "center",
      // responsive: ["md"],
    },
    {
      title: "Nilai",
      key: "grade",
      render: (_, record) => (
        <div style={{ textAlign: "center" }}>
          {record.graded_submissions > 0 ? (
            <div>
              <div
                style={{
                  background:
                    "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",
                  borderRadius: 12,
                  padding: "8px 12px",
                  color: "white",
                  marginBottom: 4,
                }}
              >
                <div style={{ fontSize: 16, fontWeight: 700, lineHeight: 1 }}>
                  {record.average_grade}
                </div>
              </div>
              <Text style={{ fontSize: 10, color: "#666" }}>
                {record.graded_submissions} dinilai
              </Text>
            </div>
          ) : (
            <div
              style={{
                background: "#f5f5f5",
                borderRadius: 12,
                padding: "8px 12px",
                color: "#999",
              }}
            >
              <Text style={{ fontSize: 12 }}>Belum ada nilai</Text>
            </div>
          )}
        </div>
      ),
      width: 100,
      align: "center",
      // responsive: ["lg"],
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <div style={{ display: "flex", gap: 4 }}>
          <Tooltip title="Lihat Detail">
            <Button
              type="primary"
              icon={<EyeOutlined />}
              size="small"
              onClick={() => onViewDetail(record)}
              loading={actionLoading[`view_${record.id}`]}
              style={{
                background: "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",
                border: "none",
                borderRadius: 8,
                minWidth: 32,
                height: 32,
              }}
            />
          </Tooltip>

          <Dropdown
            menu={{
              items: getMenuItems(record),
              onClick: ({ key, domEvent }) => {
                domEvent.stopPropagation();
                const item = getMenuItems(record).find(
                  (item) => item.key === key
                );
                if (item?.onClick) item.onClick();
              },
            }}
            trigger={["click"]}
            placement="bottomRight"
          >
            <Button
              icon={<MoreOutlined />}
              size="small"
              loading={
                actionLoading[`edit_${record.id}`] ||
                actionLoading[`delete_${record.id}`]
              }
              style={{
                borderRadius: 8,
                minWidth: 32,
                height: 32,
              }}
            />
          </Dropdown>
        </div>
      ),
      width: isMobile ? 80 : 100,
      align: "center",
      // fixed: isMobile ? "right" : false,
    },
  ];

  if (!assignments || assignments.length === 0) {
    return (
      <Card
        style={{
          borderRadius: 16,
          border: "2px dashed #d9d9d9",
          background: "#fafafa",
          textAlign: "center",
          padding: "40px 20px",
        }}
      >
        <div
          style={{
            background: "rgba(102, 126, 234, 0.1)",
            width: isMobile ? 60 : 80,
            height: isMobile ? 60 : 80,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto",
            marginBottom: 16,
          }}
        >
          <FileTextOutlined
            style={{
              fontSize: isMobile ? 24 : 32,
              color: "#667eea",
            }}
          />
        </div>
        <Empty
          description={
            <Text style={{ color: "#666", fontSize: isMobile ? 14 : 16 }}>
              Belum ada assignment dibuat
            </Text>
          }
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </Card>
    );
  }

  return (
    <Card
      style={{
        borderRadius: 16,
        border: "none",
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        overflow: "hidden",
      }}
      bodyStyle={{ padding: 0 }}
    >
      {/* Header Info */}
      <div
        style={{
          padding: isMobile ? "16px 20px" : "20px 24px",
          background: "linear-gradient(135deg, #f8fafc 0%, #e6f3ff 100%)",
          borderBottom: "1px solid #f0f0f0",
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
          <div
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              borderRadius: "50%",
              width: 32,
              height: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <FileTextOutlined style={{ color: "white", fontSize: 14 }} />
          </div>
          <div>
            <Text
              style={{
                fontSize: isMobile ? 14 : 16,
                fontWeight: 600,
                color: "#262626",
              }}
            >
              Daftar Assignment ({assignments.length})
            </Text>
            <Text
              style={{
                fontSize: isMobile ? 11 : 12,
                color: "#666",
                display: "block",
              }}
            >
              Assignment yang telah dibuat untuk materi ini
            </Text>
          </div>
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={assignments.map((assignment) => ({
          ...assignment,
          key: assignment.id,
        }))}
        pagination={{
          pageSize: isMobile ? 5 : 8,
          showSizeChanger: !isMobile,
          showQuickJumper: !isMobile,
          showTotal: (total, range) =>
            `Menampilkan ${range[0]}-${range[1]} dari ${total} assignment`,
          style: {
            padding: "16px 24px",
            background: "#fafafa",
            borderTop: "1px solid #f0f0f0",
          },
        }}
        scroll={{ x: isMobile ? 800 : undefined }}
        size={isMobile ? "small" : "middle"}
        style={{
          background: "white",
        }}
        locale={{
          emptyText: (
            <div style={{ padding: "40px 20px", textAlign: "center" }}>
              <FileTextOutlined
                style={{ fontSize: 48, color: "#d9d9d9", marginBottom: 16 }}
              />
              <Text type="secondary" style={{ fontSize: 16 }}>
                Belum ada assignment yang dibuat
              </Text>
            </div>
          ),
        }}
      />
    </Card>
  );
};

export default AssignmentsTable;
