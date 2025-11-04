import React from "react";
import { Spin } from "antd";

const QuizLoadingState = () => {
  return (
    <div style={{ textAlign: "center", padding: "60px 24px" }}>
      <Spin size="large" tip="Memuat quiz..." />
    </div>
  );
};

export default QuizLoadingState;
