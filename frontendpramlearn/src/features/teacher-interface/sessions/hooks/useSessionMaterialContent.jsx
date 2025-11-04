import { useState, useEffect, useContext } from "react";
import api from "../../../../api";
import { AuthContext } from "../../../../context/AuthContext";

const useSessionMaterialContent = (materialSlug) => {
  const { user, token } = useContext(AuthContext);
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchContent = async () => {
    if (!user || !token || user.role !== 2 || !materialSlug) return;

    try {
      setLoading(true);
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      const response = await api.get(
        `teacher/sessions/material/${materialSlug}/content/`
      );
      setContent(response.data);
      setError(null);
    } catch (err) {
      setError(err);
      console.error("Error fetching session material content:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (materialSlug) {
      fetchContent();
    }
  }, [user, token, materialSlug]);

  return {
    content,
    loading,
    error,
    refetch: fetchContent,
  };
};

export default useSessionMaterialContent;
