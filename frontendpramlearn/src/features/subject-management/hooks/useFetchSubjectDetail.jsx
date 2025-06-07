import { useState, useEffect, useContext } from "react";
import api from "../../../api";
import { AuthContext } from "../../../context/AuthContext";

const useFetchSubjectDetail = (subjectId) => {
  const { token } = useContext(AuthContext);
  const [subjectDetail, setSubjectDetail] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false); // Tambahkan loading state
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [updatedData, setUpdatedData] = useState({
    title: "",
    content: "",
    video_url: "",
    file: null,
  });

  const refetchSubjectDetail = async () => {
    if (!subjectId) return;

    setLoading(true);
    try {
      if (token) {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        const response = await api.get(`subjects/${subjectId}/`);
        setSubjectDetail(response.data);
        setError(null);
      }
    } catch (error) {
      console.error("Error fetching subject detail:", error);
      setError(error);
      setSubjectDetail(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refetchSubjectDetail();
  }, [subjectId, token]);

  const deleteMaterial = async (materialId) => {
    try {
      if (token) {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        await api.delete(`materials/${materialId}/`);
        // Refresh data setelah delete
        await refetchSubjectDetail();
      }
    } catch (error) {
      setError(error);
      throw error; // Re-throw error untuk handling di component
    }
  };

  const updateMaterial = async (materialId, updatedData) => {
    try {
      if (token) {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        const response = await api.put(`materials/${materialId}/`, updatedData);
        // Refresh data setelah update
        await refetchSubjectDetail();
      }
    } catch (error) {
      setError(error);
      throw error; // Re-throw error untuk handling di component
    }
  };

  const handleUpdateChange = (e, isFile = false) => {
    const { name, value, files } = e.target;
    setUpdatedData((prevData) => ({
      ...prevData,
      [name]: isFile ? files[0] : value,
    }));
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    const formDataToSend = new FormData();
    for (const key in updatedData) {
      formDataToSend.append(key, updatedData[key]);
    }
    formDataToSend.append("subject", subjectId);

    try {
      const response = await api.put(
        `materials/${editingMaterial.id}/`,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      await refetchSubjectDetail();
      setEditingMaterial(null);
      setUpdatedData({ title: "", content: "", video_url: "", file: null });
    } catch (error) {
      setError(error);
      throw error;
    }
  };

  return {
    subjectDetail,
    error,
    loading, // Export loading state
    deleteMaterial,
    updateMaterial,
    editingMaterial,
    setEditingMaterial,
    updatedData,
    handleUpdateChange,
    handleUpdateSubmit,
    setUpdatedData,
    fetchSubjectDetail: refetchSubjectDetail,
  };
};

export default useFetchSubjectDetail;
