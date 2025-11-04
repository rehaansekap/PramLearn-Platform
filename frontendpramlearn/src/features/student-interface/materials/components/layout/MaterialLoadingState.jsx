import React from "react";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

const MaterialLoadingState = () => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "60vh",
      }}
    >
      <Spin
        indicator={<LoadingOutlined style={{ fontSize: 32 }} spin />}
        tip="Memuat materi pembelajaran..."
      />
    </div>
  );
};

export default MaterialLoadingState;
