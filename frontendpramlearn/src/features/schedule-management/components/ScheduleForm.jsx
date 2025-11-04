import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Select, TimePicker, Button, Spin } from "antd";
import dayjs from "dayjs";
import api from "../../../api";

const { Option } = Select;

const DAY_OPTIONS = [
  { value: 0, label: "Senin" },
  { value: 1, label: "Selasa" },
  { value: 2, label: "Rabu" },
  { value: 3, label: "Kamis" },
  { value: 4, label: "Jumat" },
  { value: 5, label: "Sabtu" },
  { value: 6, label: "Minggu" },
];

const ScheduleForm = ({
  open,
  onClose,
  onSuccess,
  editingSchedule,
  classOptions,
  subjectOptions,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingSchedule) {
      form.setFieldsValue({
        class_obj: editingSchedule.class_obj,
        subject: editingSchedule.subject,
        day_of_week: editingSchedule.day_of_week,
        time: dayjs(editingSchedule.time, "HH:mm"),
      });
    } else {
      form.resetFields();
    }
  }, [editingSchedule, form]);

  const handleFinish = async (values) => {
    setLoading(true);
    try {
      const payload = {
        ...values,
        time: values.time.format("HH:mm"),
      };
      if (editingSchedule) {
        await api.put(`schedules/${editingSchedule.id}/`, payload);
      } else {
        await api.post("schedules/", payload);
      }
      onSuccess();
      onClose();
    } catch (error) {
      // Tampilkan error sesuai kebutuhan
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={editingSchedule ? "Edit Jadwal" : "Tambah Jadwal"}
      footer={null}
      destroyOnClose
    >
      <Spin spinning={loading}>
        <Form form={form} layout="vertical" onFinish={handleFinish}>
          <Form.Item
            label="Kelas"
            name="class_obj"
            rules={[{ required: true, message: "Kelas wajib dipilih" }]}
          >
            <Select
              name="class_obj"
              value={form.getFieldValue("class_obj")}
              placeholder="Pilih kelas"
            >
              {classOptions.map((cls) => (
                <Option key={cls.id} value={cls.id}>
                  {cls.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label="Mata Pelajaran"
            name="subject"
            rules={[
              { required: true, message: "Mata pelajaran wajib dipilih" },
            ]}
          >
            <Select
              name="subject"
              value={form.getFieldValue("subject")}
              placeholder="Pilih mata pelajaran"
            >
              {subjectOptions.map((subj) => (
                <Option key={subj.id} value={subj.id}>
                  {subj.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label="Hari"
            name="day_of_week"
            rules={[{ required: true, message: "Hari wajib dipilih" }]}
          >
            <Select placeholder="Pilih hari">
              {DAY_OPTIONS.map((d) => (
                <Option key={d.value} value={d.value}>
                  {d.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label="Jam"
            name="time"
            rules={[{ required: true, message: "Jam wajib diisi" }]}
          >
            <TimePicker format="HH:mm" minuteStep={5} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              {editingSchedule ? "Update" : "Tambah"}
            </Button>
          </Form.Item>
        </Form>
      </Spin>
    </Modal>
  );
};

export default ScheduleForm;
