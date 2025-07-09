import { useState } from "react";
import { message } from "antd";

const useFileUpload = ({
  maxFiles = 5,
  maxSizePerFile = 10,
  allowedTypes = [
    "pdf",
    "doc",
    "docx",
    "xls",
    "xlsx",
    "jpg",
    "jpeg",
    "png",
    "txt",
  ],
  onChange,
  onRemove,
}) => {
  const [uploading, setUploading] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);

  // Validasi file
  const validateFile = (file, currentFileCount) => {
    const fileName = file.name;
    const fileSize = file.size / 1024 / 1024; // Convert ke MB
    const fileExtension = fileName.split(".").pop().toLowerCase();

    // Cek tipe file
    if (!allowedTypes.includes(fileExtension)) {
      message.error(`Tipe file .${fileExtension} tidak diizinkan`);
      return false;
    }

    // Cek ukuran file
    if (fileSize > maxSizePerFile) {
      message.error(`Ukuran file harus kurang dari ${maxSizePerFile}MB`);
      return false;
    }

    // Cek jumlah maksimum file
    if (currentFileCount >= maxFiles) {
      message.error(`Maksimum ${maxFiles} file diizinkan`);
      return false;
    }

    return true;
  };

  // Handle upload file
  const handleUpload = async (file, currentFileCount) => {
    if (!validateFile(file, currentFileCount)) {
      return false;
    }

    setUploading(true);

    try {
      // Buat objek file
      const fileObj = {
        uid: `${Date.now()}-${Math.random()}`,
        name: file.name,
        status: "done",
        originFileObj: file,
        size: file.size,
        type: file.type,
      };

      // Tambahkan URL preview untuk gambar
      if (file.type.startsWith("image/")) {
        fileObj.url = URL.createObjectURL(file);
      }

      onChange && onChange(fileObj);
      message.success(`File "${file.name}" berhasil ditambahkan`);
    } catch (error) {
      message.error("Gagal mengunggah file");
    } finally {
      setUploading(false);
    }

    return false; // Mencegah upload default
  };

  // Handle preview file
  const handlePreview = (file) => {
    if (file.type && file.type.startsWith("image/")) {
      setPreviewFile(file);
      setPreviewVisible(true);
    } else {
      message.info("Preview tidak tersedia untuk tipe file ini");
    }
  };

  // Handle hapus file
  const handleRemove = (fileUid) => {
    onRemove && onRemove(fileUid);
  };

  // Format ukuran file
  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return {
    uploading,
    previewVisible,
    previewFile,
    setPreviewVisible,
    handleUpload,
    handlePreview,
    handleRemove,
    formatFileSize,
  };
};

export default useFileUpload;
