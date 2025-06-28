import React from "react";
import { Spin } from "antd";

const ARCSSubmissionLoading = () => {
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

export default ARCSSubmissionLoading;
