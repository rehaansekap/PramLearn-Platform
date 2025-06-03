import React from "react";
import {
  TextField,
  Button,
  Card,
  CardContent,
  Typography,
} from "@mui/material";
import { useForm } from "react-hook-form";

const LoginForm = ({ onFinish }) => {
  const { register, handleSubmit } = useForm();

  return (
    <Card sx={{ maxWidth: 400, margin: "0 auto" }}>
      <CardContent>
        <Typography variant="h5" component="div" gutterBottom>
          Login
        </Typography>
        <form onSubmit={handleSubmit(onFinish)}>
          <TextField
            label="Username"
            variant="outlined"
            fullWidth
            margin="normal"
            {...register("username", { required: true })}
          />
          <TextField
            label="Password"
            type="password"
            variant="outlined"
            fullWidth
            margin="normal"
            {...register("password", { required: true })}
          />
          <Button type="submit" variant="contained" color="primary" fullWidth>
            Login
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default LoginForm;
