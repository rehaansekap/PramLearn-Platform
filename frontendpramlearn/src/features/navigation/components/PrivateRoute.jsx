import React, { useContext } from "react";
import { AuthContext } from "../../../context/AuthContext";
import { Navigate } from "react-router-dom";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

const PrivateRoute = ({ children }) => {
  const { user, token, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "#f5f5f5",
        }}
      >
        <Spin
          indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}
          tip="Memverifikasi akses..."
        />
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Hanya izinkan admin/teacher (role 1/2)
  if (user.role !== 1 && user.role !== 2) {
    return <Navigate to="/student" replace />;
  }

  return children;
};

export default PrivateRoute;
