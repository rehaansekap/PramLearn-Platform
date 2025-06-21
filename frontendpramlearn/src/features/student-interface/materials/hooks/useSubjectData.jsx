import { useState, useEffect } from "react";
import api from "../../../../api";

const useSubjectData = (subjectId) => {
  const [subjectData, setSubjectData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSubjectData = async () => {
      if (!subjectId) return;

      setLoading(true);
      try {
        const response = await api.get(`subjects/${subjectId}/`);
        setSubjectData(response.data);
      } catch (error) {
        console.error("Gagal mengambil data mata pelajaran:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubjectData();
  }, [subjectId]);

  return { subjectData, loading };
};

export default useSubjectData;
