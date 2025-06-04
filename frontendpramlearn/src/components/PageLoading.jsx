import React from "react";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

const PageLoading = ({ message = "Memuat data..." }) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        padding: "40px 20px",
      }}
    >
      <div
        style={{
          position: "relative",
          marginBottom: 24,
        }}
      >
        <div
          style={{
            width: 60,
            height: 60,
            border: "3px solid #f0f0f0",
            borderTop: "3px solid #11418b",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 24,
            height: 24,
            background: "#11418b",
            borderRadius: "50%",
            animation: "pulse 2s ease-in-out infinite",
          }}
        />
      </div>

      <p
        style={{
          color: "#666",
          fontSize: 16,
          fontWeight: 500,
          margin: 0,
          textAlign: "center",
        }}
      >
        {message}
      </p>
    </div>
  );
};

export default PageLoading;
