import React, { useState, useEffect } from "react";
import {
  Card,
  Typography,
  Space,
  Progress,
  Row,
  Col,
  Skeleton,
  Empty,
  Tag,
  Statistic,
} from "antd";
import {
  TrophyOutlined,
  StarOutlined,
  BarChartOutlined,
  BookOutlined,
  QuestionCircleOutlined,
  FileTextOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import useStudentGrades from "../../grades/hooks/useStudentGrades";

const { Text, Title } = Typography;

const GradeSummaryCard = ({ loading: dashboardLoading }) => {
  const navigate = useNavigate();
  const {
    grades,
    statistics,
    achievements,
    loading: gradesLoading,
    fetchGrades,
  } = useStudentGrades();

  // Combine loading states
  const isLoading = dashboardLoading || gradesLoading;

  // Fetch grades data when component mounts
  useEffect(() => {
    fetchGrades();
  }, [fetchGrades]);

  const getGradeColor = (score) => {
    if (score >= 90) return "#52c41a";
    if (score >= 80) return "#1890ff";
    if (score >= 70) return "#faad14";
    if (score >= 60) return "#fa8c16";
    return "#ff4d4f";
  };

  const calculateTrend = () => {
    if (!grades || grades.length < 4)
      return { trend: "insufficient", change: 0 };

    const sortedGrades = [...grades].sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
    const halfPoint = Math.floor(sortedGrades.length / 2);

    const recentGrades = sortedGrades.slice(halfPoint);
    const olderGrades = sortedGrades.slice(0, halfPoint);

    const recentAvg =
      recentGrades.reduce((sum, g) => sum + (g.grade || 0), 0) /
      recentGrades.length;
    const olderAvg =
      olderGrades.reduce((sum, g) => sum + (g.grade || 0), 0) /
      olderGrades.length;

    const change = ((recentAvg - olderAvg) / olderAvg) * 100;

    if (Math.abs(change) < 2) return { trend: "stable", change: 0 };
    return {
      trend: change > 0 ? "increasing" : "decreasing",
      change: Math.abs(change),
    };
  };

  const getQuickAchievements = () => {
    if (!grades || grades.length === 0) return [];

    const quickAchievements = [];
    const averageGrade =
      grades.reduce((sum, g) => sum + (g.grade || 0), 0) / grades.length;

    // Perfect scores
    const perfectScores = grades.filter((g) => g.grade === 100).length;
    if (perfectScores > 0) {
      quickAchievements.push({
        title: "Perfect Score",
        description: `${perfectScores} nilai sempurna`,
        icon: "⭐",
        color: "#faad14",
      });
    }

    // High performer
    if (averageGrade >= 85) {
      quickAchievements.push({
        title: "High Performer",
        description: `Rata-rata ${averageGrade.toFixed(1)}`,
        icon: "🏆",
        color: "#52c41a",
      });
    }

    // Active learner
    if (grades.length >= 10) {
      quickAchievements.push({
        title: "Active Learner",
        description: `${grades.length} assessment selesai`,
        icon: "📚",
        color: "#1890ff",
      });
    }

    return quickAchievements.slice(0, 3); // Maksimal 3 achievement
  };

  if (isLoading) {
    return (
      <Card
        style={{
          borderRadius: 12,
          marginBottom: 16,
        }}
        size="small"
      >
        <Skeleton active paragraph={{ rows: 4 }} />
      </Card>
    );
  }

  // Jika tidak ada data grades
  if (!grades || grades.length === 0) {
    return (
      <Card
        title={
          <Space>
            <TrophyOutlined style={{ color: "#11418b" }} />
            <Text strong>Ringkasan Nilai & Achievement</Text>
          </Space>
        }
        style={{ borderRadius: 12, marginBottom: 16 }}
        size="small"
        extra={
          <Text
            type="link"
            style={{ cursor: "pointer" }}
            onClick={() => navigate("/student/grades")}
          >
            Lihat Detail →
          </Text>
        }
      >
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <div>
              <Text style={{ fontSize: 14, color: "#666" }}>
                Belum ada data nilai
              </Text>
              <div style={{ marginTop: 8 }}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Nilai akan muncul setelah mengerjakan quiz atau assignment
                </Text>
              </div>
            </div>
          }
        />
      </Card>
    );
  }

  const trend = calculateTrend();
  const quickAchievements = getQuickAchievements();
  const averageGrade = statistics?.average_grade || 0;

  // Separate quiz and assignment grades
  const quizGrades = grades.filter((g) => g.type === "quiz");
  const assignmentGrades = grades.filter((g) => g.type === "assignment");

  const quizAvg =
    quizGrades.length > 0
      ? quizGrades.reduce((sum, g) => sum + (g.grade || 0), 0) /
        quizGrades.length
      : 0;
  const assignmentAvg =
    assignmentGrades.length > 0
      ? assignmentGrades.reduce((sum, g) => sum + (g.grade || 0), 0) /
        assignmentGrades.length
      : 0;

  return (
    <Card
      title={
        <Space>
          <TrophyOutlined style={{ color: "#11418b" }} />
          <Text strong>Ringkasan Nilai & Achievement</Text>
        </Space>
      }
      style={{ borderRadius: 12, marginBottom: 16 }}
      size="large"
      extra={
        <Text
          type="link"
          style={{ cursor: "pointer" }}
          onClick={() => navigate("/student/grades")}
        >
          Lihat Detail →
        </Text>
      }
    >
      {/* Quick Stats */}
      <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={8}>
          <div
            style={{
              textAlign: "center",
              padding: "12px 8px",
              background: "#f8f9fa",
              borderRadius: 8,
            }}
          >
            <div
              style={{
                fontSize: 20,
                fontWeight: "bold",
                color: getGradeColor(averageGrade),
              }}
            >
              {averageGrade.toFixed(1)}
            </div>
            <Text type="secondary" style={{ fontSize: 13 }}>
              Rata-rata
            </Text>
          </div>
        </Col>
        <Col xs={12} sm={8}>
          <div
            style={{
              textAlign: "center",
              padding: "12px 8px",
              background: "#f8f9fa",
              borderRadius: 8,
            }}
          >
            <div style={{ fontSize: 20, fontWeight: "bold", color: "#1890ff" }}>
              {grades.length}
            </div>
            <Text type="secondary" style={{ fontSize: 13 }}>
              Total Assessment
            </Text>
          </div>
        </Col>
        <Col xs={24} sm={8}>
          <div
            style={{
              textAlign: "center",
              padding: "12px 8px",
              background: "#f8f9fa",
              borderRadius: 8,
            }}
          >
            <div
              style={{
                fontSize: 16,
                fontWeight: "bold",
                color:
                  trend.trend === "increasing"
                    ? "#52c41a"
                    : trend.trend === "decreasing"
                    ? "#ff4d4f"
                    : "#666",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 4,
              }}
            >
              {trend.trend === "increasing" && <ArrowUpOutlined />}
              {trend.trend === "decreasing" && <ArrowDownOutlined />}
              {trend.trend === "insufficient"
                ? "N/A"
                : trend.trend === "stable"
                ? "Stabil"
                : `${trend.change.toFixed(1)}%`}
            </div>
            <Text type="secondary" style={{ fontSize: 13 }}>
              Tren Performa
            </Text>
          </div>
        </Col>
      </Row>

      {/* Quiz vs Assignment Performance */}
      <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
        <Col xs={12}>
          <Card
            size="small"
            style={{
              textAlign: "center",
              background: "#e6f7ff",
              border: "1px solid #91d5ff",
            }}
          >
            <Space direction="vertical" size={2}>
              <QuestionCircleOutlined
                style={{ fontSize: 16, color: "#1890ff" }}
              />
              <div
                style={{ fontSize: 14, fontWeight: "bold", color: "#1890ff" }}
              >
                {quizAvg.toFixed(1)}
              </div>
              <Text style={{ fontSize: 13, color: "#1890ff" }}>
                Quiz ({quizGrades.length})
              </Text>
            </Space>
          </Card>
        </Col>
        <Col xs={12}>
          <Card
            size="small"
            style={{
              textAlign: "center",
              background: "#fff7e6",
              border: "1px solid #ffd591",
            }}
          >
            <Space direction="vertical" size={2}>
              <FileTextOutlined style={{ fontSize: 16, color: "#faad14" }} />
              <div
                style={{ fontSize: 14, fontWeight: "bold", color: "#faad14" }}
              >
                {assignmentAvg.toFixed(1)}
              </div>
              <Text style={{ fontSize: 13, color: "#faad14" }}>
                Assignment ({assignmentGrades.length})
              </Text>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Progress Bar
      <div style={{ marginBottom: 16 }}>
        <Text
          strong
          style={{ fontSize: 12, display: "block", marginBottom: 8 }}
        >
          Progress Keseluruhan
        </Text>
        <Progress
          percent={Math.min(averageGrade, 100)}
          strokeColor={getGradeColor(averageGrade)}
          showInfo={true}
          format={(percent) => `${percent.toFixed(1)}%`}
          size="small"
        />
      </div> */}

      {/* Quick Achievements */}
      {quickAchievements.length > 0 && (
        <div>
          <Text
            strong
            style={{ fontSize: 14, display: "block", marginBottom: 8 }}
          >
            Achievement Terbaru
          </Text>
          <Space size={[4, 8]} wrap>
            {quickAchievements.map((achievement, index) => (
              <Tag
                key={index}
                color={achievement.color}
                style={{
                  borderRadius: 12,
                  fontSize: 12,
                  padding: "2px 8px",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <span>{achievement.icon}</span>
                <span style={{ fontWeight: "bold" }}>{achievement.title}</span>
              </Tag>
            ))}
          </Space>
        </div>
      )}
    </Card>
  );
};

export default GradeSummaryCard;
