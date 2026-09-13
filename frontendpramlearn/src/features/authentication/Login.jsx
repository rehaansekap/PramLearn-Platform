import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import LoginForm from "./components/LoginForm";
import { message } from "antd";

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const onFinish = async (values) => {
    setLoading(true);
    setError(null);

    try {
      const userData = await login(values.username, values.password);
      message.success("Login berhasil! Selamat datang di PramLearn");

      // Redirect berdasarkan role
      const roleId = userData?.role || (userData?.is_superuser || userData?.is_staff ? 1 : 1);
      if (roleId === 3) {
        navigate("/student", { replace: true });
      } else if (roleId === 2) {
        navigate("/teacher", { replace: true });
      } else {
        navigate("/admin", { replace: true });
      }
    } catch (error) {
      console.error("Login error:", error);
      const errorMessage =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        "Username atau password salah";
      setError(errorMessage);
      message.error(`Login gagal: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return <LoginForm onFinish={onFinish} loading={loading} error={error} />;
};

export default Login;
