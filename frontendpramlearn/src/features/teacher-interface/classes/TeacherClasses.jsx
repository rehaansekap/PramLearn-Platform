import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import {
  Row,
  Col,
  Card,
  Input,
  Empty,
  Spin,
  Typography,
  Space,
  Statistic,
  Tag,
  Avatar,
  Progress,
} from "antd";
import {
  UserOutlined,
  BookOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  TrophyOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import useTeacherClasses from "./hooks/useTeacherClasses";

const { Title, Text } = Typography;
const { Search } = Input;

const TeacherClasses = () => {
  const navigate = useNavigate();
  const { classes, loading, error, refetch } = useTeacherClasses();
  const [searchValue, setSearchValue] = useState("");

  const handleSearch = (value) => {
    setSearchValue(value);
    refetch(value);
  };

  const handleClassClick = (classSlug) => {
    navigate(`/teacher/classes/${classSlug}`);
  };

  const getPerformanceIcon = (status) => {
    switch (status) {
      case "excellent":
        return "🏆";
      case "good":
        return "👍";
      case "average":
        return "📈";
      case "needs_improvement":
        return "⚠️";
      default:
        return "📊";
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "60px 0" }}>
        <Spin size="large" tip="Memuat daftar kelas..." />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: "center", padding: "60px 0" }}>
        <Text type="danger">Terjadi kesalahan saat memuat data kelas</Text>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 16px" }}>
      <Helmet>
        <title>Kelas yang Diampu | PramLearn</title>
      </Helmet>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <Title level={2} style={{ margin: 0, color: "#11418b" }}>
          Kelas yang Diampu
        </Title>
        <Text type="secondary" style={{ fontSize: 16 }}>
          Kelola dan pantau performa kelas Anda
        </Text>
      </div>

      {/* Search */}
      <div style={{ marginBottom: 24 }}>
        <Search
          placeholder="Cari kelas..."
          allowClear
          size="large"
          prefix={<SearchOutlined />}
          style={{ maxWidth: 400 }}
          onSearch={handleSearch}
          onChange={(e) => {
            if (!e.target.value) {
              handleSearch("");
            }
          }}
        />
      </div>

      {/* Classes Grid */}
      {classes.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <div>
              <Text style={{ fontSize: 16, color: "#666" }}>
                {searchValue
                  ? "Tidak ada kelas yang sesuai dengan pencarian"
                  : "Belum ada kelas yang diampu"}
              </Text>
              <div style={{ marginTop: 8 }}>
                <Text type="secondary" style={{ fontSize: 14 }}>
                  {searchValue
                    ? "Coba kata kunci lain"
                    : "Kelas akan muncul setelah Anda ditugaskan mengajar"}
                </Text>
              </div>
            </div>
          }
        />
      ) : (
        <Row gutter={[24, 24]}>
          {classes.map((classItem) => (
            <Col xs={24} sm={12} lg={8} xl={6} key={classItem.id}>
              <Card
                hoverable
                style={{
                  borderRadius: 16,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  border: `2px solid ${classItem.performance_status.color}20`,
                  cursor: "pointer",
                }}
                onClick={() => handleClassClick(classItem.slug)}
                bodyStyle={{ padding: "20px" }}
              >
                {/* Class Header */}
                <div style={{ marginBottom: 16 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: 8,
                    }}
                  >
                    <Title level={4} style={{ margin: 0, color: "#11418b" }}>
                      {classItem.name}
                    </Title>
                    <span style={{ fontSize: 20 }}>
                      {getPerformanceIcon(classItem.performance_status.status)}
                    </span>
                  </div>

                  <Tag
                    color={classItem.performance_status.color}
                    style={{ fontSize: 11, fontWeight: 500 }}
                  >
                    {classItem.performance_status.text}
                  </Tag>
                </div>

                {/* Statistics */}
                <div style={{ marginBottom: 16 }}>
                  <Row gutter={[8, 8]}>
                    <Col span={12}>
                      <div style={{ textAlign: "center" }}>
                        <div
                          style={{
                            fontSize: 20,
                            fontWeight: "bold",
                            color: "#11418b",
                          }}
                        >
                          {classItem.student_count}
                        </div>
                        <div
                          style={{
                            fontSize: 11,
                            color: "#666",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 4,
                          }}
                        >
                          <UserOutlined />
                          Siswa
                        </div>
                      </div>
                    </Col>
                    <Col span={12}>
                      <div style={{ textAlign: "center" }}>
                        <div
                          style={{
                            fontSize: 20,
                            fontWeight: "bold",
                            color: "#52c41a",
                          }}
                        >
                          {classItem.subjects_count}
                        </div>
                        <div
                          style={{
                            fontSize: 11,
                            color: "#666",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 4,
                          }}
                        >
                          <BookOutlined />
                          Mapel
                        </div>
                      </div>
                    </Col>
                  </Row>
                </div>

                {/* Performance Metrics */}
                <div style={{ marginBottom: 12 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 4,
                    }}
                  >
                    <Text style={{ fontSize: 12, color: "#666" }}>
                      Rata-rata Nilai
                    </Text>
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "bold",
                        color:
                          classItem.average_grade >= 80
                            ? "#52c41a"
                            : classItem.average_grade >= 70
                            ? "#1890ff"
                            : "#faad14",
                      }}
                    >
                      {classItem.average_grade}
                    </Text>
                  </div>
                  <Progress
                    percent={classItem.average_grade}
                    size="small"
                    strokeColor={
                      classItem.average_grade >= 80
                        ? "#52c41a"
                        : classItem.average_grade >= 70
                        ? "#1890ff"
                        : "#faad14"
                    }
                    showInfo={false}
                  />
                </div>

                <div style={{ marginBottom: 16 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 4,
                    }}
                  >
                    <Text style={{ fontSize: 12, color: "#666" }}>
                      Tingkat Kehadiran
                    </Text>
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "bold",
                        color:
                          classItem.attendance_rate >= 80
                            ? "#52c41a"
                            : classItem.attendance_rate >= 70
                            ? "#1890ff"
                            : "#faad14",
                      }}
                    >
                      {classItem.attendance_rate}%
                    </Text>
                  </div>
                  <Progress
                    percent={classItem.attendance_rate}
                    size="small"
                    strokeColor={
                      classItem.attendance_rate >= 80
                        ? "#52c41a"
                        : classItem.attendance_rate >= 70
                        ? "#1890ff"
                        : "#faad14"
                    }
                    showInfo={false}
                  />
                </div>

                {/* Quick Stats */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 11,
                    color: "#666",
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 4 }}
                  >
                    <FileTextOutlined />
                    {classItem.pending_submissions} pending
                  </div>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 4 }}
                  >
                    <ClockCircleOutlined />
                    {classItem.recent_activity_count} aktivitas
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default TeacherClasses;
