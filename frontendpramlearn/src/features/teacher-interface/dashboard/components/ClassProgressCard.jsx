import React from "react";
import {
  Card,
  Row,
  Col,
  Progress,
  Typography,
  Space,
  Tag,
  Avatar,
  Tooltip,
  Button,
  Empty,
  Spin,
} from "antd";
import {
  TeamOutlined,
  UserOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  TrophyOutlined,
  BookOutlined,
  FileTextOutlined,
  EyeOutlined,
  WarningOutlined,
  RiseOutlined,
  FallOutlined,
  MinusOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Text, Title } = Typography;

const ClassProgressCard = ({ classesData, loading }) => {
  const navigate = useNavigate();

  const getProgressColor = (progress) => {
    if (progress >= 85) return "#52c41a";
    if (progress >= 70) return "#faad14";
    if (progress >= 50) return "#fa8c16";
    return "#ff4d4f";
  };

  const getAttendanceColor = (rate) => {
    if (rate >= 90) return "#52c41a";
    if (rate >= 80) return "#faad14";
    if (rate >= 70) return "#fa8c16";
    return "#ff4d4f";
  };

  const getGradeColor = (grade) => {
    if (grade >= 85) return "#52c41a";
    if (grade >= 75) return "#1677ff";
    if (grade >= 65) return "#faad14";
    return "#ff4d4f";
  };

  const getTrendIcon = (trend) => {
    if (trend > 0) return <RiseOutlined style={{ color: "#52c41a" }} />;
    if (trend < 0) return <FallOutlined style={{ color: "#ff4d4f" }} />;
    return <MinusOutlined style={{ color: "#8c8c8c" }} />;
  };

  const getClassStatus = (classItem) => {
    const { average_progress, attendance_rate, pending_submissions } = classItem;
    
    if (pending_submissions > 10) return { status: "Perlu Perhatian", color: "#ff4d4f" };
    if (average_progress >= 80 && attendance_rate >= 85) return { status: "Excellent", color: "#52c41a" };
    if (average_progress >= 60 && attendance_rate >= 75) return { status: "Good", color: "#1677ff" };
    if (average_progress >= 40 && attendance_rate >= 60) return { status: "Average", color: "#faad14" };
    return { status: "Needs Improvement", color: "#ff4d4f" };
  };

  const formatLastActivity = (lastActivity) => {
    if (!lastActivity) return "Tidak ada aktivitas";
    const date = new Date(lastActivity);
    const now = new Date();
    const diffHours = (now - date) / (1000 * 60 * 60);
    
    if (diffHours < 1) return "Baru saja";
    if (diffHours < 24) return `${Math.floor(diffHours)} jam lalu`;
    if (diffHours < 48) return "Kemarin";
    return date.toLocaleDateString("id-ID", { day: "2-digit", month: "short" });
  };

  if (loading) {
    return (
      <Card
        title={
          <Space>
            <TeamOutlined style={{ color: "#11418b" }} />
            <Text strong style={{ color: "#11418b" }}>Progress Kelas</Text>
          </Space>
        }
        style={{ 
          borderRadius: 16, 
          marginBottom: 16,
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <Spin size="large" tip="Memuat progress kelas..." />
        </div>
      </Card>
    );
  }

  if (!classesData || classesData.length === 0) {
    return (
      <Card
        title={
          <Space>
            <TeamOutlined style={{ color: "#11418b" }} />
            <Text strong style={{ color: "#11418b" }}>Progress Kelas</Text>
          </Space>
        }
        style={{ 
          borderRadius: 16, 
          marginBottom: 16,
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <div>
              <Text style={{ fontSize: 14, color: "#666" }}>
                Belum ada data kelas
              </Text>
              <br />
              <Text type="secondary" style={{ fontSize: 12 }}>
                Data progress kelas akan muncul di sini
              </Text>
            </div>
          }
          style={{ padding: "40px 0" }}
        />
      </Card>
    );
  }

  // Sort classes by priority (pending submissions, then by progress)
  const sortedClasses = [...classesData].sort((a, b) => {
    // Priority: classes with more pending submissions first
    if (a.pending_submissions !== b.pending_submissions) {
      return b.pending_submissions - a.pending_submissions;
    }
    // Then by lower progress (needs more attention)
    return a.average_progress - b.average_progress;
  });

  return (
    <Card
      title={
        <Space>
          <TeamOutlined style={{ color: "#11418b" }} />
          <Text strong style={{ color: "#11418b" }}>Progress Kelas</Text>
          <Tag color="blue" style={{ marginLeft: 8 }}>
            {classesData.length} Kelas
          </Tag>
        </Space>
      }
      style={{ 
        borderRadius: 16, 
        marginBottom: 16,
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      }}
      bodyStyle={{ padding: "16px" }}
      extra={
        <Button 
          type="link" 
          size="small"
          onClick={() => navigate("/teacher/classes")}
          icon={<EyeOutlined />}
        >
          Lihat Semua
        </Button>
      }
    >
      <Row gutter={[16, 16]}>
        {sortedClasses.slice(0, 6).map((classItem, index) => {
          const classStatus = getClassStatus(classItem);
          const hasUrgentTasks = classItem.pending_submissions > 5;
          
          return (
            <Col xs={24} sm={12} lg={12} xl={8} key={classItem.id || index}>
              <Card
                size="small"
                hoverable
                onClick={() => navigate(`/teacher/classes/${classItem.slug || classItem.id}`)}
                style={{
                  borderRadius: 12,
                  border: hasUrgentTasks ? "2px solid #ff4d4f" : "1px solid #f0f0f0",
                  background: hasUrgentTasks ? "#fff2f0" : "#fafafa",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  position: "relative",
                  overflow: "hidden",
                }}
                bodyStyle={{ padding: "16px" }}
                className="class-progress-card"
              >
                {/* Urgent indicator */}
                {hasUrgentTasks && (
                  <div
                    style={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      background: "#ff4d4f",
                      borderRadius: "50%",
                      width: 12,
                      height: 12,
                      animation: "pulse 2s infinite",
                    }}
                  />
                )}

                {/* Header */}
                <div style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <Avatar
                      size={32}
                      style={{
                        backgroundColor: getProgressColor(classItem.average_progress),
                        color: "white",
                      }}
                      icon={<TeamOutlined />}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Text
                        strong
                        style={{
                          fontSize: 14,
                          color: "#333",
                          display: "block",
                          lineHeight: 1.3,
                        }}
                        ellipsis
                      >
                        {classItem.name}
                      </Text>
                      <Space size={4}>
                        <UserOutlined style={{ fontSize: 10, color: "#999" }} />
                        <Text style={{ fontSize: 11, color: "#999" }}>
                          {classItem.student_count || 0} siswa
                        </Text>
                      </Space>
                    </div>
                  </div>

                  {/* Status badge */}
                  <Tag
                    color={classStatus.color}
                    style={{
                      fontSize: 10,
                      padding: "2px 6px",
                      borderRadius: 8,
                      fontWeight: 500,
                    }}
                  >
                    {classStatus.status}
                  </Tag>
                </div>

                {/* Progress Section */}
                <div style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <Text style={{ fontSize: 11, color: "#666" }}>
                      Progress Pembelajaran
                    </Text>
                    <Space size={4}>
                      {getTrendIcon(classItem.progress_trend || 0)}
                      <Text
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: getProgressColor(classItem.average_progress),
                        }}
                      >
                        {classItem.average_progress}%
                      </Text>
                    </Space>
                  </div>
                  <Progress
                    percent={classItem.average_progress}
                    strokeColor={getProgressColor(classItem.average_progress)}
                    size="small"
                    showInfo={false}
                    strokeWidth={6}
                  />
                </div>

                {/* Metrics Row */}
                <Row gutter={8} style={{ marginBottom: 12 }}>
                  <Col span={8}>
                    <div style={{ textAlign: "center" }}>
                      <div
                        style={{
                          fontSize: 16,
                          fontWeight: "bold",
                          color: getAttendanceColor(classItem.attendance_rate),
                        }}
                      >
                        {classItem.attendance_rate}%
                      </div>
                      <Text style={{ fontSize: 10, color: "#999" }}>Kehadiran</Text>
                    </div>
                  </Col>
                  <Col span={8}>
                    <div style={{ textAlign: "center" }}>
                      <div
                        style={{
                          fontSize: 16,
                          fontWeight: "bold",
                          color: getGradeColor(classItem.average_grade || 0),
                        }}
                      >
                        {(classItem.average_grade || 0).toFixed(1)}
                      </div>
                      <Text style={{ fontSize: 10, color: "#999" }}>Rata-rata</Text>
                    </div>
                  </Col>
                  <Col span={8}>
                    <div style={{ textAlign: "center" }}>
                      <div
                        style={{
                          fontSize: 16,
                          fontWeight: "bold",
                          color: classItem.pending_submissions > 0 ? "#ff4d4f" : "#52c41a",
                        }}
                      >
                        {classItem.pending_submissions || 0}
                      </div>
                      <Text style={{ fontSize: 10, color: "#999" }}>Pending</Text>
                    </div>
                  </Col>
                </Row>

                {/* Footer */}
                <div style={{ borderTop: "1px solid #f0f0f0", paddingTop: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Space size={4}>
                      <ClockCircleOutlined style={{ fontSize: 10, color: "#999" }} />
                      <Text style={{ fontSize: 10, color: "#999" }}>
                        {formatLastActivity(classItem.last_activity)}
                      </Text>
                    </Space>
                    
                    <Space size={8}>
                      {classItem.materials_count > 0 && (
                        <Tooltip title={`${classItem.materials_count} materi`}>
                          <Space size={2}>
                            <BookOutlined style={{ fontSize: 10, color: "#1677ff" }} />
                            <Text style={{ fontSize: 10, color: "#1677ff" }}>
                              {classItem.materials_count}
                            </Text>
                          </Space>
                        </Tooltip>
                      )}
                      
                      {classItem.assignments_count > 0 && (
                        <Tooltip title={`${classItem.assignments_count} tugas`}>
                          <Space size={2}>
                            <FileTextOutlined style={{ fontSize: 10, color: "#fa8c16" }} />
                            <Text style={{ fontSize: 10, color: "#fa8c16" }}>
                              {classItem.assignments_count}
                            </Text>
                          </Space>
                        </Tooltip>
                      )}

                      {(classItem.average_progress >= 90 || classItem.average_grade >= 85) && (
                        <TrophyOutlined style={{ fontSize: 12, color: "#faad14" }} />
                      )}
                      
                      {hasUrgentTasks && (
                        <WarningOutlined style={{ fontSize: 12, color: "#ff4d4f" }} />
                      )}
                    </Space>
                  </div>
                </div>
              </Card>
            </Col>
          );
        })}
      </Row>

      {/* Show more classes button if there are more than 6 */}
      {classesData.length > 6 && (
        <div style={{ textAlign: "center", marginTop: 16, paddingTop: 16, borderTop: "1px solid #f0f0f0" }}>
          <Button
            type="dashed"
            onClick={() => navigate("/teacher/classes")}
            style={{
              borderRadius: 8,
              color: "#11418b",
              borderColor: "#11418b",
            }}
          >
            Lihat {classesData.length - 6} Kelas Lainnya
          </Button>
        </div>
      )}

      <style jsx>{`
        .class-progress-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.12);
        }
        
        @keyframes pulse {
          0% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(255, 77, 79, 0.7);
          }
          70% {
            transform: scale(1);
            box-shadow: 0 0 0 6px rgba(255, 77, 79, 0);
          }
          100% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(255, 77, 79, 0);
          }
        }
      `}</style>
    </Card>
  );
};

export default ClassProgressCard;