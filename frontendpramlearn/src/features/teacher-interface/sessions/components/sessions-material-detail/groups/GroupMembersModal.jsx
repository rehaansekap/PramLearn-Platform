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
  TrophyOutlined,
  StarOutlined,
} from "@ant-design/icons";
import { useOnlineStatus } from "../../../../../../context/OnlineStatusContext";

const { Title, Text } = Typography;

const GroupMembersModal = ({
  open,
  onClose,
  group,
  students,
  isMobile = false,
}) => {
  const [loading, setLoading] = useState(false);
  const { isUserOnline } = useOnlineStatus();

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

  // Utility functions
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
        return "Belum Terukur";
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
      totalMembers > 0
        ? members.reduce((sum, m) => sum + (m.completion_percentage || 0), 0) /
          totalMembers
        : 0;
    const presentMembers = members.filter(
      (m) => m.attendance_status === "present"
    ).length;
    const attendanceRate =
      totalMembers > 0 ? (presentMembers / totalMembers) * 100 : 0;
    const excellentMembers = members.filter(
      (m) => (m.average_grade || 0) >= 85
    ).length;

    return {
      totalMembers,
      avgProgress: avgProgress.toFixed(1),
      attendanceRate: attendanceRate.toFixed(1),
      presentMembers,
      excellentMembers,
    };
  };

  const groupStats = getGroupStatistics();

  const columns = [
    {
      title: "#",
      key: "index",
      render: (_, __, index) => (
        <div
          style={{
            width: 24,
            height: 24,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 11,
            fontWeight: 600,
          }}
        >
          {index + 1}
        </div>
      ),
      width: 40,
      align: "center",
    },
    {
      title: "Siswa",
      key: "student",
      render: (_, record) => (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ position: "relative" }}>
            <Avatar
              size={isMobile ? 32 : 40}
              icon={<UserOutlined />}
              style={{
                background: isUserOnline(record)
                  ? "linear-gradient(135deg, #52c41a 0%, #73d13d 100%)"
                  : "linear-gradient(135deg, #d9d9d9 0%, #bfbfbf 100%)",
                border: "2px solid white",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
            />
            {isUserOnline(record) && (
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
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Text
                strong
                style={{
                  fontSize: isMobile ? 12 : 14,
                  color: "#262626",
                }}
              >
                {record.username}
              </Text>
              {(record.average_grade || 0) >= 85 && (
                <TrophyOutlined style={{ color: "#faad14", fontSize: 10 }} />
              )}
            </div>
            {(record.first_name || record.last_name) && (
              <Text
                type="secondary"
                style={{
                  fontSize: isMobile ? 12 : 13,
                  display: "block",
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
                marginTop: 2,
                padding: "1px 6px",
                borderRadius: 8,
              }}
            >
              {isUserOnline(record) ? "🟢 Online" : "⚪ Offline"}
            </Tag>
          </div>
        </div>
      ),
      width: isMobile ? 140 : 180,
    },
    {
      title: "Progress",
      key: "progress",
      render: (_, record) => (
        <div style={{ minWidth: 80 }}>
          <div style={{ marginBottom: 4 }}>
            <Text style={{ fontSize: 12, color: "#666" }}>
              {Math.round(record.completion_percentage || 0)}%
            </Text>
          </div>
          <Progress
            percent={record.completion_percentage || 0}
            size="small"
            strokeColor={
              record.completion_percentage >= 80
                ? "#52c41a"
                : record.completion_percentage >= 60
                ? "#faad14"
                : "#ff4d4f"
            }
            showInfo={false}
            strokeWidth={6}
          />
        </div>
      ),
      width: 100,
      align: "center",
    },
    {
      title: "Motivasi",
      key: "motivation",
      render: (_, record) => (
        <Tag
          color={getMotivationColor(record.motivation_level)}
          style={{
            fontSize: 12,
            fontWeight: 600,
            borderRadius: 10,
            padding: "2px 8px",
          }}
        >
          {getMotivationText(record.motivation_level)}
        </Tag>
      ),
      width: 90,
      align: "center",
      responsive: ["md"],
    },
    {
      title: "Kehadiran",
      key: "attendance",
      render: (_, record) => (
        <Tag
          color={getAttendanceColor(record.attendance_status)}
          style={{
            fontSize: 12,
            fontWeight: 600,
            borderRadius: 10,
            padding: "2px 8px",
          }}
        >
          {getAttendanceText(record.attendance_status)}
        </Tag>
      ),
      width: 90,
      align: "center",
      //   responsive: ["lg"],
    },
  ];

  const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={isMobile ? "95%" : 900}
      centered
      destroyOnClose
      style={{ maxWidth: 1000 }}
    >
      {/* Header */}
      <div
        style={{
          textAlign: "center",
          padding: isMobile ? "40px" : "40px",
          //   background: "linear-gradient(135deg, #f8fafc 0%, #e6f3ff 100%)",
          margin: "-24px -24px 20px",
          borderRadius: "8px 8px 0 0",
          //   width: "100%",
        }}
      >
        <div
          style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            borderRadius: "50%",
            width: isMobile ? "60" : 70,
            height: isMobile ? 60 : 70,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto",
            marginBottom: 12,
            boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
          }}
        >
          <TeamOutlined
            style={{
              fontSize: isMobile ? 24 : 28,
              color: "white",
            }}
          />
        </div>

        <Title
          level={isMobile ? 5 : 4}
          style={{
            margin: 0,
            marginBottom: 4,
            color: "#262626",
            fontSize: isMobile ? 16 : 20,
          }}
        >
          {group.name}
        </Title>

        <Text
          type="secondary"
          style={{
            fontSize: isMobile ? 12 : 14,
            background: "rgba(255, 255, 255, 0.8)",
            padding: "4px 12px",
            borderRadius: 12,
            display: "inline-block",
          }}
        >
          📋 Kode: {group.code}
        </Text>
      </div>

      {/* Group Statistics */}
      <Row gutter={[12, 12]} style={{ marginBottom: 20 }}>
        <Col xs={12} sm={6}>
          <Card
            size="small"
            style={{
              textAlign: "center",
              borderRadius: 12,
              background: "linear-gradient(135deg, #f6ffed 0%, #f6ffed 100%)",
              border: "1px solid #b7eb8f",
              width: "100%",
            }}
          >
            <Statistic
              title="Anggota"
              value={groupStats.totalMembers}
              prefix={<UserOutlined style={{ color: "#52c41a" }} />}
              valueStyle={{ color: "#52c41a", fontSize: isMobile ? 16 : 18 }}
              titleStyle={{ fontSize: isMobile ? 10 : 12 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card
            size="small"
            style={{
              textAlign: "center",
              borderRadius: 12,
              background: "linear-gradient(135deg, #fffbe6 0%, #fffbe6 100%)",
              border: "1px solid #ffe58f",
            }}
          >
            <Statistic
              title="Progress"
              value={groupStats.avgProgress}
              suffix="%"
              prefix={<FireOutlined style={{ color: "#faad14" }} />}
              valueStyle={{ color: "#faad14", fontSize: isMobile ? 16 : 18 }}
              titleStyle={{ fontSize: isMobile ? 10 : 12 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card
            size="small"
            style={{
              textAlign: "center",
              borderRadius: 12,
              background: "linear-gradient(135deg, #e6fffb 0%, #e6fffb 100%)",
              border: "1px solid #87e8de",
            }}
          >
            <Statistic
              title="Kehadiran"
              value={groupStats.attendanceRate}
              suffix="%"
              prefix={<CheckCircleOutlined style={{ color: "#13c2c2" }} />}
              valueStyle={{ color: "#13c2c2", fontSize: isMobile ? 16 : 18 }}
              titleStyle={{ fontSize: isMobile ? 10 : 12 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card
            size="small"
            style={{
              textAlign: "center",
              borderRadius: 12,
              background: "linear-gradient(135deg, #f9f0ff 0%, #f9f0ff 100%)",
              border: "1px solid #d3adf7",
            }}
          >
            <Statistic
              title="Excellent"
              value={groupStats.excellentMembers}
              prefix={<StarOutlined style={{ color: "#722ed1" }} />}
              valueStyle={{ color: "#722ed1", fontSize: isMobile ? 16 : 18 }}
              titleStyle={{ fontSize: isMobile ? 10 : 12 }}
            />
          </Card>
        </Col>
      </Row>

      {/* Members Table */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <Spin indicator={antIcon} />
          <p style={{ marginTop: 16, color: "#666", fontSize: 14 }}>
            Memuat data anggota kelompok...
          </p>
        </div>
      ) : (
        <Card
          style={{
            borderRadius: 12,
            border: "1px solid #f0f0f0",
          }}
          bodyStyle={{ padding: 0 }}
        >
          <Table
            dataSource={members.map((member, index) => ({
              ...member,
              key: member.id || index,
            }))}
            columns={columns}
            pagination={false}
            scroll={{ x: isMobile ? 500 : undefined }}
            size={isMobile ? "small" : "middle"}
            style={{ borderRadius: 12 }}
          />
        </Card>
      )}
    </Modal>
  );
};

export default GroupMembersModal;
