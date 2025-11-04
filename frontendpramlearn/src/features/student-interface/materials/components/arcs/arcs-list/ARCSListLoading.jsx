import React from "react";
import { Spin, Alert } from "antd";

export const ARCSListLoading = () => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "60vh",
      }}
    >
      <Spin size="large" tip="Memuat kuesioner ARCS..." />
    </div>
  );
};

export const ARCSListError = ({ error }) => {
  return (
    <Alert
      message="Gagal memuat kuesioner ARCS"
      description={
        error.message || "Terjadi kesalahan saat mengambil data kuesioner."
      }
      type="error"
      showIcon
      style={{ borderRadius: 12 }}
    />
  );
};