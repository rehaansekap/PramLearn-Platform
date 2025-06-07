import React, { useEffect, useState } from "react";
import api from "../../api";
import { Table } from "antd";

const StudentActivityMonitor = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchActivities = async () => {
    setLoading(true);
    const res = await api.get("student-activities/");
    setActivities(res.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  return (
    <div>
      <h3>Monitoring Aktivitas Siswa</h3>
      <Table
        dataSource={activities}
        columns={[
          {
            title: "Siswa",
            dataIndex: ["student", "username"],
            key: "student",
          },
          { title: "Tipe", dataIndex: "type", key: "type" },
          { title: "Judul", dataIndex: "title", key: "title" },
          { title: "Deskripsi", dataIndex: "description", key: "description" },
          { title: "Waktu", dataIndex: "time", key: "time" },
        ]}
        loading={loading}
        rowKey="id"
      />
    </div>
  );
};

export default StudentActivityMonitor;
