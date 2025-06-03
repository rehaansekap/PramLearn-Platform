import React, { useState, useEffect } from "react";
import { Modal, Spin } from "antd";
import { LoadingOutlined, UserOutlined } from "@ant-design/icons";

const UserInfoModal = ({ open, onClose, user, className }) => {
  const [loading, setLoading] = useState(false);

  // Simulasi loading saat modal dibuka
  useEffect(() => {
    if (open && user) {
      setLoading(true);
      const timer = setTimeout(() => {
        setLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [open, user]);

  const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

  return (
    <Modal
      className={className}
      open={open}
      onCancel={onClose}
      footer={null}
      title={
        <div
          style={{
            textAlign: "center",
            fontWeight: 700,
            fontSize: "1.25rem",
            color: "#11418b",
          }}
        >
          <UserOutlined
            style={{
              fontSize: 20,
              color: "#11418b",
              marginRight: 8,
            }}
          />
          <div>
          User Information
          </div>
        </div>
      }
      centered
      destroyOnClose
      // Hapus width custom, biarkan menggunakan default Ant Design
      // width={500}
    >
      {loading ? (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <Spin indicator={antIcon} />
          <p style={{ marginTop: 16, color: "#666" }}>
            Memuat informasi user...
          </p>
        </div>
      ) : user ? (
        <div>
          <div style={{ marginBottom: 12 }}>
            <span style={{ fontWeight: "bold", color: "#11418b" }}>
              Username:
            </span>
            <span style={{ marginLeft: 8 }}>{user.username}</span>
          </div>
          <div style={{ marginBottom: 12 }}>
            <span style={{ fontWeight: "bold", color: "#11418b" }}>Email:</span>
            <span style={{ marginLeft: 8 }}>{user.email}</span>
          </div>
          <div style={{ marginBottom: 12 }}>
            <span style={{ fontWeight: "bold", color: "#11418b" }}>
              First Name:
            </span>
            <span style={{ marginLeft: 8 }}>{user.first_name || "-"}</span>
          </div>
          <div style={{ marginBottom: 12 }}>
            <span style={{ fontWeight: "bold", color: "#11418b" }}>
              Last Name:
            </span>
            <span style={{ marginLeft: 8 }}>{user.last_name || "-"}</span>
          </div>
          <div style={{ marginBottom: 12 }}>
            <span style={{ fontWeight: "bold", color: "#11418b" }}>Kelas:</span>
            <span style={{ marginLeft: 8 }}>
              {user.class_names ? user.class_names.join(", ") : "-"}
            </span>
          </div>
          <div style={{ marginBottom: 12 }}>
            <span style={{ fontWeight: "bold", color: "#11418b" }}>
              Status:
            </span>
            <span
              style={{
                marginLeft: 8,
                color: user.is_active ? "#52c41a" : "#f5222d",
                fontWeight: "500",
              }}
            >
              {user.is_active ? "Active" : "Inactive"}
            </span>
          </div>
        </div>
      ) : null}
    </Modal>
  );
};

export default UserInfoModal;
