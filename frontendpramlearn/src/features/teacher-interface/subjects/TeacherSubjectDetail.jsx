import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Row,
  Col,
  Typography,
  Tabs,
  Space,
  Statistic,
  Table,
  Tag,
  Progress,
  Button,
  Spin,
  Alert,
  Avatar,
  List,
  Timeline,
  Empty,
} from "antd";
import {
  ArrowLeftOutlined,
  UserOutlined,
  FileTextOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
  BookOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import useTeacherSubjectDetail from "./hooks/useTeacherSubjectDetail";

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const TeacherSubjectDetail = () => {
  const { subjectSlug } = useParams();
  const navigate = useNavigate();
  const { subjectDetail, loading, error } =
    useTeacherSubjectDetail(subjectSlug);
  const [activeTab, setActiveTab] = useState("overview");

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
        <Spin size="large" tip="Memuat detail mata pelajaran..." />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "20px 0" }}>
        <Alert
          message="Error"
          description="Terjadi kesalahan saat memuat detail mata pelajaran."
          type="error"
          showIcon
          action={
            <Button size="small" onClick={() => navigate("/teacher/subjects")}>
              Kembali
            </Button>
          }
        />
      </div>
    );
  }

  if (!subjectDetail) {
    return (
      <div style={{ padding: "20px 0" }}>
        <Alert
          message="Mata pelajaran tidak ditemukan"
          type="warning"
          showIcon
          action={
            <Button size="small" onClick={() => navigate("/teacher/subjects")}>
              Kembali
            </Button>
          }
        />
      </div>
    );
  }

  const {
    subject_info,
    students,
    performance_overview,
    materials,
    assignment_stats,
    quiz_stats,
    recent_activities,
    schedules,
  } = subjectDetail;

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
      title: "Motivasi",
      dataIndex: "motivation_level",
      key: "motivation_level",
      render: (level) => {
        const colors = {
          high: "green",
          medium: "orange",
          low: "red",
        };
        const labels = {
          high: "Tinggi",
          medium: "Sedang",
          low: "Rendah",
        };
        return (
          <Tag color={colors[level] || "default"}>
            {labels[level] || "Unknown"}
          </Tag>
        );
      },
    },
    {
      title: "Status",
      dataIndex: "is_online",
      key: "is_online",
      render: (isOnline) => (
        <Tag color={isOnline ? "green" : "red"}>
          {isOnline ? "Online" : "Offline"}
        </Tag>
      ),
    },
  ];

  // Materials table columns
  const materialsColumns = [
    {
      title: "Materi",
      dataIndex: "title",
      key: "title",
      render: (title, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{title}</div>
          <div style={{ fontSize: 12, color: "#666" }}>
            {record.assignments_count} tugas • {record.quizzes_count} kuis
          </div>
        </div>
      ),
    },
    {
      title: "Tingkat Penyelesaian",
      dataIndex: "completion_rate",
      key: "completion_rate",
      render: (rate) => (
        <div style={{ textAlign: "center" }}>
          <div style={{ marginBottom: 4 }}>{rate}%</div>
          <Progress
            percent={rate}
            size="small"
            showInfo={false}
            strokeColor={
              rate >= 80 ? "#52c41a" : rate >= 50 ? "#1890ff" : "#faad14"
            }
          />
        </div>
      ),
      sorter: (a, b) => a.completion_rate - b.completion_rate,
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/teacher/subjects")}
          style={{ marginBottom: 16 }}
        >
          Kembali ke Daftar Mata Pelajaran
        </Button>

        <Card
          style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            border: "none",
            borderRadius: 16,
            color: "white",
          }}
          bodyStyle={{ padding: "32px" }}
        >
          <Row gutter={24} align="middle">
            <Col flex="auto">
              <Space direction="vertical" size="small">
                <Title level={2} style={{ color: "white", margin: 0 }}>
                  {subject_info.name}
                </Title>
                <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 16 }}>
                  Kelas {subject_info.class_name} • {subject_info.teacher_name}
                </Text>
              </Space>
            </Col>
            <Col>
              <Space direction="vertical" size="middle" align="center">
                <Statistic
                  title={
                    <span style={{ color: "rgba(255,255,255,0.8)" }}>
                      Siswa
                    </span>
                  }
                  value={performance_overview.total_students}
                  valueStyle={{ color: "white", fontSize: 24 }}
                  prefix={<UserOutlined />}
                />
              </Space>
            </Col>
          </Row>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs activeKey={activeTab} onChange={setActiveTab} size="large">
        <TabPane tab="Overview" key="overview">
          <Row gutter={[24, 24]}>
            {/* Performance Overview */}
            <Col span={24}>
              <Card
                title="Ringkasan Performa Kelas"
                style={{ borderRadius: 12 }}
              >
                <Row gutter={24}>
                  <Col xs={24} sm={12} md={6}>
                    <Statistic
                      title="Rata-rata Nilai"
                      value={performance_overview.average_grade}
                      precision={1}
                      valueStyle={{
                        color:
                          performance_overview.average_grade >= 80
                            ? "#52c41a"
                            : "#1890ff",
                      }}
                      prefix={<TrophyOutlined />}
                    />
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Statistic
                      title="Rata-rata Kehadiran"
                      value={performance_overview.average_attendance}
                      precision={1}
                      suffix="%"
                      valueStyle={{ color: "#52c41a" }}
                      prefix={<CheckCircleOutlined />}
                    />
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Statistic
                      title="Performa Tinggi"
                      value={performance_overview.high_performers}
                      suffix={`/${performance_overview.total_students}`}
                      valueStyle={{ color: "#52c41a" }}
                    />
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Statistic
                      title="Perlu Perhatian"
                      value={performance_overview.low_performers}
                      suffix={`/${performance_overview.total_students}`}
                      valueStyle={{ color: "#ff4d4f" }}
                      prefix={<ExclamationCircleOutlined />}
                    />
                  </Col>
                </Row>
              </Card>
            </Col>

            {/* Assignment & Quiz Stats */}
            <Col xs={24} lg={12}>
              <Card title="Statistik Tugas" style={{ borderRadius: 12 }}>
                <Row gutter={16}>
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
                      value={assignment_stats?.average_grade ?? 0}
                      precision={1}
                      valueStyle={{ fontSize: 18, color: "#1890ff" }}
                    />
                  </Col>
                </Row>
              </Card>
            </Col>

            <Col xs={24} lg={12}>
              <Card title="Statistik Kuis" style={{ borderRadius: 12 }}>
                <Row gutter={16}>
                  <Col span={12}>
                    <Statistic
                      title="Total Kuis"
                      value={quiz_stats.total_quizzes}
                      valueStyle={{ fontSize: 18 }}
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic
                      title="Hasil Individual"
                      value={quiz_stats.individual_results}
                      valueStyle={{ fontSize: 18, color: "#1890ff" }}
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic
                      title="Hasil Kelompok"
                      value={quiz_stats.group_results}
                      valueStyle={{ fontSize: 18, color: "#722ed1" }}
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic
                      title="Rata-rata Kuis"
                      value={quiz_stats.average_grade}
                      precision={1}
                      valueStyle={{ fontSize: 18, color: "#52c41a" }}
                    />
                  </Col>
                </Row>
              </Card>
            </Col>

            {/* Recent Activities */}
            <Col span={24}>
              <Card title="Aktivitas Terbaru" style={{ borderRadius: 12 }}>
                {recent_activities.length > 0 ? (
                  <Timeline>
                    {recent_activities.map((activity, index) => (
                      <Timeline.Item key={index} color="blue">
                        <div>
                          <Text strong>{activity.student_name}</Text>{" "}
                          mengumpulkan tugas{" "}
                          <Text strong>{activity.assignment_title}</Text>
                          {activity.grade && (
                            <Tag
                              color={activity.grade >= 80 ? "green" : "orange"}
                              style={{ marginLeft: 8 }}
                            >
                              Nilai: {activity.grade}
                            </Tag>
                          )}
                          <br />
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {new Date(activity.submission_date).toLocaleString(
                              "id-ID"
                            )}
                          </Text>
                        </div>
                      </Timeline.Item>
                    ))}
                  </Timeline>
                ) : (
                  <Empty description="Belum ada aktivitas terbaru" />
                )}
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab="Siswa" key="students">
          <Card title="Daftar Siswa" style={{ borderRadius: 12 }}>
            <Table
              columns={studentsColumns}
              dataSource={students}
              rowKey="id"
              pagination={{ pageSize: 10 }}
              scroll={{ x: 800 }}
            />
          </Card>
        </TabPane>

        <TabPane tab="Materi" key="materials">
          <Card title="Daftar Materi" style={{ borderRadius: 12 }}>
            <Table
              columns={materialsColumns}
              dataSource={materials}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </TabPane>

        <TabPane tab="Jadwal" key="schedule">
          <Card title="Jadwal Mengajar" style={{ borderRadius: 12 }}>
            {schedules.length > 0 ? (
              <List
                dataSource={schedules}
                renderItem={(schedule) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<CalendarOutlined style={{ fontSize: 24 }} />}
                      title={schedule.day}
                      description={`Pukul ${schedule.time}`}
                    />
                  </List.Item>
                )}
              />
            ) : (
              <Empty description="Belum ada jadwal yang ditetapkan" />
            )}
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default TeacherSubjectDetail;
