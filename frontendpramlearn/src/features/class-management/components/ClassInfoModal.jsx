import React, { useState, useEffect } from "react";
import { Modal, Spin } from "antd";
import { LoadingOutlined, InfoCircleOutlined } from "@ant-design/icons";

const ClassInfoModal = ({ open, onClose, classItem, loading = false }) => {
  const [localLoading, setLocalLoading] = useState(false);

  // Simulasi loading saat modal dibuka
  useEffect(() => {
    if (open && classItem) {
      setLocalLoading(true);
      const timer = setTimeout(() => {
        setLocalLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [open, classItem]);

  const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;
  const isLoading = loading || localLoading;

  return (
    <Modal
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
          <InfoCircleOutlined
            style={{
              fontSize: 20,
              color: "#11418b",
              marginRight: 8,
            }}
          />
          Class Information
        </div>
      }
      centered
      destroyOnClose
    >
      {isLoading ? (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <Spin indicator={antIcon} />
          <p style={{ marginTop: 16, color: "#666" }}>
            Memuat informasi class...
          </p>
        </div>
      ) : classItem ? (
        <div>
          <div style={{ marginBottom: 12 }}>
            <span style={{ fontWeight: "bold", color: "#11418b" }}>Name:</span>
            <span style={{ marginLeft: 8 }}>{classItem.name}</span>
          </div>
          <div style={{ marginBottom: 12 }}>
            <span style={{ fontWeight: "bold", color: "#11418b" }}>Slug:</span>
            <span style={{ marginLeft: 8 }}>{classItem.slug || "-"}</span>
          </div>
          <div style={{ marginBottom: 12 }}>
            <span style={{ fontWeight: "bold", color: "#11418b" }}>
              Students:
            </span>
            <span style={{ marginLeft: 8, color: "#1890ff", fontWeight: 500 }}>
              {classItem.student_count || 0} students
            </span>
          </div>
          <div style={{ marginBottom: 12 }}>
            <span style={{ fontWeight: "bold", color: "#11418b" }}>
              Created:
            </span>
            <span style={{ marginLeft: 8 }}>
              {classItem.created_at
                ? new Date(classItem.created_at).toLocaleDateString()
                : "-"}
            </span>
          </div>
          <div style={{ marginBottom: 12 }}>
            <span style={{ fontWeight: "bold", color: "#11418b" }}>
              Status:
            </span>
            <span
              style={{
                marginLeft: 8,
                color: classItem.is_active ? "#52c41a" : "#f5222d",
                fontWeight: "500",
              }}
            >
              {classItem.is_active ? "Active" : "Inactive"}
            </span>
          </div>
        </div>
      ) : null}
    </Modal>
  );
};

export default ClassInfoModal;
