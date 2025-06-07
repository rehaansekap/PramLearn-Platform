// frontendpramlearn/src/hooks/useAvailableStudents.jsx
import { useState, useEffect, useContext } from "react";
import api from "../../../api";
import { AuthContext } from "../../../context/AuthContext";

const useAvailableStudents = () => {
  const { token } = useContext(AuthContext);
  const [availableStudents, setAvailableStudents] = useState([]);

  useEffect(() => {
    const fetchAvailableStudents = async () => {
      try {
        if (token) {
          api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
          const response = await api.get("available-students/");
          setAvailableStudents(response.data);
        }
      } catch (error) {
        console.error("Error fetching available students:", error);
      }
    };

    fetchAvailableStudents();
  }, [token]);

  return { availableStudents };
};

export default useAvailableStudents;
