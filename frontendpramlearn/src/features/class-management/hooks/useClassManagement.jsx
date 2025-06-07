// frontendpramlearn/src/hooks/useClassManagement.jsx
import { useState, useContext } from "react";
import api from "../../../api";
import { AuthContext } from "../../../context/AuthContext";

const useClassManagement = () => {
  const { token } = useContext(AuthContext);
  const [message, setMessage] = useState("");

  const saveClass = async (classId, formData) => {
    try {
      if (classId) {
        await api.put(`classes/${classId}/`, formData);
        setMessage("Class updated successfully!");
      } else {
        await api.post("classes/", formData);
        setMessage("Class created successfully!");
      }
    } catch (error) {
      console.error("Error saving class:", error);
      setMessage("Error saving class.");
    }
  };

  const deleteClass = async (classId) => {
    try {
      if (token) {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        await api.delete(`classes/${classId}/`);
        return true;
      }
    } catch (error) {
      console.error("Error deleting class:", error);
      return false;
    }
  };

  return { saveClass, deleteClass, message };
};

export default useClassManagement;
