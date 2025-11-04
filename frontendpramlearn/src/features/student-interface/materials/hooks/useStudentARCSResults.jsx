import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../../../context/AuthContext";
import api from "../../../../api";

const useStudentARCSResults = (materialSlug, arcsSlug) => {
  const { token } = useContext(AuthContext);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch ARCS results
  const fetchResults = async () => {
    if (!materialSlug || !arcsSlug || !token) return;

    try {
      setLoading(true);
      setError(null);

      const response = await api.get(
        `/student/materials/${materialSlug}/arcs/${arcsSlug}/results/`
      );

      setResults(response.data);
    } catch (error) {
      console.error("Error fetching ARCS results:", error);
      const errorMessage =
        error.response?.data?.error || "Gagal memuat hasil kuesioner";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, [materialSlug, arcsSlug, token]);

  return {
    results,
    loading,
    error,
    refetch: fetchResults,
  };
};

export default useStudentARCSResults;
