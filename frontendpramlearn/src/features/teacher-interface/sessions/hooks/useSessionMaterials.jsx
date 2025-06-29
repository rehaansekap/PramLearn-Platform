import { useState, useEffect, useContext } from "react";
import api from "../../../../api";
import { AuthContext } from "../../../../context/AuthContext";

const useSessionMaterials = (subjectId) => {
  const { user, token } = useContext(AuthContext);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMaterials = async () => {
    if (!user || !token || user.role !== 2 || !subjectId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      const response = await api.get(`subjects/${subjectId}/`);
      setMaterials(response.data.materials || []);
      setError(null);
    } catch (err) {
      setError(err);
      console.error("Error fetching materials:", err);
    } finally {
      setLoading(false);
    }
  };

  const deleteMaterial = async (materialId) => {
    try {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      await api.delete(`materials/${materialId}/`);
      await fetchMaterials(); // Refresh data
    } catch (error) {
      throw error;
    }
  };

  const bulkDeleteMaterials = async (materialIds) => {
    try {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      // Delete materials one by one
      for (const materialId of materialIds) {
        await api.delete(`materials/${materialId}/`);
      }

      await fetchMaterials(); // Refresh data
    } catch (error) {
      throw error;
    }
  };

  useEffect(() => {
    if (subjectId) {
      fetchMaterials();
    }
  }, [user, token, subjectId]);

  return {
    materials,
    loading,
    error,
    fetchMaterials,
    deleteMaterial,
    bulkDeleteMaterials,
  };
};

export default useSessionMaterials;
