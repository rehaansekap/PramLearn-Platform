// frontendpramlearn/src/hooks/useFetchSubjects.jsx
import { useState, useEffect, useContext } from "react";
import api from "../../../api";
import { AuthContext } from "../../../context/AuthContext";

const useFetchSubjects = (classId) => {
  const { token } = useContext(AuthContext);
  const [subjects, setSubjects] = useState([]);
  const [error, setError] = useState(null);

  const fetchSubjects = async () => {
    try {
      if (token) {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        const response = await api.get(`subjects/?class_id=${classId}`);
        setSubjects(response.data);
      }
    } catch (error) {
      setError(error);
    }
  };

  const deleteSubject = async (subjectId) => {
    try {
      if (token) {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        await api.delete(`subjects/${subjectId}/`);
        setSubjects((prevSubjects) =>
          prevSubjects.filter((subject) => subject.id !== subjectId)
        );
      }
    } catch (error) {
      setError(error);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, [classId]);

  return { subjects, deleteSubject, fetchSubjects, error };
};

export default useFetchSubjects;
