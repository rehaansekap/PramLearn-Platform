import React from "react";
import { Typography, List, Badge } from "antd";
import {
  TrophyOutlined,
  ClockCircleOutlined,
  LockOutlined,
} from "@ant-design/icons";
import AchievementCard from "./AchievementCard";

const { Title } = Typography;

const AchievementSection = ({
  title,
  achievements,
  status,
  icon,
  badgeColor,
}) => {
  const getIcon = () => {
    switch (icon) {
      case "trophy":
        return (
          <TrophyOutlined style={{ marginRight: 18, color: badgeColor }} />
        );
      case "clock":
        return (
          <ClockCircleOutlined style={{ marginRight: 18, color: badgeColor }} />
        );
      case "lock":
        return <LockOutlined style={{ marginRight: 18, color: "#bfbfbf" }} />;
      default:
        return (
          <TrophyOutlined style={{ marginRight: 18, color: badgeColor }} />
        );
    }
  };

  return (
    <div style={{ marginBottom: 32 }}>
      <Title level={4} style={{ marginBottom: 16, color: "#11418b" }}>
        <Badge
          count={achievements.length}
          style={{ backgroundColor: badgeColor, marginRight: 14 }}
        >
          {getIcon()}
        </Badge>
        {title}
      </Title>
      <List
        grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4 }}
        dataSource={achievements}
        renderItem={(achievement) => (
          <List.Item>
            <AchievementCard achievement={achievement} status={status} />
          </List.Item>
        )}
      />
    </div>
  );
};

export default AchievementSection;
