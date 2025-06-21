import React from "react";
import { Spin } from "antd";

const AssignmentLoadingState = () => {
  return (
    <div style={{ textAlign: "center", padding: "60px 24px" }}>
      <Spin size="large" tip="Memuat assignment..." />
    </div>
  );
};

export default AssignmentLoadingState;
