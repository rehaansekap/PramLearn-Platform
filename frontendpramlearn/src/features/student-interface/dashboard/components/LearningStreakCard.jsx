import React from "react";
import { Card, Typography, Space, Progress, Row, Col, Tooltip } from "antd";
import {
  FireOutlined,
  TrophyOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

const LearningStreakCard = ({ streakData, loading }) => {
  const getStreakColor = (streak) => {
    if (streak >= 20) return "#ff4d4f"; // Red fire for high streaks
    if (streak >= 10) return "#faad14"; // Orange fire for medium streaks
    if (streak >= 5) return "#52c41a"; // Green fire for good streaks
    return "#d9d9d9"; // Gray for low streaks
  };

  const getStreakEmoji = (streak) => {
    if (streak >= 20) return "🔥";
    if (streak >= 10) return "⚡";
    if (streak >= 5) return "✨";
    return "💫";
  };

  const renderStreakDays = () => {
    if (!streakData?.streak_activities) return null;

    return (
      <Row gutter={4} justify="center" style={{ marginTop: 12 }}>
        {streakData.streak_activities.map((day, index) => (
          <Col key={index}>
            <Tooltip
              title={
                <div>
                  <div>{day.date}</div>
                  <div>
                    {day.completed
                      ? `${day.activities} activities completed`
                      : "No activities"}
                  </div>
                </div>
              }
            >
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  backgroundColor: day.completed ? "#52c41a" : "#f0f0f0",
                  border: day.completed
                    ? "2px solid #389e0d"
                    : "2px solid #d9d9d9",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 10,
                  fontWeight: "bold",
                  color: day.completed ? "#fff" : "#999",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
              >
                {day.completed ? <CheckCircleOutlined /> : ""}
              </div>
            </Tooltip>
          </Col>
        ))}
      </Row>
    );
  };

  return (
    <Card
      style={{
        borderRadius: 12,
        marginBottom: 16,
        background: `linear-gradient(135deg, ${getStreakColor(
          streakData?.current_streak || 0
        )}10 0%, ${getStreakColor(streakData?.current_streak || 0)}05 100%)`,
        border: `1px solid ${getStreakColor(
          streakData?.current_streak || 0
        )}30`,
      }}
      size="small"
    >
      <div style={{ textAlign: "center" }}>
        {/* Main Streak Display */}
        <div style={{ marginBottom: 16 }}>
          <div
            style={{
              fontSize: 32,
              color: getStreakColor(streakData?.current_streak || 0),
              marginBottom: 4,
            }}
          >
            <FireOutlined />
          </div>
          <div
            style={{
              fontSize: 24,
              fontWeight: "bold",
              color: getStreakColor(streakData?.current_streak || 0),
              marginBottom: 4,
            }}
          >
            {getStreakEmoji(streakData?.current_streak || 0)}{" "}
            {streakData?.current_streak || 0}
          </div>
          <Text strong style={{ fontSize: 14, color: "#333" }}>
            Day Learning Streak
          </Text>
        </div>

        {/* Progress and Stats */}
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={12}>
            <div style={{ textAlign: "center" }}>
              <div
                style={{ fontSize: 16, fontWeight: "bold", color: "#faad14" }}
              >
                <TrophyOutlined style={{ marginRight: 4 }} />
                {streakData?.longest_streak || 0}
              </div>
              <Text type="secondary" style={{ fontSize: 11 }}>
                Best Streak
              </Text>
            </div>
          </Col>
          <Col span={12}>
            <div style={{ textAlign: "center" }}>
              <div
                style={{ fontSize: 16, fontWeight: "bold", color: "#1677ff" }}
              >
                <CalendarOutlined style={{ marginRight: 4 }} />
                {streakData?.weekly_progress || 0}/
                {streakData?.weekly_goal || 5}
              </div>
              <Text type="secondary" style={{ fontSize: 11 }}>
                This Week
              </Text>
            </div>
          </Col>
        </Row>

        {/* Weekly Progress Bar */}
        <div style={{ marginBottom: 12 }}>
          <Text
            strong
            style={{ fontSize: 12, display: "block", marginBottom: 4 }}
          >
            Weekly Goal Progress
          </Text>
          <Progress
            percent={
              ((streakData?.weekly_progress || 0) /
                (streakData?.weekly_goal || 5)) *
              100
            }
            strokeColor={getStreakColor(streakData?.current_streak || 0)}
            size="small"
            showInfo={false}
            style={{ marginBottom: 4 }}
          />
          <Text type="secondary" style={{ fontSize: 10 }}>
            {streakData?.next_milestone
              ? `Next milestone: ${streakData.next_milestone} days`
              : "Keep going!"}
          </Text>
        </div>

        {/* Last 7 Days Visualization */}
        <div>
          <Text
            strong
            style={{ fontSize: 11, display: "block", marginBottom: 8 }}
          >
            Last 7 Days
          </Text>
          {renderStreakDays()}
        </div>
      </div>
    </Card>
  );
};

export default LearningStreakCard;
