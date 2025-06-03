import React, { useState } from "react";
import { Form, Input, Button, Select, Alert, Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import useUserForm from "../hooks/useUserForm";
import Swal from "sweetalert2";

const { Option } = Select;

const UserForm = ({ userId, onSuccess, isSubmitting, setIsSubmitting }) => {
  const {
    formData,
    roles,
    classes,
    message,
    handleChange,
    handleSubmit,
    loading,
    initialLoading,
    rolesLoading,
    classesLoading,
  } = useUserForm(userId, onSuccess);

  const [formError, setFormError] = useState("");

  const isStudentRole = Number(formData.role) === 3;

  const handleClassChange = (value) => {
    // Pastikan value selalu array
    const classIdsArray = Array.isArray(value) ? value : [value];
    handleChange({
      target: {
        name: "class_ids",
        value: classIdsArray,
      },
    });
  };

  const onFinish = async () => {
    try {
      setIsSubmitting(true);
      setFormError("");
      await handleSubmit();
    } catch (error) {
      console.error("Error submitting form:", error);
      setFormError(
        error.response?.data?.detail ||
          error.response?.data?.message ||
          "An error occurred while saving the user."
      );
      Swal.fire("Error", "Failed to save user. Please try again.", "error");
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
            {userId ? "Memuat data user..." : "Memuat form..."}
          </p>
        </div>
      )}

      <h1
        className="ant-modal-header"
        style={{ color: "#11418b", marginBottom: 16 }}
      >
        {userId ? "Update User" : "Create User"}
      </h1>

      {formError && (
        <Alert
          message="Error"
          description={formError}
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      <Form layout="vertical" onFinish={onFinish}>
        <Form.Item
          label={<span style={{ fontWeight: "bold" }}>Username</span>}
          required
        >
          <Input
            name="username"
            value={formData.username}
            onChange={handleChange}
            disabled={initialLoading}
          />
        </Form.Item>

        <Form.Item
          label={<span style={{ fontWeight: "bold" }}>First Name</span>}
          required
        >
          <Input
            name="first_name"
            value={formData.first_name || ""}
            onChange={handleChange}
            disabled={initialLoading}
          />
        </Form.Item>

        <Form.Item
          label={<span style={{ fontWeight: "bold" }}>Last Name</span>}
        >
          <Input
            name="last_name"
            value={formData.last_name || ""}
            onChange={handleChange}
            disabled={initialLoading}
          />
        </Form.Item>

        <Form.Item
          label={<span style={{ fontWeight: "bold" }}>Email</span>}
          required
          rules={[{ required: true, message: "Email wajib diisi" }]}
        >
          <Input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            disabled={initialLoading}
          />
        </Form.Item>

        <Form.Item
          label={<span style={{ fontWeight: "bold" }}>Password</span>}
          required
          rules={[{ required: true, message: "Password wajib diisi" }]}
        >
          <Input.Password
            name="password"
            value={formData.password}
            onChange={handleChange}
            disabled={initialLoading}
          />
        </Form.Item>

        <Form.Item
          label={<span style={{ fontWeight: "bold" }}>Role</span>}
          required
          rules={[{ required: true, message: "Role wajib dipilih" }]}
        >
          <Select
            name="role"
            value={formData.role}
            onChange={(value) =>
              handleChange({ target: { name: "role", value } })
            }
            disabled={initialLoading || rolesLoading}
            loading={rolesLoading}
            notFoundContent={
              rolesLoading ? (
                <div style={{ textAlign: "center", padding: "20px" }}>
                  <Spin
                    indicator={
                      <LoadingOutlined style={{ fontSize: 14 }} spin />
                    }
                  />
                  <p style={{ marginTop: 8, color: "#666" }}>Memuat roles...</p>
                </div>
              ) : (
                "No roles available"
              )
            }
          >
            {roles.map((role) => (
              <Option key={role.id} value={role.id}>
                {role.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        {isStudentRole && (
          <Form.Item label={<span style={{ fontWeight: "bold" }}>Kelas</span>}>
            <Select
              name="class_ids"
              value={formData.class_ids || []}
              onChange={handleClassChange}
              placeholder="Pilih kelas"
              disabled={initialLoading || classesLoading}
              loading={classesLoading}
              notFoundContent={
                classesLoading ? (
                  <div style={{ textAlign: "center", padding: "20px" }}>
                    <Spin
                      indicator={
                        <LoadingOutlined style={{ fontSize: 14 }} spin />
                      }
                    />
                    <p style={{ marginTop: 8, color: "#666" }}>
                      Memuat kelas...
                    </p>
                  </div>
                ) : (
                  "No classes available"
                )
              }
            >
              {classes.map((cls) => (
                <Option key={cls.id} value={cls.id}>
                  {cls.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        )}

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            disabled={isSubmitting || initialLoading}
            loading={isSubmitting}
            style={{
              width: "100%",
              height: 40,
              fontWeight: 600,
              borderRadius: 8,
              backgroundColor: "#11418b",
              borderColor: "#11418b",
            }}
          >
            {isSubmitting
              ? userId
                ? "Updating..."
                : "Creating..."
              : userId
              ? "Update User"
              : "Create User"}
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default UserForm;
