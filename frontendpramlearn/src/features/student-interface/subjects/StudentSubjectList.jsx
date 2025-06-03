import React, { useState } from "react";
import { Row, Col, Input, Empty, Spin, Alert } from "antd";
import useStudentSubjects from "./hooks/useStudentSubjects";
import SubjectCard from "./components/SubjectCard";
import SubjectDetailStudent from "./SubjectDetailStudent";
import { LoadingOutlined } from "@ant-design/icons";

const StudentSubjectList = () => {
  const { subjects, loading, error } = useStudentSubjects();
  const [search, setSearch] = useState("");
  const [selectedSubject, setSelectedSubject] = useState(null);

  const filteredSubjects = subjects.filter((subject) =>
    subject.name.toLowerCase().includes(search.trim().toLowerCase())
  );

  const handleQuickAccessMaterial = (materialSlug) => {
    // Navigasi menggunakan slug
    if (materialSlug) {
      window.location.href = `/student/materials/${materialSlug}`;
    }
  };

  if (selectedSubject) {
    return (
      <SubjectDetailStudent
        subject={selectedSubject}
        onBack={() => setSelectedSubject(null)}
      />
    );
  }

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: 16 }}>
      <h2 style={{ color: "#11418b", fontWeight: 700, marginBottom: 16 }}>
        My Subjects
      </h2>
      <Input.Search
        placeholder="Cari mata pelajaran..."
        allowClear
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ maxWidth: 350, marginBottom: 24 }}
      />
      {error && (
        <Alert
          message="Gagal memuat subjects"
          description={
            error.message || "Terjadi kesalahan saat mengambil data subjects."
          }
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}
      {loading ? (
        <div style={{ textAlign: "center", margin: "40px 0" }}>
          <Spin indicator={<LoadingOutlined style={{ fontSize: 32 }} spin />} />
          <p style={{ marginTop: 16, color: "#666" }}>
            Memuat data subjects...
          </p>
        </div>
      ) : filteredSubjects.length === 0 ? (
        <Empty description="Belum ada mata pelajaran ditemukan" />
      ) : (
        <Row gutter={[16, 16]}>
          {filteredSubjects.map((subject) => (
            <Col xs={24} sm={12} md={8} key={subject.id}>
              <SubjectCard
                subject={subject}
                onClick={setSelectedSubject}
                onQuickAccessMaterial={handleQuickAccessMaterial}
              />
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default StudentSubjectList;
