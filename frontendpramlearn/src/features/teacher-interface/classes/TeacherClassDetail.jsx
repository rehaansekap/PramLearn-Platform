import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import {
  Card,
  Tabs,
  Button,
  Typography,
  Space,
  Row,
  Col,
  Statistic,
  Progress,
  Table,
  Tag,
  Avatar,
  Spin,
  Alert,
} from "antd";
import {
  ArrowLeftOutlined,
  UserOutlined,
  TrophyOutlined,
  CalendarOutlined,
  FileTextOutlined,
  BookOutlined,
  ClockCircleOutlined,
  BarChartOutlined,
} from "@ant-design/icons";
import useTeacherClassDetail from "./hooks/useTeacherClassDetail";

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const TeacherClassDetail = () => {
  const { classSlug } = useParams();
  const navigate = useNavigate();
  const { classDetail, loading, error } = useTeacherClassDetail(classSlug);
  const [activeTab, setActiveTab] = useState("overview");

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "60px 0" }}>
        <Spin size="large" tip="Memuat detail kelas..." />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: "center", padding: "60px 0" }}>
        <Alert
          message="Gagal memuat detail kelas"
          description="Terjadi kesalahan saat mengambil data. Silakan coba lagi."
          type="error"
          showIcon
        />
      </div>
    );
  }

  if (!classDetail) {
    return (
      <div style={{ textAlign: "center", padding: "60px 0" }}>
        <Text>Data kelas tidak ditemukan</Text>
      </div>
    );
  }

  const {
    class_info,
    students,
    performance_overview,
    attendance_summary,
    recent_activities,
    assignment_stats,
    quiz_stats,
  } = classDetail;

  // Students table columns
  const studentsColumns = [
    {
      title: "Siswa",
      key: "student",
      render: (_, record) => (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Avatar icon={<UserOutlined />} />
          <div>
            <div style={{ fontWeight: 500 }}>{record.full_name}</div>
            <div style={{ fontSize: 12, color: "#666" }}>{record.username}</div>
          </div>
        </div>
      ),
    },
    {
      title: "Rata-rata Nilai",
      dataIndex: "average_grade",
      key: "average_grade",
      render: (grade) => (
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontWeight: "bold",
              color:
                grade >= 80 ? "#52c41a" : grade >= 70 ? "#1890ff" : "#faad14",
            }}
          >
            {grade}
          </div>
          <Progress
            percent={grade}
            size="small"
            showInfo={false}
            strokeColor={
              grade >= 80 ? "#52c41a" : grade >= 70 ? "#1890ff" : "#faad14"
            }
          />
        </div>
      ),
      sorter: (a, b) => a.average_grade - b.average_grade,
    },
    {
      title: "Kehadiran",
      dataIndex: "attendance_rate",
      key: "attendance_rate",
      render: (rate) => (
        <div style={{ textAlign: "center" }}>
          <Text>{rate}%</Text>
        </div>
      ),
      sorter: (a, b) => a.attendance_rate - b.attendance_rate,
    },
    {
      title: "Tingkat Motivasi",
      dataIndex: "motivation_level",
      key: "motivation_level",
      render: (level) => {
        const getColor = (level) => {
          switch (level?.toLowerCase()) {
            case "high":
              return "green";
            case "medium":
              return "orange";
            case "low":
              return "red";
            default:
              return "default";
          }
        };
        return <Tag color={getColor(level)}>{level || "Unknown"}</Tag>;
      },
    },
    {
      title: "Status",
      dataIndex: "performance_status",
      key: "performance_status",
      render: (status) => <Tag color={status.color}>{status.text}</Tag>,
    },
    {
      title: "Online",
      dataIndex: "is_online",
      key: "is_online",
      render: (isOnline) => (
        <Tag color={isOnline ? "green" : "red"}>
          {isOnline ? "Online" : "Offline"}
        </Tag>
      ),
    },
  ];

  // Attendance table columns
  const attendanceColumns = [
    {
      title: "Materi",
      dataIndex: "material_name",
      key: "material_name",
    },
    {
      title: "Mata Pelajaran",
      dataIndex: "subject_name",
      key: "subject_name",
    },
    {
      title: "Hadir",
      dataIndex: "present_count",
      key: "present_count",
      align: "center",
    },
    {
      title: "Tidak Hadir",
      dataIndex: "absent_count",
      key: "absent_count",
      align: "center",
    },
    {
      title: "Terlambat",
      dataIndex: "late_count",
      key: "late_count",
      align: "center",
    },
    {
      title: "Tingkat Kehadiran",
      dataIndex: "attendance_rate",
      key: "attendance_rate",
      render: (rate) => (
        <div style={{ textAlign: "center" }}>
          <div style={{ marginBottom: 4 }}>{rate}%</div>
          <Progress
            percent={rate}
            size="small"
            showInfo={false}
            strokeColor={
              rate >= 80 ? "#52c41a" : rate >= 70 ? "#1890ff" : "#faad14"
            }
          />
        </div>
      ),
      sorter: (a, b) => a.attendance_rate - b.attendance_rate,
    },
  ];

  return (
    <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 16px" }}>
      <Helmet>
        <title>
          {class_info.name
            ? `${class_info.name} | PramLearn`
            : "Detail Kelas | PramLearn"}
        </title>
      </Helmet>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/teacher/classes")}
          style={{ marginBottom: 16 }}
        >
          Kembali ke Daftar Kelas
        </Button>

        <Title level={2} style={{ margin: 0, color: "#11418b" }}>
          {class_info.name}
        </Title>
        <div style={{ marginTop: 8 }}>
          {class_info.subjects.map((subject, index) => (
            <Tag key={subject.id} color="blue" style={{ marginBottom: 4 }}>
              {subject.name}
            </Tag>
          ))}
        </div>
      </div>

      {/* Overview Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="Total Siswa"
              value={performance_overview.total_students}
              prefix={<UserOutlined />}
              valueStyle={{ color: "#11418b" }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="Rata-rata Kelas"
              value={performance_overview.average_grade}
              precision={1}
              prefix={<TrophyOutlined />}
              valueStyle={{
                color:
                  performance_overview.average_grade >= 80
                    ? "#52c41a"
                    : performance_overview.average_grade >= 70
                    ? "#1890ff"
                    : "#faad14",
              }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="Tingkat Kehadiran"
              value={performance_overview.attendance_rate}
              precision={1}
              suffix="%"
              prefix={<CalendarOutlined />}
              valueStyle={{
                color:
                  performance_overview.attendance_rate >= 80
                    ? "#52c41a"
                    : performance_overview.attendance_rate >= 70
                    ? "#1890ff"
                    : "#faad14",
              }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="Total Penilaian"
              value={performance_overview.total_assessments}
              prefix={<BarChartOutlined />}
              valueStyle={{ color: "#722ed1" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Tabs Content */}
      <Card style={{ borderRadius: 12 }}>
        <Tabs activeKey={activeTab} onChange={setActiveTab} size="large">
          {/* Overview Tab */}
          <TabPane tab="Ringkasan" key="overview">
            <Row gutter={[24, 24]}>
              <Col xs={24} lg={12}>
                <Card title="Distribusi Nilai" size="small">
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 8 }}
                  >
                    {Object.entries(
                      performance_overview.grade_distribution
                    ).map(([grade, count]) => (
                      <div
                        key={grade}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Text>Grade {grade}</Text>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <Progress
                            percent={
                              performance_overview.total_assessments > 0
                                ? (count /
                                    performance_overview.total_assessments) *
                                  100
                                : 0
                            }
                            size="small"
                            style={{ width: 100 }}
                            showInfo={false}
                          />
                          <Text style={{ minWidth: 30, textAlign: "right" }}>
                            {count}
                          </Text>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </Col>

              <Col xs={24} lg={12}>
                <Card title="Statistik Tugas" size="small">
                  <Row gutter={[16, 16]}>
                    <Col span={12}>
                      <Statistic
                        title="Total Tugas"
                        value={assignment_stats?.total_assignments ?? 0}
                        valueStyle={{ fontSize: 18 }}
                      />
                    </Col>
                    <Col span={12}>
                      <Statistic
                        title="Pending Review"
                        value={assignment_stats?.pending_submissions ?? 0}
                        valueStyle={{ fontSize: 18, color: "#faad14" }}
                      />
                    </Col>
                    <Col span={12}>
                      <Statistic
                        title="Sudah Dinilai"
                        value={assignment_stats?.graded_submissions ?? 0}
                        valueStyle={{ fontSize: 18, color: "#52c41a" }}
                      />
                    </Col>
                    <Col span={12}>
                      <Statistic
                        title="Rata-rata Tugas"
                        value={assignment_stats?.average_submission_grade ?? 0}
                        precision={1}
                        valueStyle={{ fontSize: 18, color: "#1890ff" }}
                      />
                    </Col>
                  </Row>
                </Card>
              </Col>
            </Row>
          </TabPane>

          {/* Students Tab */}
          <TabPane tab="Data Siswa" key="students">
            <Table
              columns={studentsColumns}
              dataSource={students}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showSizeChanger: false,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} dari ${total} siswa`,
              }}
              scroll={{ x: 800 }}
            />
          </TabPane>

          {/* Attendance Tab */}
          <TabPane tab="Rekapan Kehadiran" key="attendance">
            <Table
              columns={attendanceColumns}
              dataSource={attendance_summary}
              rowKey={(record) => `${record.material_id}`}
              pagination={{
                pageSize: 10,
                showSizeChanger: false,
              }}
              scroll={{ x: 600 }}
            />
          </TabPane>

          {/* Activities Tab */}
          <TabPane tab="Aktivitas Terbaru" key="activities">
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {recent_activities.length === 0 ? (
                <Text type="secondary">Belum ada aktivitas terbaru</Text>
              ) : (
                recent_activities.map((activity, index) => (
                  <Card key={index} size="small">
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <Text strong>{activity.student_name}</Text>
                        <div style={{ fontSize: 12, color: "#666" }}>
                          {activity.title} - {activity.activity_type}
                        </div>
                      </div>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {new Date(activity.timestamp).toLocaleString("id-ID")}
                      </Text>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default TeacherClassDetail;
