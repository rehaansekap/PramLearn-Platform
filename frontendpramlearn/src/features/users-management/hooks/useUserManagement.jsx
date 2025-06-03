import { useState, useEffect, useCallback, useContext } from "react";
import api from "../../../api";
import { AuthContext } from "../../../context/AuthContext";
import { useRef } from "react";

const useUserManagement = () => {
  const { user, token } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [classes, setClasses] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false); // Loading untuk users
  const [rolesLoading, setRolesLoading] = useState(false); // Loading untuk roles
  const [classesLoading, setClassesLoading] = useState(false); // Loading untuk classes
  const didFetch = useRef(false);

  const fetchClasses = useCallback(async () => {
    try {
      if (user?.role !== 2 && token) {
        setClassesLoading(true);
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        const response = await api.get("classes/");
        setClasses(response.data);
      }
    } catch (error) {
      setError(error);
    } finally {
      setClassesLoading(false);
    }
  }, [user, token]);

  const fetchUsers = useCallback(async () => {
    try {
      if (token) {
        setLoading(true);
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        let response;
        if (user?.role === 2) {
          response = await api.get("teacher/related-users/");
          setUsers(response.data.users || response.data);
          setClasses(response.data.classes || []);
        } else {
          response = await api.get("users/");
          setUsers(response.data);
        }
      }
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  }, [user, token]);

  const fetchRoles = useCallback(async () => {
    try {
      if (token) {
        setRolesLoading(true);
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        const response = await api.get("roles/");
        setRoles(response.data);
      }
    } catch (error) {
      setError(error);
    } finally {
      setRolesLoading(false);
    }
  }, [token]);

  const deleteUser = async (userId) => {
    try {
      await api.delete(`users/${userId}/`);
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
    } catch (error) {
      setError(error);
    }
  };

  useEffect(() => {
    if (user && token && !didFetch.current) {
      didFetch.current = true;
      fetchUsers();
      fetchRoles();
      if (user.role !== 2) {
        fetchClasses();
      }
    }
  }, [user, token]);

  return { 
    users, 
    roles, 
    classes, 
    deleteUser, 
    fetchUsers, 
    error,
    loading,
    rolesLoading,
    classesLoading
  };
};

export default useUserManagement;