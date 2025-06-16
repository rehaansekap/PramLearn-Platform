import React, { useState } from "react";
import {
  Row,
  Col,
  Input,
  Empty,
  Spin,
  Alert,
  Select,
  Space,
  Typography,
  Card,
  Breadcrumb,
} from "antd";
import {
  LoadingOutlined,
  BookOutlined,
  SearchOutlined,
  CalendarOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import useStudentSubjects from "./hooks/useStudentSubjects";
import SubjectCard from "./components/SubjectCard";
import SubjectDetailStudent from "./SubjectDetailStudent";

const { Title, Text } = Typography;

const StudentSubjectList = () => {
  const { subjects, loading, error } = useStudentSubjects();
  const [search, setSearch] = useState("");
  const [selectedSubject, setSelectedSubject] = useState(null);
  const navigate = useNavigate();
  const [dayFilter, setDayFilter] = useState("");

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
    const matchName = subject.name
      .toLowerCase()
      .includes(search.trim().toLowerCase());
    const matchDay =
      !dayFilter ||
      (subject.schedules &&
        subject.schedules.some((sch) => sch.day_of_week === dayFilter));
    return matchName && matchDay;
  });

  const handleQuickAccessMaterial = (materialSlug) => {
    if (materialSlug) {
      navigate(`/student/materials/${materialSlug}`);
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
    <div
      style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "24px 16px",
        minHeight: "calc(100vh - 64px)",
      }}
    >
      {/* Breadcrumb - Konsisten dengan halaman lain */}
      <Breadcrumb
        style={{ marginBottom: 24 }}
        items={[
          {
            href: "/student",
            title: (
              <Space>
                <HomeOutlined />
                <span>Dashboard</span>
              </Space>
            ),
          },
          {
            title: (
              <Space>
                <BookOutlined />
                <span>My Subjects</span>
              </Space>
            ),
          },
        ]}
      />

      {/* Header Section - Konsisten dengan student assignments */}
      {/* Header Section - Konsisten dengan student assignments */}
      <div
        style={{
          background:
            "linear-gradient(135deg, #001529 0%, #3a3f5c 60%, #43cea2 100%)", // Sama dengan StudentLayout
          borderRadius: 16,
          padding: "32px 24px",
          marginBottom: 32,
          color: "white",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -20,
            right: -20,
            width: 100,
            height: 100,
            borderRadius: "50%",
            background: "rgba(255, 255, 255, 0.1)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -30,
            left: -30,
            width: 120,
            height: 120,
            borderRadius: "50%",
            background: "rgba(255, 255, 255, 0.05)",
          }}
        />

        <Row align="middle" style={{ position: "relative", zIndex: 1 }}>
          <Col xs={24} md={18}>
            <Title
              level={2}
              style={{ color: "white", margin: 0, marginBottom: 8 }}
            >
              📚 My Subjects
            </Title>
            <Text
              style={{
                color: "rgba(255, 255, 255, 0.9)",
                fontSize: 16,
                display: "block",
                marginBottom: 4,
              }}
            >
              Kelola mata pelajaran dan akses materi pembelajaran
            </Text>
            <Text
              style={{
                color: "rgba(255, 255, 255, 0.8)",
                fontSize: 14,
              }}
            >
              Total {subjects.length} mata pelajaran tersedia
            </Text>
          </Col>
          <Col xs={24} md={6} style={{ textAlign: "center" }}>
            <div
              style={{
                background: "rgba(255, 255, 255, 0.15)",
                borderRadius: 12,
                padding: 16,
                backdropFilter: "blur(10px)",
              }}
            >
              <BookOutlined style={{ fontSize: 32, marginBottom: 8 }} />
              <div style={{ fontSize: 14, opacity: 0.9 }}>
                Pembelajaran Aktif
              </div>
            </div>
          </Col>
        </Row>
      </div>

      {/* Filter Section - Konsisten dengan assignments */}
      <Card
        style={{
          borderRadius: 12,
          marginBottom: 24,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
        bodyStyle={{ padding: "20px 24px" }}
      >
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={10}>
            <Space.Compact style={{ width: "100%" }}>
              <Input
                placeholder="Cari mata pelajaran..."
                prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
                allowClear
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  borderRadius: "8px 0 0 8px",
                  height: 40,
                }}
              />
            </Space.Compact>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="Filter berdasarkan hari"
              prefix={<CalendarOutlined />}
              allowClear
              value={dayFilter}
              onChange={setDayFilter}
              style={{ width: "100%", height: 40 }}
              options={DAY_OPTIONS}
            />
          </Col>
          <Col xs={24} md={8}>
            <div style={{ textAlign: "right" }}>
              <Text type="secondary" style={{ fontSize: 14 }}>
                Menampilkan {filteredSubjects.length} dari {subjects.length}{" "}
                mata pelajaran
              </Text>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Error State */}
      {error && (
        <Alert
          message="Gagal memuat subjects"
          description={
            error.message || "Terjadi kesalahan saat mengambil data subjects."
          }
          type="error"
          showIcon
          style={{
            marginBottom: 24,
            borderRadius: 12,
          }}
        />
      )}

      {/* Loading State */}
      {loading ? (
        <Card
          style={{
            borderRadius: 12,
            textAlign: "center",
            padding: "60px 24px",
          }}
        >
          <Spin
            indicator={
              <LoadingOutlined
                style={{ fontSize: 48, color: "#11418b" }}
                spin
              />
            }
            tip={
              <Text
                style={{
                  fontSize: 16,
                  color: "#666",
                  marginTop: 16,
                  display: "block",
                }}
              >
                Memuat data subjects...
              </Text>
            }
          />
        </Card>
      ) : filteredSubjects.length === 0 ? (
        /* Empty State */
        <Card
          style={{
            borderRadius: 12,
            textAlign: "center",
            padding: "60px 24px",
          }}
        >
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <div>
                <Text style={{ fontSize: 16, color: "#666" }}>
                  {search || dayFilter
                    ? "Tidak ada mata pelajaran yang sesuai filter"
                    : "Belum ada mata pelajaran ditemukan"}
                </Text>
                {(search || dayFilter) && (
                  <div style={{ marginTop: 12 }}>
                    <Text type="secondary" style={{ fontSize: 14 }}>
                      Coba ubah kata kunci pencarian atau filter hari
                    </Text>
                  </div>
                )}
              </div>
            }
          />
        </Card>
      ) : (
        /* Subjects Grid */
        <Row gutter={[24, 24]}>
          {filteredSubjects.map((subject) => (
            <Col xs={24} sm={12} lg={8} xl={6} key={subject.id}>
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
