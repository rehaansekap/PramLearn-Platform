import { useState, useEffect, useContext } from "react";
import api from "../../../../api";
import { AuthContext } from "../../../../context/AuthContext";

const useTeacherClassDetail = (classSlug) => {
  const { user, token } = useContext(AuthContext);
  const [classDetail, setClassDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchClassDetail = async () => {
    if (!user || !token || !classSlug) return;

    try {
      setLoading(true);
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      
      const response = await api.get(`teacher/classes/${classSlug}/`);
      setClassDetail(response.data);
      setError(null);
    } catch (err) {
      setError(err);
      console.error('Error fetching class detail:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (classSlug) {
      fetchClassDetail();
    }
  }, [classSlug, user, token]);

  return {
    classDetail,
    loading,
    error,
    refetch: fetchClassDetail,
  };
};

export default useTeacherClassDetail;