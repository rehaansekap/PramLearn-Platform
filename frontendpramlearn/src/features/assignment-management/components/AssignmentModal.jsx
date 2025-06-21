import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Button, DatePicker, Divider, Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import AssignmentQuestionForm from "./AssignmentQuestionForm";
import useAssignmentForm from "../hooks/useAssignmentForm";
import dayjs from "dayjs";
import Swal from "sweetalert2";

const AssignmentModal = ({
  open,
  onClose,
  materialId,
  editingAssignment,
  onSuccess,
}) => {
  const {
    formData,
    setFormData,
    handleChange,
    addQuestion,
    updateQuestion,
    removeQuestion,
    handleSubmit,
    loading,
    isEdit,
  } = useAssignmentForm(materialId, onSuccess, editingAssignment);

  const [form] = Form.useForm();
  const [initialLoading, setInitialLoading] = useState(false); // Loading untuk data awal

  useEffect(() => {
    if (open && editingAssignment) {
      setInitialLoading(true);
      // Simulasi loading saat fetch data editing assignment
      const timer = setTimeout(() => {
        setFormData({
          title: editingAssignment.title,
          description: editingAssignment.description,
          due_date: editingAssignment.due_date,
          questions: editingAssignment.questions || [],
        });

        form.setFieldsValue({
          title: editingAssignment.title,
          description: editingAssignment.description,
          due_date: editingAssignment.due_date
            ? dayjs(editingAssignment.due_date)
            : null,
        });
        setInitialLoading(false);
      }, 800);

      return () => clearTimeout(timer);
    } else if (open) {
      setFormData({
        title: "",
        description: "",
        due_date: "",
        questions: [],
      });
      form.resetFields();
    }
  }, [editingAssignment, setFormData, open, form]);

  const onFinish = async (values) => {
    if (!formData.title || !formData.description || !formData.due_date) {
      Swal.fire("Error", "Semua field wajib diisi!", "error");
      return;
    }

    const ok = await handleSubmit();
    if (ok) {
      Swal.fire(
        "Berhasil",
        isEdit
          ? "Assignment berhasil diupdate!"
          : "Assignment berhasil dibuat!",
        "success"
      );
      form.resetFields();
      onClose();
      if (onSuccess) onSuccess();
    } else {
      Swal.fire("Gagal", "Gagal menyimpan assignment.", "error");
    }
  };

  const handleDatePickerChange = (date, dateString) => {
    setFormData((prev) => ({
      ...prev,
      due_date: date ? date.toISOString() : "",
    }));
    form.setFieldValue("due_date", date);
  };

  const handleModalClose = () => {
    form.resetFields();
    setFormData({
      title: "",
      description: "",
      due_date: "",
      questions: [],
    });
    setInitialLoading(false);
    onClose();
  };

  const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

  return (
    <Modal
      open={open}
      onCancel={handleModalClose}
      footer={null}
      centered
      title={
        <div
          className="ant-modal-header"
          style={{
            textAlign: "center",
            fontWeight: 700,
            fontSize: "1.5rem",
            color: "#11418b",
          }}
        >
          {isEdit ? "Edit Assignment" : "Buat Assignment"}
        </div>
      }
      destroyOnClose
      className="class-form-modal"
      width={window.innerWidth > 768 ? "60%" : "95%"}
      style={{ top: 20 }}
    >
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
            Memuat data assignment...
          </p>
        </div>
      )}

      <Form
        layout="vertical"
        form={form}
        onFinish={onFinish}
        initialValues={{
          title: "",
          description: "",
          due_date: null,
        }}
        style={{ maxWidth: "100%" }}
      >
        <Form.Item
          label={<span style={{ fontWeight: "bold" }}>Judul</span>}
          name="title"
          rules={[{ required: true, message: "Judul wajib diisi" }]}
        >
          <Input
            name="title"
            value={formData.title}
            onChange={(e) => {
              handleChange(e);
              form.setFieldValue("title", e.target.value);
            }}
            placeholder="Masukkan judul assignment"
            autoFocus
            disabled={initialLoading}
          />
        </Form.Item>

        <Form.Item
          label={<span style={{ fontWeight: "bold" }}>Deskripsi</span>}
          name="description"
          rules={[{ required: true, message: "Deskripsi wajib diisi" }]}
        >
          <Input.TextArea
            name="description"
            value={formData.description}
            onChange={(e) => {
              handleChange(e);
              form.setFieldValue("description", e.target.value);
            }}
            placeholder="Masukkan deskripsi assignment"
            rows={3}
            disabled={initialLoading}
          />
        </Form.Item>

        <Form.Item
          label={<span style={{ fontWeight: "bold" }}>Due Date</span>}
          name="due_date"
          rules={[{ required: true, message: "Due date wajib diisi" }]}
        >
          <DatePicker
            showTime
            format="DD/MM/YYYY HH:mm"
            style={{ width: "100%" }}
            value={formData.due_date ? dayjs(formData.due_date) : null}
            onChange={handleDatePickerChange}
            placeholder="Pilih due date"
            disabled={initialLoading}
          />
        </Form.Item>

        <Divider />

        <div>
          <label
            style={{ fontWeight: "bold", marginBottom: 16, display: "block" }}
          >
            Soal Pilihan Ganda
          </label>
          <div
            style={{
              maxHeight: "400px",
              overflowY: "auto",
              paddingRight: "8px",
            }}
          >
            {formData.questions.map((q, idx) => (
              <AssignmentQuestionForm
                key={idx}
                question={q}
                idx={idx}
                onChange={updateQuestion}
                onRemove={removeQuestion}
                disabled={initialLoading}
              />
            ))}
          </div>
          <Button
            type="dashed"
            onClick={addQuestion}
            style={{ width: "100%", marginTop: 16, marginBottom: 16 }}
            disabled={initialLoading}
          >
            Tambah Soal
          </Button>
        </div>

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
            loading={loading}
            disabled={initialLoading}
          >
            {isEdit ? "Update Assignment" : "Simpan Assignment"}
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AssignmentModal;
