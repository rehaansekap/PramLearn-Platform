// frontendpramlearn/src/hooks/useClassForm.jsx
import { useState, useEffect, useContext, useRef } from "react";
import api from "../../../api";
import { AuthContext } from "../../../context/AuthContext";
import useStudents from "./useStudents";

const useClassForm = (classId, onSuccess) => {
  const { token } = useContext(AuthContext);
  const [formData, setFormData] = useState({ name: "", students: [] });
  const [message, setMessage] = useState("");
  const [students, setStudents] = useState([]);
  const [removedStudents, setRemovedStudents] = useState([]);
  const removedStudentsRef = useRef([]); // State untuk siswa yang dihapus
  const { students: allStudents } = useStudents();

  useEffect(() => {
    removedStudentsRef.current = removedStudents;
  }, [removedStudents]);

  useEffect(() => {
    const fetchClass = async () => {
      try {
        if (classId) {
          const response = await api.get(`classes/${classId}/`);
          const students = (response.data.students || []).map((stu) => ({
            student: stu.id, // id user/student
            id: stu.classstudent_id || null, // id relasi classstudent
            username: stu.username,
          }));
          console.log("Fetched students for class:", students);
          setFormData({
            name: response.data.name,
            students,
          });
          setStudents(students);
          setRemovedStudents([]);
        }
      } catch (error) {
        console.error("Error fetching class:", error);
      }
    };

    if (classId) {
      fetchClass();
    }
  }, [classId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleAddStudent = () => {
    setFormData((prevData) => ({
      ...prevData,
      students: [...prevData.students, { student: "", id: null }],
    }));
  };

  const handleRemoveStudent = (index) => {
    const studentToRemove = formData.students[index];
    if (studentToRemove.id) {
      setRemovedStudents((prevRemoved) => {
        const updated = [...prevRemoved, studentToRemove];
        // ref juga diupdate di useEffect di atas
        console.log("RemovedStudents after remove:", updated);
        return updated;
      });
      console.log("Student to remove (will DELETE):", studentToRemove);
    }
    setFormData((prevData) => {
      const newStudents = [...prevData.students];
      newStudents.splice(index, 1);
      return {
        ...prevData,
        students: newStudents,
      };
    });
  };

  const handleStudentChange = (index, e) => {
    const { name, value } = e.target;
    setFormData((prevData) => {
      const newStudents = [...prevData.students];
      newStudents[index][name] = value;
      return {
        ...prevData,
        students: newStudents,
      };
    });
  };

  // ...existing code...
  const handleSubmit = async (e) => {
    try {
      let response;
      if (classId) {
        response = await api.put(`classes/${classId}/`, formData);
        setMessage("Class updated successfully!");
      } else {
        response = await api.post("classes/", formData);
        setMessage("Class created successfully!");
        setFormData({
          ...response.data,
          students: response.data.students || [],
        });
      }

      // Ambil daftar student yang sudah ada di kelas ini (dari students state)
      const existingStudentIds = students.map((s) => s.student);

      // Add new students to class (hanya yang belum ada di kelas ini)
      const newStudents = formData.students.filter(
        (student) =>
          !student.id && // belum punya id relasi classstudent
          student.student && // sudah dipilih
          !existingStudentIds.includes(Number(student.student)) // belum ada di kelas ini
      );
      for (const student of newStudents) {
        try {
          const payload = {
            class_id: response.data.id,
            student: parseInt(student.student, 10),
          };
          await api.post("class-students/", payload);
        } catch (error) {
          if (
            error.response?.data?.non_field_errors &&
            error.response.data.non_field_errors[0].includes(
              "already enrolled in another class"
            )
          ) {
            setMessage(
              `Student dengan ID ${student.student} sudah terdaftar di kelas lain.`
            );
          } else {
            setMessage(
              error.response?.data?.non_field_errors?.[0] ||
                error.response?.data?.detail ||
                "Error adding student."
            );
          }
          throw error;
        }
      }

      // Remove students that were deleted from the class
      console.log(
        "Removed students before delete:",
        removedStudentsRef.current
      );
      await Promise.all(
        removedStudentsRef.current
          .filter((student) => student.id)
          .map(async (student) => {
            try {
              console.log("Deleting student:", student);
              await api.delete(
                `class-students/class/${classId}/student/${student.student}/`
              );
            } catch (error) {
              setMessage(
                `Error removing student ${student.id}: ${error.response?.data?.detail}`
              );
            }
          })
      );

      onSuccess();
    } catch (error) {
      // Error sudah ditangani di atas
    }
  };
  // ...existing code...

  return {
    formData,
    message,
    handleChange,
    handleSubmit,
    handleAddStudent,
    handleRemoveStudent,
    handleStudentChange,
    setFormData,
    setStudents,
  };
};

export default useClassForm;
