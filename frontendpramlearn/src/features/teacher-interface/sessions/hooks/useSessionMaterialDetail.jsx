import { useState, useEffect, useContext } from "react";
import api from "../../../../api";
import { AuthContext } from "../../../../context/AuthContext";

const useSessionMaterialDetail = (materialSlug) => {
  const { user, token } = useContext(AuthContext);
  const [materialDetail, setMaterialDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMaterialDetail = async () => {
    if (!user || !token || user.role !== 2 || !materialSlug) return;

    try {
      setLoading(true);
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      const response = await api.get(
        `teacher/sessions/material/${materialSlug}/`
      );
      setMaterialDetail(response.data);
      setError(null);
    } catch (err) {
      setError(err);
      console.error("Error fetching session material detail:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (materialSlug) {
      fetchMaterialDetail();
    }
  }, [user, token, materialSlug]);

  return {
    materialDetail,
    loading,
    error,
    refetch: fetchMaterialDetail,
  };
};

export default useSessionMaterialDetail;
