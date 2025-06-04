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

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Check if user role is allowed
  if (!allowedRoles.includes(user.role)) {
    // Redirect ke halaman yang sesuai dengan role user
    const getRolePath = (roleId) => {
      switch (roleId) {
        case 1:
          return "/admin";
        case 2:
          return "/teacher";
        case 3:
          return "/student";
        default:
          return "/login";
      }
    };

    return <Navigate to={getRolePath(user.role)} replace />;
  }

  return children;
};

export default PrivateRoute;
