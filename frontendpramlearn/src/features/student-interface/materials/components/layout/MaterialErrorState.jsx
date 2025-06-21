import React from "react";
import { Alert, Button, Space } from "antd";

const MaterialErrorState = ({ error }) => {
  return (
    <div
      style={{
        margin: "24px",
        maxWidth: 1200,
        marginLeft: "auto",
        marginRight: "auto",
      }}
    >
      <Alert
        message={error ? "Gagal memuat materi" : "Materi tidak ditemukan"}
        description={
          error?.message ||
          "Materi yang Anda cari tidak tersedia atau terjadi kesalahan."
        }
        type={error ? "error" : "warning"}
        showIcon
        style={{ borderRadius: 12 }}
        action={
          <Space>
            {error && (
              <Button
                size="small"
                danger
                onClick={() => window.location.reload()}
              >
                Coba Lagi
              </Button>
            )}
            <Button size="small" onClick={() => window.history.back()}>
              Kembali
            </Button>
          </Space>
        }
      />
    </div>
  );
};

export default MaterialErrorState;
