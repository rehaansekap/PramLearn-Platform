import React from "react";
import { Link } from "react-router-dom";
import { Drawer, Button, Menu, Avatar, Badge, Typography } from "antd";
import {
  DashboardOutlined,
  BookOutlined,
  FileTextOutlined,
  TrophyOutlined,
  LogoutOutlined,
  EditOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

const StudentMobileDrawer = ({
  open,
  onClose,
  user,
  selectedMenuKey,
  onLogout,
}) => {
  // ✅ MENU ITEMS YANG SAMA DENGAN SIDEBAR DESKTOP
  const menuItems = [
    {
      key: "/student",
      icon: <DashboardOutlined />,
      label: <Link to="/student">Dasbor</Link>,
    },
    {
      key: "/student/subjects",
      icon: <BookOutlined />,
      label: <Link to="/student/subjects">Mata Pelajaran</Link>,
    },
    {
      key: "/student/assessments",
      icon: <FileTextOutlined />,
      label: <Link to="/student/assessments">Kuis & Penilaian</Link>,
    },
    {
      key: "/student/assignments",
      icon: <EditOutlined />,
      label: <Link to="/student/assignments">Tugas</Link>,
    },
    {
      key: "/student/grades",
      icon: <TrophyOutlined />,
      label: <Link to="/student/grades">Nilai & Hasil</Link>,
    },
  ];

  return (
    <Drawer
      title={null}
      placement="left"
      onClose={onClose}
      open={open}
      width={280}
      bodyStyle={{
        padding: 0,
        background: "#001529",
      }}
      headerStyle={{ display: "none" }}
      closable={false}
    >
      <div
        style={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          background: "#001529",
        }}
      >
        {/* HEADER PROFIL */}
        <div
          style={{
            padding: "24px 16px",
            borderBottom: "1px solid #303030",
            textAlign: "center",
          }}
        >
          <Avatar
            size={64}
            style={{
              background: "linear-gradient(135deg, #1890ff 0%, #52c41a 100%)",
              marginBottom: 12,
              fontSize: "24px",
              fontWeight: "bold",
            }}
          >
            {user?.username?.charAt(0)?.toUpperCase() || "S"}
          </Avatar>
          <div
            style={{
              color: "#fff",
              fontWeight: 600,
              fontSize: "16px",
              marginBottom: 4,
            }}
          >
            {user?.username || user?.first_name || "Siswa"}
          </div>
          <div style={{ display: "flex", alignItems: "center" }}>
            <Badge status="success" />
            <span
              style={{
                color: "rgba(255, 255, 255, 0.8)",
                fontSize: "12px",
                marginLeft: 5,
              }}
            >
              Online - Siswa
            </span>
          </div>
        </div>

        {/* NAVIGASI MENU */}
        <div style={{ padding: "0 16px", marginBottom: 8 }}>
          <Text
            style={{
              color: "rgba(255, 255, 255, 0.5)",
              fontSize: 12,
              fontWeight: 500,
            }}
          >
            NAVIGASI SISWA
          </Text>
        </div>

        {/* Menu yang Ditingkatkan */}
        <div style={{ flex: 1, overflowY: "auto", padding: "0 16px" }}>
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[selectedMenuKey]}
            style={{
              borderRight: 0,
              background: "transparent",
              fontSize: "14px",
            }}
            items={menuItems.map((item) => ({
              ...item,
              style: {
                marginBottom: 4,
                borderRadius: 8,
                height: 44,
              },
              onClick: onClose,
            }))}
          />
        </div>

        {/* Tombol Keluar */}
        <div
          style={{
            padding: "16px",
            marginTop: "auto",
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <Button
            type="primary"
            danger
            size="large"
            icon={<LogoutOutlined />}
            onClick={onLogout}
            block
            style={{
              height: 46,
              fontWeight: 600,
              fontSize: "14px",
            }}
          >
            Keluar
          </Button>
        </div>
      </div>
    </Drawer>
  );
};

export default StudentMobileDrawer;
