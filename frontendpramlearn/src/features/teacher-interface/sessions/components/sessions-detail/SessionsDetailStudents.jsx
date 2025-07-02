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
} from "antd";
import {
  UserOutlined,
  SearchOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
  StarOutlined,
  ReloadOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useOnlineStatus } from "../../../../../context/OnlineStatusContext";

const { Text } = Typography;
const { Search } = Input;

const SessionsDetailStudents = ({
  sessionDetail,
  isMobile,
  onRefresh,
  refreshing,
}) => {
  const [searchText, setSearchText] = useState("");
  const [sortedInfo, setSortedInfo] = useState({});
  const { isUserOnline } = useOnlineStatus();

  if (!sessionDetail) {
    return (
      <Card
        style={{
          borderRadius: 16,
          background: "linear-gradient(135deg, #f8faff 0%, #f0f9ff 100%)",
        }}
      >
        <Empty
          image={
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: 120,
                height: 120,
                margin: "0 auto 20px",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                borderRadius: "50%",
                color: "white",
                fontSize: 48,
              }}
            >
              <TeamOutlined />
            </div>
          }
          description={
            <div>
              <Text style={{ color: "#667eea", fontSize: 18, fontWeight: 600 }}>
                Data Siswa Tidak Tersedia
              </Text>
            </div>
          }
        />
      </Card>
    );
  }

  const { students = [], statistics = {} } = sessionDetail;

  // Filter students based on search
  const filteredStudents = students.filter(
    (student) =>
      student.username.toLowerCase().includes(searchText.toLowerCase()) ||
      `${student.first_name} ${student.last_name}`
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
        return "Unknown";
    }
  };

  const calculateStudentStats = () => {
    if (students.length === 0)
      return { online: 0, excellent: 0, needsAttention: 0 };

    const online = students.filter((s) => isUserOnline(s)).length;
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
      icon: <TeamOutlined style={{ color: "#52c41a" }} />,
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
      render: (_, record) => {
        const isOnline = isUserOnline(record);
        return (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ position: "relative" }}>
              <Avatar
                icon={<UserOutlined />}
                style={{
                  background: isOnline
                    ? "linear-gradient(135deg, #52c41a 0%, #73d13d 100%)"
                    : "#d9d9d9",
                }}
              />
              {isOnline && (
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
                    boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
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
                  {`${record.first_name || ""} ${
                    record.last_name || ""
                  }`.trim()}
                </Text>
              )}
            </div>
          </div>
        );
      },
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
      title: "Kehadiran",
      key: "attendance",
      render: (_, record) => (
        <Tag
          color={getAttendanceColor(record.attendance_status)}
          style={{ borderRadius: 8 }}
        >
          {getAttendanceText(record.attendance_status)}
        </Tag>
      ),
      width: 100,
      align: "center",
      filters: [
        { text: "Hadir", value: "present" },
        { text: "Terlambat", value: "late" },
        { text: "Izin", value: "excused" },
        { text: "Tidak Hadir", value: "absent" },
      ],
      onFilter: (value, record) => record.attendance_status === value,
      responsive: ["sm"],
    },
    {
      title: "Status",
      key: "status",
      render: (_, record) => {
        const isOnline = isUserOnline(record);
        return (
          <Tag
            color={isOnline ? "green" : "default"}
            style={{ borderRadius: 8 }}
          >
            {isOnline ? "Online" : "Offline"}
          </Tag>
        );
      },
      width: 80,
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
      {/* Statistics Cards - Same style as sessions list */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {statsData.map((stat, index) => (
          <Col xs={12} sm={6} lg={6} key={index}>
            <Card
              style={{
                borderRadius: 16,
                border: `1px solid ${stat.color}20`,
                background: stat.bgColor,
                height: "100%",
              }}
              bodyStyle={{
                padding: isMobile ? 16 : 20,
                textAlign: "center",
              }}
            >
              <Space
                direction="vertical"
                style={{ width: "100%" }}
                size="small"
              >
                <div
                  style={{
                    background: "white",
                    borderRadius: "50%",
                    width: 48,
                    height: 48,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 8px",
                    fontSize: 20,
                    boxShadow: `0 4px 12px ${stat.color}20`,
                  }}
                >
                  {stat.icon}
                </div>
                <Statistic
                  value={stat.value}
                  valueStyle={{
                    color: stat.color,
                    fontSize: isMobile ? 20 : 24,
                    fontWeight: 700,
                  }}
                />
                <Text
                  style={{
                    color: "#666",
                    fontSize: isMobile ? 12 : 14,
                    fontWeight: 500,
                  }}
                >
                  {stat.title}
                </Text>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Search and Actions */}
      <Card
        style={{
          borderRadius: 16,
          marginBottom: 24,
          background: "linear-gradient(135deg, #f8faff 0%, #e6f7ff 100%)",
          border: "1px solid #667eea20",
        }}
        bodyStyle={{ padding: isMobile ? 16 : 20 }}
      >
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={18} md={20}>
            <Search
              placeholder="Cari siswa berdasarkan nama atau username..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{
                borderRadius: 12,
              }}
              size="large"
              prefix={<SearchOutlined style={{ color: "#667eea" }} />}
            />
          </Col>
          <Col xs={24} sm={6} md={4}>
            <Button
              icon={<ReloadOutlined />}
              onClick={onRefresh}
              loading={refreshing}
              size="large"
              style={{
                width: "100%",
                borderRadius: 12,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                border: "none",
                color: "white",
                fontWeight: 600,
              }}
            >
              {isMobile ? "" : "Refresh"}
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Students Table */}
      {filteredStudents.length > 0 ? (
        <Card
          style={{
            borderRadius: 16,
            border: "1px solid #f0f0f0",
            boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
          }}
          bodyStyle={{ padding: 0 }}
        >
          <Table
            dataSource={filteredStudents}
            columns={columns}
            rowKey="id"
            pagination={{
              pageSize: isMobile ? 5 : 10,
              showSizeChanger: !isMobile,
              showQuickJumper: !isMobile,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} dari ${total} siswa`,
              style: { padding: "16px 24px" },
            }}
            scroll={{ x: 800 }}
            onChange={handleTableChange}
            size={isMobile ? "small" : "middle"}
            style={{
              borderRadius: 16,
              overflow: "hidden",
            }}
            rowClassName={(record, index) =>
              index % 2 === 0 ? "table-row-light" : "table-row-dark"
            }
          />
        </Card>
      ) : (
        <Card
          style={{
            borderRadius: 16,
            textAlign: "center",
            border: "1px dashed #d9d9d9",
            background: "linear-gradient(135deg, #f8faff 0%, #f0f9ff 100%)",
          }}
          bodyStyle={{ padding: "60px 40px" }}
        >
          <Empty
            image={
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  width: 120,
                  height: 120,
                  margin: "0 auto 20px",
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  borderRadius: "50%",
                  color: "white",
                  fontSize: 48,
                }}
              >
                <TeamOutlined />
              </div>
            }
            description={
              <div>
                <Text
                  style={{ color: "#667eea", fontSize: 18, fontWeight: 600 }}
                >
                  {searchText
                    ? "Tidak ada siswa yang cocok"
                    : "Belum ada data siswa"}
                </Text>
                <br />
                <Text style={{ color: "#666", fontSize: 14 }}>
                  {searchText
                    ? "Coba ubah kata kunci pencarian"
                    : "Data siswa akan muncul di sini"}
                </Text>
              </div>
            }
          />
        </Card>
      )}
    </div>
  );
};

export default SessionsDetailStudents;
