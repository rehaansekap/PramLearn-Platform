import React from "react";
import { Link } from "react-router-dom";
import {
  DashboardOutlined,
  BookOutlined,
  FileTextOutlined,
  TrophyOutlined,
  LogoutOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { Button, Drawer, Menu, Avatar, Badge, Typography } from "antd";

const { Text } = Typography;

const StudentMobileDrawer = ({
  open,
  onClose,
  user,
  selectedMenuKey,
  onLogout,
}) => {
  const menuItems = [
    {
      key: "/student",
      icon: <DashboardOutlined />,
      label: <Link to="/student">Dasbor</Link>,
    },
    {
      key: "/student/subjects",
      icon: <BookOutlined />,
      label: <Link to="/student/subjects">Mata Pelajaran Saya</Link>,
    },
    {
      key: "/student/assessments",
      icon: <FileTextOutlined />,
      label: <Link to="/student/assessments">Penilaian</Link>,
    },
    {
      key: "/student/assignments",
      icon: <FileTextOutlined />,
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
      open={open}
      onClose={onClose}
      closable={false}
      headerStyle={{ display: "none" }}
      bodyStyle={{
        background: "#001529",
        padding: 0,
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
      width={300}
    >
      {/* Header Drawer Custom */}
      <div
        style={{
          background:
            "linear-gradient(135deg, #001529 0%, #3a3f5c 60%, #43cea2 100%)",
          padding: "16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "8px",
              background: "linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
            }}
          >
            <span
              style={{
                fontSize: "20px",
                fontWeight: "800",
                background: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              P
            </span>
          </div>
          <div>
            <div
              style={{
                color: "#fff",
                fontSize: "16px",
                fontWeight: "700",
                lineHeight: "18px",
              }}
            >
              PramLearn
            </div>
            <div
              style={{
                color: "rgba(255, 255, 255, 0.8)",
                fontSize: "11px",
                fontWeight: "500",
                lineHeight: "14px",
              }}
            >
              Portal Siswa
            </div>
          </div>
        </div>
        <Button
          type="text"
          icon={<CloseOutlined />}
          onClick={onClose}
          style={{
            color: "#fff",
            fontSize: 16,
            padding: 0,
            width: 32,
            height: 32,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        />
      </div>

      {/* Kartu Profil Pengguna */}
      <div
        style={{
          padding: "20px 16px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          background: "rgba(255, 255, 255, 0.05)",
          margin: "0 16px 16px",
          borderRadius: 12,
          marginTop: 16,
        }}
      >
        <Avatar
          size={48}
          style={{
            background: "linear-gradient(135deg, #1890ff 0%, #52c41a 100%)",
            color: "#fff",
            fontWeight: "bold",
            fontSize: "18px",
          }}
        >
          {user?.username?.charAt(0)?.toUpperCase() || "S"}
        </Avatar>
        <div>
          <div
            style={{
              color: "#fff",
              fontWeight: 600,
              fontSize: "15px",
              marginBottom: 2,
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
            fontSize: 16,
            fontWeight: 600,
            borderRadius: 8,
          }}
        >
          Keluar
        </Button>
      </div>
    </Drawer>
  );
};

export default StudentMobileDrawer;
