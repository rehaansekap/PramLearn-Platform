import React from "react";
import {
  Card,
  Table,
  Avatar,
  Tag,
  Typography,
  Progress,
  Button,
  Dropdown,
  Menu,
  Tooltip,
} from "antd";
import {
  UserOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  MinusCircleOutlined,
  CloseCircleOutlined,
  EditOutlined,
  TrophyOutlined,
  StarOutlined,
} from "@ant-design/icons";
import { useOnlineStatus } from "../../../../../../context/OnlineStatusContext";

const { Text } = Typography;

const StudentsTable = ({
  students = [],
  searchText = "",
  sortOrder = "",
  filterStatus = "",
  updating = {},
  onAttendanceChange,
  isMobile = false,
}) => {
  const { isUserOnline } = useOnlineStatus();

  // Filter and sort students
  const processStudents = () => {
    let filtered = students.filter((student) => {
      // Search filter
      const matchesSearch =
        searchText === "" ||
        student.username.toLowerCase().includes(searchText.toLowerCase()) ||
        `${student.first_name || ""} ${student.last_name || ""}`
          .toLowerCase()
          .includes(searchText.toLowerCase());

      // Status filter
      let matchesFilter = true;
      switch (filterStatus) {
        case "online":
          matchesFilter = isUserOnline(student);
          break;
        case "offline":
          matchesFilter = !isUserOnline(student);
          break;
        case "excellent":
          matchesFilter = (student.average_grade || 0) >= 85;
          break;
        case "needsAttention":
          matchesFilter = (student.completion_percentage || 0) < 50;
          break;
        default:
          matchesFilter = true;
      }

      return matchesSearch && matchesFilter;
    });

    // Sort students
    switch (sortOrder) {
      case "name":
        filtered.sort((a, b) => a.username.localeCompare(b.username));
        break;
      case "grade":
        filtered.sort(
          (a, b) => (b.average_grade || 0) - (a.average_grade || 0)
        );
        break;
      case "progress":
        filtered.sort(
          (a, b) =>
            (b.completion_percentage || 0) - (a.completion_percentage || 0)
        );
        break;
      default:
        break;
    }

    return filtered;
  };

  const filteredStudents = processStudents();

  // Utility functions
  const getGradeColor = (grade) => {
    if (grade >= 85) return "#52c41a";
    if (grade >= 70) return "#faad14";
    return "#ff4d4f";
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return "#52c41a";
    if (progress >= 60) return "#faad14";
    return "#ff4d4f";
  };

  const getAttendanceColor = (status) => {
    switch (status) {
      case "present":
        return "green";
      case "late":
        return "orange";
      case "excused":
        return "blue";
      case "absent":
        return "red";
      default:
        return "default";
    }
  };

  const getAttendanceText = (status) => {
    switch (status) {
      case "present":
        return "Hadir";
      case "late":
        return "Terlambat";
      case "excused":
        return "Izin";
      case "absent":
        return "Tidak Hadir";
      default:
        return "Belum Diatur";
    }
  };

  const getAttendanceIcon = (status) => {
    switch (status) {
      case "present":
        return <CheckCircleOutlined />;
      case "late":
        return <ExclamationCircleOutlined />;
      case "excused":
        return <MinusCircleOutlined />;
      case "absent":
        return <CloseCircleOutlined />;
      default:
        return <UserOutlined />;
    }
  };

  const getMotivationColor = (level) => {
    switch (level?.toLowerCase()) {
      case "high":
        return "#52c41a";
      case "medium":
        return "#faad14";
      case "low":
        return "#ff4d4f";
      default:
        return "#d9d9d9";
    }
  };

  const getMotivationText = (level) => {
    switch (level?.toLowerCase()) {
      case "high":
        return "Tinggi";
      case "medium":
        return "Sedang";
      case "low":
        return "Rendah";
      default:
        return "Belum Dianalisis";
    }
  };

  const getAttendanceMenu = (studentId, currentStatus) => (
    <Menu
      onClick={({ key }) => onAttendanceChange(studentId, key)}
      selectedKeys={[currentStatus]}
      style={{ borderRadius: 8 }}
    >
      <Menu.Item key="present" icon={<CheckCircleOutlined />}>
        <Tag color="green">Hadir</Tag>
      </Menu.Item>
      <Menu.Item key="late" icon={<ExclamationCircleOutlined />}>
        <Tag color="orange">Terlambat</Tag>
      </Menu.Item>
      <Menu.Item key="excused" icon={<MinusCircleOutlined />}>
        <Tag color="blue">Izin</Tag>
      </Menu.Item>
      <Menu.Item key="absent" icon={<CloseCircleOutlined />}>
        <Tag color="red">Tidak Hadir</Tag>
      </Menu.Item>
    </Menu>
  );

  const columns = [
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
      title: "Siswa",
      key: "student",
      render: (_, record) => (
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ position: "relative" }}>
            <Avatar
              size={isMobile ? 36 : 44}
              icon={<UserOutlined />}
              style={{
                background: isUserOnline(record)
                  ? "linear-gradient(135deg, #52c41a 0%, #73d13d 100%)"
                  : "linear-gradient(135deg, #d9d9d9 0%, #bfbfbf 100%)",
                border: "3px solid white",
                boxShadow: isUserOnline(record)
                  ? "0 0 0 2px #52c41a20"
                  : "0 0 0 2px #d9d9d920",
              }}
            />
            {isUserOnline(record) && (
              <div
                style={{
                  position: "absolute",
                  top: -2,
                  right: -2,
                  width: 14,
                  height: 14,
                  borderRadius: "50%",
                  background: "#52c41a",
                  border: "3px solid white",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                }}
              />
            )}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Text
                strong
                style={{
                  display: "block",
                  fontSize: isMobile ? 13 : 15,
                  color: "#262626",
                }}
              >
                {record.username}
              </Text>
              {(record.average_grade || 0) >= 85 && (
                <Tooltip title="Performa Excellent">
                  <TrophyOutlined style={{ color: "#faad14", fontSize: 12 }} />
                </Tooltip>
              )}
              {(record.completion_percentage || 0) < 50 && (
                <Tooltip title="Perlu Perhatian">
                  <StarOutlined style={{ color: "#ff4d4f", fontSize: 12 }} />
                </Tooltip>
              )}
            </div>
            {(record.first_name || record.last_name) && (
              <Text
                type="secondary"
                style={{
                  fontSize: isMobile ? 11 : 13,
                  display: "block",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {`${record.first_name || ""} ${record.last_name || ""}`.trim()}
              </Text>
            )}
            <Tag
              color={isUserOnline(record) ? "green" : "default"}
              size="small"
              style={{
                fontSize: 10,
                marginTop: 4,
                borderRadius: 10,
              }}
            >
              {isUserOnline(record) ? "🟢 Online" : "⚪ Offline"}
            </Tag>
          </div>
        </div>
      ),
      width: isMobile ? 180 : 220,
    },
    {
      title: "Progress & Nilai",
      key: "performance",
      render: (_, record) => (
        <div style={{ minWidth: 140 }}>
          {/* Progress */}
          <div style={{ marginBottom: 12 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 4,
              }}
            >
              <Text style={{ fontSize: 13, color: "#666" }}>Progress</Text>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: getProgressColor(record.completion_percentage || 0),
                }}
              >
                {Math.round(record.completion_percentage || 0)}%
              </Text>
            </div>
            <Progress
              percent={record.completion_percentage || 0}
              size="small"
              strokeColor={getProgressColor(record.completion_percentage || 0)}
              showInfo={false}
              strokeWidth={6}
              trailColor="#f0f0f0"
            />
          </div>

          {/* Grade */}
          <div
            style={{
              background: `${getGradeColor(record.average_grade || 0)}10`,
              borderRadius: 8,
              padding: "6px 12px",
              textAlign: "center",
              border: `1px solid ${getGradeColor(record.average_grade || 0)}30`,
            }}
          >
            <div
              style={{
                fontSize: isMobile ? 16 : 18,
                fontWeight: 700,
                color: getGradeColor(record.average_grade || 0),
                lineHeight: 1,
              }}
            >
              {Math.round(record.average_grade || 0)}
            </div>
            <Text style={{ fontSize: 12, color: "#666" }}>Rata-rata</Text>
          </div>
        </div>
      ),
      width: 160,
      //   responsive: ["sm"],
    },
    {
      title: "Motivasi",
      key: "motivation",
      render: (_, record) => (
        <Tag
          color={getMotivationColor(record.motivation_level)}
          style={{
            borderRadius: 12,
            fontWeight: 600,
            fontSize: 14,
            padding: "4px 12px",
          }}
        >
          {getMotivationText(record.motivation_level)}
        </Tag>
      ),
      width: 120,
      align: "center",
      //   responsive: ["md"],
    },
    {
      title: "Kehadiran",
      key: "attendance",
      render: (_, record) => {
        const isUpdating = updating[record.id];

        return (
          <div
            style={{
              // make it center
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
            }}
          >
            <Dropdown
              overlay={getAttendanceMenu(record.id, record.attendance_status)}
              trigger={["click"]}
              disabled={isUpdating}
            >
              <Button
                type="text"
                size="small"
                loading={isUpdating}
                icon={
                  !isUpdating
                    ? getAttendanceIcon(record.attendance_status)
                    : undefined
                }
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 12px",
                  borderRadius: 8,
                  background: `${
                    getAttendanceColor(record.attendance_status) === "default"
                      ? "#f0f0f0"
                      : "transparent"
                  }`,
                  border: "1px solid #f0f0f0",
                  transition: "all 0.2s ease",
                }}
              >
                <Tag
                  color={getAttendanceColor(record.attendance_status)}
                  style={{ margin: 0, fontSize: 14, fontWeight: "bold" }}
                >
                  {getAttendanceText(record.attendance_status)}
                </Tag>
                <EditOutlined style={{ fontSize: 14, color: "#666" }} />
              </Button>
            </Dropdown>
          </div>
        );
      },
      width: 140,
      align: "center",
      //   responsive: ["lg"],
    },
  ];

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
      <Table
        columns={columns}
        dataSource={filteredStudents}
        rowKey="id"
        pagination={{
          pageSize: isMobile ? 5 : 8,
          showSizeChanger: !isMobile,
          showQuickJumper: !isMobile,
          showTotal: (total, range) =>
            `Menampilkan ${range[0]}-${range[1]} dari ${total} siswa`,
          style: {
            padding: "16px 24px",
            background: "#fafafa",
            borderTop: "1px solid #f0f0f0",
          },
        }}
        scroll={{ x: isMobile ? 600 : undefined }}
        size={isMobile ? "small" : "middle"}
        rowClassName={(record, index) => {
          const baseClass =
            index % 2 === 0 ? "table-row-light" : "table-row-dark";
          const onlineClass = isUserOnline(record)
            ? "student-online"
            : "student-offline";
          return `${baseClass} ${onlineClass}`;
        }}
        style={{
          background: "white",
        }}
        locale={{
          emptyText: (
            <div style={{ padding: "40px 20px", textAlign: "center" }}>
              <UserOutlined
                style={{ fontSize: 48, color: "#d9d9d9", marginBottom: 16 }}
              />
              <Text type="secondary" style={{ fontSize: 16 }}>
                {searchText || filterStatus
                  ? "Tidak ada siswa yang sesuai dengan filter"
                  : "Belum ada siswa terdaftar"}
              </Text>
            </div>
          ),
        }}
      />
    </Card>
  );
};

export default StudentsTable;
