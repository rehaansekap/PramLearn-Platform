import React, { useEffect, useState } from "react";
import { Form, Input, Button, Select, Alert, Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import useSubjectForm from "../hooks/useSubjectForm";
import Swal from "sweetalert2";

const { Option } = Select;

const SubjectForm = ({
  subjectId,
  onSuccess,
  isSubmitting,
  setIsSubmitting,
}) => {
  const { formData, message, handleChange, handleSubmit, teachers, classes } =
    useSubjectForm(subjectId, onSuccess);

  const [form] = Form.useForm();
  const [initialLoading, setInitialLoading] = useState(false);

  // Loading saat fetch data untuk edit
  useEffect(() => {
    if (subjectId) {
      setInitialLoading(true);
      // Simulasi loading saat fetch subject data
      const timer = setTimeout(() => {
        setInitialLoading(false);
      }, 800);
      return () => clearTimeout(timer);
    } else {
      // Reset form untuk create new
      form.resetFields();
    }
  }, [subjectId, form]);

  // Set form values ketika data berubah
  useEffect(() => {
    form.setFieldsValue({
      name: formData.name,
      teacher: formData.teacher,
      class_id: formData.class_id,
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
        "Terjadi kesalahan saat menyimpan subject.";
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
            {subjectId ? "Loading subject data..." : "Preparing form..."}
          </p>
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
        {subjectId ? "Update Subject" : "Create Subject"}
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
          name: formData.name,
          teacher: formData.teacher,
          class_id: formData.class_id,
        }}
        style={{ maxWidth: "100%" }}
      >
        <Form.Item
          label={<span style={{ fontWeight: "bold" }}>Subject Name</span>}
          name="name"
          rules={[{ required: true, message: "Subject name wajib diisi" }]}
        >
          <Input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Masukkan nama subject"
            autoFocus
            disabled={initialLoading}
          />
        </Form.Item>

        <Form.Item
          label={<span style={{ fontWeight: "bold" }}>Teacher</span>}
          name="teacher"
          rules={[{ required: true, message: "Teacher wajib dipilih" }]}
        >
          <Select
            name="teacher"
            value={formData.teacher}
            onChange={(value) =>
              handleChange({ target: { name: "teacher", value } })
            }
            placeholder="Pilih teacher"
            disabled={initialLoading}
          >
            {teachers.map((teacher) => (
              <Option key={teacher.id} value={teacher.id}>
                {teacher.first_name} {teacher.last_name} - {teacher.username}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label={<span style={{ fontWeight: "bold" }}>Class</span>}
          name="class_id"
          rules={[{ required: true, message: "Class wajib dipilih" }]}
        >
          <Select
            name="class_id"
            value={formData.class_id}
            onChange={(value) =>
              handleChange({ target: { name: "class_id", value } })
            }
            placeholder="Pilih class"
            disabled={initialLoading}
          >
            {classes.map((cls) => (
              <Option key={cls.id} value={cls.id}>
                {cls.name}
              </Option>
            ))}
          </Select>
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
            disabled={initialLoading}
          >
            {isSubmitting
              ? subjectId
                ? "Updating subject..."
                : "Creating subject..."
              : subjectId
              ? "Update Subject"
              : "Create Subject"}
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default SubjectForm;
