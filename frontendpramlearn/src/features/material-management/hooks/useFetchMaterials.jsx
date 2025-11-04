// frontendpramlearn/src/hooks/useFetchMaterials.jsx
import { useState, useEffect, useContext } from "react";
import api from "../../../api";
import { AuthContext } from "../../../context/AuthContext";

const useFetchMaterials = (subjectId) => {
  const { token } = useContext(AuthContext);
  const [materials, setMaterials] = useState([]);
  const [error, setError] = useState(null);

  const fetchMaterials = async () => {
    try {
      if (token) {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        const response = await api.get(`subjects/${subjectId}/materials/`);
        setMaterials(response.data);
      }
    } catch (error) {
      setError(error);
    }
  };

  const deleteMaterial = async (materialId) => {
    try {
      if (token) {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        await api.delete(`materials/${materialId}/`);
        setMaterials((prevMaterials) =>
          prevMaterials.filter((material) => material.id !== materialId)
        );
      }
    } catch (error) {
      setError(error);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, [subjectId]);

  return { materials, deleteMaterial, fetchMaterials, error };
};

export default useFetchMaterials;
