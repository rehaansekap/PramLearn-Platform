import React, { useState, useEffect } from "react";
import {
  Modal,
  Table,
  Avatar,
  Tag,
  Spin,
  Typography,
  Space,
  Progress,
  Card,
  Row,
  Col,
  Statistic,
} from "antd";
import {
  UserOutlined,
  TeamOutlined,
  LoadingOutlined,
  FireOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const SessionsGroupMembersModal = ({ open, onClose, group, students }) => {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && group) {
      setLoading(true);
      const timer = setTimeout(() => {
        setLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [open, group]);

  if (!group) return null;

  // Get member details from students data
  const getGroupMembers = () => {
    if (!group.members || !students) return [];

    return group.members.map((member) => {
      const studentDetail = students.find(
        (s) => s.id === member.id || s.username === member.username
      );
      return {
        ...member,
        ...studentDetail,
      };
    });
  };

  const members = getGroupMembers();

  const getMotivationColor = (level) => {
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

  // Calculate group statistics
  const getGroupStatistics = () => {
    const totalMembers = members.length;
    const avgProgress =
      members.reduce((sum, m) => sum + (m.completion_percentage || 0), 0) /
      totalMembers;
    const presentMembers = members.filter(
      (m) => m.attendance_status === "present"
    ).length;
    const attendanceRate =
      totalMembers > 0 ? (presentMembers / totalMembers) * 100 : 0;

    return {
      totalMembers,
      avgProgress: avgProgress.toFixed(1),
      attendanceRate: attendanceRate.toFixed(1),
      presentMembers,
    };
  };

  const groupStats = getGroupStatistics();

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
      title: "Nama Siswa",
      key: "name",
      render: (_, record) => (
        <div>
          <Text strong style={{ display: "block" }}>
            {record.username}
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
      title: "Progress",
      key: "progress",
      render: (_, record) => (
        <div style={{ minWidth: 100 }}>
          <Progress
            percent={Math.round(record.completion_percentage || 0)}
            size="small"
            strokeColor={
              record.completion_percentage >= 80 ? "#52c41a" : "#faad14"
            }
          />
        </div>
      ),
      width: 120,
      align: "center",
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
    },
    {
      title: "Kehadiran",
      key: "attendance",
      render: (_, record) => (
        <Tag color={getAttendanceColor(record.attendance_status)}>
          {getAttendanceText(record.attendance_status)}
        </Tag>
      ),
      width: 120,
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
    },
  ];

  const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={1000}
      centered
      className="session-group-members-modal"
      destroyOnClose
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginBottom: 24,
          paddingTop: 16,
        }}
      >
        <TeamOutlined
          style={{ fontSize: 28, color: "#11418b", marginBottom: 8 }}
        />
        <Title level={4} style={{ margin: 0, color: "#11418b" }}>
          Detail Kelompok: {group.name}
        </Title>
        <Text type="secondary" style={{ fontSize: 14 }}>
          Kode Kelompok: {group.code}
        </Text>
      </div>

      {/* Group Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card size="small" style={{ textAlign: "center" }}>
            <Statistic
              title="Total Anggota"
              value={groupStats.totalMembers}
              prefix={<UserOutlined style={{ color: "#1677ff" }} />}
              valueStyle={{ color: "#1677ff" }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" style={{ textAlign: "center" }}>
            <Statistic
              title="Progress Rata-rata"
              value={groupStats.avgProgress}
              suffix="%"
              prefix={<FireOutlined style={{ color: "#faad14" }} />}
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" style={{ textAlign: "center" }}>
            <Statistic
              title="Tingkat Kehadiran"
              value={groupStats.attendanceRate}
              suffix="%"
              prefix={<CheckCircleOutlined style={{ color: "#52c41a" }} />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" style={{ textAlign: "center" }}>
            <Statistic
              title="Hadir Hari Ini"
              value={groupStats.presentMembers}
              prefix={<UserOutlined style={{ color: "#722ed1" }} />}
              valueStyle={{ color: "#722ed1" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Members Table */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <Spin indicator={antIcon} />
          <p style={{ marginTop: 16, color: "#666" }}>
            Memuat data anggota kelompok...
          </p>
        </div>
      ) : (
        <Table
          dataSource={members.map((member, index) => ({
            ...member,
            key: member.id || index,
          }))}
          columns={columns}
          pagination={false}
          className="session-group-members-table"
          style={{ width: "100%" }}
          scroll={{ x: 800 }}
          size="middle"
        />
      )}
    </Modal>
  );
};

export default SessionsGroupMembersModal;
