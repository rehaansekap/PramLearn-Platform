import React from "react";
import { Empty, Typography } from "antd";

const { Text } = Typography;

const ARCSEmptyState = () => {
  return (
    <div style={{ textAlign: "center", padding: "60px 24px" }}>
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={
          <div>
            <Text style={{ fontSize: 16, color: "#666" }}>
              Tidak ada kuesioner ARCS untuk materi ini
            </Text>
            <div style={{ marginTop: 12 }}>
              <Text type="secondary" style={{ fontSize: 14 }}>
                Kuesioner akan tersedia setelah ditambahkan oleh guru
              </Text>
            </div>
          </div>
        }
      />
    </div>
  );
};

export default ARCSEmptyState;
