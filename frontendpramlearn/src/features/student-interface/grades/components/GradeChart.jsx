import React from "react";
import { Card, Row, Col, Empty, Spin, Typography } from "antd";
import OverviewCards from "./charts/OverviewCards";
import DetailedChartTabs from "./charts/DetailedChartTabs";
import { useGradeChartData } from "../hooks/useGradeChartData";

const { Text } = Typography;

const GradeChart = ({
  grades,
  subjects = [],
  analytics,
  analyticsLoading = false,
  statistics = {},
  loading,
  compact = false,
  getGradeColor,
}) => {
  const {
    subjectsToUse,
    quizGrades,
    assignmentGrades,
    quizAvg,
    assignmentAvg,
    overallAvg,
    trendData,
    subjectPerformance,
  } = useGradeChartData(grades, subjects, getGradeColor);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "60px 0" }}>
        <Spin size="large" tip="Memuat data grafik..." />
      </div>
    );
  }

  if (!analytics && (!grades || grades.length === 0)) {
    return (
      <div style={{ textAlign: "center", padding: "60px 24px" }}>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <div>
              <Text style={{ fontSize: 16, color: "#666" }}>
                Belum ada data untuk ditampilkan
              </Text>
              <div style={{ marginTop: 12 }}>
                <Text type="secondary" style={{ fontSize: 14 }}>
                  Grafik akan muncul setelah ada nilai quiz atau assignment
                </Text>
              </div>
            </div>
          }
        />
      </div>
    );
  }

  if (!grades || grades.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "60px 24px" }}>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Belum ada data nilai untuk grafik"
        />
      </div>
    );
  }

  if (compact) {
    return (
      <Row gutter={[16, 16]}>
        <OverviewCards
          overallAvg={overallAvg}
          quizAvg={quizAvg}
          assignmentAvg={assignmentAvg}
          quizGrades={quizGrades}
          assignmentGrades={assignmentGrades}
          getGradeColor={getGradeColor}
          compact={true}
        />
      </Row>
    );
  }

  return (
    <div>
      <OverviewCards
        overallAvg={overallAvg}
        quizAvg={quizAvg}
        assignmentAvg={assignmentAvg}
        quizGrades={quizGrades}
        assignmentGrades={assignmentGrades}
        getGradeColor={getGradeColor}
        trendData={trendData}
        grades={grades}
      />

      <DetailedChartTabs
        subjectPerformance={subjectPerformance}
        grades={grades}
        quizAvg={quizAvg}
        assignmentAvg={assignmentAvg}
        quizGrades={quizGrades}
        assignmentGrades={assignmentGrades}
        getGradeColor={getGradeColor}
      />
    </div>
  );
};

export default GradeChart;
