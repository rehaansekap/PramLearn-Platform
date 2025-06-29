import { useState, useEffect, useContext } from "react";
import api from "../../../api";
import { AuthContext } from "../../../context/AuthContext";

const useMaterialForm = (materialId, subjectId, onSuccess) => {
  const { token } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    title: "",
    pdf_files: [],
    // google_form_embed_arcs_awal: "",
    // google_form_embed_arcs_akhir: "",
    youtube_videos: [{ url: "" }],
  });
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchMaterial = async () => {
      try {
        if (materialId && token) {
          api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
          const response = await api.get(`materials/${materialId}/`);

          // Set form data dengan struktur yang benar
          setFormData({
            title: response.data.title || "",
            pdf_files: response.data.pdf_files || [],
            // google_form_embed_arcs_awal:
            //   response.data.google_form_embed_arcs_awal || "",
            // google_form_embed_arcs_akhir:
            //   response.data.google_form_embed_arcs_akhir || "",
            youtube_videos:
              response.data.youtube_videos &&
              response.data.youtube_videos.length > 0
                ? response.data.youtube_videos
                : [{ url: "" }],
          });
        }
      } catch (error) {
        console.error("Error fetching material:", error);
        setMessage("Error loading material data");
      }
    };

    fetchMaterial();
  }, [materialId, token]);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "file" ? files[0] : value,
    }));
  };

  const handleFileUpload = async (file) => {
    const uploadFormData = new FormData();
    uploadFormData.append("file", file);

    try {
      if (token) {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        const response = await api.post("files/upload/", uploadFormData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        // Tambahkan objek file lengkap ke pdf_files
        setFormData((prevData) => ({
          ...prevData,
          pdf_files: [...(prevData.pdf_files || []), response.data],
        }));

        setMessage("File uploaded successfully!");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      setMessage("Error uploading file");
    }
  };

  const handleFileDelete = async (fileId) => {
    try {
      if (token) {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        await api.delete(`files/${fileId}/delete/`);

        setFormData((prevData) => ({
          ...prevData,
          pdf_files: (prevData.pdf_files || []).filter(
            (file) => file.id !== fileId
          ),
        }));

        setMessage("File deleted successfully!");
      }
    } catch (error) {
      console.error("Error deleting file:", error);
      setMessage("Error deleting file");
    }
  };

  const handleSubmit = async () => {
    const payload = {
      title: formData.title,
      pdf_files_ids: (formData.pdf_files || []).map((file) => file.id),
      // google_form_embed_arcs_awal: formData.google_form_embed_arcs_awal,
      // google_form_embed_arcs_akhir: formData.google_form_embed_arcs_akhir,
      youtube_videos: (formData.youtube_videos || []).filter(
        (v) => v.url.trim() !== ""
      ),
      subject: subjectId,
    };

    try {
      if (token) {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        if (materialId) {
          await api.put(`materials/${materialId}/`, payload);
          setMessage("Material updated successfully!");
        } else {
          await api.post(`subjects/${subjectId}/materials/`, payload);
          setMessage("Material created successfully!");
        }

        // Reset form setelah berhasil
        if (!materialId) {
          setFormData({
            title: "",
            pdf_files: [],
            // google_form_embed_arcs_awal: "",
            // google_form_embed_arcs_akhir: "",
            youtube_videos: [{ url: "" }],
          });
        }

        if (onSuccess) onSuccess();
      }
    } catch (error) {
      console.error("Error saving material:", error);
      setMessage("Error saving material");
      throw error; // Re-throw untuk handling di component
    }
  };

  return {
    formData,
    message,
    handleChange,
    handleFileUpload,
    handleFileDelete,
    handleSubmit,
    setFormData,
  };
};

export default useMaterialForm;
