import React, { useContext } from "react";
import { AuthContext } from "../../../context/AuthContext";
import { Navigate, useLocation } from "react-router-dom";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

const PrivateRoute = ({ children, allowedRoles = [1, 2] }) => {
  const { user, token, loading } = useContext(AuthContext);
  const location = useLocation();

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

  if (loading) {
    return null; // Atau tampilkan loading spinner
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    switch (user.role) {
      case 1:
        return <Navigate to="/admin" replace />;
      case 2:
        return <Navigate to="/teacher" replace />;
      case 3:
        return <Navigate to="/student" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  }

  return children;
};

export default PrivateRoute;
