import React from "react";
import {
  Card,
  Row,
  Col,
  Typography,
  Progress,
  Space,
  Empty,
  List,
  Tag,
  Tooltip,
  Badge,
} from "antd";
import {
  CrownOutlined,
  StarOutlined,
  ThunderboltOutlined,
  GiftOutlined,
  TrophyOutlined,
  FireOutlined,
  LockOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const AchievementBadges = ({ grades = [], statistics = {} }) => {
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
        const perfectScores = grades.filter(g => g.grade === 100).length;
        return {
          current: perfectScores,
          target: 1,
          percentage: perfectScores > 0 ? 100 : 0,
          description: perfectScores > 0 ? `${perfectScores} nilai sempurna` : "Belum ada nilai 100"
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
        const sortedGrades = [...grades].sort((a, b) => new Date(a.date) - new Date(b.date));
        for (let i = 0; i <= sortedGrades.length - 5; i++) {
          const consecutive = sortedGrades.slice(i, i + 5);
          if (consecutive.every(g => g.grade >= 80)) return true;
        }
        return false;
      },
      progress: () => {
        const sortedGrades = [...grades].sort((a, b) => new Date(a.date) - new Date(b.date));
        let maxConsecutive = 0;
        let current = 0;
        
        for (const grade of sortedGrades) {
          if (grade.grade >= 80) {
            current++;
            maxConsecutive = Math.max(maxConsecutive, current);
          } else {
            current = 0;
          }
        }
        
        return {
          current: maxConsecutive,
          target: 5,
          percentage: Math.min((maxConsecutive / 5) * 100, 100),
          description: `${maxConsecutive}/5 assessment berturut-turut`
        };
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
        const quizAverage = statistics.quiz_average || 0;
        return {
          current: quizAverage.toFixed(1),
          target: 85,
          percentage: Math.min((quizAverage / 85) * 100, 100),
          description: `Rata-rata quiz: ${quizAverage.toFixed(1)}/85`
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
        const assignmentAverage = statistics.assignment_average || 0;
        return {
          current: assignmentAverage.toFixed(1),
          target: 85,
          percentage: Math.min((assignmentAverage / 85) * 100, 100),
          description: `Rata-rata assignment: ${assignmentAverage.toFixed(1)}/85`
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
        const overallAverage = statistics.average_grade || 0;
        return {
          current: overallAverage.toFixed(1),
          target: 90,
          percentage: Math.min((overallAverage / 90) * 100, 100),
          description: `Rata-rata keseluruhan: ${overallAverage.toFixed(1)}/90`
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
      criteria: () => (statistics.completed_assessments || grades.length) >= 20,
      progress: () => {
        const completed = statistics.completed_assessments || grades.length;
        return {
          current: completed,
          target: 20,
          percentage: Math.min((completed / 20) * 100, 100),
          description: `${completed}/20 assessment diselesaikan`
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
    const isLocked = status === "locked";

    return (
      <Card
        style={{
          borderRadius: 12,
          textAlign: "center",
          border: isEarned ? `2px solid ${achievement.color}` : "1px solid #f0f0f0",
          background: isEarned ? achievement.bgColor : isLocked ? "#f8f8f8" : "white",
          opacity: isLocked ? 0.7 : 1,
          transition: "all 0.3s ease",
          position: "relative",
          overflow: "hidden",
        }}
        bodyStyle={{ padding: 16 }}
        onMouseEnter={(e) => {
          if (!isLocked) {
            e.currentTarget.style.transform = "translateY(-4px)";
            e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.12)";
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "none";
        }}
      >
        {/* Status Badge */}
        {isEarned && (
          <div style={{
            position: "absolute",
            top: 8,
            right: 8,
            background: achievement.color,
            borderRadius: "50%",
            width: 24,
            height: 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <CheckCircleOutlined style={{ color: "white", fontSize: 12 }} />
          </div>
        )}

        {isInProgress && (
          <div style={{
            position: "absolute",
            top: 8,
            right: 8,
            background: "#faad14",
            borderRadius: "50%",
            width: 24,
            height: 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <ClockCircleOutlined style={{ color: "white", fontSize: 12 }} />
          </div>
        )}

        {isLocked && (
          <div style={{
            position: "absolute",
            top: 8,
            right: 8,
            background: "#d9d9d9",
            borderRadius: "50%",
            width: 24,
            height: 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <LockOutlined style={{ color: "white", fontSize: 12 }} />
          </div>
        )}

        {/* Achievement Icon */}
        <div style={{
          fontSize: 32,
          color: isLocked ? "#bfbfbf" : achievement.color,
          marginBottom: 12,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: 48
        }}>
          {isLocked ? <LockOutlined /> : achievement.icon}
        </div>

        {/* Achievement Title */}
        <Title level={5} style={{ 
          margin: "0 0 8px 0", 
          color: isLocked ? "#bfbfbf" : "#11418b",
          fontSize: 14,
          fontWeight: "bold"
        }}>
          {achievement.title}
        </Title>

        {/* Achievement Description */}
        <Text 
          type={isLocked ? "secondary" : "default"}
          style={{ 
            fontSize: 12, 
            display: "block", 
            marginBottom: 12,
            color: isLocked ? "#bfbfbf" : "#666"
          }}
        >
          {achievement.description}
        </Text>

        {/* Progress Section */}
        {!isEarned && (
          <div style={{ marginBottom: 8 }}>
            <Progress
              percent={progress.percentage}
              strokeColor={isLocked ? "#d9d9d9" : achievement.color}
              trailColor="#f0f0f0"
              showInfo={false}
              size="small"
            />
            <Text style={{ 
              fontSize: 11, 
              color: isLocked ? "#bfbfbf" : "#666",
              marginTop: 4,
              display: "block"
            }}>
              {progress.description}
            </Text>
          </div>
        )}

        {/* Earned Badge */}
        {isEarned && (
          <div style={{ marginTop: 8 }}>
            <Tag 
              color={achievement.color}
              style={{ 
                borderRadius: 12,
                fontWeight: "bold",
                fontSize: 11
              }}
            >
              ✓ Tercapai
            </Tag>
          </div>
        )}

        {/* Progress Badge */}
        {isInProgress && (
          <div style={{ marginTop: 8 }}>
            <Tag 
              color="orange"
              style={{ 
                borderRadius: 12,
                fontWeight: "bold",
                fontSize: 11
              }}
            >
              {progress.percentage.toFixed(0)}% Progress
            </Tag>
          </div>
        )}
      </Card>
    );
  };

  if (grades.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "60px 24px" }}>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <div>
              <Text style={{ fontSize: 16, color: "#666" }}>
                Belum ada pencapaian
              </Text>
              <div style={{ marginTop: 12 }}>
                <Text type="secondary" style={{ fontSize: 14 }}>
                  Mulai mengerjakan quiz dan assignment untuk mendapatkan achievement
                </Text>
              </div>
            </div>
          }
        />
      </div>
    );
  }

  return (
    <div>
      {/* Summary Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
        <Col xs={24} sm={8}>
          <Card style={{ borderRadius: 12, textAlign: "center", background: "linear-gradient(135deg, #52c41a 0%, #73d13d 100%)", color: "white" }}>
            <TrophyOutlined style={{ fontSize: 32, marginBottom: 8 }} />
            <div style={{ fontSize: 24, fontWeight: "bold", marginBottom: 4 }}>
              {earnedAchievements.length}
            </div>
            <div style={{ fontSize: 14, opacity: 0.9 }}>
              Achievement Tercapai
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card style={{ borderRadius: 12, textAlign: "center", background: "linear-gradient(135deg, #faad14 0%, #ffc53d 100%)", color: "white" }}>
            <ClockCircleOutlined style={{ fontSize: 32, marginBottom: 8 }} />
            <div style={{ fontSize: 24, fontWeight: "bold", marginBottom: 4 }}>
              {inProgressAchievements.length}
            </div>
            <div style={{ fontSize: 14, opacity: 0.9 }}>
              Sedang Progress
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card style={{ borderRadius: 12, textAlign: "center", background: "linear-gradient(135deg, #722ed1 0%, #9254de 100%)", color: "white" }}>
            <StarOutlined style={{ fontSize: 32, marginBottom: 8 }} />
            <div style={{ fontSize: 24, fontWeight: "bold", marginBottom: 4 }}>
              {achievements.length}
            </div>
            <div style={{ fontSize: 14, opacity: 0.9 }}>
              Total Achievement
            </div>
          </Card>
        </Col>
      </Row>

      {/* Earned Achievements */}
      {earnedAchievements.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <Title level={4} style={{ marginBottom: 16, color: "#11418b" }}>
            <Badge count={earnedAchievements.length} style={{ backgroundColor: "#52c41a" }}>
              <TrophyOutlined style={{ marginRight: 8, color: "#52c41a" }} />
            </Badge>
            Achievement Tercapai
          </Title>
          <List
            grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4 }}
            dataSource={earnedAchievements}
            renderItem={(achievement) => (
              <List.Item>
                <AchievementCard achievement={achievement} status="earned" />
              </List.Item>
            )}
          />
        </div>
      )}

      {/* In Progress Achievements */}
      {inProgressAchievements.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <Title level={4} style={{ marginBottom: 16, color: "#11418b" }}>
            <Badge count={inProgressAchievements.length} style={{ backgroundColor: "#faad14" }}>
              <ClockCircleOutlined style={{ marginRight: 8, color: "#faad14" }} />
            </Badge>
            Sedang Dikerjakan
          </Title>
          <List
            grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4 }}
            dataSource={inProgressAchievements}
            renderItem={(achievement) => (
              <List.Item>
                <AchievementCard achievement={achievement} status="inProgress" />
              </List.Item>
            )}
          />
        </div>
      )}

      {/* Locked Achievements */}
      {lockedAchievements.length > 0 && (
        <div>
          <Title level={4} style={{ marginBottom: 16, color: "#11418b" }}>
            <Badge count={lockedAchievements.length} style={{ backgroundColor: "#d9d9d9" }}>
              <LockOutlined style={{ marginRight: 8, color: "#bfbfbf" }} />
            </Badge>
            Belum Terbuka
          </Title>
          <List
            grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4 }}
            dataSource={lockedAchievements}
            renderItem={(achievement) => (
              <List.Item>
                <AchievementCard achievement={achievement} status="locked" />
              </List.Item>
            )}
          />
        </div>
      )}
    </div>
  );
};

export default AchievementBadges;