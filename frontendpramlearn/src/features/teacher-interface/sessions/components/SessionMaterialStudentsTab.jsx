import React, { useState, useEffect } from "react";
import {
  Table,
  Card,
  Typography,
  Space,
  Button,
  Tag,
  Avatar,
  Spin,
  Empty,
  Row,
  Col,
  Statistic,
  Progress,
  Dropdown,
  Menu,
  message,
} from "antd";
import {
  UserOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  DownOutlined,
  ReloadOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import SessionsARCSProfileSection from "./SessionsARCSProfileSection";

const { Title, Text } = Typography;

const SessionMaterialStudentsTab = ({
  materialSlug,
  students,
  statistics,
  onDataUpdate, // Tambahkan prop untuk callback update data
}) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [updating, setUpdating] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Handler untuk upload ARCS berhasil
  const handleARCSUploadSuccess = async (result) => {
    try {
      message.success("Data profil motivasi berhasil diperbarui!");

      // Call callback untuk update data di parent component
      if (onDataUpdate) {
        await onDataUpdate();
      }
    } catch (error) {
      console.error("Error updating data after ARCS upload:", error);
      message.error("Gagal memperbarui data setelah upload");
    }
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
      default:
        return "red";
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
      default:
        return "Tidak Hadir";
    }
  };

  const getAttendanceIcon = (status) => {
    switch (status) {
      case "present":
        return <CheckCircleOutlined />;
      case "late":
        return <ClockCircleOutlined />;
      case "excused":
        return <ExclamationCircleOutlined />;
      case "absent":
      default:
        return <CloseCircleOutlined />;
    }
  };

  const getMotivationColor = (level) => {
    if (!level) return "default";

    switch (level?.toLowerCase()) {
      case "high":
        return "green";
      case "medium":
        return "orange";
      case "low":
        return "red";
      default:
        return "default";
    }
  };

  const getMotivationText = (level) => {
    if (!level || level === null || level === undefined) {
      return "Belum Dianalisis";
    }

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

  const getProgressColor = (percentage) => {
    if (percentage >= 80) return "#52c41a";
    if (percentage >= 60) return "#faad14";
    if (percentage >= 40) return "#fa8c16";
    return "#ff4d4f";
  };

  const handleAttendanceChange = async (studentId, newStatus) => {
    setUpdating((prev) => ({ ...prev, [studentId]: true }));

    try {
      // API call untuk update attendance
      // await updateAttendanceStatus(studentId, newStatus);
      message.success("Kehadiran berhasil diupdate");

      // Update data after attendance change
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
      <Menu.Item key="present">
        <Tag color="green">Hadir</Tag>
      </Menu.Item>
      <Menu.Item key="late">
        <Tag color="orange">Terlambat</Tag>
      </Menu.Item>
      <Menu.Item key="excused">
        <Tag color="blue">Izin</Tag>
      </Menu.Item>
      <Menu.Item key="absent">
        <Tag color="red">Tidak Hadir</Tag>
      </Menu.Item>
    </Menu>
  );

  const columns = [
    {
      title: "No",
      key: "no",
      render: (_, __, index) => index + 1,
      width: 60,
      align: "center",
    },
    {
      title: "Foto",
      key: "avatar",
      render: () => <Avatar icon={<UserOutlined />} size="default" />,
      width: 80,
      align: "center",
    },
    {
      title: "Username",
      dataIndex: "username",
      key: "username",
      render: (username, record) => (
        <div>
          <Text strong style={{ display: "block" }}>
            {username}
          </Text>
          {(record.first_name || record.last_name) && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              {`${record.first_name || ""} ${record.last_name || ""}`.trim()}
            </Text>
          )}
        </div>
      ),
      ellipsis: true,
    },
    {
      title: "Progress Materi",
      key: "progress",
      render: (_, record) => (
        <div style={{ minWidth: 120 }}>
          <Progress
            percent={Math.round(record.completion_percentage || 0)}
            size="small"
            strokeColor={getProgressColor(record.completion_percentage || 0)}
          />
        </div>
      ),
      width: 140,
      align: "center",
      responsive: ["md"],
    },
    {
      title: "Motivasi ARCS",
      key: "motivation",
      render: (_, record) => (
        <Tag color={getMotivationColor(record.motivation_level)}>
          {getMotivationText(record.motivation_level)}
        </Tag>
      ),
      width: 120,
      align: "center",
      responsive: ["lg"],
    },
    {
      title: "Kehadiran",
      key: "attendance",
      render: (_, record) => (
        <Dropdown
          overlay={getAttendanceMenu(record.id, record.attendance_status)}
          trigger={["click"]}
          disabled={updating[record.id]}
        >
          <Button
            size="small"
            loading={updating[record.id]}
            style={{
              border: "none",
              padding: "4px 8px",
              backgroundColor: "transparent",
            }}
          >
            <Tag color={getAttendanceColor(record.attendance_status)}>
              {getAttendanceIcon(record.attendance_status)}
              <span style={{ marginLeft: 4 }}>
                {getAttendanceText(record.attendance_status)}
              </span>
              {!updating[record.id] && (
                <DownOutlined style={{ marginLeft: 4 }} />
              )}
            </Tag>
          </Button>
        </Dropdown>
      ),
      width: 140,
      align: "center",
    },
    {
      title: "Status",
      key: "status",
      render: (_, record) => (
        <Tag color={record.is_online ? "green" : "default"}>
          {record.is_online ? "Online" : "Offline"}
        </Tag>
      ),
      width: 100,
      align: "center",
      responsive: ["lg"],
    },
  ];

  const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "40px 0" }}>
        <Spin indicator={antIcon} />
        <p style={{ marginTop: 16, color: "#666" }}>Memuat data siswa...</p>
      </div>
    );
  }

  if (!students || students.length === 0) {
    return (
      <div>
        <Empty
          description="Belum ada siswa terdaftar"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          style={{ padding: "60px 0" }}
        />

        {/* ARCS Profile Section */}
        <div style={{ marginTop: 48 }}>
          <SessionsARCSProfileSection
            onUploadSuccess={handleARCSUploadSuccess}
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card size="small" style={{ borderRadius: 8 }}>
            <Statistic
              title="Total Siswa"
              value={statistics?.totalStudents || students.length}
              prefix={<UserOutlined style={{ color: "#1677ff" }} />}
              valueStyle={{ color: "#1677ff", fontSize: 18 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" style={{ borderRadius: 8 }}>
            <Statistic
              title="Hadir Hari Ini"
              value={statistics?.presentStudents || 0}
              prefix={<CheckCircleOutlined style={{ color: "#52c41a" }} />}
              valueStyle={{ color: "#52c41a", fontSize: 18 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" style={{ borderRadius: 8 }}>
            <Statistic
              title="Progress Rata-rata"
              value={statistics?.averageProgress || 0}
              suffix="%"
              prefix={<CheckCircleOutlined style={{ color: "#faad14" }} />}
              valueStyle={{ color: "#faad14", fontSize: 18 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" style={{ borderRadius: 8 }}>
            <Statistic
              title="Siswa Online"
              value={statistics?.onlineStudents || 0}
              prefix={<UserOutlined style={{ color: "#722ed1" }} />}
              valueStyle={{ color: "#722ed1", fontSize: 18 }}
            />
          </Card>
        </Col>
      </Row>

      {/* Students Table */}
      <Card style={{ borderRadius: 12 }} bodyStyle={{ padding: "24px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
            flexDirection: isMobile ? "column" : "row",
            gap: isMobile ? 12 : 0,
          }}
        >
          <div>
            <Title level={5} style={{ margin: 0, color: "#11418b" }}>
              <UserOutlined style={{ marginRight: 8 }} />
              Daftar Siswa
            </Title>
            <Text type="secondary" style={{ fontSize: 14 }}>
              Total: {students.length} siswa terdaftar
            </Text>
          </div>

          <Button
            icon={<ReloadOutlined />}
            onClick={onDataUpdate}
            style={{ borderRadius: 6 }}
          >
            Refresh Data
          </Button>
        </div>

        <Table
          dataSource={students.map((student, index) => ({
            ...student,
            key: student.id || index,
          }))}
          columns={columns}
          pagination={{
            pageSize: 10,
            showSizeChanger: false,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} dari ${total} siswa`,
            style: { textAlign: "center" },
          }}
          className="session-students-table"
          style={{ width: "100%" }}
          scroll={{ x: isMobile ? 800 : undefined }}
          size="middle"
        />
      </Card>

      {/* ARCS Profile Section */}
      <div style={{ marginTop: 48 }}>
        <SessionsARCSProfileSection onUploadSuccess={handleARCSUploadSuccess} />
      </div>
    </div>
  );
};

export default SessionMaterialStudentsTab;
