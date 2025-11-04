import React from "react";
import { Empty, Button, Card, Typography } from "antd";
import { PlusOutlined, BookOutlined } from "@ant-design/icons";
import './styles/styles.css'

const { Title, Text } = Typography;

const SessionsEmptyState = ({ hasFilters, onClearFilters }) => {
  if (hasFilters) {
    return (
      <Card
        style={{
          textAlign: "center",
          borderRadius: 16,
          border: "1px dashed #d9d9d9",
          background: "#fafafa",
          padding: "40px 20px",
        }}
      >
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <div>
              <Title level={4} style={{ color: "#666", marginBottom: 8 }}>
                Tidak ada sesi yang ditemukan
              </Title>
              <Text style={{ color: "#999", fontSize: 16 }}>
                Coba ubah filter pencarian atau hapus filter untuk melihat semua
                sesi
              </Text>
            </div>
          }
        >
          <Button
            type="primary"
            onClick={onClearFilters}
            style={{
              borderRadius: 8,
              height: 40,
              paddingLeft: 24,
              paddingRight: 24,
            }}
          >
            Hapus Filter
          </Button>
        </Empty>
      </Card>
    );
  }

  return (
    <Card
      style={{
        textAlign: "center",
        borderRadius: 16,
        border: "1px dashed #d9d9d9",
        background: "linear-gradient(135deg, #f8faff 0%, #f0f9ff 100%)",
        padding: "60px 20px",
      }}
    >
      <Empty
        image={
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: 120,
              height: 120,
              margin: "0 auto 20px",
              background: "linear-gradient(135deg, #1890ff, #722ed1)",
              borderRadius: "50%",
              color: "white",
              fontSize: 48,
            }}
          >
            <BookOutlined />
          </div>
        }
        description={
          <div>
            <Title level={3} style={{ color: "#1890ff", marginBottom: 12 }}>
              Belum Ada Sesi Pembelajaran
            </Title>
            <Text style={{ color: "#666", fontSize: 16, lineHeight: 1.6 }}>
              Mulai buat sesi pembelajaran pertama Anda untuk mengelola materi,
              tugas, dan quiz bagi siswa-siswa Anda.
            </Text>
          </div>
        }
      >
        <Button
          type="primary"
          size="large"
          icon={<PlusOutlined />}
          style={{
            background: "linear-gradient(135deg, #1890ff, #722ed1)",
            border: "none",
            borderRadius: 12,
            height: 48,
            paddingLeft: 24,
            paddingRight: 24,
            fontSize: 16,
            fontWeight: 600,
            marginTop: 16,
          }}
        >
          Buat Sesi Pembelajaran
        </Button>
      </Empty>
    </Card>
  );
};

export default SessionsEmptyState;
