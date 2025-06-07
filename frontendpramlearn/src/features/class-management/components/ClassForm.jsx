import React, { useEffect } from "react";
import { Form, Input, Button, Select, Space, Alert, Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import useClassForm from "../hooks/useClassForm";
import useAvailableStudents from "../hooks/useAvailableStudents";
import useAvailableAndRelatedStudents from "../hooks/useAvailableAndRelatedStudents";
import Swal from "sweetalert2";

const { Option } = Select;

const ClassForm = ({ classId, onSuccess, isSubmitting, setIsSubmitting }) => {
  const [initialLoading, setInitialLoading] = React.useState(false);

  const {
    formData,
    message,
    handleChange,
    handleSubmit,
    handleAddStudent,
    handleRemoveStudent,
    handleStudentChange,
    setFormData,
    setStudents,
  } = useClassForm(classId, onSuccess);

  const [form] = Form.useForm();
  const { availableStudents } = useAvailableStudents();
  const { availableAndRelatedStudents } =
    useAvailableAndRelatedStudents(classId);
  const studentOptions = classId
    ? availableAndRelatedStudents
    : availableStudents;

  // Loading saat fetch data untuk edit
  useEffect(() => {
    if (classId) {
      setInitialLoading(true);
      // Simulasi loading saat fetch class data
      const timer = setTimeout(() => {
        setInitialLoading(false);
      }, 800);
      return () => clearTimeout(timer);
    } else {
      setFormData({ name: "", students: [] });
      setStudents([]);
    }
  }, [classId, setFormData, setStudents]);

  useEffect(() => {
    form.setFieldsValue({ name: formData.name });
  }, [formData.name, form]);

  const onFinish = async () => {
    setIsSubmitting(true);
    try {
      await handleSubmit();
      onSuccess();
      // Hapus Swal.fire di sini karena sudah ada di parent component
    } catch (error) {
      const errorMessage =
        error.response?.data?.detail ||
        "Terjadi kesalahan saat menyimpan class.";
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
            {classId ? "Loading class data..." : "Preparing form..."}
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
        {classId ? "Update Class" : "Create Class"}
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
        initialValues={{ name: formData.name }}
      >
        <Form.Item
          label={<span style={{ fontWeight: "bold" }}>Class Name</span>}
          name="name"
          rules={[{ required: true, message: "Class name is required" }]}
        >
          <Input
            name="name"
            onChange={handleChange}
            placeholder="Enter class name"
            autoFocus
            disabled={initialLoading}
          />
        </Form.Item>

        <h2 style={{ fontWeight: "bold", marginBottom: 8 }}>Students</h2>

        <div className="class-form-scrollable">
          <Space direction="vertical" style={{ width: "100%" }}>
            {formData.students.map((student, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 8,
                }}
              >
                <Form.Item
                  label={
                    <span style={{ fontWeight: "bold" }}>{`Student ${
                      index + 1
                    }`}</span>
                  }
                  required
                  style={{
                    flex: 1,
                    marginBottom: 0,
                    marginTop: 0,
                  }}
                  labelCol={{ span: 24 }}
                  wrapperCol={{ span: 24 }}
                >
                  <Select
                    name="student"
                    value={student.student || ""}
                    onChange={(value) =>
                      handleStudentChange(index, {
                        target: { name: "student", value },
                      })
                    }
                    placeholder="Select student"
                    style={{ width: "100%" }}
                    showSearch
                    optionFilterProp="children"
                    disabled={initialLoading}
                    loading={!studentOptions || studentOptions.length === 0}
                  >
                    {studentOptions.map((s) => (
                      <Option key={s.id} value={s.id}>
                        {s.username}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
                <Button
                  danger
                  onClick={() => handleRemoveStudent(index)}
                  style={{ marginLeft: 8, marginTop: 22 }}
                  disabled={initialLoading}
                >
                  Remove
                </Button>
              </div>
            ))}
          </Space>
        </div>

        <Button
          type="dashed"
          onClick={handleAddStudent}
          style={{ width: "100%", marginBottom: 16 }}
          disabled={initialLoading}
        >
          Add Student
        </Button>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            disabled={isSubmitting || initialLoading}
            loading={isSubmitting}
            style={{
              width: "100%",
              height: "40px",
              fontSize: "16px",
              fontWeight: "600",
            }}
          >
            {isSubmitting
              ? classId
                ? "Updating..."
                : "Creating..."
              : classId
              ? "Update Class"
              : "Create Class"}
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default ClassForm;
