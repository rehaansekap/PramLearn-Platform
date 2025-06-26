import { useState, useContext } from "react";
import { message } from "antd";
import api from "../../../../api";
import { AuthContext } from "../../../../context/AuthContext";

const useSessionsARCSUpload = (onUploadSuccess) => {
  const { token } = useContext(AuthContext);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadMessage, setUploadMessage] = useState("");

  const handleFileChange = (info) => {
    const { fileList } = info;

    if (fileList.length > 0) {
      const selectedFile = fileList[0].originFileObj;

      // Validasi tipe file
      if (selectedFile && !selectedFile.name.toLowerCase().endsWith(".csv")) {
        setUploadMessage("error:File harus berformat .csv");
        setFile(null);
        return;
      }

      setFile(selectedFile);
      setUploadMessage("");
    } else {
      setFile(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setUploadMessage("error:Silakan pilih file CSV terlebih dahulu.");
      return;
    }

    if (!token) {
      setUploadMessage("error:Sesi login tidak valid.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    setUploadProgress(0);

    // Simulasi progress bar
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + 10;
      });
    }, 200);

    try {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      const response = await api.post(
        "teacher/sessions/upload-arcs/",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      setUploadProgress(100);
      setUploadMessage(`success:${response.data.message}`);
      setFile(null);

      // Show success message
      message.success("Profil motivasi siswa berhasil diperbarui!");

      // Call callback untuk update data tanpa refresh
      if (onUploadSuccess) {
        onUploadSuccess(response.data);
      }

      return response.data;
    } catch (error) {
      setUploadProgress(0);
      const errorMessage =
        error.response?.data?.error ||
        "Terjadi kesalahan saat mengupload file.";
      setUploadMessage(`error:${errorMessage}`);

      // Show error message
      message.error(`Upload gagal: ${errorMessage}`);

      throw error;
    } finally {
      setUploading(false);
      clearInterval(progressInterval);
    }
  };

  const resetUpload = () => {
    setFile(null);
    setUploading(false);
    setUploadProgress(0);
    setUploadMessage("");
  };

  const getMessageType = () => {
    if (uploadMessage.startsWith("error:")) return "error";
    if (uploadMessage.startsWith("success:")) return "success";
    return "info";
  };

  const getMessageText = () => {
    return uploadMessage.replace(/^(error:|success:|info:)/, "");
  };

  return {
    file,
    uploading,
    uploadProgress,
    uploadMessage,
    handleFileChange,
    handleUpload,
    resetUpload,
    getMessageType,
    getMessageText,
  };
};

export default useSessionsARCSUpload;
