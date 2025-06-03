import { useState, useEffect, useContext } from "react";
import api from "../../../api";
import { AuthContext } from "../../../context/AuthContext";

const useMaterialData = (materialSlug) => {
  const [materialId, setMaterialId] = useState(null);
  const [materialDetail, setMaterialDetail] = useState(null);
  const [classId, setClassId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useContext(AuthContext);

  useEffect(() => {
    const fetchMaterialAndClass = async () => {
      if (!materialSlug) {
        console.log("No materialSlug provided to useMaterialData hook");
        return;
      }

      setLoading(true);
      try {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        const response = await api.get(`materials/?slug=${materialSlug}`);
        const filteredMaterial = response.data.find(
          (material) => material.slug === materialSlug
        );

        if (filteredMaterial) {
          setMaterialId(filteredMaterial.id);
          setMaterialDetail(filteredMaterial);

          if (filteredMaterial.subject) {
            const subjectRes = await api.get(
              `subjects/${filteredMaterial.subject}/`
            );
            setClassId(subjectRes.data.class_id);
          } else {
            console.warn("Material has no subject");
          }
        } else {
          console.error(`No material found with slug: ${materialSlug}`);
        }
        setError(null);
      } catch (error) {
        console.error("Error in useMaterialData:", error);
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    if (materialSlug && token) {
      fetchMaterialAndClass();
    }
  }, [materialSlug, token]);

  return { materialId, materialDetail, classId, loading, error };
};

export default useMaterialData;
