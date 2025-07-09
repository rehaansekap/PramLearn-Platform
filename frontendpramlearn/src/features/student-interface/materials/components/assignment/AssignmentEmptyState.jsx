import React from "react";
import { Empty, Typography } from "antd";

const { Text } = Typography;

const AssignmentEmptyState = () => {
  return (
    <div style={{ textAlign: "center", padding: "60px 24px" }}>
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={
          <div>
            <Text style={{ fontSize: 16, color: "#666" }}>
              Tidak ada assignment untuk materi ini
            </Text>
            <div style={{ marginTop: 12 }}>
              <Text type="secondary" style={{ fontSize: 14 }}>
                Assignment akan tersedia setelah ditambahkan oleh guru
              </Text>
            </div>
          </div>
        }
      />
    </div>
  );
};

export default AssignmentEmptyState;
