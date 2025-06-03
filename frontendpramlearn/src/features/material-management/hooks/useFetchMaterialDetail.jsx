import { useState, useEffect, useContext } from "react";
import api from "../../../api";
import { AuthContext } from "../../../context/AuthContext";

const useFetchMaterialDetail = (materialId) => {
  const { token } = useContext(AuthContext);
  const [materialDetail, setMaterialDetail] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMaterialDetail = async () => {
      try {
        if (token) {
          api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
          const response = await api.get(`materials/${materialId}/`);
          setMaterialDetail(response.data);
        }
      } catch (error) {
        setError(error);
      }
    };

    if (materialId) {
      fetchMaterialDetail();
    }
  }, [token, materialId]);

  return { materialDetail, error };
};

export default useFetchMaterialDetail;
