// frontendpramlearn/src/hooks/useAvailableAndRelatedStudents.jsx
import { useState, useEffect, useContext } from "react";
import api from "../../../api";
import { AuthContext } from "../../../context/AuthContext";

const useAvailableAndRelatedStudents = (classId) => {
  const { token } = useContext(AuthContext);
  const [availableAndRelatedStudents, setAvailableAndRelatedStudents] =
    useState([]);

  useEffect(() => {
    const fetchAvailableAndRelatedStudents = async () => {
      try {
        if (token) {
          api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
          const response = await api.get(
            `available-and-related-students/${classId}/`
          );
          setAvailableAndRelatedStudents(response.data);
        }
      } catch (error) {
        console.error("Error fetching available and related students:", error);
      }
    };

    if (classId) {
      fetchAvailableAndRelatedStudents();
    }
  }, [token, classId]);

  return { availableAndRelatedStudents };
};

export default useAvailableAndRelatedStudents;
