import React from "react";
import { Empty, Typography } from "antd";
import AchievementSummary from "./achievements/AchievementSummary";
import AchievementSection from "./achievements/AchievementSection";
import { useAchievementData } from "../hooks/useAchievementData";

const { Text } = Typography;

const AchievementBadges = ({ grades = [], statistics = {} }) => {
  const {
    achievements,
    earnedAchievements,
    inProgressAchievements,
    lockedAchievements,
  } = useAchievementData(grades, statistics);

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
                  Mulai mengerjakan kuis dan tugas untuk mendapatkan prestasi
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
      {/* Summary Statistics */}
      <AchievementSummary
        earnedCount={earnedAchievements.length}
        inProgressCount={inProgressAchievements.length}
        totalCount={achievements.length}
      />

      {/* Earned Achievements */}
      {earnedAchievements.length > 0 && (
        <AchievementSection
          title="Prestasi Tercapai"
          achievements={earnedAchievements}
          status="earned"
          icon="trophy"
          badgeColor="#52c41a"
        />
      )}

      {/* In Progress Achievements */}
      {inProgressAchievements.length > 0 && (
        <AchievementSection
          title="Sedang Dikerjakan"
          achievements={inProgressAchievements}
          status="inProgress"
          icon="clock"
          badgeColor="#faad14"
        />
      )}

      {/* Locked Achievements */}
      {lockedAchievements.length > 0 && (
        <AchievementSection
          title="Belum Terbuka"
          achievements={lockedAchievements}
          status="locked"
          icon="lock"
          badgeColor="#d9d9d9"
        />
      )}
    </div>
  );
};

export default AchievementBadges;
