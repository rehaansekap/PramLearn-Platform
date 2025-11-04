import { useState, useEffect, useContext } from "react";
import api from "../../../api";
import { AuthContext } from "../../../context/AuthContext";

const useFetchClassDetail = (classId) => {
  const { token } = useContext(AuthContext);
  const [classDetail, setClassDetail] = useState(null);
  const [error, setError] = useState(null);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [updatedData, setUpdatedData] = useState({ title: "", content: "" });

  useEffect(() => {
    const fetchClassDetail = async () => {
      try {
        if (token) {
          api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
          const response = await api.get(`classes/${classId}/`);
          setClassDetail(response.data);
        }
      } catch (error) {
        setError(error);
      }
    };

    if (classId) {
      fetchClassDetail();
    }
  }, [token, classId]);

  const deleteMaterial = async (materialId) => {
    try {
      if (token) {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        await api.delete(`materials/${materialId}/`);
        setClassDetail({
          ...classDetail,
          materials: classDetail.materials.filter(
            (material) => material.id !== materialId
          ),
        });
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
        setClassDetail({
          ...classDetail,
          materials: classDetail.materials.map((material) =>
            material.id === materialId ? response.data : material
          ),
        });
      }
    } catch (error) {
      setError(error);
    }
  };

  const handleUpdateChange = (e) => {
    const { name, value } = e.target;
    setUpdatedData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleUpdateSubmit = (e) => {
    e.preventDefault();
    updateMaterial(editingMaterial.id, updatedData);
    setEditingMaterial(null);
    setUpdatedData({ title: "", content: "" });
  };

  return {
    classDetail,
    error,
    deleteMaterial,
    updateMaterial,
    editingMaterial,
    setEditingMaterial,
    updatedData,
    handleUpdateChange,
    handleUpdateSubmit,
    setClassDetail,
  };
};

export default useFetchClassDetail;
