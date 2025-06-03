// frontendpramlearn/src/hooks/useFetchSubjectDetail.jsx
import { useState, useEffect, useContext } from "react";
import api from "../../../api";
import { AuthContext } from "../../../context/AuthContext";

const useFetchSubjectDetail = (subjectId) => {
  const { token } = useContext(AuthContext);
  const [subjectDetail, setSubjectDetail] = useState(null);
  const [error, setError] = useState(null);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [updatedData, setUpdatedData] = useState({
    title: "",
    content: "",
    video_url: "",
    file: null,
  });

  useEffect(() => {
    const fetchSubjectDetail = async () => {
      try {
        if (token) {
          api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
          const response = await api.get(`subjects/${subjectId}/`);
          setSubjectDetail(response.data);
        }
      } catch (error) {
        setError(error);
      }
    };

    if (subjectId) {
      fetchSubjectDetail();
    }
  }, [token, subjectId]);

  const deleteMaterial = async (materialId) => {
    try {
      if (token) {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        await api.delete(`materials/${materialId}/`);
        setSubjectDetail((prevDetail) => ({
          ...prevDetail,
          materials: prevDetail.materials.filter(
            (material) => material.id !== materialId
          ),
        }));
      }
    } catch (error) {
      setError(error);
    }
  };

  const updateMaterial = async (materialId, updatedData) => {
    try {
      if (token) {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        const response = await api.put(`materials/${materialId}/`, updatedData);
        setSubjectDetail((prevDetail) => ({
          ...prevDetail,
          materials: prevDetail.materials.map((material) =>
            material.id === materialId ? response.data : material
          ),
        }));
      }
    } catch (error) {
      setError(error);
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
    formDataToSend.append("subject", subjectId); // Tambahkan subjectId ke formData

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
      setSubjectDetail((prevDetail) => ({
        ...prevDetail,
        materials: prevDetail.materials.map((material) =>
          material.id === editingMaterial.id ? response.data : material
        ),
      }));
      setEditingMaterial(null);
      setUpdatedData({ title: "", content: "", video_url: "", file: null });
    } catch (error) {
      setError(error);
    }
  };

  return {
    subjectDetail,
    error,
    deleteMaterial,
    updateMaterial,
    editingMaterial,
    setEditingMaterial,
    updatedData,
    handleUpdateChange,
    handleUpdateSubmit,
    setUpdatedData, // Pastikan setUpdatedData didefinisikan
  };
};

export default useFetchSubjectDetail;
