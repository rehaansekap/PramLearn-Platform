import React from "react";
import { Spin, Alert } from "antd";

export const AssignmentListLoading = () => {
  return (
    <div
      style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "24px 16px",
        minHeight: "calc(100vh - 64px)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <Spin size="large" tip="Memuat tugas..." />
      </div>
    </div>
  );
};

export const AssignmentListError = ({ error }) => {
  return (
    <div
      style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "24px 16px",
        minHeight: "calc(100vh - 64px)",
      }}
    >
      <Alert
        message="Gagal memuat tugas"
        description={
          error.message || "Terjadi kesalahan saat mengambil data tugas."
        }
        type="error"
        showIcon
        style={{ borderRadius: 12 }}
      />
    </div>
  );
};
