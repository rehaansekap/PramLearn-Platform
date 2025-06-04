import React from "react";
import { Card, Row, Col, Badge, Typography, Space, Tooltip, Progress, Tag, Statistic } from "antd";
import {
  TrophyOutlined,
  StarOutlined,
  FireOutlined,
  ThunderboltOutlined,
  CrownOutlined,
  GiftOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const AchievementBadges = ({ grades, statistics }) => {
  // Define achievement criteria and calculate progress
  const achievements = [
    {
      id: "perfect_score",
      title: "Perfect Score",
      description: "Dapatkan nilai 100",
      icon: <CrownOutlined />,
      color: "#FFD700",
      bgColor: "#FFF8DC",
      criteria: () => grades.some((g) => g.grade === 100),
      progress: () => {
        const perfectScores = grades.filter((g) => g.grade === 100).length;
        return {
          current: perfectScores,
          target: 1,
          percentage: perfectScores > 0 ? 100 : 0,
        };
      },
    },
    {
      id: "consistent_performer",
      title: "Consistent Performer",
      description: "Nilai di atas 80 dalam 5 assessment berturut-turut",
      icon: <StarOutlined />,
      color: "#52c41a",
      bgColor: "#f6ffed",
      criteria: () => {
        const recent = grades.slice(0, 5);
        return recent.length >= 5 && recent.every((g) => g.grade >= 80);
      },
      progress: () => {
        const recent = grades.slice(0, 5);
        const above80 = recent.filter((g) => g.grade >= 80).length;
        return { current: above80, target: 5, percentage: (above80 / 5) * 100 };
      },
    },
    {
      id: "quiz_master",
      title: "Quiz Master",
      description: "Rata-rata quiz di atas 85",
      icon: <ThunderboltOutlined />,
      color: "#1890ff",
      bgColor: "#e6f7ff",
      criteria: () => (statistics.quiz_average || 0) >= 85,
      progress: () => {
        const avg = statistics.quiz_average || 0;
        return {
          current: avg.toFixed(1),
          target: 85,
          percentage: (avg / 85) * 100,
        };
      },
    },
    {
      id: "assignment_expert",
      title: "Assignment Expert",
      description: "Rata-rata assignment di atas 85",
      icon: <GiftOutlined />,
      color: "#722ed1",
      bgColor: "#f9f0ff",
      criteria: () => (statistics.assignment_average || 0) >= 85,
      progress: () => {
        const avg = statistics.assignment_average || 0;
        return {
          current: avg.toFixed(1),
          target: 85,
          percentage: (avg / 85) * 100,
        };
      },
    },
    {
      id: "high_achiever",
      title: "High Achiever",
      description: "Rata-rata keseluruhan di atas 90",
      icon: <TrophyOutlined />,
      color: "#fa8c16",
      bgColor: "#fff7e6",
      criteria: () => (statistics.average_grade || 0) >= 90,
      progress: () => {
        const avg = statistics.average_grade || 0;
        return {
          current: avg.toFixed(1),
          target: 90,
          percentage: (avg / 90) * 100,
        };
      },
    },
    {
      id: "dedicated_learner",
      title: "Dedicated Learner",
      description: "Selesaikan 20 assessment",
      icon: <FireOutlined />,
      color: "#eb2f96",
      bgColor: "#fff0f6",
      criteria: () => (statistics.completed_assessments || 0) >= 20,
      progress: () => {
        const completed = statistics.completed_assessments || 0;
        return {
          current: completed,
          target: 20,
          percentage: (completed / 20) * 100,
        };
      },
    },
  ];

  const earnedAchievements = achievements.filter((achievement) =>
    achievement.criteria()
  );

  const inProgressAchievements = achievements.filter(
    (achievement) =>
      !achievement.criteria() && achievement.progress().percentage > 0
  );

  const lockedAchievements = achievements.filter(
    (achievement) =>
      !achievement.criteria() && achievement.progress().percentage === 0
  );

  const AchievementCard = ({ achievement, status = "earned" }) => {
    const progress = achievement.progress();
    const isEarned = status === "earned";
    const isInProgress = status === "inProgress";

    return (
      <Tooltip
        title={
          <div>
            <div style={{ fontWeight: "bold", marginBottom: 4 }}>
              {achievement.title}
            </div>
            <div style={{ marginBottom: 8 }}>{achievement.description}</div>
            {!isEarned && (
              <div>
                Progress: {progress.current} / {progress.target}
              </div>
            )}
          </div>
        }
        placement="top"
      >
        <Card
          size="small"
          style={{
            background: isEarned
              ? achievement.bgColor
              : isInProgress
              ? "#fafafa"
              : "#f5f5f5",
            border: `2px solid ${
              isEarned
                ? achievement.color
                : isInProgress
                ? "#d9d9d9"
                : "#e8e8e8"
            }`,
            borderRadius: 12,
            textAlign: "center",
            opacity: isEarned ? 1 : isInProgress ? 0.8 : 0.5,
            transition: "all 0.3s ease",
            cursor: "pointer",
          }}
          hoverable
          className="achievement-card"
        >
          <div style={{ marginBottom: 8 }}>
            <div
              style={{
                fontSize: 32,
                color: isEarned ? achievement.color : "#bfbfbf",
                marginBottom: 8,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: 40,
              }}
            >
              {achievement.icon}
            </div>

            {isEarned && (
              <Badge
                count="✓"
                style={{
                  backgroundColor: achievement.color,
                  position: "absolute",
                  top: 8,
                  right: 8,
                }}
              />
            )}
          </div>

          <Title
            level={5}
            style={{
              margin: 0,
              fontSize: 12,
              color: isEarned ? achievement.color : "#666",
              fontWeight: "bold",
            }}
          >
            {achievement.title}
          </Title>

          <Text
            type="secondary"
            style={{
              fontSize: 10,
              display: "block",
              marginTop: 4,
              height: 32,
              overflow: "hidden",
            }}
          >
            {achievement.description}
          </Text>

          {!isEarned && progress.percentage > 0 && (
            <div style={{ marginTop: 8 }}>
              <Progress
                percent={Math.min(progress.percentage, 100)}
                size="small"
                showInfo={false}
                strokeColor={achievement.color}
              />
              <Text style={{ fontSize: 10, color: "#666" }}>
                {progress.current} / {progress.target}
              </Text>
            </div>
          )}

          {isEarned && (
            <Tag
              color={achievement.color}
              style={{
                margin: "8px 0 0 0",
                fontSize: 10,
                padding: "2px 6px",
              }}
            >
              EARNED
            </Tag>
          )}
        </Card>
      </Tooltip>
    );
  };

  return (
    <div>
      {/* Summary */}
      <Card style={{ marginBottom: 24, textAlign: "center" }}>
        <Row gutter={16}>
          <Col span={8}>
            <Statistic
              title="🏆 Earned"
              value={earnedAchievements.length}
              suffix={`/ ${achievements.length}`}
              valueStyle={{ color: "#52c41a", fontSize: 24 }}
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="⏳ In Progress"
              value={inProgressAchievements.length}
              valueStyle={{ color: "#faad14", fontSize: 24 }}
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="🔒 Locked"
              value={lockedAchievements.length}
              valueStyle={{ color: "#bfbfbf", fontSize: 24 }}
            />
          </Col>
        </Row>
      </Card>

      {/* Earned Achievements */}
      {earnedAchievements.length > 0 && (
        <Card
          title={
            <Space>
              <TrophyOutlined style={{ color: "#FFD700" }} />
              <Text strong>
                Pencapaian yang Diraih ({earnedAchievements.length})
              </Text>
            </Space>
          }
          style={{ marginBottom: 24 }}
        >
          <Row gutter={[16, 16]}>
            {earnedAchievements.map((achievement) => (
              <Col xs={12} sm={8} md={6} lg={4} key={achievement.id}>
                <AchievementCard achievement={achievement} status="earned" />
              </Col>
            ))}
          </Row>
        </Card>
      )}

      {/* In Progress Achievements */}
      {inProgressAchievements.length > 0 && (
        <Card
          title={
            <Space>
              <StarOutlined style={{ color: "#faad14" }} />
              <Text strong>
                Sedang Dalam Progress ({inProgressAchievements.length})
              </Text>
            </Space>
          }
          style={{ marginBottom: 24 }}
        >
          <Row gutter={[16, 16]}>
            {inProgressAchievements.map((achievement) => (
              <Col xs={12} sm={8} md={6} lg={4} key={achievement.id}>
                <AchievementCard
                  achievement={achievement}
                  status="inProgress"
                />
              </Col>
            ))}
          </Row>
        </Card>
      )}

      {/* Locked Achievements */}
      {lockedAchievements.length > 0 && (
        <Card
          title={
            <Space>
              <GiftOutlined style={{ color: "#bfbfbf" }} />
              <Text strong>
                Pencapaian Terkunci ({lockedAchievements.length})
              </Text>
            </Space>
          }
        >
          <Row gutter={[16, 16]}>
            {lockedAchievements.map((achievement) => (
              <Col xs={12} sm={8} md={6} lg={4} key={achievement.id}>
                <AchievementCard achievement={achievement} status="locked" />
              </Col>
            ))}
          </Row>
        </Card>
      )}

      {/* Achievement Tips */}
      <Card title="💡 Tips untuk Meraih Pencapaian" size="small">
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li>
            <Text type="secondary">
              Kerjakan quiz dan assignment secara konsisten untuk unlock badge
              "Dedicated Learner"
            </Text>
          </li>
          <li>
            <Text type="secondary">
              Pertahankan nilai di atas 80 untuk mendapatkan "Consistent
              Performer"
            </Text>
          </li>
          <li>
            <Text type="secondary">
              Focus pada persiapan quiz untuk mencapai "Quiz Master"
            </Text>
          </li>
          <li>
            <Text type="secondary">
              Kualitas pengerjaan assignment sangat penting untuk "Assignment
              Expert"
            </Text>
          </li>
        </ul>
      </Card>
    </div>
  );
};

export default AchievementBadges;
