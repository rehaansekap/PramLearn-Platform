// frontendpramlearn/src/pages/Login.jsx
import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import LoginForm from "./components/LoginForm";
import { Grid } from "@mui/material";

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    await login(values.username, values.password);
    navigate("/");
  };

  return (
    <Grid
      container
      justifyContent="center"
      alignItems="center"
      style={{ height: "100vh", backgroundColor: "#f0f2f5" }}
    >
      <Grid item>
        <LoginForm onFinish={onFinish} />
      </Grid>
    </Grid>
  );
};

export default Login;
