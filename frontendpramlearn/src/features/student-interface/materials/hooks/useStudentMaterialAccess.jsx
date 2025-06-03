import { useState, useEffect, useContext, useCallback } from "react";
import api from "../../../../api";
import { AuthContext } from "../../../../context/AuthContext";

const useStudentMaterialAccess = (materialSlug) => {
  const { user } = useContext(AuthContext);
  const [material, setMaterial] = useState(null);
  const [materialId, setMaterialId] = useState(null); // Tambah untuk store ID setelah fetch
  const [progress, setProgress] = useState({
    completion_percentage: 0,
    time_spent: 0,
    last_position: 0,
  });
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch material data by slug (konsisten dengan existing pattern)
  useEffect(() => {
    let mounted = true;
    const fetchMaterial = async () => {
      if (!materialSlug) return;

      setLoading(true);
      setError(null);
      try {
        // Fetch material by slug (sama seperti di MaterialDetailPage)
        const materialRes = await api.get(`materials/?slug=${materialSlug}`);
        const foundMaterial = materialRes.data.find(
          (m) => m.slug === materialSlug
        );

        if (!foundMaterial) {
          throw new Error("Material not found");
        }

        if (mounted) {
          setMaterial(foundMaterial);
          setMaterialId(foundMaterial.id);

          // Fetch progress dan bookmarks menggunakan material ID
          const [progressRes, bookmarksRes] = await Promise.all([
            api
              .get(`/student/materials/${foundMaterial.id}/progress/`)
              .catch(() => ({ data: {} })),
            api
              .get(`/student/materials/${foundMaterial.id}/bookmarks/`)
              .catch(() => ({ data: [] })),
          ]);

          setProgress(
            progressRes.data || {
              completion_percentage: 0,
              time_spent: 0,
              last_position: 0,
            }
          );
          setBookmarks(bookmarksRes.data || []);
        }
      } catch (err) {
        if (mounted) setError(err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchMaterial();
    return () => {
      mounted = false;
    };
  }, [materialSlug]);

  // Record material access
  useEffect(() => {
    const recordAccess = async () => {
      if (!materialId || !user) return;
      try {
        await api.post(`/student/materials/${materialId}/access/`);
      } catch (error) {
        console.warn("Failed to record material access:", error);
      }
    };
    recordAccess();
  }, [materialId, user]);

  // Update progress (tetap menggunakan materialId untuk API)
  const updateProgress = useCallback(
    async (progressData) => {
      if (!materialId) return;
      try {
        const response = await api.put(
          `/student/materials/${materialId}/progress/`,
          progressData
        );
        setProgress(response.data);
      } catch (error) {
        console.warn("Failed to update progress:", error);
      }
    },
    [materialId]
  );

  // Add bookmark
  const addBookmark = useCallback(
    async (bookmarkData) => {
      if (!materialId) return;
      try {
        const response = await api.post(
          `/student/materials/${materialId}/bookmarks/`,
          bookmarkData
        );
        setBookmarks((prev) => [...prev, response.data]);
        return response.data;
      } catch (error) {
        console.error("Failed to add bookmark:", error);
        throw error;
      }
    },
    [materialId]
  );

  // Remove bookmark
  const removeBookmark = useCallback(
    async (bookmarkId) => {
      if (!materialId) return;
      try {
        await api.delete(
          `/student/materials/${materialId}/bookmarks/${bookmarkId}/`
        );
        setBookmarks((prev) => prev.filter((b) => b.id !== bookmarkId));
      } catch (error) {
        console.error("Failed to remove bookmark:", error);
        throw error;
      }
    },
    [materialId]
  );

  return {
    material,
    materialId, // Export materialId jika needed
    progress,
    bookmarks,
    loading,
    error,
    updateProgress,
    addBookmark,
    removeBookmark,
  };
};

export default useStudentMaterialAccess;
