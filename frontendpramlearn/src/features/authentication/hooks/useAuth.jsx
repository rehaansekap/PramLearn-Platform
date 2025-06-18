import { useState, useEffect } from "react";
import api from "../../../api";

const useAuth = () => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [error, setError] = useState(null);

  useEffect(() => {
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
  }, [token]);

  const login = async (username, password) => {
    try {
      const response = await api.post("login/", { username, password });
      setToken(response.data.access);
      localStorage.setItem("token", response.data.access);
      api.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${response.data.access}`;
    } catch (err) {
      setError(err.response.data.detail);
    }
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem("token");
    delete api.defaults.headers.common["Authorization"];
  };

  return { token, error, login, logout };
};

export default useAuth;
