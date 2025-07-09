import React from "react";
import { Empty, Typography } from "antd";

const { Text } = Typography;

const VideoEmptyState = () => {
  return (
    <div style={{ textAlign: "center", padding: "60px 24px" }}>
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={
          <div>
            <Text style={{ fontSize: 16, color: "#666" }}>
              Tidak ada video tersedia
            </Text>
            <div style={{ marginTop: 12 }}>
              <Text type="secondary" style={{ fontSize: 14 }}>
                Video pembelajaran akan tersedia setelah ditambahkan oleh guru
              </Text>
            </div>
          </div>
        }
      />
    </div>
  );
};

export default VideoEmptyState;