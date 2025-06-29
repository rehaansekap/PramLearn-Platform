import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  Upload,
  Typography,
  Space,
  Spin,
  message,
  Divider,
  Row,
  Col,
  Card,
} from "antd";
import {
  InboxOutlined,
  FileTextOutlined,
  DeleteOutlined,
  PlusOutlined,
  LoadingOutlined,
  YoutubeOutlined,
  LinkOutlined,
} from "@ant-design/icons";
import useSessionMaterialForm from "../hooks/useSessionMaterialForm";

const { Title, Text } = Typography;
const { Dragger } = Upload;
const { TextArea } = Input;

const SessionMaterialForm = ({
  materialId,
  subjectId,
  onSuccess,
  isSubmitting,
  setIsSubmitting,
}) => {
  const {
    formData,
    handleChange,
    handleFileUpload,
    handleFileDelete,
    handleSubmit,
    setFormData,
  } = useSessionMaterialForm(materialId, subjectId, onSuccess);

  const [form] = Form.useForm();
  const [initialLoading, setInitialLoading] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState(false);

  // Loading saat fetch data untuk edit
  useEffect(() => {
    if (materialId) {
      setInitialLoading(true);
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
      message.success("Materi berhasil disimpan!");
      onSuccess();
    } catch (error) {
      const errorMessage =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        "Terjadi kesalahan saat menyimpan materi.";
      message.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle file upload with loading
  const handleFileUploadWithLoading = async (file) => {
    setUploadingFiles(true);
    try {
      await handleFileUpload(file);
      message.success("File PDF berhasil diupload!");
    } catch (error) {
      console.error("Error uploading file:", error);
      message.error("Gagal mengupload file PDF");
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
          message.error("File harus berformat .pdf");
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
    const newVideos = formData.youtube_videos.filter((_, i) => i !== index);
    setFormData((prev) => ({
      ...prev,
      youtube_videos: newVideos,
    }));
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
            background: "rgba(255, 255, 255, 0.9)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 10,
            borderRadius: 8,
          }}
        >
          <Spin indicator={antIcon} tip="Memuat data materi..." />
        </div>
      )}

      <div style={{ padding: "24px 0" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <FileTextOutlined
            style={{ fontSize: 32, color: "#11418b", marginBottom: 16 }}
          />
          <Title level={3} style={{ color: "#11418b", margin: 0 }}>
            {materialId ? "Edit Materi Pembelajaran" : "Tambah Materi Baru"}
          </Title>
          <Text type="secondary" style={{ fontSize: 14 }}>
            {materialId
              ? "Perbarui informasi materi"
              : "Buat materi pembelajaran baru"}
          </Text>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          disabled={initialLoading}
        >
          {/* Basic Information */}
          <Card
            title="Informasi Dasar"
            style={{ marginBottom: 24, borderRadius: 8 }}
          >
            <Form.Item
              label={<span style={{ fontWeight: "bold" }}>Judul Materi</span>}
              name="title"
              rules={[{ required: true, message: "Judul materi wajib diisi" }]}
            >
              <Input
                placeholder="Masukkan judul materi pembelajaran"
                value={formData.title}
                onChange={(e) => handleChange(e)}
                name="title"
                size="large"
                disabled={initialLoading}
                style={{ borderRadius: 8 }}
              />
            </Form.Item>
          </Card>

          {/* PDF Files */}
          <Card title="File PDF" style={{ marginBottom: 24, borderRadius: 8 }}>
            <Dragger
              name="file"
              multiple={false}
              beforeUpload={() => false}
              onChange={handleFileChange}
              accept=".pdf"
              disabled={uploadingFiles || initialLoading}
              style={{
                marginBottom: 16,
                borderRadius: 8,
                border: "2px dashed #d9d9d9",
              }}
            >
              <p className="ant-upload-drag-icon">
                {(formData.pdf_files || []).length > 0 ? (
                  <>
                    <FileTextOutlined
                      style={{
                        fontSize: 48,
                        color: "#52c41a",
                        marginBottom: 16,
                      }}
                    />
                    <div>
                      <Text
                        strong
                        style={{ color: "#52c41a", fontSize: "16px" }}
                      >
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
              </p>
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

            {/* Daftar file yang sudah diupload */}
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
                  <FileTextOutlined
                    style={{ color: "#1890ff", marginRight: 8 }}
                  />
                  <Text strong>File PDF Terupload:</Text>
                </div>

                <div
                  style={{ display: "flex", flexDirection: "column", gap: 8 }}
                >
                  {(formData.pdf_files || []).map((file, index) => (
                    <div
                      key={index}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "8px 12px",
                        backgroundColor: "white",
                        borderRadius: "6px",
                        border: "1px solid #e0e0e0",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <FileTextOutlined
                          style={{ color: "#1890ff", marginRight: 8 }}
                        />
                        <Text style={{ fontSize: "14px" }}>
                          {file.file?.split("/").pop() ||
                            `PDF File ${index + 1}`}
                        </Text>
                      </div>
                      <Button
                        type="text"
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                        onClick={() => handleFileDelete(file.id)}
                        style={{ padding: "4px 8px" }}
                      >
                        Hapus
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* YouTube Videos */}
          <Card
            title="Video YouTube"
            style={{ marginBottom: 24, borderRadius: 8 }}
          >
            <Space direction="vertical" style={{ width: "100%" }} size="middle">
              {(formData.youtube_videos || []).map((video, index) => (
                <Row key={index} gutter={8} align="middle">
                  <Col flex="auto">
                    <Input
                      placeholder="Masukkan URL YouTube (contoh: https://youtube.com/watch?v=...)"
                      value={video.url}
                      onChange={(e) =>
                        handleYouTubeVideoChange(index, e.target.value)
                      }
                      prefix={<YoutubeOutlined style={{ color: "#ff4d4f" }} />}
                      size="large"
                      style={{ borderRadius: 8 }}
                    />
                  </Col>
                  {(formData.youtube_videos || []).length > 1 && (
                    <Col>
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => removeYouTubeVideo(index)}
                        size="large"
                      />
                    </Col>
                  )}
                </Row>
              ))}

              <Button
                type="dashed"
                icon={<PlusOutlined />}
                onClick={addYouTubeVideo}
                style={{ width: "100%", height: 40, borderRadius: 8 }}
              >
                Tambah Video YouTube
              </Button>
            </Space>
          </Card>

          {/* Google Forms */}
          {/* <Card
            title="Google Form ARCS"
            style={{ marginBottom: 24, borderRadius: 8 }}
          >
            <Row gutter={16}>
              <Col xs={24} lg={12}>
                <Form.Item
                  label={
                    <span style={{ fontWeight: "bold" }}>
                      Google Form ARCS Awal
                    </span>
                  }
                >
                  <Input
                    placeholder="URL Google Form untuk pre-assessment ARCS"
                    value={formData.google_form_embed_arcs_awal}
                    onChange={(e) => handleChange(e)}
                    name="google_form_embed_arcs_awal"
                    prefix={<LinkOutlined style={{ color: "#1890ff" }} />}
                    size="large"
                    style={{ borderRadius: 8 }}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} lg={12}>
                <Form.Item
                  label={
                    <span style={{ fontWeight: "bold" }}>
                      Google Form ARCS Akhir
                    </span>
                  }
                >
                  <Input
                    placeholder="URL Google Form untuk post-assessment ARCS"
                    value={formData.google_form_embed_arcs_akhir}
                    onChange={(e) => handleChange(e)}
                    name="google_form_embed_arcs_akhir"
                    prefix={<LinkOutlined style={{ color: "#1890ff" }} />}
                    size="large"
                    style={{ borderRadius: 8 }}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card> */}

          {/* Submit Button */}
          <Form.Item style={{ textAlign: "center", marginTop: 32 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={isSubmitting}
              disabled={initialLoading}
              size="large"
              style={{
                backgroundColor: "#11418b",
                borderColor: "#11418b",
                borderRadius: 8,
                padding: "0 48px",
                height: 48,
                fontSize: 16,
                fontWeight: 600,
              }}
            >
              {isSubmitting
                ? materialId
                  ? "Memperbarui materi..."
                  : "Menyimpan materi..."
                : materialId
                ? "Perbarui Materi"
                : "Simpan Materi"}
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default SessionMaterialForm;
