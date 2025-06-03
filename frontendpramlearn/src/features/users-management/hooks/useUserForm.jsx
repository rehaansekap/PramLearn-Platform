import { useState, useEffect, useContext } from "react";
import api from "../../../api";
import { AuthContext } from "../../../context/AuthContext";

const useUserForm = (userId, onSuccess) => {
  const { token } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    username: "",
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    role: "",
    class_ids: [],
    isStaff: false,
    isSuperuser: false,
    isActive: true,
  });
  const [roles, setRoles] = useState([]);
  const [classes, setClasses] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false); // Loading untuk submit
  const [initialLoading, setInitialLoading] = useState(false); // Loading untuk fetch data awal
  const [rolesLoading, setRolesLoading] = useState(false); // Loading untuk roles
  const [classesLoading, setClassesLoading] = useState(false); // Loading untuk classes

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setRolesLoading(true);
        const response = await api.get("roles/");
        setRoles(response.data);
      } catch (error) {
        console.error("Error fetching roles:", error);
      } finally {
        setRolesLoading(false);
      }
    };

    const fetchClasses = async () => {
      try {
        setClassesLoading(true);
        const response = await api.get("classes/");
        setClasses(response.data);
      } catch (error) {
        console.error("Error fetching classes:", error);
      } finally {
        setClassesLoading(false);
      }
    };

    const fetchUser = async () => {
      try {
        setInitialLoading(true);
        const response = await api.get(`users/${userId}/`);
        const user = response.data;
        setFormData({
          username: user.username,
          first_name: user.first_name || "",
          last_name: user.last_name || "",
          email: user.email,
          password: "",
          role: user.role,
          class_ids: user.class_ids || [],
          subject_ids: user.subject_ids || [],
          isStaff: user.is_staff,
          isSuperuser: user.is_superuser,
          isActive: user.is_active,
        });
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setInitialLoading(false);
      }
    };

    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      fetchRoles();
      fetchClasses();
      if (userId) {
        fetchUser();
      }
    }
  }, [token, userId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Map frontend camelCase to backend snake_case
      const payload = {
        ...formData,
        is_active: true,
        is_staff: formData.isStaff,
        is_superuser: formData.isSuperuser,
      };
      delete payload.isActive;
      delete payload.isStaff;
      delete payload.isSuperuser;

      if (userId) {
        await api.put(`users/${userId}/`, payload);
        setMessage("User updated successfully!");

        const STUDENT_ROLE_ID = 3;
        if (
          Number(payload.role) === STUDENT_ROLE_ID &&
          Array.isArray(payload.class_ids) &&
          payload.class_ids.length
        ) {
          // Hapus semua relasi kelas lama user ini
          await api.delete(`class-students/user/${userId}/`);
          // Tambahkan relasi baru
          for (const classId of payload.class_ids) {
            await api.post("class-students/", {
              class_id: classId,
              student: userId,
            });
          }
        }
      } else {
        const res = await api.post("users/", payload);
        setMessage("User created successfully!");
        const createdUser = res.data;

        const STUDENT_ROLE_ID = 3;
        if (
          Number(payload.role) === STUDENT_ROLE_ID &&
          Array.isArray(payload.class_ids) &&
          payload.class_ids.length
        ) {
          for (const classId of payload.class_ids) {
            await api.post("class-students/", {
              class_id: classId,
              student: createdUser.id,
            });
          }
        }
      }
      onSuccess();
      resetForm();
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      username: "",
      first_name: "",
      last_name: "",
      email: "",
      password: "",
      role: "",
      class_ids: [],
      isStaff: false,
      isSuperuser: false,
      isActive: true,
    });
  };

  return {
    formData,
    roles,
    classes,
    message,
    handleChange,
    handleSubmit,
    resetForm,
    loading,
    initialLoading,
    rolesLoading,
    classesLoading,
  };
};

export default useUserForm;
