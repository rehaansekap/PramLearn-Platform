import { useMemo } from "react";
import {
  CrownOutlined,
  StarOutlined,
  ThunderboltOutlined,
  GiftOutlined,
  TrophyOutlined,
  FireOutlined,
} from "@ant-design/icons";

export const useAchievementData = (grades, statistics) => {
  return useMemo(() => {
    const achievements = [
      {
        id: "perfect_score",
        title: "Nilai Sempurna",
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
            description:
              perfectScores > 0
                ? `${perfectScores} nilai sempurna`
                : "Belum ada nilai 100",
          };
        },
        category: "excellence",
      },
      {
        id: "consistent_performer",
        title: "Performa Konsisten",
        description: "Nilai di atas 80 dalam 5 penilaian berturut-turut",
        icon: <StarOutlined />,
        color: "#52c41a",
        bgColor: "#f6ffed",
        criteria: () => {
          const sortedGrades = [...grades].sort(
            (a, b) => new Date(a.date) - new Date(b.date)
          );
          for (let i = 0; i <= sortedGrades.length - 5; i++) {
            const consecutive = sortedGrades.slice(i, i + 5);
            if (consecutive.every((g) => g.grade >= 80)) return true;
          }
          return false;
        },
        progress: () => {
          const sortedGrades = [...grades].sort(
            (a, b) => new Date(a.date) - new Date(b.date)
          );
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
            description: `${maxConsecutive}/5 penilaian berturut-turut`,
          };
        },
        category: "consistency",
      },
      {
        id: "quiz_master",
        title: "Master Kuis",
        description: "Rata-rata kuis di atas 85",
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
            description: `Rata-rata kuis: ${quizAverage.toFixed(1)}/85`,
          };
        },
        category: "specialization",
      },
      {
        id: "assignment_expert",
        title: "Ahli Tugas",
        description: "Rata-rata tugas di atas 85",
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
            description: `Rata-rata tugas: ${assignmentAverage.toFixed(1)}/85`,
          };
        },
        category: "specialization",
      },
      {
        id: "high_achiever",
        title: "Pencapaian Tinggi",
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
            description: `Rata-rata keseluruhan: ${overallAverage.toFixed(
              1
            )}/90`,
          };
        },
        category: "excellence",
      },
      {
        id: "dedicated_learner",
        title: "Pembelajar Tekun",
        description: "Selesaikan 20 penilaian",
        icon: <FireOutlined />,
        color: "#eb2f96",
        bgColor: "#fff0f6",
        criteria: () =>
          (statistics.completed_assessments || grades.length) >= 20,
        progress: () => {
          const completed = statistics.completed_assessments || grades.length;
          return {
            current: completed,
            target: 20,
            percentage: Math.min((completed / 20) * 100, 100),
            description: `${completed}/20 penilaian diselesaikan`,
          };
        },
        category: "dedication",
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

    return {
      achievements,
      earnedAchievements,
      inProgressAchievements,
      lockedAchievements,
    };
  }, [grades, statistics]);
};
