import { useState, useEffect, useContext } from "react";
import api from "../../../../api";
import { AuthContext } from "../../../../context/AuthContext";

const useTeacherSubjectDetail = (subjectSlug) => {
  const { user, token } = useContext(AuthContext);
  const [subjectDetail, setSubjectDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSubjectDetail = async () => {
    if (!user || !token || !subjectSlug) return;

    try {
      setLoading(true);
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      const response = await api.get(`teacher/subjects/${subjectSlug}/`);
      setSubjectDetail(response.data);
      setError(null);
    } catch (err) {
      setError(err);
      console.error("Error fetching subject detail:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (subjectSlug) {
      fetchSubjectDetail();
    }
  }, [subjectSlug, user, token]);

  return {
    subjectDetail,
    loading,
    error,
    refetch: fetchSubjectDetail,
  };
};

export default useTeacherSubjectDetail;
