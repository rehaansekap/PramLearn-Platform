import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  Button,
  Upload,
  Alert,
  List,
  Spin,
  Typography,
} from "antd";
import {
  UploadOutlined,
  FilePdfOutlined,
  MinusCircleOutlined,
  PlusOutlined,
  LoadingOutlined,
  InboxOutlined,
  FileTextOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import useMaterialForm from "../hooks/useMaterialForm";
import Swal from "sweetalert2";

const { Dragger } = Upload;
const { Text } = Typography;

const MaterialForm = ({
  materialId,
  subjectId,
  onSuccess,
  isSubmitting,
  setIsSubmitting,
}) => {
  const {
    formData,
    message,
    handleChange,
    handleFileUpload,
    handleFileDelete,
    handleSubmit,
    setFormData,
  } = useMaterialForm(materialId, subjectId, onSuccess);

  const [form] = Form.useForm();
  const [initialLoading, setInitialLoading] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState(false);

  // Loading saat fetch data untuk edit
  useEffect(() => {
    if (materialId) {
      setInitialLoading(true);
      // Simulasi loading saat fetch material data
      const timer = setTimeout(() => {
        setInitialLoading(false);
      }, 800);
      return () => clearTimeout(timer);
    } else {
      // Reset form untuk create new
      form.resetFields();
      setFormData({
        title: "",
        pdf_files: [],
        // google_form_embed_arcs_awal: "",
        // google_form_embed_arcs_akhir: "",
        youtube_videos: [{ url: "" }],
      });
    }
  }, [materialId, form, setFormData]);

  // Set form values ketika data berubah
  useEffect(() => {
    form.setFieldsValue({
      title: formData.title,
    });
  }, [formData, form]);

  const onFinish = async () => {
    setIsSubmitting(true);
    try {
      await handleSubmit();
      onSuccess();
      // Success message sudah dihandle di parent component
    } catch (error) {
      const errorMessage =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        "Terjadi kesalahan saat menyimpan material.";
      Swal.fire({
        title: "Gagal!",
        text: errorMessage,
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle file upload with loading
  const handleFileUploadWithLoading = async (file) => {
    setUploadingFiles(true);
    try {
      await handleFileUpload(file);
    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      setUploadingFiles(false);
    }
  };

  // Handle file change untuk Dragger
  const handleFileChange = (info) => {
    const { fileList } = info;

    if (fileList.length > 0) {
      fileList.forEach((fileItem) => {
        const selectedFile = fileItem.originFileObj;

        // Validasi tipe file
        if (selectedFile && !selectedFile.name.toLowerCase().endsWith(".pdf")) {
          Swal.fire({
            title: "File Tidak Valid",
            text: "File harus berformat .pdf",
            icon: "error",
            confirmButtonText: "OK",
          });
          return;
        }

        if (selectedFile) {
          handleFileUploadWithLoading(selectedFile);
        }
      });
    }
  };

  // Handle YouTube video changes
  const handleYouTubeVideoChange = (index, value) => {
    const newVideos = [...(formData.youtube_videos || [])];
    newVideos[index] = { url: value };
    setFormData((prev) => ({
      ...prev,
      youtube_videos: newVideos,
    }));
  };

  const addYouTubeVideo = () => {
    setFormData((prev) => ({
      ...prev,
      youtube_videos: [...(prev.youtube_videos || []), { url: "" }],
    }));
  };

  const removeYouTubeVideo = (index) => {
    const newVideos = [...(formData.youtube_videos || [])];
    newVideos.splice(index, 1);
    setFormData((prev) => ({
      ...prev,
      youtube_videos: newVideos.length > 0 ? newVideos : [{ url: "" }],
    }));
  };

  const beforeUpload = () => {
    return false; // Prevent automatic upload
  };

  const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

  return (
    <div style={{ position: "relative" }}>
      {/* Loading overlay untuk initial data */}
      {initialLoading && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(255, 255, 255, 0.8)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <Spin indicator={antIcon} />
          <p style={{ marginTop: 16, color: "#666" }}>
            {materialId ? "Loading material data..." : "Preparing form..."}
          </p>
        </div>
      )}

      {/* Loading indicator saat upload */}
      {uploadingFiles && (
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <Spin indicator={<LoadingOutlined style={{ fontSize: 16 }} spin />} />
          <Text type="secondary" style={{ marginLeft: 8 }}>
            Mengupload file PDF...
          </Text>
        </div>
      )}

      <h1
        className="ant-modal-header"
        style={{
          fontSize: "1.5rem",
          textAlign: "center",
          fontWeight: 700,
          marginBottom: 24,
          color: "#11418b",
        }}
      >
        {materialId ? "Update Material" : "Create Material"}
      </h1>

      {message && (
        <Alert
          message={message}
          type={message.toLowerCase().includes("success") ? "success" : "error"}
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      <Form
        layout="vertical"
        form={form}
        onFinish={onFinish}
        initialValues={{
          title: formData.title,
        }}
        style={{ maxWidth: "100%" }}
      >
        <Form.Item
          label={<span style={{ fontWeight: "bold" }}>Material Title</span>}
          name="title"
          rules={[{ required: true, message: "Material title wajib diisi" }]}
        >
          <Input
            value={formData.title}
            onChange={(e) => {
              const newValue = e.target.value;
              setFormData((prev) => ({ ...prev, title: newValue }));
              form.setFieldValue("title", newValue);
            }}
            placeholder="Masukkan judul material"
            autoFocus
            disabled={initialLoading}
            style={{
              height: 40,
              borderRadius: 8,
            }}
          />
        </Form.Item>

        <Form.Item
          label={<span style={{ fontWeight: "bold" }}>Upload PDFs</span>}
        >
          {/* Drag and Drop Area - Style sama dengan UploadARCSCSV */}
          <Dragger
            accept=".pdf"
            multiple={true}
            onChange={handleFileChange}
            beforeUpload={beforeUpload}
            showUploadList={false}
            disabled={uploadingFiles || initialLoading}
            style={{
              backgroundColor:
                (formData.pdf_files || []).length > 0 ? "#f6ffed" : "#fafafa",
              border:
                (formData.pdf_files || []).length > 0
                  ? "2px dashed #52c41a"
                  : "2px dashed #d9d9d9",
              borderRadius: "8px",
              marginBottom: 16,
            }}
          >
            <div className="text-center" style={{ padding: "20px" }}>
              {(formData.pdf_files || []).length > 0 ? (
                <>
                  <FileTextOutlined
                    style={{ fontSize: 48, color: "#52c41a", marginBottom: 16 }}
                  />
                  <div>
                    <Text strong style={{ color: "#52c41a", fontSize: "16px" }}>
                      ✓ {(formData.pdf_files || []).length} file PDF terpilih
                    </Text>
                    <br />
                    <Text type="secondary">
                      Klik atau seret file PDF tambahan ke area ini
                    </Text>
                  </div>
                </>
              ) : (
                <>
                  <InboxOutlined
                    style={{ fontSize: 48, color: "#999", marginBottom: 16 }}
                  />
                  <div>
                    <Text style={{ fontSize: "16px", fontWeight: 500 }}>
                      Klik atau seret file PDF ke area ini
                    </Text>
                    <br />
                    <Text type="secondary">
                      Mendukung multiple file .pdf untuk materi pembelajaran
                    </Text>
                  </div>
                </>
              )}
            </div>
          </Dragger>

          {/* Loading indicator saat upload */}
          {uploadingFiles && (
            <div style={{ textAlign: "center", marginBottom: 16 }}>
              <Spin size="small" />
              <Text type="secondary" style={{ marginLeft: 8 }}>
                Mengupload file PDF...
              </Text>
            </div>
          )}

          {/* Daftar file yang sudah diupload - RAPIHKAN */}
          {(formData.pdf_files || []).length > 0 && (
            <div
              style={{
                backgroundColor: "#f5f5f5",
                border: "1px solid #e8e8e8",
                borderRadius: "8px",
                padding: "16px",
                marginTop: 8,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: 12,
                  paddingBottom: 8,
                  borderBottom: "1px solid #e0e0e0",
                }}
              >
                <FilePdfOutlined
                  style={{ fontSize: 16, color: "#11418b", marginRight: 8 }}
                />
                <Text strong style={{ fontSize: "14px", color: "#11418b" }}>
                  File PDF yang sudah diupload:
                </Text>
              </div>

              <div
                style={{ display: "flex", flexDirection: "column", gap: "8px" }}
              >
                {(formData.pdf_files || []).map((file, index) => (
                  <div
                    key={file.id || index}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "8px 12px",
                      backgroundColor: "#ffffff",
                      border: "1px solid #e0e0e0",
                      borderRadius: "6px",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#f8f9fa";
                      e.currentTarget.style.borderColor = "#11418b";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "#ffffff";
                      e.currentTarget.style.borderColor = "#e0e0e0";
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        flex: 1,
                        cursor: "pointer",
                      }}
                      onClick={() => window.open(file.file, "_blank")}
                    >
                      <FilePdfOutlined
                        style={{
                          fontSize: 18,
                          color: "#e53935",
                          marginRight: 10,
                          flexShrink: 0,
                        }}
                      />
                      <Text
                        style={{
                          fontSize: "13px",
                          fontWeight: 500,
                          color: "#333",
                          wordBreak: "break-all",
                          lineHeight: "1.2",
                        }}
                        title={
                          file.file_name ||
                          file.file?.split("/").pop() ||
                          "PDF File"
                        }
                      >
                        {file.file_name ||
                          file.file?.split("/").pop() ||
                          "PDF File"}
                      </Text>
                    </div>

                    <Button
                      danger
                      size="small"
                      icon={<DeleteOutlined />}
                      onClick={() => handleFileDelete(file.id)}
                      disabled={initialLoading || uploadingFiles}
                      style={{
                        fontSize: "12px",
                        height: "28px",
                        minWidth: "28px",
                        borderRadius: "4px",
                        padding: "0 8px",
                        marginLeft: 8,
                        flexShrink: 0,
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Form.Item>

        {/* <Form.Item
          label={
            <span style={{ fontWeight: "bold" }}>
              Embed Google Form ARCS Awal
            </span>
          }
        >
          <Input
            value={formData.google_form_embed_arcs_awal}
            onChange={(e) => {
              const newValue = e.target.value;
              setFormData((prev) => ({
                ...prev,
                google_form_embed_arcs_awal: newValue,
              }));
            }}
            placeholder="Paste Google Form Embed Link ARCS Awal"
            disabled={initialLoading}
            style={{
              height: 40,
              borderRadius: 8,
            }}
          />
        </Form.Item>

        <Form.Item
          label={
            <span style={{ fontWeight: "bold" }}>
              Embed Google Form ARCS Akhir
            </span>
          }
        >
          <Input
            value={formData.google_form_embed_arcs_akhir}
            onChange={(e) => {
              const newValue = e.target.value;
              setFormData((prev) => ({
                ...prev,
                google_form_embed_arcs_akhir: newValue,
              }));
            }}
            placeholder="Paste Google Form Embed Link ARCS Akhir"
            disabled={initialLoading}
            style={{
              height: 40,
              borderRadius: 8,
            }}
          />
        </Form.Item> */}

        <Form.Item
          label={
            <span style={{ fontWeight: "bold" }}>Embedded YouTube Videos</span>
          }
        >
          {(formData.youtube_videos || [{ url: "" }]).map((video, idx) => (
            <div
              key={idx}
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: 8,
                gap: 8,
              }}
            >
              <Input
                placeholder="Paste YouTube Embed Link"
                value={video.url || ""}
                onChange={(e) => handleYouTubeVideoChange(idx, e.target.value)}
                disabled={initialLoading}
                style={{
                  flex: 1,
                  height: 40,
                  borderRadius: 8,
                }}
              />
              {(formData.youtube_videos || []).length > 1 && (
                <Button
                  danger
                  icon={<MinusCircleOutlined />}
                  onClick={() => removeYouTubeVideo(idx)}
                  disabled={initialLoading}
                  style={{
                    height: 40,
                    borderRadius: 8,
                  }}
                />
              )}
            </div>
          ))}
          <Button
            type="dashed"
            onClick={addYouTubeVideo}
            icon={<PlusOutlined />}
            disabled={initialLoading}
            style={{
              width: "100%",
              height: 40,
              borderRadius: 8,
              marginTop: 8,
            }}
          >
            Add YouTube Video
          </Button>
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            style={{
              width: "100%",
              backgroundColor: "#11418b",
              borderColor: "#11418b",
              height: "40px",
              fontSize: "16px",
              fontWeight: "600",
            }}
            loading={isSubmitting}
            disabled={initialLoading || uploadingFiles}
          >
            {isSubmitting
              ? materialId
                ? "Updating material..."
                : "Creating material..."
              : materialId
              ? "Update Material"
              : "Create Material"}
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default MaterialForm;
