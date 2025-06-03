// frontendpramlearn/src/hooks/useSubjectForm.jsx
import { useState, useContext, useEffect } from "react";
import api from "../../../api";
import { AuthContext } from "../../../context/AuthContext";

const useSubjectForm = (subjectId, onSuccess) => {
  const { token } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    name: "",
    teacher: "",
    class_id: "",
  });
  const [message, setMessage] = useState("");
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const response = await api.get("teachers/");
        setTeachers(response.data);
      } catch (error) {
        console.error("Error fetching teachers:", error);
      }
    };

    const fetchClasses = async () => {
      try {
        const response = await api.get("classes/");
        setClasses(response.data);
      } catch (error) {
        console.error("Error fetching classes:", error);
      }
    };

    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      fetchTeachers();
      fetchClasses();
    }

    if (subjectId) {
      const fetchSubject = async () => {
        try {
          const response = await api.get(`subjects/${subjectId}/`);
          setFormData({
            name: response.data.name,
            teacher: response.data.teacher,
            class_id: response.data.class_id,
          });
        } catch (error) {
          console.error("Error fetching subject:", error);
        }
      };

      fetchSubject();
    }
  }, [token, subjectId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      if (subjectId) {
        await api.put(`subjects/${subjectId}/`, formData);
        setMessage("Subject updated successfully!");
      } else {
        const { subject_id, ...dataToSubmit } = formData; // Hapus subject_id dari formData
        await api.post("subjects/", dataToSubmit);
        setMessage("Subject created successfully!");
      }
      onSuccess();
    } catch (error) {
      console.error("Error saving subject:", error);
      setMessage("Error saving subject.");
    }
  };

  return {
    formData,
    message,
    handleChange,
    handleSubmit,
    teachers,
    classes,
  };
};

export default useSubjectForm;
