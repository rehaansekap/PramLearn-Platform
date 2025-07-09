import { useMemo } from "react";
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  StarOutlined,
  BookOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

export const usePerformanceAnalytics = (grades) => {
  return useMemo(() => {
    if (!grades || grades.length === 0) {
      return {
        trend: { trend: "insufficient_data", percentage: 0 },
        subjectPerformance: [],
        monthlyPerformance: [],
        insights: [],
        isInsufficientData: true,
      };
    }

    // Calculate trends
    const calculateTrend = () => {
      if (grades.length < 10) {
        return {
          trend: "insufficient_data",
          percentage: 0,
          message: "Minimal 10 nilai diperlukan untuk analisis tren",
        };
      }

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

      const difference = recentAvg - olderAvg;
      const percentage = Math.abs((difference / olderAvg) * 100);

      let trend = "stable";
      if (difference > 3) trend = "increasing";
      else if (difference < -3) trend = "decreasing";

      return {
        trend,
        percentage: percentage.toFixed(1),
        recentAvg: recentAvg.toFixed(1),
        olderAvg: olderAvg.toFixed(1),
        difference: difference.toFixed(1),
      };
    };

    // Calculate subject performance
    const getSubjectPerformance = () => {
      const subjectMap = new Map();

      grades.forEach((grade) => {
        const subjectName = grade.subject_name;
        if (!subjectMap.has(subjectName)) {
          subjectMap.set(subjectName, {
            name: subjectName,
            grades: [],
            quizCount: 0,
            assignmentCount: 0,
          });
        }

        const subject = subjectMap.get(subjectName);
        subject.grades.push(grade);

        if (grade.type === "quiz") subject.quizCount++;
        else subject.assignmentCount++;
      });

      return Array.from(subjectMap.values())
        .map((subject) => {
          const average =
            subject.grades.reduce((sum, g) => sum + (g.grade || 0), 0) /
            subject.grades.length;
          const highest = Math.max(...subject.grades.map((g) => g.grade || 0));
          const lowest = Math.min(...subject.grades.map((g) => g.grade || 0));

          return {
            ...subject,
            average: average.toFixed(1),
            highest,
            lowest,
            totalAssessments: subject.grades.length,
            consistency:
              subject.grades.length > 1
                ? (100 - ((highest - lowest) / highest) * 100).toFixed(1)
                : 100,
          };
        })
        .sort((a, b) => b.average - a.average);
    };

    // Get monthly performance
    const getMonthlyPerformance = () => {
      const monthlyMap = new Map();

      grades.forEach((grade) => {
        const month = dayjs(grade.date).format("YYYY-MM");
        const monthName = dayjs(grade.date).format("MMM YYYY");

        if (!monthlyMap.has(month)) {
          monthlyMap.set(month, {
            month: monthName,
            grades: [],
            quizCount: 0,
            assignmentCount: 0,
          });
        }

        const monthData = monthlyMap.get(month);
        monthData.grades.push(grade);

        if (grade.type === "quiz") monthData.quizCount++;
        else monthData.assignmentCount++;
      });

      return Array.from(monthlyMap.values())
        .map((month) => ({
          ...month,
          average:
            month.grades.reduce((sum, g) => sum + (g.grade || 0), 0) /
            month.grades.length,
          totalAssessments: month.grades.length,
        }))
        .sort((a, b) => b.month.localeCompare(a.month))
        .slice(0, 6);
    };

    // Performance insights
    const getPerformanceInsights = () => {
      const insights = [];
      const trend = calculateTrend();
      const subjectPerformance = getSubjectPerformance();
      const averageGrade =
        grades.reduce((sum, g) => sum + (g.grade || 0), 0) / grades.length;

      if (trend.trend === "increasing") {
        insights.push({
          type: "success",
          icon: <ArrowUpOutlined />,
          title: "Performa Meningkat",
          description: `Nilai Anda meningkat ${trend.percentage}% dari periode sebelumnya. Pertahankan!`,
        });
      } else if (trend.trend === "decreasing") {
        insights.push({
          type: "warning",
          icon: <ArrowDownOutlined />,
          title: "Perlu Perhatian",
          description: `Nilai menurun ${trend.percentage}%. Fokus pada review materi dan latihan lebih banyak.`,
        });
      }

      if (subjectPerformance.length > 0) {
        const strongest = subjectPerformance[0];
        const weakest = subjectPerformance[subjectPerformance.length - 1];

        if (strongest.average >= 85) {
          insights.push({
            type: "info",
            icon: <StarOutlined />,
            title: "Mata Pelajaran Terkuat",
            description: `Anda sangat baik di ${strongest.name} dengan rata-rata ${strongest.average}`,
          });
        }

        if (weakest.average < 70 && subjectPerformance.length > 1) {
          insights.push({
            type: "warning",
            icon: <BookOutlined />,
            title: "Perlu Peningkatan",
            description: `${weakest.name} memerlukan perhatian lebih dengan rata-rata ${weakest.average}`,
          });
        }
      }

      if (averageGrade >= 90) {
        insights.push({
          type: "success",
          icon: <TrophyOutlined />,
          title: "Prestasi Luar Biasa",
          description:
            "Rata-rata keseluruhan Anda sangat tinggi. Anda adalah siswa berprestasi!",
        });
      }

      return insights;
    };

    const trend = calculateTrend();
    const subjectPerformance = getSubjectPerformance();
    const monthlyPerformance = getMonthlyPerformance();
    const insights = getPerformanceInsights();

    return {
      trend,
      subjectPerformance,
      monthlyPerformance,
      insights,
      isInsufficientData: trend.trend === "insufficient_data",
    };
  }, [grades]);
};
