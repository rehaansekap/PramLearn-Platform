import { useState, useEffect, useContext } from "react";
import api from "../../../../api";
import { AuthContext } from "../../../../context/AuthContext";

const useSessionMaterialForm = (materialId, subjectId, onSuccess) => {
  const { token } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    title: "",
    pdf_files: [],
    google_form_embed_arcs_awal: "",
    google_form_embed_arcs_akhir: "",
    youtube_videos: [{ url: "" }],
  });

  useEffect(() => {
    if (materialId) {
      fetchMaterialData();
    }
  }, [materialId]);

  const fetchMaterialData = async () => {
    try {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      const response = await api.get(
        `materials/${materialId}/?slug=${materialId}`
      );
      const material = response.data;

      setFormData({
        title: material.title || "",
        pdf_files: material.pdf_files || [],
        google_form_embed_arcs_awal: material.google_form_embed_arcs_awal || "",
        google_form_embed_arcs_akhir:
          material.google_form_embed_arcs_akhir || "",
        youtube_videos:
          material.youtube_videos?.length > 0
            ? material.youtube_videos
            : [{ url: "" }],
      });
    } catch (error) {
      console.error("Error fetching material data:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileUpload = async (file) => {
    try {
      const fileFormData = new FormData();
      fileFormData.append("file", file);

      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      const response = await api.post("files/upload/", fileFormData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setFormData((prev) => ({
        ...prev,
        pdf_files: [...(prev.pdf_files || []), response.data],
      }));
    } catch (error) {
      throw error;
    }
  };

  const handleFileDelete = async (fileId) => {
    try {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      await api.delete(`delete-file/${fileId}/`);

      setFormData((prev) => ({
        ...prev,
        pdf_files: (prev.pdf_files || []).filter((file) => file.id !== fileId),
      }));
    } catch (error) {
      console.error("Error deleting file:", error);
    }
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        title: formData.title,
        subject: subjectId,
        pdf_files_ids: (formData.pdf_files || []).map((file) => file.id),
        youtube_videos: formData.youtube_videos.filter((video) =>
          video.url.trim()
        ),
        google_form_embed_arcs_awal: formData.google_form_embed_arcs_awal,
        google_form_embed_arcs_akhir: formData.google_form_embed_arcs_akhir,
      };

      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      if (materialId) {
        await api.put(`materials/${materialId}/`, payload);
      } else {
        await api.post("materials/", payload);
      }

      // Reset form setelah berhasil
      if (!materialId) {
        setFormData({
          title: "",
          pdf_files: [],
          google_form_embed_arcs_awal: "",
          google_form_embed_arcs_akhir: "",
          youtube_videos: [{ url: "" }],
        });
      }

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error saving material:", error);
      throw error;
    }
  };

  return {
    formData,
    handleChange,
    handleFileUpload,
    handleFileDelete,
    handleSubmit,
    setFormData,
  };
};

export default useSessionMaterialForm;
