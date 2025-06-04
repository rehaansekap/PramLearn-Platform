import React, { useState, useContext, useCallback, useEffect } from "react";
import {
  Table,
  Select,
  Tag,
  Button,
  message,
  Spin,
  Space,
  Dropdown,
  Menu,
  Row,
  Col,
} from "antd";
import {
  UserOutlined,
  ReloadOutlined,
  MailOutlined,
  LoadingOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { AuthContext } from "../../../context/AuthContext";
import { useOnlineStatus } from "../../../context/OnlineStatusContext";
import useAttendanceManagement from "../hooks/useAttendanceManagement";
import useAttendanceWebSocket from "../hooks/useAttendanceWebSocket";
import MotivationProfileSection from "./MotivationProfileSection";
import Swal from "sweetalert2";
import api from "../../../api";

const { Option } = Select;

const StudentsTab = ({ studentDetails, classId, loading, materialId }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const { user } = useContext(AuthContext);
  const { isUserOnline } = useOnlineStatus();
  const [updating, setUpdating] = useState({});
  const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

  const {
    attendanceRecords,
    loading: attendanceLoading,
    updateAttendanceStatus,
    bulkCreateAttendance,
    getStudentAttendanceStatus,
    refetchAttendance,
  } = useAttendanceManagement(materialId);

  // WebSocket for real-time updates
  const handleAttendanceUpdate = useCallback(
    (data) => {
      refetchAttendance();
      message.info(
        `Kehadiran ${data.student_id} diupdate oleh ${data.updated_by}`
      );
    },
    [refetchAttendance]
  );

  const { sendAttendanceUpdate } = useAttendanceWebSocket(
    materialId,
    handleAttendanceUpdate
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

  // Get motivation profile color and text
  const getMotivationProfileDisplay = (student) => {
    // Cek berbagai kemungkinan struktur data profil motivasi
    let motivationLevel = null;

    // Kemungkinan 1: student.motivation_profile (string langsung)
    if (student.motivation_profile) {
      motivationLevel = student.motivation_profile.toLowerCase();
    }
    // Kemungkinan 2: student.studentmotivationprofile (object)
    else if (student.studentmotivationprofile?.motivation_level) {
      motivationLevel =
        student.studentmotivationprofile.motivation_level.toLowerCase();
    }
    // Kemungkinan 3: student.motivation_level (langsung di student object)
    else if (student.motivation_level) {
      motivationLevel = student.motivation_level.toLowerCase();
    }

    if (motivationLevel) {
      switch (motivationLevel) {
        case "high":
          return { color: "green", text: "Tinggi", icon: "🔥" };
        case "medium":
          return { color: "orange", text: "Sedang", icon: "⚡" };
        case "low":
          return { color: "red", text: "Rendah", icon: "📈" };
        default:
          return { color: "gray", text: "Belum Dianalisis", icon: "❓" };
      }
    }

    return { color: "gray", text: "Belum Dianalisis", icon: "❓" };
  };

  const handleAttendanceChange = async (studentId, newStatus) => {
    setUpdating((prev) => ({ ...prev, [studentId]: true }));

    try {
      const result = await updateAttendanceStatus(studentId, newStatus);

      // Send WebSocket update
      sendAttendanceUpdate(
        studentId,
        newStatus,
        user.username,
        new Date().toISOString()
      );

      message.success("Kehadiran berhasil diupdate");
    } catch (error) {
      message.error("Gagal mengupdate kehadiran");
      console.error("Error updating attendance:", error);
    } finally {
      setUpdating((prev) => ({ ...prev, [studentId]: false }));
    }
  };

  const handleBulkCreateAttendance = async () => {
    try {
      await api.post(`materials/${materialId}/attendance/bulk-create/`, {
        material_id: materialId,
      });
      await refetchAttendance();
      Swal.fire("Berhasil", "Kehadiran berhasil dibuat!", "success");
    } catch (error) {
      console.error(
        "Error bulk creating attendance:",
        error,
        error?.response?.data
      );
      Swal.fire(
        "Gagal",
        error?.response?.data?.detail ||
          error?.response?.data?.message ||
          "Gagal mereset kehadiran.",
        "error"
      );
    }
  };

  // Function to create dropdown menu for attendance
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
      render: (_, __, idx) => idx + 1,
      width: 60,
    },
    {
      title: "Username",
      dataIndex: "username",
      key: "username",
      render: (text) => (
        <Space>
          <UserOutlined style={{ color: "#1890ff" }} />
          <span style={{ fontWeight: 500 }}>{text}</span>
        </Space>
      ),
      ellipsis: true,
    },
    {
      title: "Nama Lengkap",
      key: "fullName",
      render: (_, record) => {
        const fullName = `${record.first_name || ""} ${
          record.last_name || ""
        }`.trim();
        return fullName || "-";
      },
      ellipsis: true,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (text) => (
        <Space>
          <MailOutlined style={{ color: "#666" }} />
          <span>{text}</span>
        </Space>
      ),
      ellipsis: true,
      responsive: ["lg"],
    },
    {
      title: "Profil Motivasi",
      key: "motivation_profile",
      render: (_, record) => {
        const profile = getMotivationProfileDisplay(record);
        return (
          <Tag
            color={profile.color}
            style={{
              fontSize: "13px",
              padding: "4px 8px",
              borderRadius: "6px",
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              maxWidth: "120px",
            }}
          >
            <span style={{ marginRight: 4 }}>{profile.icon}</span>
            {profile.text}
          </Tag>
        );
      },
      width: 140,
      align: "center",
    },
    {
      title: "Kehadiran",
      key: "attendance",
      render: (_, record) => {
        const currentStatus = getStudentAttendanceStatus(record.id);
        const isUpdating = updating[record.id];

        return (
          <Dropdown
            overlay={getAttendanceMenu(record.id, currentStatus)}
            trigger={["click"]}
            disabled={isUpdating || attendanceLoading}
            placement="bottomLeft"
          >
            <Tag
              color={getAttendanceColor(currentStatus)}
              style={{
                cursor:
                  isUpdating || attendanceLoading ? "not-allowed" : "pointer",
                fontSize: "14px",
                padding: "4px 8px",
                borderRadius: "4px",
                userSelect: "none",
                fontWeight: 500,
                minWidth: "80px",
                textAlign: "center",
              }}
            >
              {isUpdating ? "..." : getAttendanceText(currentStatus)}
            </Tag>
          </Dropdown>
        );
      },
      width: 120,
      align: "center",
    },
    {
      title: "Status",
      key: "status",
      render: (_, record) => {
        const isOnline = isUserOnline(record.username);
        return (
          <Tag color={isOnline ? "green" : "red"}>
            {isOnline ? "Online" : "Offline"}
          </Tag>
        );
      },
      width: 100,
      align: "center",
      responsive: ["lg"],
    },
  ];

  if (loading || attendanceLoading) {
    return (
      <div style={{ textAlign: "center", padding: "40px 0" }}>
        <Spin indicator={antIcon} />
        <p style={{ marginTop: 16, color: "#666" }}>
          Memuat data siswa dan kehadiran...
        </p>
      </div>
    );
  }

  if (!studentDetails || studentDetails.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "40px 0" }}>
        <UserOutlined style={{ fontSize: 48, color: "#d9d9d9" }} />
        <p style={{ fontSize: "16px", color: "#666", marginTop: 16 }}>
          Belum ada siswa di kelas ini
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Header dengan icon dan tombol create */}
      <div style={{ width: "100%", marginBottom: 24 }}>
        <Row gutter={[16, 16]} align="middle" justify="center">
          <Col xs={24} style={{ textAlign: "center" }}>
            <UserOutlined
              style={{ fontSize: 32, color: "#11418b", marginBottom: 8 }}
            />
            <h3
              style={{
                fontSize: isMobile ? "16px" : "20px",
                fontWeight: 700,
                color: "#11418b",
                margin: "8px 0 4px 0",
              }}
            >
              Daftar Siswa & Kehadiran
            </h3>
            <p
              style={{
                fontSize: isMobile ? "12px" : "14px",
                color: "#666",
                margin: "0 0 16px 0",
              }}
            >
              Total: {studentDetails.length} siswa
            </p>
            <div
              style={{
                display: "flex",
                gap: 12,
                flexWrap: "wrap",
                justifyContent: "center",
                flexDirection: isMobile ? "column" : "row", // Tambahkan ini
                alignItems: "center", // Agar tombol tetap rata tengah di mobile
              }}
            >
              <Button
                type="primary"
                icon={<ReloadOutlined />}
                onClick={refetchAttendance}
                loading={attendanceLoading}
                style={{
                  minWidth: isMobile ? 180 : 140, // Lebar tombol lebih besar di mobile
                  width: isMobile ? "100%" : undefined, // Full width di mobile
                }}
              >
                Refresh
              </Button>
              <Button
                type="primary"
                icon={<TeamOutlined />}
                onClick={handleBulkCreateAttendance}
                loading={attendanceLoading}
                style={{
                  minWidth: isMobile ? 180 : 140,
                  width: isMobile ? "100%" : undefined,
                }}
              >
                Inisialisasi Kehadiran
              </Button>
            </div>
          </Col>
        </Row>
      </div>

      {/* Table Siswa */}
      <Table
        dataSource={studentDetails.map((student) => ({
          ...student,
          key: student.id,
        }))}
        columns={columns}
        pagination={{
          pageSize: 10,
          showSizeChanger: false,
          style: { textAlign: "center" },
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} dari ${total} siswa`,
        }}
        className="user-table-responsive"
        style={{ width: "100%" }}
        scroll={{ x: isMobile ? 600 : undefined }} // Tambahkan scroll horizontal untuk mobile
        size="middle"
      />

      {/* Upload Data ARCS Section - Dipindah ke bawah */}
      <div style={{ marginTop: 48 }}>
        <MotivationProfileSection />
      </div>
    </div>
  );
};

export default StudentsTab;
