import React from "react";
import { Card, Typography, Progress, Tag } from "antd";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  LockOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const AchievementCard = ({ achievement, status = "earned" }) => {
  const progress = achievement.progress();
  const isEarned = status === "earned";
  const isInProgress = status === "inProgress";
  const isLocked = status === "locked";

  const getStatusBadge = () => {
    if (isEarned) {
      return (
        <div
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            background: achievement.color,
            borderRadius: "50%",
            width: 28,
            height: 28,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          }}
        >
          <CheckCircleOutlined style={{ color: "white", fontSize: 14 }} />
        </div>
      );
    }

    if (isInProgress) {
      return (
        <div
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            background: "#faad14",
            borderRadius: "50%",
            width: 28,
            height: 28,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          }}
        >
          <ClockCircleOutlined style={{ color: "white", fontSize: 14 }} />
        </div>
      );
    }

    if (isLocked) {
      return (
        <div
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            background: "#d9d9d9",
            borderRadius: "50%",
            width: 28,
            height: 28,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <LockOutlined style={{ color: "white", fontSize: 14 }} />
        </div>
      );
    }

    return null;
  };

  const getMainIcon = () => {
    return (
      <div
        style={{
          fontSize: 36,
          color: isLocked ? "#bfbfbf" : achievement.color,
          marginBottom: 16,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: 56,
          width: 56,
          borderRadius: "50%",
          background: isLocked ? "#f5f5f5" : `${achievement.color}15`,
          margin: "0 auto 16px",
          transition: "all 0.3s ease",
        }}
      >
        {isLocked ? <LockOutlined /> : achievement.icon}
      </div>
    );
  };

  const getStatusTag = () => {
    if (isEarned) {
      return (
        <Tag
          color={achievement.color}
          style={{
            borderRadius: 12,
            fontWeight: "bold",
            fontSize: 11,
            padding: "4px 12px",
            border: "none",
          }}
        >
          ✓ Tercapai
        </Tag>
      );
    }

    if (isInProgress) {
      return (
        <Tag
          color="orange"
          style={{
            borderRadius: 12,
            fontWeight: "bold",
            fontSize: 11,
            padding: "4px 12px",
          }}
        >
          {progress.percentage.toFixed(0)}% Progress
        </Tag>
      );
    }

    return (
      <Tag
        color="default"
        style={{
          borderRadius: 12,
          fontWeight: "bold",
          fontSize: 11,
          padding: "4px 12px",
          color: "#bfbfbf",
          borderColor: "#e8e8e8",
        }}
      >
        🔒 Terkunci
      </Tag>
    );
  };

  return (
    <Card
      style={{
        borderRadius: 16,
        textAlign: "center",
        border: isEarned
          ? `2px solid ${achievement.color}`
          : "1px solid #f0f0f0",
        background: isEarned
          ? achievement.bgColor
          : isLocked
          ? "#fafafa"
          : "white",
        opacity: isLocked ? 0.8 : 1,
        transition: "all 0.3s ease",
        position: "relative",
        overflow: "hidden",
        height: "100%",
        boxShadow: isEarned
          ? `0 4px 16px ${achievement.color}30`
          : "0 2px 8px rgba(0,0,0,0.06)",
      }}
      bodyStyle={{
        padding: "20px 16px",
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
      onMouseEnter={(e) => {
        if (!isLocked) {
          e.currentTarget.style.transform = "translateY(-4px)";
          e.currentTarget.style.boxShadow = isEarned
            ? `0 8px 24px ${achievement.color}40`
            : "0 8px 24px rgba(0,0,0,0.12)";
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = isEarned
          ? `0 4px 16px ${achievement.color}30`
          : "0 2px 8px rgba(0,0,0,0.06)";
      }}
    >
      {/* Status Badge */}
      {getStatusBadge()}

      {/* Achievement Icon */}
      {getMainIcon()}

      {/* Achievement Title */}
      <Title
        level={5}
        style={{
          margin: "0 0 8px 0",
          color: isLocked ? "#bfbfbf" : "#11418b",
          fontSize: 15,
          fontWeight: "bold",
          flex: "0 0 auto",
        }}
      >
        {achievement.title}
      </Title>

      {/* Achievement Description */}
      <Text
        type={isLocked ? "secondary" : "default"}
        style={{
          fontSize: 12,
          display: "block",
          marginBottom: 16,
          color: isLocked ? "#bfbfbf" : "#666",
          lineHeight: 1.4,
          flex: "1 1 auto",
        }}
      >
        {achievement.description}
      </Text>

      {/* Progress Section */}
      {!isEarned && (
        <div style={{ marginBottom: 16, flex: "0 0 auto" }}>
          <Progress
            percent={progress.percentage}
            strokeColor={isLocked ? "#d9d9d9" : achievement.color}
            trailColor="#f0f0f0"
            showInfo={false}
            size="small"
            strokeWidth={6}
          />
          <Text
            style={{
              fontSize: 11,
              color: isLocked ? "#bfbfbf" : "#666",
              marginTop: 8,
              display: "block",
              fontWeight: 500,
            }}
          >
            {progress.description}
          </Text>
        </div>
      )}

      {/* Status Tag */}
      <div style={{ flex: "0 0 auto" }}>{getStatusTag()}</div>
    </Card>
  );
};

export default AchievementCard;
