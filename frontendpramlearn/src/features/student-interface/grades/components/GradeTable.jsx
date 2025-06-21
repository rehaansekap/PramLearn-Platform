import React, { useState } from "react";
import { Spin, Empty, Typography } from "antd";
import { useGradeTable } from "../hooks/useGradeTable";
import GradeSummaryStats from "./grade-table/GradeSummaryStats";
import GradeMobileView from "./grade-table/GradeMobileView";
import GradeDesktopTable from "./grade-table/GradeDesktopTable";
import GradeModals from "./grade-table/GradeModals";

const { Text } = Typography;

const GradeTable = ({
  grades,
  loading,
  onViewDetail,
  getGradeColor,
  getGradeLetter,
  pagination = true,
}) => {
  const {
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
  } = useGradeTable(grades, onViewDetail);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "60px 0" }}>
        <Spin size="large" tip="Memuat data nilai..." />
      </div>
    );
  }

  if (!grades || grades.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "60px 24px" }}>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <div>
              <Text style={{ fontSize: 16, color: "#666" }}>
                Belum ada data nilai
              </Text>
              <div style={{ marginTop: 12 }}>
                <Text type="secondary" style={{ fontSize: 14 }}>
                  Nilai akan muncul setelah quiz atau assignment dinilai
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
      <GradeSummaryStats
        averageGrade={averageGrade}
        gradeDistribution={gradeDistribution}
        totalGrades={grades.length}
        isMobile={isMobile}
      />

      {/* Table Content */}
      {isMobile ? (
        <GradeMobileView
          grades={grades}
          pagination={pagination}
          getGradeColor={getGradeColor}
          getGradeLetter={getGradeLetter}
          getPerformanceIndicator={getPerformanceIndicator}
          onViewDetail={handleViewDetail}
        />
      ) : (
        <GradeDesktopTable
          grades={grades}
          pagination={pagination}
          sortedInfo={sortedInfo}
          getGradeColor={getGradeColor}
          getGradeLetter={getGradeLetter}
          getPerformanceIndicator={getPerformanceIndicator}
          onViewDetail={handleViewDetail}
          onTableChange={handleTableChange}
        />
      )}

      {/* Modals */}
      <GradeModals
        selectedGrade={selectedGrade}
        detailModalVisible={detailModalVisible}
        onCloseDetail={handleCloseDetail}
      />
    </div>
  );
};

export default GradeTable;