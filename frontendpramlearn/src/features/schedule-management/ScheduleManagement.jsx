import React, { useEffect, useState } from "react";
import api from "../../api";
import { Table, Button, Modal, Spin } from "antd";
import ScheduleForm from "./components/ScheduleForm";

const ScheduleManagement = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);

  // Tambahkan state berikut:
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);

  // Dummy data, ganti dengan fetch dari API
  const [classOptions, setClassOptions] = useState([]);
  const [subjectOptions, setSubjectOptions] = useState([]);

  const fetchSchedules = async () => {
    setLoading(true);
    const res = await api.get("schedules/");
    setSchedules(res.data);
    setLoading(false);
  };

  // Fetch classes
  const fetchClasses = async () => {
    const res = await api.get("classes/");
    setClassOptions(res.data);
  };

  // Fetch subjects
  const fetchSubjects = async () => {
    const res = await api.get("subjects/");
    setSubjectOptions(res.data);
  };

  useEffect(() => {
    fetchSchedules();
    fetchClasses();
    fetchSubjects();
    // TODO: fetch classOptions dan subjectOptions dari API
  }, []);

  // Handler untuk tambah jadwal
  const handleAdd = () => {
    setSelectedSchedule(null);
    setModalOpen(true);
  };

  // Handler untuk edit jadwal
  const handleEdit = (schedule) => {
    setSelectedSchedule(schedule);
    setModalOpen(true);
  };

  // Handler setelah sukses tambah/edit
  const handleSuccess = () => {
    fetchSchedules();
  };

  return (
    <div>
      <h3>Manajemen Jadwal Pelajaran</h3>
      <Button type="primary" onClick={handleAdd} style={{ marginBottom: 16 }}>
        Tambah Jadwal
      </Button>
      <Table
        dataSource={schedules}
        columns={[
          { title: "Kelas", dataIndex: "class_name", key: "class" },
          {
            title: "Mata Pelajaran",
            dataIndex: "subject_name",
            key: "subject",
          },
          { title: "Hari", dataIndex: "day_of_week", key: "day" },
          { title: "Jam", dataIndex: "time", key: "time" },
          {
            title: "Aksi",
            key: "actions",
            render: (_, record) => (
              <Button onClick={() => handleEdit(record)}>Edit</Button>
            ),
          },
        ]}
        loading={loading}
        rowKey="id"
      />

      <ScheduleForm
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleSuccess}
        editingSchedule={selectedSchedule}
        classOptions={classOptions}
        subjectOptions={subjectOptions}
      />
    </div>
  );
};

export default ScheduleManagement;
