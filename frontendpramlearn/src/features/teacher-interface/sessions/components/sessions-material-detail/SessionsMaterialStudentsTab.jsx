import React, { useState } from "react";
import {
  Card,
  Table,
  Avatar,
  Tag,
  Typography,
  Progress,
  Space,
  Input,
  Button,
  Row,
  Col,
  Statistic,
  Empty,
  Tooltip,
  Dropdown,
  Menu,
  message,
} from "antd";
import {
  UserOutlined,
  SearchOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
  StarOutlined,
  ReloadOutlined,
  EditOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  MinusCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/id";
import api from "../../../../../api";
import { useOnlineStatus } from "../../../../../context/OnlineStatusContext";

dayjs.extend(relativeTime);
dayjs.locale("id");

const { Text } = Typography;
const { Search } = Input;

const SessionsMaterialStudentsTab = ({
  materialDetail,
  isMobile,
  onRefresh,
  refreshing,
  onDataUpdate,
}) => {
  const [searchText, setSearchText] = useState("");
  const [sortedInfo, setSortedInfo] = useState({});
  const [updating, setUpdating] = useState({});
    const { isUserOnline } = useOnlineStatus();

  if (!materialDetail) {
    return (
      <Card style={{ borderRadius: 16 }}>
        <Empty description="Data siswa tidak tersedia" />
      </Card>
    );
  }

  const { students = [], statistics = {} } = materialDetail;

  // Filter students based on search
  const filteredStudents = students.filter(
    (student) =>
      student.username.toLowerCase().includes(searchText.toLowerCase()) ||
      `${student.first_name || ""} ${student.last_name || ""}`
        .toLowerCase()
        .includes(searchText.toLowerCase())
  );

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

  const handleAttendanceChange = async (studentId, newStatus) => {
    setUpdating((prev) => ({ ...prev, [studentId]: true }));
    try {
      await api.post(
        `teacher/sessions/material/${materialDetail.material.slug}/attendance/${studentId}/`,
        { status: newStatus }
      );
      message.success("Kehadiran berhasil diupdate");
      if (onDataUpdate) {
        await onDataUpdate();
      }
    } catch (error) {
      message.error("Gagal mengupdate kehadiran");
      console.error("Error updating attendance:", error);
    } finally {
      setUpdating((prev) => ({ ...prev, [studentId]: false }));
    }
  };

  const getAttendanceMenu = (studentId, currentStatus) => (
    <Menu
      onClick={({ key }) => handleAttendanceChange(studentId, key)}
      selectedKeys={[currentStatus]}
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

  const calculateStudentStats = () => {
    if (students.length === 0)
      return { online: 0, excellent: 0, needsAttention: 0 };

    const online = students.filter((s) => s.is_online).length;
    const excellent = students.filter(
      (s) => (s.average_grade || 0) >= 85
    ).length;
    const needsAttention = students.filter(
      (s) => (s.completion_percentage || 0) < 50
    ).length;

    return { online, excellent, needsAttention };
  };

  const studentStats = calculateStudentStats();

  const statsData = [
    {
      title: "Total Siswa",
      value: students.length,
      icon: <UserOutlined style={{ color: "#667eea" }} />,
      color: "#667eea",
      bgColor: "#f8faff",
    },
    {
      title: "Online",
      value: `${studentStats.online} / ${students.length}`,
      icon: <CheckCircleOutlined style={{ color: "#52c41a" }} />,
      color: "#52c41a",
      bgColor: "#f6ffed",
    },
    {
      title: "Excellent",
      value: studentStats.excellent,
      icon: <TrophyOutlined style={{ color: "#faad14" }} />,
      color: "#faad14",
      bgColor: "#fffbe6",
    },
    {
      title: "Perlu Perhatian",
      value: studentStats.needsAttention,
      icon: <StarOutlined style={{ color: "#ff4d4f" }} />,
      color: "#ff4d4f",
      bgColor: "#fff2f0",
    },
  ];

  const columns = [
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
          <div style={{ position: "relative" }}>
            <Avatar
              icon={<UserOutlined />}
              style={{
                background: record.is_online ? "#52c41a" : "#d9d9d9",
              }}
            />
            {record.is_online && (
              <div
                style={{
                  position: "absolute",
                  top: -2,
                  right: -2,
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  background: "#52c41a",
                  border: "2px solid white",
                }}
              />
            )}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <Text strong style={{ display: "block", fontSize: 14 }}>
              {record.username}
            </Text>
            {(record.first_name || record.last_name) && (
              <Text
                type="secondary"
                style={{
                  fontSize: 12,
                  display: "block",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {`${record.first_name || ""} ${record.last_name || ""}`.trim()}
              </Text>
            )}
          </div>
        </div>
      ),
      width: isMobile ? 150 : 200,
      sorter: (a, b) => a.username.localeCompare(b.username),
      sortOrder: sortedInfo.columnKey === "student" && sortedInfo.order,
    },
    {
      title: "Progress",
      key: "progress",
      render: (_, record) => (
        <div style={{ minWidth: 100 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 4,
            }}
          >
            <Text style={{ fontSize: 12 }}>Progress</Text>
            <Text
              style={{
                fontSize: 12,
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
          />
        </div>
      ),
      width: 120,
      sorter: (a, b) =>
        (a.completion_percentage || 0) - (b.completion_percentage || 0),
      sortOrder: sortedInfo.columnKey === "progress" && sortedInfo.order,
      responsive: ["md"],
    },
    {
      title: "Nilai",
      key: "grade",
      render: (_, record) => (
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: getGradeColor(record.average_grade || 0),
              lineHeight: 1,
            }}
          >
            {Math.round(record.average_grade || 0)}
          </div>
          <Text type="secondary" style={{ fontSize: 10 }}>
            Rata-rata
          </Text>
        </div>
      ),
      width: 80,
      align: "center",
      sorter: (a, b) => (a.average_grade || 0) - (b.average_grade || 0),
      sortOrder: sortedInfo.columnKey === "grade" && sortedInfo.order,
    },
    {
      title: "Motivasi",
      key: "motivation",
      render: (_, record) => (
        <Tag color={getMotivationColor(record.motivation_level)}>
          {getMotivationText(record.motivation_level)}
        </Tag>
      ),
      width: 120,
      align: "center",
      filters: [
        { text: "Tinggi", value: "High" },
        { text: "Sedang", value: "Medium" },
        { text: "Rendah", value: "Low" },
      ],
      onFilter: (value, record) => record.motivation_level === value,
      responsive: ["sm"],
    },
    {
      title: "Kehadiran",
      key: "attendance",
      render: (_, record) => {
        const updateKey = `attendance_${record.id}`;
        const isUpdating = updating[updateKey];

        return (
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
                gap: 4,
                padding: "4px 8px",
                borderRadius: 6,
              }}
            >
              <Tag color={getAttendanceColor(record.attendance_status)}>
                {getAttendanceText(record.attendance_status)}
              </Tag>
              <EditOutlined style={{ fontSize: 10 }} />
            </Button>
          </Dropdown>
        );
      },
      width: 140,
      align: "center",
      responsive: ["sm"],
    },
    {
      title: "Status",
      key: "status",
      render: (_, record) => (
        <Tag color={isUserOnline(record) ? "green" : "default"}>
          {isUserOnline(record) ? "Online" : "Offline"}
        </Tag>
      ),
      width: 100,
      align: "center",
      filters: [
        { text: "Online", value: true },
        { text: "Offline", value: false },
      ],
      onFilter: (value, record) => isUserOnline(record) === value,
      responsive: ["sm"],
    },
  ];

  const handleTableChange = (pagination, filters, sorter) => {
    setSortedInfo(sorter);
  };

  return (
    <div>
      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {statsData.map((stat, index) => (
          <Col xs={12} sm={6} lg={6} key={index}>
            <Card
              style={{
                borderRadius: 12,
                textAlign: "center",
                background: stat.bgColor,
                border: `1px solid ${stat.color}20`,
                transition: "all 0.3s ease",
              }}
              bodyStyle={{ padding: isMobile ? "16px" : "20px" }}
              className="session-detail-card"
            >
              <div style={{ marginBottom: 8 }}>
                {React.cloneElement(stat.icon, {
                  style: { fontSize: 24, ...stat.icon.props.style },
                })}
              </div>
              <Statistic
                title={stat.title}
                value={stat.value}
                valueStyle={{
                  color: stat.color,
                  fontSize: isMobile ? 18 : 20,
                  fontWeight: 700,
                }}
                titleStyle={{
                  color: stat.color,
                  fontSize: isMobile ? 12 : 14,
                  fontWeight: 600,
                }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* Controls */}
      <Card style={{ borderRadius: 16 }} bodyStyle={{ padding: "20px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <Search
            placeholder="Cari siswa..."
            allowClear
            style={{ width: isMobile ? "100%" : 300 }}
            onChange={(e) => setSearchText(e.target.value)}
            prefix={<SearchOutlined />}
          />
          <Button
            icon={<ReloadOutlined />}
            onClick={onRefresh}
            loading={refreshing}
            style={{ minWidth: 100 }}
          >
            Refresh
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={filteredStudents}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: false,
            showQuickJumper: !isMobile,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} dari ${total} siswa`,
            style: { marginTop: 16 },
          }}
          onChange={handleTableChange}
          scroll={{ x: isMobile ? 800 : undefined }}
          size={isMobile ? "small" : "middle"}
          style={{ marginTop: 16 }}
          rowClassName={(record, index) =>
            index % 2 === 0 ? "table-row-light" : "table-row-dark"
          }
        />
      </Card>
    </div>
  );
};

export default SessionsMaterialStudentsTab;
