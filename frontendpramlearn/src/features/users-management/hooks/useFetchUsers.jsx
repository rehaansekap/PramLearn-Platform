import { useState, useEffect, useContext } from "react";
import api from "../../../api";
import { AuthContext } from "../../../context/AuthContext";

const useFetchUsers = () => {
  const { token, user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        if (token && user?.role !== 2) {
          api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
          const response = await api.get("users/");
          setUsers(response.data);
        }
      } catch (error) {
        setError(error);
      }
    };

    fetchUsers();
  }, [token, user]);

  const deleteUser = async (userId) => {
    try {
      if (token && user?.role !== 2) {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        await api.delete(`users/${userId}/`);
        setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
      }
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  return { users, error, setUsers, deleteUser };
};

export default useFetchUsers;
