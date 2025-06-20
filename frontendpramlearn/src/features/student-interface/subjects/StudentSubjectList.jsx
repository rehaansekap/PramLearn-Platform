import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Typography, Input, Select, Row, Col, Spin, Alert } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import useStudentSubjects from "./hooks/useStudentSubjects";
import SubjectCard from "./components/SubjectCard";
import SubjectDetailStudent from "./SubjectDetailStudent";
import SubjectListHeader from "./components/SubjectListHeader";
import SubjectListFilters from "./components/SubjectListFilters";

const { Title } = Typography;

const StudentSubjectList = () => {
  const { subjects, loading, error } = useStudentSubjects();
  const [search, setSearch] = useState("");
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [dayFilter, setDayFilter] = useState("");
  const navigate = useNavigate();

  const DAY_OPTIONS = [
    { value: "", label: "Semua Hari" },
    { value: "Senin", label: "Senin" },
    { value: "Selasa", label: "Selasa" },
    { value: "Rabu", label: "Rabu" },
    { value: "Kamis", label: "Kamis" },
    { value: "Jumat", label: "Jumat" },
    { value: "Sabtu", label: "Sabtu" },
    { value: "Minggu", label: "Minggu" },
  ];

  const filteredSubjects = subjects.filter((subject) => {
    const matchesSearch = subject.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesDay =
      !dayFilter ||
      (subject.schedules &&
        subject.schedules.some((schedule) => schedule.day === dayFilter));

    return matchesSearch && matchesDay;
  });

  const handleQuickAccessMaterial = (materialSlug) => {
    if (materialSlug) {
      navigate(`/student/materials/${materialSlug}`);
    }
  };

  const handleSubjectClick = (subject) => {
    setSelectedSubject(subject);
  };

  const handleBackToList = () => {
    setSelectedSubject(null);
  };

  if (selectedSubject) {
    return (
      <SubjectDetailStudent
        subject={selectedSubject}
        onBack={handleBackToList}
      />
    );
  }

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "50vh",
        }}
      >
        <Spin size="large" tip="Memuat mata pelajaran..." />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Gagal Memuat Data"
        description={error.message}
        type="error"
        showIcon
        style={{ margin: "20px 0" }}
      />
    );
  }

  return (
    <div
      style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "24px 16px",
      }}
    >
      <SubjectListHeader />

      <SubjectListFilters
        search={search}
        setSearch={setSearch}
        dayFilter={dayFilter}
        setDayFilter={setDayFilter}
        dayOptions={DAY_OPTIONS}
      />

      <Row gutter={[24, 24]}>
        {filteredSubjects.map((subject) => (
          <Col key={subject.id} xs={24} sm={12} lg={8} xl={6}>
            <SubjectCard
              subject={subject}
              onClick={handleSubjectClick}
              onQuickAccessMaterial={handleQuickAccessMaterial}
            />
          </Col>
        ))}
      </Row>

      {filteredSubjects.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "60px 20px",
            color: "#999",
          }}
        >
          <Title level={4} style={{ color: "#999" }}>
            Tidak ada mata pelajaran ditemukan
          </Title>
          <p>Coba ubah filter pencarian Anda</p>
        </div>
      )}
    </div>
  );
};

export default StudentSubjectList;
