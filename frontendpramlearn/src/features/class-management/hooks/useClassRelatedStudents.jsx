// frontendpramlearn/src/hooks/useClassRelatedStudents.jsx
import { useState, useEffect, useContext } from "react";
import api from "../../../api";
import { AuthContext } from "../../../context/AuthContext";

const useClassRelatedStudents = (classId) => {
  const { token } = useContext(AuthContext);
  const [classRelatedStudents, setClassRelatedStudents] = useState([]);

  useEffect(() => {
    const fetchClassRelatedStudents = async () => {
      try {
        if (token) {
          api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
          const response = await api.get(`class-related-students/${classId}/`);
          setClassRelatedStudents(response.data);
        }
      } catch (error) {
        console.error("Error fetching class related students:", error);
      }
    };

    if (classId) {
      fetchClassRelatedStudents();
    }
  }, [token, classId]);

  return { classRelatedStudents };
};

export default useClassRelatedStudents;