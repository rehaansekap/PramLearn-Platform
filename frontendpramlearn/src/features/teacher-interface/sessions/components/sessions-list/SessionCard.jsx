import React from "react";
import {
  Card,
  Typography,
  Progress,
  Space,
  Tag,
  Button,
  Avatar,
  Tooltip,
} from "antd";
import {
  PlayCircleOutlined,
  TeamOutlined,
  BookOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  QuestionCircleOutlined,
  UserOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/id";
import "./styles/styles.css";

dayjs.extend(relativeTime);
dayjs.locale("id");

const { Title, Text, Paragraph } = Typography;

const SessionCard = ({ session, onClick, isMobile }) => {
  const getProgressColor = (progress) => {
    if (progress >= 80) return "#52c41a";
    if (progress >= 60) return "#faad14";
    return "#ff4d4f";
  };

  const getAttendanceColor = (rate) => {
    if (rate >= 90) return "success";
    if (rate >= 75) return "warning";
    return "error";
  };

  const getGradeColor = (grade) => {
    if (grade >= 85) return "#52c41a";
    if (grade >= 70) return "#faad14";
    return "#ff4d4f";
  };

  return (
    <Card
      hoverable
      onClick={() => onClick(session)}
      className="session-card-hover"
      style={{
        borderRadius: 16,
        border: "1px solid #f0f0f0",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        height: "100%",
        cursor: "pointer",
      }}
      bodyStyle={{
        padding: isMobile ? 16 : 20,
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <Space
          style={{ width: "100%", justifyContent: "space-between" }}
          align="start"
        >
          <div style={{ flex: 1 }}>
            <Title
              level={4}
              style={{
                margin: 0,
                marginBottom: 4,
                color: "#1890ff",
                fontSize: isMobile ? 16 : 18,
                fontWeight: 700,
                lineHeight: 1.3,
              }}
              ellipsis={{ rows: 2 }}
            >
              {session.name}
            </Title>
            <Space size="small">
              <BookOutlined style={{ color: "#666", fontSize: 14 }} />
              <Text
                style={{
                  color: "#666",
                  fontSize: 14,
                  fontWeight: 500,
                }}
              >
                {session.class_name}
              </Text>
            </Space>
          </div>

          <Avatar
            className="gradient-primary"
            style={{
              fontSize: 16,
              border: "none",
            }}
            icon={<BookOutlined />}
          />
        </Space>
      </div>

      {/* Statistics Grid */}
      <div style={{ marginBottom: 16, flex: 1 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
          }}
        >
          {/* Students Count */}
          <div
            style={{
              background: "#f8faff",
              borderRadius: 8,
              padding: 12,
              textAlign: "center",
              border: "1px solid #e6f7ff",
            }}
          >
            <TeamOutlined
              style={{ color: "#1890ff", fontSize: 20, marginBottom: 4 }}
            />
            <div>
              <Text
                style={{
                  display: "block",
                  fontSize: 18,
                  fontWeight: 700,
                  color: "#1890ff",
                }}
              >
                {session.students_count || 0}
              </Text>
              <Text style={{ fontSize: 12, color: "#666" }}>Siswa</Text>
            </div>
          </div>

          {/* Materials Count */}
          <div
            style={{
              background: "#f6ffed",
              borderRadius: 8,
              padding: 12,
              textAlign: "center",
              border: "1px solid #b7eb8f",
            }}
          >
            <FileTextOutlined
              style={{ color: "#52c41a", fontSize: 20, marginBottom: 4 }}
            />
            <div>
              <Text
                style={{
                  display: "block",
                  fontSize: 18,
                  fontWeight: 700,
                  color: "#52c41a",
                }}
              >
                {session.total_sessions || 0}
              </Text>
              <Text style={{ fontSize: 12, color: "#666" }}>Materi</Text>
            </div>
          </div>

          {/* Assignments Count */}
          <div
            style={{
              background: "#fffbe6",
              borderRadius: 8,
              padding: 12,
              textAlign: "center",
              border: "1px solid #ffe58f",
            }}
          >
            <FileTextOutlined
              style={{ color: "#faad14", fontSize: 20, marginBottom: 4 }}
            />
            <div>
              <Text
                style={{
                  display: "block",
                  fontSize: 18,
                  fontWeight: 700,
                  color: "#faad14",
                }}
              >
                {session.total_assignments || 0}
              </Text>
              <Text style={{ fontSize: 12, color: "#666" }}>Tugas</Text>
            </div>
          </div>

          {/* Quizzes Count */}
          <div
            style={{
              background: "#f9f0ff",
              borderRadius: 8,
              padding: 12,
              textAlign: "center",
              border: "1px solid #d3adf7",
            }}
          >
            <QuestionCircleOutlined
              style={{ color: "#722ed1", fontSize: 20, marginBottom: 4 }}
            />
            <div>
              <Text
                style={{
                  display: "block",
                  fontSize: 18,
                  fontWeight: 700,
                  color: "#722ed1",
                }}
              >
                {session.total_quizzes || 0}
              </Text>
              <Text style={{ fontSize: 12, color: "#666" }}>Quiz</Text>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bars */}
      <div style={{ marginBottom: 16 }}>
        <Space direction="vertical" style={{ width: "100%" }} size={8}>
          {/* Overall Progress */}
          <div>
            <Space
              style={{ width: "100%", justifyContent: "space-between" }}
              size="small"
            >
              <Text style={{ fontSize: 12, color: "#666", fontWeight: 500 }}>
                Progress Pembelajaran
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: getProgressColor(session.overall_progress || 0),
                }}
              >
                {Math.round(session.overall_progress || 0)}%
              </Text>
            </Space>
            <Progress
              percent={Math.round(session.overall_progress || 0)}
              size="small"
              strokeColor={getProgressColor(session.overall_progress || 0)}
              showInfo={false}
              style={{ marginTop: 4 }}
            />
          </div>

          {/* Attendance */}
          <div>
            <Space
              style={{ width: "100%", justifyContent: "space-between" }}
              size="small"
            >
              <Text style={{ fontSize: 12, color: "#666", fontWeight: 500 }}>
                Tingkat Kehadiran
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: getProgressColor(session.overall_attendance || 0),
                }}
              >
                {Math.round(session.overall_attendance || 0)}%
              </Text>
            </Space>
            <Progress
              percent={Math.round(session.overall_attendance || 0)}
              size="small"
              strokeColor={getProgressColor(session.overall_attendance || 0)}
              showInfo={false}
              style={{ marginTop: 4 }}
            />
          </div>

          {/* Completion Rate */}
          <div>
            <Space
              style={{ width: "100%", justifyContent: "space-between" }}
              size="small"
            >
              <Text style={{ fontSize: 12, color: "#666", fontWeight: 500 }}>
                Tingkat Penyelesaian
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: getProgressColor(session.overall_completion || 0),
                }}
              >
                {Math.round(session.overall_completion || 0)}%
              </Text>
            </Space>
            <Progress
              percent={Math.round(session.overall_completion || 0)}
              size="small"
              strokeColor={getProgressColor(session.overall_completion || 0)}
              showInfo={false}
              style={{ marginTop: 4 }}
            />
          </div>
        </Space>
      </div>

      {/* Performance Metrics */}
      <div style={{ marginBottom: 16 }}>
        <Space style={{ width: "100%", justifyContent: "space-between" }}>
          <Tooltip title="Rata-rata Nilai">
            <div style={{ textAlign: "center" }}>
              <TrophyOutlined
                style={{
                  color: getGradeColor(session.average_grade || 0),
                  fontSize: 16,
                  marginBottom: 4,
                }}
              />
              <Text
                style={{
                  display: "block",
                  fontSize: 14,
                  fontWeight: 600,
                  color: getGradeColor(session.average_grade || 0),
                }}
              >
                {Math.round(session.average_grade || 0)}
              </Text>
              <Text style={{ fontSize: 10, color: "#999" }}>Nilai</Text>
            </div>
          </Tooltip>

          <Tooltip title="Aktivitas Terakhir">
            <div style={{ textAlign: "center" }}>
              <ClockCircleOutlined
                style={{ color: "#666", fontSize: 16, marginBottom: 4 }}
              />
              <Text
                style={{
                  display: "block",
                  fontSize: 12,
                  color: "#666",
                  fontWeight: 500,
                }}
              >
                {session.last_activity
                  ? dayjs(session.last_activity).fromNow()
                  : "Belum ada"}
              </Text>
              <Text style={{ fontSize: 10, color: "#999" }}>Aktivitas</Text>
            </div>
          </Tooltip>
        </Space>
      </div>

      {/* Action Button */}
      <Button
        type="primary"
        icon={<PlayCircleOutlined />}
        size="large"
        className="custom-button"
        style={{
          width: "100%",
          height: 48,
          borderRadius: 12,
          background: "linear-gradient(135deg, #1890ff, #722ed1)",
          border: "none",
          fontSize: 16,
          fontWeight: 600,
          marginTop: "auto",
        }}
      >
        Kelola Sesi
      </Button>
    </Card>
  );
};

export default SessionCard;
