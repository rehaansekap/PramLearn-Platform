import { useState, useEffect, useMemo } from "react";
import { StarFilled, StarOutlined, TrophyOutlined } from "@ant-design/icons";

export const useGradeTable = (grades, onViewDetail) => {
  const [sortedInfo, setSortedInfo] = useState({});
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleViewDetail = (record) => {
    setSelectedGrade(record);
    setDetailModalVisible(true);
    if (onViewDetail) {
      onViewDetail(record);
    }
  };

  const handleCloseDetail = () => {
    setDetailModalVisible(false);
    setSelectedGrade(null);
  };

  const handleTableChange = (pagination, filters, sorter) => {
    setSortedInfo(sorter);
  };

  const getPerformanceIndicator = (grade) => {
    if (grade >= 90)
      return { icon: <StarFilled />, color: "#gold", text: "Sangat Baik" };
    if (grade >= 80)
      return { icon: <StarOutlined />, color: "#52c41a", text: "Baik" };
    if (grade >= 70)
      return { icon: <TrophyOutlined />, color: "#faad14", text: "Cukup" };
    return { icon: null, color: "#ff4d4f", text: "Perlu Ditingkatkan" };
  };

  const { averageGrade, gradeDistribution } = useMemo(() => {
    const avg =
      grades.length > 0
        ? grades.reduce((sum, g) => sum + (g.grade || 0), 0) / grades.length
        : 0;

    const distribution = {
      excellent: grades.filter((g) => g.grade >= 90).length,
      good: grades.filter((g) => g.grade >= 80 && g.grade < 90).length,
      fair: grades.filter((g) => g.grade >= 60 && g.grade < 80).length,
      poor: grades.filter((g) => g.grade < 60).length,
    };

    return { averageGrade: avg, gradeDistribution: distribution };
  }, [grades]);

  return {
    isMobile,
    detailModalVisible,
    selectedGrade,
    sortedInfo,
    averageGrade,
    gradeDistribution,
    handleViewDetail,
    handleCloseDetail,
    handleTableChange,
    getPerformanceIndicator,
  };
};
