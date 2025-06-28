import React from "react";
import { Spin } from "antd";

const ARCSResultsLoading = () => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "60vh",
      }}
    >
      <Spin size="large" tip="Memuat hasil kuesioner ARCS..." />
    </div>
  );
};

export default ARCSResultsLoading;
