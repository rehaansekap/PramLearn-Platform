import React, { useState } from "react";
import {
  Card,
  Row,
  Col,
  Typography,
  Progress,
  Badge,
  Tag,
  Space,
  Button,
  Modal,
  Empty,
  Spin,
  Tooltip,
  Statistic,
  Timeline,
} from "antd";
import {
  TrophyOutlined,
  StarOutlined,
  FireOutlined,
  CrownOutlined,
  ThunderboltOutlined,
  BookOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  AimOutlined,
  GiftOutlined,
} from "@ant-design/icons";
import useAchievements from "../hooks/useAchievements";

const { Title, Text } = Typography;

const AchievementSystem = ({
  achievements: propAchievements,
  loading: propLoading,
}) => {
  const [selectedAchievement, setSelectedAchievement] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [filter, setFilter] = useState("all"); // all, earned, progress, locked

  // Use hook if achievements not passed as props
  const hookData = useAchievements();
  const achievements = propAchievements || hookData.achievements;
  const loading = propLoading !== undefined ? propLoading : hookData.loading;

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "60px 0" }}>
        <Spin size="large" tip="Loading achievements..." />
      </div>
    );
  }

  // Define achievement categories and their data
  const achievementDefinitions = [
    {
      id: "learning_streak",
      title: "Learning Streak",
      description: "Study for consecutive days",
      icon: <FireOutlined />,
      color: "#ff4d4f",
      bgColor: "#fff2f0",
      category: "consistency",
      levels: [
        { days: 3, title: "3-Day Streak", points: 10 },
        { days: 7, title: "Week Warrior", points: 25 },
        { days: 14, title: "Two Week Champion", points: 50 },
        { days: 30, title: "Monthly Master", points: 100 },
      ],
    },
    {
      id: "time_spent",
      title: "Study Time Master",
      description: "Accumulate total study hours",
      icon: <ClockCircleOutlined />,
      color: "#1890ff",
      bgColor: "#e6f7ff",
      category: "dedication",
      levels: [
        { hours: 10, title: "Study Starter", points: 15 },
        { hours: 50, title: "Dedicated Learner", points: 40 },
        { hours: 100, title: "Study Champion", points: 75 },
        { hours: 200, title: "Learning Legend", points: 150 },
      ],
    },
    {
      id: "materials_completed",
      title: "Content Explorer",
      description: "Complete learning materials",
      icon: <BookOutlined />,
      color: "#52c41a",
      bgColor: "#f6ffed",
      category: "progress",
      levels: [
        { materials: 10, title: "Explorer", points: 20 },
        { materials: 25, title: "Discoverer", points: 50 },
        { materials: 50, title: "Navigator", points: 100 },
        { materials: 100, title: "Master Explorer", points: 200 },
      ],
    },
    {
      id: "perfect_attendance",
      title: "Perfect Attendance",
      description: "Maintain perfect attendance",
      icon: <CalendarOutlined />,
      color: "#722ed1",
      bgColor: "#f9f0ff",
      category: "attendance",
      levels: [
        { weeks: 1, title: "Week Perfect", points: 25 },
        { weeks: 2, title: "Bi-weekly Hero", points: 50 },
        { weeks: 4, title: "Monthly Champion", points: 100 },
        { weeks: 8, title: "Attendance Legend", points: 200 },
      ],
    },
    {
      id: "quiz_master",
      title: "Quiz Master",
      description: "Achieve high quiz scores",
      icon: <ThunderboltOutlined />,
      color: "#faad14",
      bgColor: "#fffbe6",
      category: "performance",
      levels: [
        { score: 80, title: "Good Scorer", points: 30 },
        { score: 85, title: "Great Performer", points: 60 },
        { score: 90, title: "Quiz Expert", points: 100 },
        { score: 95, title: "Quiz Master", points: 150 },
      ],
    },
    {
      id: "early_bird",
      title: "Early Bird",
      description: "Study during morning hours",
      icon: <StarOutlined />,
      color: "#eb2f96",
      bgColor: "#fff0f6",
      category: "habit",
      levels: [
        { sessions: 5, title: "Morning Starter", points: 15 },
        { sessions: 15, title: "Dawn Warrior", points: 40 },
        { sessions: 30, title: "Sunrise Champion", points: 80 },
        { sessions: 50, title: "Early Bird Master", points: 120 },
      ],
    },
  ];

  // Calculate current progress for each achievement
  const calculateAchievementProgress = (achievement) => {
    const progress = achievements?.progress || {};
    const earned = achievements?.earned || [];

    // Check if already earned
    const isEarned = earned.some((e) => e.achievement_id === achievement.id);

    if (isEarned) {
      return {
        status: "earned",
        currentLevel: achievement.levels.length - 1,
        progress: 100,
      };
    }

    // Calculate current progress
    const userProgress = progress[achievement.id] || {};
    let currentLevel = -1;
    let nextLevelProgress = 0;

    for (let i = 0; i < achievement.levels.length; i++) {
      const level = achievement.levels[i];
      let isLevelMet = false;

      switch (achievement.id) {
        case "learning_streak":
          isLevelMet = (userProgress.current_streak || 0) >= level.days;
          nextLevelProgress = Math.min(
            ((userProgress.current_streak || 0) / level.days) * 100,
            100
          );
          break;
        case "time_spent":
          const totalHours = (userProgress.total_time || 0) / 3600;
          isLevelMet = totalHours >= level.hours;
          nextLevelProgress = Math.min((totalHours / level.hours) * 100, 100);
          break;
        case "materials_completed":
          isLevelMet = (userProgress.completed_count || 0) >= level.materials;
          nextLevelProgress = Math.min(
            ((userProgress.completed_count || 0) / level.materials) * 100,
            100
          );
          break;
        case "perfect_attendance":
          isLevelMet = (userProgress.perfect_weeks || 0) >= level.weeks;
          nextLevelProgress = Math.min(
            ((userProgress.perfect_weeks || 0) / level.weeks) * 100,
            100
          );
          break;
        case "quiz_master":
          isLevelMet = (userProgress.average_score || 0) >= level.score;
          nextLevelProgress = Math.min(
            ((userProgress.average_score || 0) / level.score) * 100,
            100
          );
          break;
        case "early_bird":
          isLevelMet = (userProgress.morning_sessions || 0) >= level.sessions;
          nextLevelProgress = Math.min(
            ((userProgress.morning_sessions || 0) / level.sessions) * 100,
            100
          );
          break;
        default:
          break;
      }

      if (isLevelMet) {
        currentLevel = i;
      } else {
        break;
      }
    }

    if (currentLevel === achievement.levels.length - 1) {
      return { status: "earned", currentLevel, progress: 100 };
    } else if (currentLevel >= 0) {
      return { status: "progress", currentLevel, progress: nextLevelProgress };
    } else {
      return {
        status: "locked",
        currentLevel: -1,
        progress: nextLevelProgress,
      };
    }
  };

  // Filter achievements based on selected filter
  const getFilteredAchievements = () => {
    return achievementDefinitions.filter((achievement) => {
      const progress = calculateAchievementProgress(achievement);

      switch (filter) {
        case "earned":
          return progress.status === "earned";
        case "progress":
          return progress.status === "progress";
        case "locked":
          return progress.status === "locked";
        default:
          return true;
      }
    });
  };

  const filteredAchievements = getFilteredAchievements();

  // Calculate statistics
  const earnedCount = achievementDefinitions.filter(
    (a) => calculateAchievementProgress(a).status === "earned"
  ).length;

  const progressCount = achievementDefinitions.filter(
    (a) => calculateAchievementProgress(a).status === "progress"
  ).length;

  const totalPoints =
    achievements?.earned?.reduce(
      (sum, achievement) => sum + (achievement.points || 0),
      0
    ) || 0;

  const AchievementCard = ({ achievement }) => {
    const progress = calculateAchievementProgress(achievement);
    const { status, currentLevel, progress: progressPercent } = progress;

    const isEarned = status === "earned";
    const isInProgress = status === "progress";
    const isLocked = status === "locked";

    const currentLevelData =
      currentLevel >= 0 ? achievement.levels[currentLevel] : null;
    const nextLevelData =
      currentLevel < achievement.levels.length - 1
        ? achievement.levels[currentLevel + 1]
        : null;

    return (
      <Card
        size="small"
        hoverable
        onClick={() => {
          setSelectedAchievement({ ...achievement, progress });
          setDetailModalVisible(true);
        }}
        style={{
          height: "100%",
          background: isEarned
            ? achievement.bgColor
            : isInProgress
            ? "#fafafa"
            : "#f5f5f5",
          border: `2px solid ${
            isEarned ? achievement.color : isInProgress ? "#d9d9d9" : "#e8e8e8"
          }`,
          borderRadius: 12,
          opacity: isEarned ? 1 : isInProgress ? 0.9 : 0.6,
          position: "relative",
        }}
      >
        {/* Badge for earned achievements */}
        {isEarned && (
          <div
            style={{
              position: "absolute",
              top: -8,
              right: -8,
              background: achievement.color,
              borderRadius: "50%",
              width: 24,
              height: 24,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: 12,
              fontWeight: "bold",
              zIndex: 10,
            }}
          >
            ✓
          </div>
        )}

        <div style={{ textAlign: "center" }}>
          {/* Icon */}
          <div
            style={{
              fontSize: 32,
              color: isEarned ? achievement.color : "#bfbfbf",
              marginBottom: 12,
            }}
          >
            {achievement.icon}
          </div>

          {/* Title */}
          <Title
            level={5}
            style={{
              margin: 0,
              marginBottom: 8,
              color: isEarned ? achievement.color : "#666",
              fontSize: 14,
            }}
          >
            {achievement.title}
          </Title>

          {/* Description */}
          <Text
            type="secondary"
            style={{
              fontSize: 12,
              display: "block",
              marginBottom: 12,
              height: 32,
              overflow: "hidden",
            }}
          >
            {achievement.description}
          </Text>

          {/* Current Level */}
          {currentLevelData && (
            <Tag
              color={achievement.color}
              style={{ marginBottom: 8, fontSize: 10 }}
            >
              {currentLevelData.title}
            </Tag>
          )}

          {/* Progress */}
          {!isEarned && nextLevelData && (
            <div>
              <Progress
                percent={Math.min(progressPercent, 100)}
                size="small"
                showInfo={false}
                strokeColor={achievement.color}
                style={{ marginBottom: 4 }}
              />
              <Text style={{ fontSize: 10, color: "#666" }}>
                Next: {nextLevelData.title}
              </Text>
            </div>
          )}

          {/* Points */}
          {isEarned && currentLevelData && (
            <div style={{ marginTop: 8 }}>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "bold",
                  color: achievement.color,
                }}
              >
                +{currentLevelData.points} points
              </Text>
            </div>
          )}
        </div>
      </Card>
    );
  };

  return (
    <div>
      {/* Header Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={8}>
          <Card size="small">
            <Statistic
              title="Earned"
              value={earnedCount}
              suffix={`/ ${achievementDefinitions.length}`}
              prefix={<TrophyOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={8}>
          <Card size="small">
            <Statistic
              title="In Progress"
              value={progressCount}
              prefix={<AimOutlined />}
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>
        <Col xs={8}>
          <Card size="small">
            <Statistic
              title="Total Points"
              value={totalPoints}
              prefix={<CrownOutlined />}
              valueStyle={{ color: "#722ed1" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filter Buttons */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Text strong>Achievements</Text>
          </Col>
          <Col>
            <Button.Group size="small">
              <Button
                type={filter === "all" ? "primary" : "default"}
                onClick={() => setFilter("all")}
              >
                All ({achievementDefinitions.length})
              </Button>
              <Button
                type={filter === "earned" ? "primary" : "default"}
                onClick={() => setFilter("earned")}
              >
                Earned ({earnedCount})
              </Button>
              <Button
                type={filter === "progress" ? "primary" : "default"}
                onClick={() => setFilter("progress")}
              >
                Progress ({progressCount})
              </Button>
              <Button
                type={filter === "locked" ? "primary" : "default"}
                onClick={() => setFilter("locked")}
              >
                Locked (
                {achievementDefinitions.length - earnedCount - progressCount})
              </Button>
            </Button.Group>
          </Col>
        </Row>
      </Card>

      {/* Achievement Grid */}
      {filteredAchievements.length > 0 ? (
        <Row gutter={[16, 16]}>
          {filteredAchievements.map((achievement) => (
            <Col xs={12} sm={8} md={6} lg={4} key={achievement.id}>
              <AchievementCard achievement={achievement} />
            </Col>
          ))}
        </Row>
      ) : (
        <Empty description={`No ${filter} achievements found`} />
      )}

      {/* Recent Achievements Timeline */}
      {achievements?.earned?.length > 0 && (
        <Card
          title={
            <Space>
              <GiftOutlined />
              <Text strong>Recent Achievements</Text>
            </Space>
          }
          style={{ marginTop: 24 }}
        >
          <Timeline>
            {achievements.earned.slice(0, 5).map((achievement, index) => (
              <Timeline.Item
                key={index}
                color={
                  achievementDefinitions.find(
                    (a) => a.id === achievement.achievement_id
                  )?.color || "blue"
                }
              >
                <div>
                  <Text strong>{achievement.title}</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Earned on{" "}
                    {new Date(achievement.earned_date).toLocaleDateString()}
                  </Text>
                  <br />
                  <Tag color="gold" size="small">
                    +{achievement.points} points
                  </Tag>
                </div>
              </Timeline.Item>
            ))}
          </Timeline>
        </Card>
      )}

      {/* Achievement Detail Modal */}
      <Modal
        title={selectedAchievement?.title}
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={600}
      >
        {selectedAchievement && (
          <div>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <div
                style={{
                  fontSize: 64,
                  color: selectedAchievement.color,
                  marginBottom: 16,
                }}
              >
                {selectedAchievement.icon}
              </div>
              <Title level={3} style={{ color: selectedAchievement.color }}>
                {selectedAchievement.title}
              </Title>
              <Text type="secondary">{selectedAchievement.description}</Text>
            </div>

            <Card title="Achievement Levels" size="small">
              <Space direction="vertical" style={{ width: "100%" }}>
                {selectedAchievement.levels.map((level, index) => {
                  const isCompleted =
                    index <= selectedAchievement.progress.currentLevel;
                  const isCurrent =
                    index === selectedAchievement.progress.currentLevel + 1;

                  return (
                    <div
                      key={index}
                      style={{
                        padding: 12,
                        background: isCompleted
                          ? selectedAchievement.bgColor
                          : isCurrent
                          ? "#f9f9f9"
                          : "#fafafa",
                        borderRadius: 8,
                        border: `1px solid ${
                          isCompleted ? selectedAchievement.color : "#e8e8e8"
                        }`,
                      }}
                    >
                      <Row justify="space-between" align="middle">
                        <Col>
                          <Space>
                            {isCompleted && <Badge status="success" />}
                            <Text
                              strong
                              style={{
                                color: isCompleted
                                  ? selectedAchievement.color
                                  : "#666",
                              }}
                            >
                              {level.title}
                            </Text>
                            {isCurrent && (
                              <Tag color="processing">Current Goal</Tag>
                            )}
                          </Space>
                        </Col>
                        <Col>
                          <Text
                            strong
                            style={{ color: selectedAchievement.color }}
                          >
                            {level.points} points
                          </Text>
                        </Col>
                      </Row>

                      {isCurrent &&
                        selectedAchievement.progress.progress < 100 && (
                          <div style={{ marginTop: 8 }}>
                            <Progress
                              percent={selectedAchievement.progress.progress}
                              strokeColor={selectedAchievement.color}
                              size="small"
                            />
                          </div>
                        )}
                    </div>
                  );
                })}
              </Space>
            </Card>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AchievementSystem;
