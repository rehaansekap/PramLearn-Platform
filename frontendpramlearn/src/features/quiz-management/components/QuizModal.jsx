import React, { useEffect, useState, useMemo } from "react";
import { Modal, Form, Input, Button, Select, Divider, Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import useQuizForm from "../hooks/useQuizForm";
import QuizQuestionForm from "./QuizQuestionForm";
import useGroupsByMaterial from "../hooks/useGroupsByMaterial";
import Swal from "sweetalert2";

export default function QuizModal({
  open,
  onClose,
  onSubmit,
  materialId,
  classId,
  editingQuiz,
}) {
  const [form] = Form.useForm();
  const [title, setTitle] = useState(editingQuiz ? editingQuiz.title : "");
  const [content, setContent] = useState(
    editingQuiz ? editingQuiz.content : ""
  );
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false); // Loading untuk data awal
  const [groupsLoading, setGroupsLoading] = useState(false); // Loading untuk groups

  const {
    questions,
    setQuestions,
    addQuestion,
    updateQuestion,
    updateChoice,
    removeQuestion,
  } = useQuizForm();

  const groups = useGroupsByMaterial(materialId);
  const isEdit = !!editingQuiz;

  const filteredGroups = useMemo(
    () => groups.filter((g) => g.class_id === classId || g.class === classId),
    [groups, classId]
  );

  // Loading untuk fetch data editing quiz
  useEffect(() => {
    if (open && editingQuiz) {
      setInitialLoading(true);
      // Simulasi loading data editing (bisa diganti dengan fetch real data)
      const timer = setTimeout(() => {
        setTitle(editingQuiz.title);
        setContent(editingQuiz.content);
        if (editingQuiz.questions) setQuestions(editingQuiz.questions);
        if (editingQuiz.assignedGroupIds)
          setSelectedGroups(editingQuiz.assignedGroupIds);

        form.setFieldsValue({
          title: editingQuiz.title,
          content: editingQuiz.content,
          groupIds: editingQuiz.assignedGroupIds || [],
        });

        setInitialLoading(false);
      }, 800);

      return () => clearTimeout(timer);
    } else if (open) {
      setTitle("");
      setContent("");
      setQuestions([]);
      setSelectedGroups([]);
      form.resetFields();
    }
  }, [editingQuiz, open, form, setQuestions]);

  // Loading untuk groups
  useEffect(() => {
    if (open && materialId) {
      setGroupsLoading(true);
      const timer = setTimeout(() => {
        setGroupsLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [open, materialId]);

  const handleGroupChange = (value) => {
    if (value.includes("ALL")) {
      setSelectedGroups(filteredGroups.map((g) => g.id));
      form.setFieldValue(
        "groupIds",
        filteredGroups.map((g) => g.id)
      );
    } else {
      setSelectedGroups(value.filter((v) => v !== "ALL"));
      form.setFieldValue(
        "groupIds",
        value.filter((v) => v !== "ALL")
      );
    }
  };

  const handleFinish = async () => {
    const values = form.getFieldsValue();
    const groupIds = values.groupIds || [];

    if (
      !values.title ||
      !values.content ||
      groupIds.length === 0 ||
      questions.length === 0
    ) {
      Swal.fire(
        "Error",
        "Semua field wajib diisi dan minimal satu soal!",
        "error"
      );
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        title: values.title,
        content: values.content,
        questions,
        groupIds,
      });
      Swal.fire(
        "Berhasil",
        isEdit ? "Quiz berhasil diupdate!" : "Quiz berhasil dibuat!",
        "success"
      );
      handleModalClose();
    } catch (error) {
      Swal.fire("Gagal", "Gagal menyimpan quiz.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    form.resetFields();
    setTitle("");
    setContent("");
    setQuestions([]);
    setSelectedGroups([]);
    setInitialLoading(false);
    setGroupsLoading(false);
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
          {isEdit ? "Edit Quiz" : "Buat Quiz"}
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
            {isEdit ? "Memuat data quiz..." : "Menyiapkan form..."}
          </p>
        </div>
      )}

      <Form layout="vertical" form={form} onFinish={handleFinish}>
        <Form.Item
          label={<span style={{ fontWeight: "bold" }}>Judul Quiz</span>}
          name="title"
          rules={[{ required: true, message: "Judul quiz wajib diisi" }]}
        >
          <Input
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              form.setFieldValue("title", e.target.value);
            }}
            placeholder="Masukkan judul quiz"
            autoFocus
            disabled={initialLoading}
          />
        </Form.Item>

        <Form.Item
          label={
            <span style={{ fontWeight: "bold" }}>Deskripsi/Content Quiz</span>
          }
          name="content"
          rules={[{ required: true, message: "Deskripsi quiz wajib diisi" }]}
        >
          <Input.TextArea
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              form.setFieldValue("content", e.target.value);
            }}
            placeholder="Masukkan deskripsi quiz"
            rows={3}
            disabled={initialLoading}
          />
        </Form.Item>

        <Form.Item
          label={
            <span style={{ fontWeight: "bold" }}>
              Pilih kelompok yang akan di-assign
            </span>
          }
          name="groupIds"
          rules={[{ required: true, message: "Pilih minimal satu kelompok" }]}
        >
          <Select
            mode="multiple"
            allowClear
            style={{ width: "100%" }}
            placeholder="Pilih kelompok"
            value={selectedGroups}
            onChange={handleGroupChange}
            disabled={
              filteredGroups.length === 0 || initialLoading || groupsLoading
            }
            loading={groupsLoading}
            notFoundContent={
              groupsLoading ? (
                <div style={{ textAlign: "center", padding: "20px" }}>
                  <Spin size="small" />
                  <p style={{ marginTop: 8, color: "#666" }}>
                    Memuat kelompok...
                  </p>
                </div>
              ) : (
                "Belum ada kelompok"
              )
            }
          >
            {filteredGroups.length === 0 && !groupsLoading ? (
              <Select.Option value="NO_GROUP" disabled>
                Belum ada kelompok
              </Select.Option>
            ) : (
              <>
                <Select.Option value="ALL">Semua Kelompok</Select.Option>
                {filteredGroups.map((g) => (
                  <Select.Option key={g.id} value={g.id}>
                    {g.name}
                  </Select.Option>
                ))}
              </>
            )}
          </Select>
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
            {questions.map((q, idx) => (
              <QuizQuestionForm
                key={idx}
                question={q}
                idx={idx}
                onChange={updateQuestion}
                onChoiceChange={updateChoice}
                onRemove={() => removeQuestion(idx)}
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
            disabled={filteredGroups.length === 0 || initialLoading}
          >
            {isEdit ? "Update Quiz" : "Simpan Quiz & Assign"}
          </Button>
        </Form.Item>

        <Form.Item>
          <Button
            onClick={handleModalClose}
            style={{
              width: "100%",
              height: "40px",
            }}
            disabled={loading}
          >
            Batal
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
}
