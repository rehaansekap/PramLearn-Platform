import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  List,
  Typography,
  Tag,
  Button,
  Space,
  Progress,
  Input,
  Select,
  Row,
  Col,
  Empty,
  Spin,
  Breadcrumb,
  Statistic,
  Alert,
} from "antd";
import {
  CalendarOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  TrophyOutlined,
  EditOutlined,
  SearchOutlined,
  FilterOutlined,
  HomeOutlined,
  BookOutlined,
  UserOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/id";

dayjs.extend(relativeTime);
dayjs.locale("id");

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

const StudentAssignmentList = ({
  assignments,
  loading,
  error,
  onSelectAssignment,
  getAssignmentStatus,
  getTimeRemaining,
}) => {
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const isMobile = window.innerWidth <= 768;
  const navigate = useNavigate();

  // Filter assignments based on search and status
  const filteredAssignments = assignments.filter((assignment) => {
    const matchSearch =
      assignment.title.toLowerCase().includes(searchText.toLowerCase()) ||
      assignment.description.toLowerCase().includes(searchText.toLowerCase());

    if (!matchSearch) return false;

    if (statusFilter === "all") return true;

    const status = getAssignmentStatus(assignment);
    return status.status === statusFilter;
  });

  // Calculate statistics
  const completedAssignments = assignments.filter((assignment) => {
    const status = getAssignmentStatus(assignment);
    return status.status === "submitted" || status.status === "graded";
  });

  const overdueAssignments = assignments.filter((assignment) => {
    const status = getAssignmentStatus(assignment);
    return status.status === "overdue";
  });

  const availableAssignments = assignments.filter((assignment) => {
    const status = getAssignmentStatus(assignment);
    return status.status === "available";
  });

  const averageScore =
    completedAssignments.length > 0
      ? completedAssignments.reduce(
          (sum, assignment) => sum + (assignment.grade || 0),
          0
        ) / completedAssignments.length
      : 0;

  const getStatusIcon = (status) => {
    switch (status.status) {
      case "graded":
        return <TrophyOutlined style={{ color: "#52c41a" }} />;
      case "submitted":
        return <CheckCircleOutlined style={{ color: "#1890ff" }} />;
      case "overdue":
        return <ExclamationCircleOutlined style={{ color: "#ff4d4f" }} />;
      default:
        return <EditOutlined style={{ color: "#faad14" }} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status.status) {
      case "graded":
        return "success";
      case "submitted":
        return "processing";
      case "overdue":
        return "error";
      case "available":
        return "warning";
      default:
        return "default";
    }
  };

  if (loading) {
    return (
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "24px 16px",
          minHeight: "calc(100vh - 64px)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "60vh",
          }}
        >
          <Spin size="large" tip="Memuat assignment..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "24px 16px",
          minHeight: "calc(100vh - 64px)",
        }}
      >
        <Alert
          message="Gagal memuat assignment"
          description={
            error.message || "Terjadi kesalahan saat mengambil data assignment."
          }
          type="error"
          showIcon
          style={{ borderRadius: 12 }}
        />
      </div>
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
                <FileTextOutlined />
                <span>Assignments</span>
              </Space>
            ),
          },
        ]}
      />

      {/* Header Section - Konsisten dengan assessments */}
      <div
        style={{
          background:
            "linear-gradient(135deg, #001529 0%, #3a3f5c 60%, #43cea2 100%)",
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
              📝 My Assignments
            </Title>
            <Text
              style={{
                color: "rgba(255, 255, 255, 0.9)",
                fontSize: 16,
                display: "block",
                marginBottom: 4,
              }}
            >
              Kerjakan assignment untuk mengasah kemampuan Anda
            </Text>
            <Text
              style={{
                color: "rgba(255, 255, 255, 0.8)",
                fontSize: 14,
              }}
            >
              Total {assignments.length} assignment tersedia
            </Text>
          </Col>
          <Col xs={24} md={6} style={{ marginTop: 16, textAlign: "center" }}>
            <div
              style={{
                background: "rgba(255, 255, 255, 0.15)",
                borderRadius: 12,
                padding: 16,
                backdropFilter: "blur(10px)",
              }}
            >
              <FileTextOutlined style={{ fontSize: 32, marginBottom: 8 }} />
              <div style={{ fontSize: 14, opacity: 0.9 }}>
                Assignment Center
              </div>
            </div>
          </Col>
        </Row>
      </div>

      {/* Stats Cards - Konsisten dengan assessments */}
      <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
        <Col xs={12} sm={6} md={6}>
          <Card style={{ borderRadius: 12, textAlign: "center" }}>
            <Statistic
              title="Total Assignment"
              value={assignments.length}
              prefix={<FileTextOutlined style={{ color: "#1890ff" }} />}
              valueStyle={{ color: "#1890ff", fontSize: 24 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6} md={6}>
          <Card style={{ borderRadius: 12, textAlign: "center" }}>
            <Statistic
              title="Selesai"
              value={completedAssignments.length}
              prefix={<TrophyOutlined style={{ color: "#52c41a" }} />}
              valueStyle={{ color: "#52c41a", fontSize: 24 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6} md={6}>
          <Card style={{ borderRadius: 12, textAlign: "center" }}>
            <Statistic
              title="Terlambat"
              value={overdueAssignments.length}
              prefix={<ClockCircleOutlined style={{ color: "#ff4d4f" }} />}
              valueStyle={{ color: "#ff4d4f", fontSize: 24 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6} md={6}>
          <Card style={{ borderRadius: 12, textAlign: "center" }}>
            <Statistic
              title="Rata-rata Nilai"
              value={averageScore.toFixed(1)}
              prefix={<TrophyOutlined style={{ color: "#faad14" }} />}
              valueStyle={{ color: "#faad14", fontSize: 24 }}
              suffix="/100"
            />
          </Card>
        </Col>
      </Row>

      {/* Search and Filter - Konsisten dengan assessments */}
      <Card
        style={{
          marginBottom: 24,
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
        bodyStyle={{ padding: "16px 24px" }}
      >
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Search
              placeholder="Cari assignment..."
              allowClear
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              prefix={<SearchOutlined />}
              style={{ width: "100%" }}
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Select
              style={{ width: "100%" }}
              placeholder="Filter status"
              value={statusFilter}
              onChange={setStatusFilter}
              suffixIcon={<FilterOutlined />}
            >
              <Option value="all">Semua Status</Option>
              <Option value="available">Tersedia</Option>
              <Option value="submitted">Sudah Submit</Option>
              <Option value="graded">Sudah Dinilai</Option>
              <Option value="overdue">Terlambat</Option>
            </Select>
          </Col>
          <Col xs={24} sm={24} md={8}>
            <Text type="secondary" style={{ fontSize: 14 }}>
              {filteredAssignments.length} dari {assignments.length} assignment
            </Text>
          </Col>
        </Row>
      </Card>

      {/* Assignment List */}
      <Card
        style={{
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
        styles={{
          header: {
            borderBottom: "1px solid #f0f0f0",
            background: "#fafafa",
          },
        }}
      >
        {filteredAssignments.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 24px" }}>
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <div>
                  <Text style={{ fontSize: 16, color: "#666" }}>
                    {searchText || statusFilter !== "all"
                      ? "Tidak ada assignment yang sesuai dengan filter"
                      : "Belum ada assignment tersedia"}
                  </Text>
                  <div style={{ marginTop: 12 }}>
                    <Text type="secondary" style={{ fontSize: 14 }}>
                      {searchText || statusFilter !== "all"
                        ? "Coba ubah kata kunci pencarian atau filter"
                        : "Assignment akan tersedia setelah ditambahkan oleh guru"}
                    </Text>
                  </div>
                </div>
              }
            />
          </div>
        ) : (
          <List
            grid={{
              gutter: 16,
              xs: 1,
              sm: 1,
              md: 1,
              lg: 2,
              xl: 2,
              xxl: 2,
            }}
            dataSource={filteredAssignments}
            renderItem={(assignment) => {
              const status = getAssignmentStatus(assignment);
              const timeRemaining = getTimeRemaining(assignment.due_date);

              return (
                <List.Item>
                  <Card
                    style={{
                      borderRadius: 16,
                      overflow: "hidden",
                      boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                      border: "1px solid #f0f0f0",
                      height: "100%",
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      position: "relative",
                    }}
                    bodyStyle={{ padding: 0 }}
                    hoverable
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-6px)";
                      e.currentTarget.style.boxShadow =
                        "0 12px 32px rgba(17, 65, 139, 0.12)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow =
                        "0 4px 16px rgba(0,0,0,0.08)";
                    }}
                  >
                    {/* Status Badge - Top Right Corner */}
                    <div
                      style={{
                        marginTop: isMobile ? 5 : 0,
                        position: "absolute",
                        top: isMobile ? 8 : 12,
                        left: isMobile ? "52%" : "auto", // Center horizontal pada mobile
                        right: isMobile ? "auto" : 12, // Right positioning untuk desktop
                        transform: isMobile ? "translateX(-50%)" : "none", // Center transform pada mobile
                        zIndex: 3,
                      }}
                    >
                      <Tag
                        icon={getStatusIcon(status)} // Hide icon on mobile
                        color={getStatusColor(status)}
                        style={{
                          fontWeight: 600,
                          fontSize: isMobile ? 10 : 11,
                          padding: isMobile ? "3px 4px" : "5px 8px",
                          borderRadius: 6,
                          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                        }}
                      >
                        {/* {isMobile ? status.text.substring(0, 6) : status.text} */}
                        {status.text}
                        {/* Shorten text on mobile */}
                      </Tag>
                    </div>

                    {/* Header Section */}
                    <div
                      style={{
                        background:
                          "linear-gradient(135deg, #001529 0%, #3a3f5c 60%, #43cea2 100%)",
                        padding: "24px 20px 20px 20px",
                        color: "white",
                        position: "relative",
                        overflow: "hidden",
                      }}
                    >
                      {/* Background Pattern */}
                      <div
                        style={{
                          position: "absolute",
                          top: -20,
                          right: -20,
                          width: 80,
                          height: 80,
                          borderRadius: "50%",
                          background: "rgba(255, 255, 255, 0.1)",
                        }}
                      />
                      <div
                        style={{
                          position: "absolute",
                          bottom: -30,
                          left: -30,
                          width: 100,
                          height: 100,
                          borderRadius: "50%",
                          background: "rgba(255, 255, 255, 0.05)",
                        }}
                      />

                      {/* Assignment Type Badge */}
                      <div
                        style={{
                          marginTop: isMobile ? 30 : 0,
                          marginBottom: 12,
                          position: "relative",
                          zIndex: 1,
                        }}
                      >
                        <Space size={8}>
                          <FileTextOutlined style={{ fontSize: 16 }} />
                          <Tag
                            color="rgba(255, 255, 255, 0.2)"
                            style={{
                              color: "white",
                              border: "1px solid rgba(255, 255, 255, 0.3)",
                              background: "rgba(255, 255, 255, 0.15)",
                              fontSize: 11,
                              fontWeight: 500,
                            }}
                          >
                            Assignment
                          </Tag>
                        </Space>
                      </div>

                      {/* Assignment Title */}
                      <Title
                        level={5}
                        style={{
                          color: "white",
                          margin: 0,
                          fontSize: 15,
                          fontWeight: 600,
                          lineHeight: 1.3,
                          position: "relative",
                          zIndex: 1,
                        }}
                      >
                        {assignment.title.length > 45
                          ? `${assignment.title.substring(0, 45)}...`
                          : assignment.title}
                      </Title>

                      {/* Subject Info */}
                      {assignment.subject_name && (
                        <div
                          style={{
                            marginTop: 8,
                            position: "relative",
                            zIndex: 1,
                          }}
                        >
                          <Text
                            style={{
                              color: "rgba(255, 255, 255, 0.8)",
                              fontSize: 12,
                            }}
                          >
                            Mata Pelajaran: {assignment.subject_name}
                          </Text>
                        </div>
                      )}
                    </div>

                    {/* Content Section */}
                    <div style={{ padding: "20px" }}>
                      {/* Assignment Description */}
                      {assignment.description && (
                        <div style={{ marginBottom: 16 }}>
                          <Text
                            type="secondary"
                            style={{
                              fontSize: 14,
                              color: "#666",
                              background: "#f7f7f7",
                              padding: "8px 12px",
                              borderRadius: 8,
                              border: "1px solid #e8e8e8",
                              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
                              marginBottom: 12,
                              wordBreak: "break-word",
                              lineHeight: 1.5,
                              display: "block",
                            }}
                          >
                            {assignment.description.length > 120
                              ? `${assignment.description.substring(0, 120)}...`
                              : assignment.description}
                          </Text>
                        </div>
                      )}

                      {/* Grade Display untuk Graded Assignment */}
                      {status.status === "graded" &&
                        assignment.grade !== null &&
                        assignment.grade !== undefined && ( // TAMBAHKAN CHECK INI
                          <div
                            style={{
                              background:
                                "linear-gradient(135deg, #f6ffed 0%, #e6fffb 100%)",
                              border: "2px solid #b7eb8f",
                              borderRadius: 12,
                              padding: "16px",
                              marginBottom: 16,
                              textAlign: "center",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 12,
                                marginBottom: 8,
                              }}
                            >
                              <div
                                style={{
                                  background: "#52c41a",
                                  borderRadius: "50%",
                                  width: 32,
                                  height: 32,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                <TrophyOutlined
                                  style={{ color: "white", fontSize: 16 }}
                                />
                              </div>
                              <div>
                                <Text
                                  strong
                                  style={{ fontSize: 15, color: "#52c41a" }}
                                >
                                  Assignment Dinilai
                                </Text>
                                <div
                                  style={{
                                    fontSize: 20,
                                    fontWeight: 700,
                                    color: "#52c41a",
                                  }}
                                >
                                  {/* UBAH: Add safety check */}
                                  {typeof assignment.grade === "number"
                                    ? assignment.grade.toFixed(1)
                                    : "0.0"}
                                  /100
                                </div>
                              </div>
                            </div>
                            <Progress
                              percent={
                                typeof assignment.grade === "number"
                                  ? assignment.grade
                                  : 0
                              }
                              strokeColor={{
                                "0%": "#52c41a",
                                "100%": "#389e0d",
                              }}
                              showInfo={false}
                              strokeWidth={8}
                              style={{ marginBottom: 0 }}
                            />
                          </div>
                        )}

                      {/* Due Date Countdown */}
                      <div
                        style={{
                          background: timeRemaining.expired
                            ? "linear-gradient(135deg, #fff2f0 0%, #ffebe6 100%)"
                            : "linear-gradient(135deg, #f6ffed 0%, #e6fffb 100%)",
                          border: `2px solid ${
                            timeRemaining.expired ? "#ffccc7" : "#b7eb8f"
                          }`,
                          borderRadius: 12,
                          padding: "16px",
                          marginBottom: 16,
                          textAlign: "center",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 8,
                            marginBottom: 8,
                          }}
                        >
                          <div
                            style={{
                              background: timeRemaining.expired
                                ? "#ff4d4f"
                                : "#52c41a",
                              borderRadius: "50%",
                              width: 24,
                              height: 24,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <ClockCircleOutlined
                              style={{ color: "white", fontSize: 12 }}
                            />
                          </div>
                          <Text
                            style={{
                              fontSize: 13,
                              fontWeight: 600,
                              color: "#666",
                            }}
                          >
                            {timeRemaining.expired ? "Terlambat" : "Deadline"}
                          </Text>
                        </div>

                        <div
                          style={{
                            fontSize: 18,
                            fontWeight: 700,
                            color: timeRemaining.color,
                            marginBottom: 4,
                          }}
                        >
                          {timeRemaining.text}
                        </div>

                        <Text style={{ fontSize: 12, color: "#999" }}>
                          Due:{" "}
                          {dayjs(assignment.due_date).format(
                            "DD MMM YYYY, HH:mm"
                          )}
                        </Text>
                      </div>

                      {/* Assignment Meta Information */}
                      <div style={{ marginBottom: 16 }}>
                        <Space wrap size={8}>
                          <div
                            style={{
                              background: "#f0f8ff",
                              border: "1px solid #d1e9ff",
                              borderRadius: 8,
                              padding: "6px 12px",
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                            }}
                          >
                            <FileTextOutlined
                              style={{ color: "#1890ff", fontSize: 12 }}
                            />
                            <Text
                              style={{
                                fontSize: 12,
                                color: "#1890ff",
                                fontWeight: 500,
                              }}
                            >
                              {assignment.questions?.length || 0} Soal
                            </Text>
                          </div>
                          {assignment.subject_name && (
                            <div
                              style={{
                                background: "#fff7e6",
                                border: "1px solid #ffd591",
                                borderRadius: 8,
                                padding: "6px 12px",
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                              }}
                            >
                              <BookOutlined
                                style={{ color: "#fa8c16", fontSize: 12 }}
                              />
                              <Text
                                style={{
                                  fontSize: 12,
                                  color: "#fa8c16",
                                  fontWeight: 500,
                                }}
                              >
                                {assignment.subject_name}
                              </Text>
                            </div>
                          )}
                        </Space>
                      </div>

                      {/* Action Button */}
                      <Button
                        type="primary"
                        icon={getStatusIcon(status)}
                        onClick={() => {
                          const assignmentSlug =
                            assignment.slug ||
                            assignment.title
                              .toLowerCase()
                              .replace(/\s+/g, "-")
                              .replace(/[^a-z0-9-]/g, "");
                          if (
                            status.status === "submitted" ||
                            status.status === "graded"
                          ) {
                            navigate(
                              `/student/assignments/${assignmentSlug}/results`
                            );
                          } else {
                            navigate(`/student/assignments/${assignmentSlug}`);
                          }
                        }}
                        disabled={
                          status.status === "overdue" &&
                          !assignment.allow_late_submission
                        }
                        size="large"
                        style={{
                          width: "100%",
                          height: 48,
                          borderRadius: 10,
                          fontWeight: 600,
                          fontSize: 13,
                          background:
                            status.status === "graded"
                              ? "linear-gradient(135deg, #ffec3d 0%, #faad14 50%, #ff8c00 100%)"
                              : "linear-gradient(135deg, #001529 0%, #3a3f5c 60%, #43cea2 100%)",
                          border: "none",
                          boxShadow:
                            status.status === "graded"
                              ? "0 4px 12px rgba(255, 173, 20, 0.4)"
                              : "0 4px 12px rgba(0, 21, 41, 0.2)",
                          transition: "all 0.3s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "translateY(-2px)";
                          e.currentTarget.style.boxShadow =
                            status.status === "graded"
                              ? "0 6px 16px rgba(255, 173, 20, 0.5)"
                              : "0 6px 16px rgba(0, 21, 41, 0.3)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "translateY(0)";
                          e.currentTarget.style.boxShadow =
                            status.status === "graded"
                              ? "0 4px 12px rgba(255, 173, 20, 0.4)"
                              : "0 4px 12px rgba(0, 21, 41, 0.2)";
                        }}
                      >
                        {status.status === "available"
                          ? "Mulai Assignment"
                          : status.status === "submitted"
                          ? "Lihat Submission"
                          : status.status === "graded"
                          ? "Lihat Nilai & Feedback"
                          : status.status === "overdue"
                          ? assignment.allow_late_submission
                            ? "Submit Terlambat"
                            : "Waktu Habis"
                          : "Lihat Assignment"}
                      </Button>

                      {/* Submission timestamp */}
                      {assignment.submitted_at && (
                        <Text
                          type="secondary"
                          style={{
                            display: "block",
                            textAlign: "center",
                            marginTop: 8,
                            fontSize: 12,
                          }}
                        >
                          Submitted:{" "}
                          {dayjs(assignment.submitted_at).format(
                            "DD MMM YYYY, HH:mm"
                          )}
                        </Text>
                      )}
                    </div>
                  </Card>
                </List.Item>
              );
            }}
          />
        )}
      </Card>
    </div>
  );
};

export default StudentAssignmentList;
