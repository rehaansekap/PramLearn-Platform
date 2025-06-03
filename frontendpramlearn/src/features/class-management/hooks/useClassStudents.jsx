import { useState, useEffect, useContext } from "react";
import api from "../../../api";
import { AuthContext } from "../../../context/AuthContext";

const useClassStudents = (classId) => {
  const { token } = useContext(AuthContext);
  const [classStudents, setClassStudents] = useState([]);
  const [studentDetails, setStudentDetails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!classId) {
      console.log("useClassStudents: classId belum ada");
      return;
    }

    const fetchClassStudents = async () => {
      setLoading(true);
      try {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        // GUNAKAN ENDPOINT BARU yang sudah include profil motivasi
        const response = await api.get(
          `class-students/${classId}/with-profile/`
        );

        console.log("Class students with profile:", response.data);

        // Data response sudah langsung berisi profil motivasi
        setStudentDetails(response.data);
        setClassStudents(response.data);
        setError(null);
      } catch (error) {
        console.error("Error fetching class students with profile:", error);
        setError(error);
        setClassStudents([]);
        setStudentDetails([]);
      } finally {
        setLoading(false);
      }
    };

    fetchClassStudents();
  }, [token, classId]);

  const deleteStudent = async (studentId) => {
    try {
      if (token) {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        await api.delete(`class-students/${classId}/${studentId}/`);
        setClassStudents((prevStudents) => {
          if (Array.isArray(prevStudents)) {
            return prevStudents.filter((student) => student.id !== studentId);
          }
          return [];
        });
        setStudentDetails((prevDetails) => {
          if (Array.isArray(prevDetails)) {
            return prevDetails.filter((student) => student.id !== studentId);
          }
          return [];
        });
      }
    } catch (error) {
      console.error("Error deleting student:", error);
    }
  };

  return { classStudents, loading, error, deleteStudent, studentDetails };
};

export default useClassStudents;
