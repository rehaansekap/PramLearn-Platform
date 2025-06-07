import { useState, useEffect, useContext } from "react";
import api from "../api";
import { AuthContext } from "../context/AuthContext";

const useFetchRoles = () => {
  const { token } = useContext(AuthContext);
  const [roles, setRoles] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        if (token) {
          api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
          const response = await api.get("roles/");
          setRoles(response.data);
        }
      } catch (error) {
        setError(error);
      }
    };

    fetchRoles();
  }, [token]);

  return { roles, error };
};

export default useFetchRoles;