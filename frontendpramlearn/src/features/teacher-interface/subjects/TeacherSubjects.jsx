import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Row,
  Col,
  Typography,
  Input,
  Space,
  Statistic,
  Tag,
  Progress,
  Button,
  Spin,
  Alert,
  Empty,
} from "antd";
import {
  BookOutlined,
  UserOutlined,
  FileTextOutlined,
  QuestionCircleOutlined,
  ClockCircleOutlined,
  TrophyOutlined,
  SearchOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import useTeacherSubjects from "./hooks/useTeacherSubjects";

const { Title, Text } = Typography;
const { Search } = Input;

const TeacherSubjects = () => {
  const navigate = useNavigate();
  const { subjects, loading, error, refetch } = useTeacherSubjects();
  const [searchValue, setSearchValue] = useState("");

  const handleSearch = (value) => {
    setSearchValue(value);
    refetch(value);
  };

  const handleSubjectClick = (subjectSlug) => {
    navigate(`/teacher/subjects/${subjectSlug}`);
  };

  const getPerformanceColor = (grade) => {
    if (grade >= 80) return "#52c41a";
    if (grade >= 70) return "#1890ff";
    if (grade >= 60) return "#faad14";
    return "#ff4d4f";
  };

  const getGradeStatus = (grade) => {
    if (grade >= 80) return { text: "Excellent", color: "success" };
    if (grade >= 70) return { text: "Good", color: "processing" };
    if (grade >= 60) return { text: "Average", color: "warning" };
    return { text: "Needs Improvement", color: "error" };
  };

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
      <div style={{ padding: "20px 0" }}>
        <Alert
          message="Error"
          description="Terjadi kesalahan saat memuat data mata pelajaran."
          type="error"
          showIcon
          action={
            <Button size="small" onClick={() => refetch()}>
              Coba Lagi
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div style={{ padding: "24px" }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0, color: "#11418b" }}>
          Mata Pelajaran Saya
        </Title>
        <Text type="secondary">
          Kelola dan pantau mata pelajaran yang Anda ampu
        </Text>
      </div>

      {/* Search */}
      <div style={{ marginBottom: 24 }}>
        <Search
          placeholder="Cari mata pelajaran atau kelas..."
          allowClear
          enterButton={<SearchOutlined />}
          size="large"
          onSearch={handleSearch}
          style={{ maxWidth: 600 }}
        />
      </div>

      {/* Subjects Grid */}
      {subjects.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <div>
              <Text style={{ fontSize: 16, color: "#666" }}>
                {searchValue
                  ? "Tidak ada mata pelajaran yang cocok dengan pencarian"
                  : "Belum ada mata pelajaran yang diampu"}
              </Text>
            </div>
          }
        />
      ) : (
        <Row gutter={[24, 24]}>
          {subjects.map((subject) => {
            const gradeStatus = getGradeStatus(subject.average_grade);

            return (
              <Col xs={24} sm={12} lg={8} xl={6} key={subject.id}>
                <Card
                  hoverable
                  style={{
                    borderRadius: 16,
                    border: "1px solid #f0f0f0",
                    height: "100%",
                    cursor: "pointer",
                  }}
                  bodyStyle={{ padding: 0 }}
                  onClick={() => handleSubjectClick(subject.slug)}
                >
                  {/* Header Card */}
                  <div
                    style={{
                      background:
                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      padding: "20px",
                      color: "white",
                      borderRadius: "16px 16px 0 0",
                    }}
                  >
                    <Space
                      direction="vertical"
                      size="small"
                      style={{ width: "100%" }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <BookOutlined style={{ fontSize: 24 }} />
                        {subject.pending_submissions > 0 && (
                          <Tag color="orange" style={{ margin: 0 }}>
                            {subject.pending_submissions} pending
                          </Tag>
                        )}
                      </div>
                      <Title
                        level={4}
                        style={{ color: "white", margin: 0, fontSize: 16 }}
                      >
                        {subject.name}
                      </Title>
                      <Text style={{ color: "rgba(255,255,255,0.8)" }}>
                        Kelas {subject.class_name}
                      </Text>
                    </Space>
                  </div>

                  {/* Content */}
                  <div style={{ padding: "20px" }}>
                    <Space
                      direction="vertical"
                      size="middle"
                      style={{ width: "100%" }}
                    >
                      {/* Statistics */}
                      <Row gutter={16}>
                        <Col span={12}>
                          <Statistic
                            title="Siswa"
                            value={subject.students_count}
                            prefix={<UserOutlined />}
                            valueStyle={{ fontSize: 16 }}
                          />
                        </Col>
                        <Col span={12}>
                          <Statistic
                            title="Materi"
                            value={subject.materials_count}
                            prefix={<FileTextOutlined />}
                            valueStyle={{ fontSize: 16 }}
                          />
                        </Col>
                      </Row>

                      <Row gutter={16}>
                        <Col span={12}>
                          <Statistic
                            title="Tugas"
                            value={subject.assignments_count}
                            prefix={<FileTextOutlined />}
                            valueStyle={{ fontSize: 16 }}
                          />
                        </Col>
                        <Col span={12}>
                          <Statistic
                            title="Kuis"
                            value={subject.quizzes_count}
                            prefix={<QuestionCircleOutlined />}
                            valueStyle={{ fontSize: 16 }}
                          />
                        </Col>
                      </Row>

                      {/* Performance */}
                      <div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: 8,
                          }}
                        >
                          <Text strong>Rata-rata Nilai</Text>
                          <Tag color={gradeStatus.color}>
                            {gradeStatus.text}
                          </Tag>
                        </div>
                        <Progress
                          percent={subject.average_grade}
                          strokeColor={getPerformanceColor(
                            subject.average_grade
                          )}
                          size="small"
                        />
                      </div>

                      {/* Schedule */}
                      {subject.next_schedule && (
                        <div
                          style={{
                            background: "#f8f9fa",
                            padding: "12px",
                            borderRadius: 8,
                          }}
                        >
                          <Space>
                            <CalendarOutlined style={{ color: "#1890ff" }} />
                            <div>
                              <Text strong style={{ fontSize: 12 }}>
                                {subject.next_schedule.day}
                              </Text>
                              <br />
                              <Text type="secondary" style={{ fontSize: 12 }}>
                                {subject.next_schedule.time}
                              </Text>
                            </div>
                          </Space>
                        </div>
                      )}

                      {/* Recent Activity */}
                      {subject.recent_submissions > 0 && (
                        <div
                          style={{
                            background: "#e6f7ff",
                            padding: "8px 12px",
                            borderRadius: 6,
                            border: "1px solid #91d5ff",
                          }}
                        >
                          <Space>
                            <ClockCircleOutlined style={{ color: "#1890ff" }} />
                            <Text style={{ fontSize: 12, color: "#1890ff" }}>
                              {subject.recent_submissions} submission baru
                              minggu ini
                            </Text>
                          </Space>
                        </div>
                      )}
                    </Space>
                  </div>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}
    </div>
  );
};

export default TeacherSubjects;
