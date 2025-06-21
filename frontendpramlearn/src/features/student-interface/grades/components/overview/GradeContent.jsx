import React from "react";
import { Card, Tabs, Empty, Typography, Space } from "antd";
import {
  BarChartOutlined,
  FileTextOutlined,
  StarOutlined,
} from "@ant-design/icons";
import GradeFilters from "../GradeFilters";
import GradeChart from "../GradeChart";
import GradeTable from "../GradeTable";
import PerformanceAnalytics from "../PerformanceAnalytics";
import AchievementBadges from "../AchievementBadges";

const { TabPane } = Tabs;
const { Text } = Typography;

const GradeContent = ({
  grades,
  subjects,
  statistics,
  analytics,
  analyticsData,
  analyticsLoading,
  achievements,
  activeTab,
  filters,
  loading,
  hasGrades,
  onTabChange,
  onFilterChange,
  onViewDetail,
  onExport,
  onClearFilters,
  getGradeColor,
  getGradeLetter,
}) => {
  return (
    <>
      {/* Filter Section */}
      <GradeFilters
        subjects={subjects}
        filters={filters}
        onApplyFilters={onFilterChange}
        onClearFilters={onClearFilters}
        loading={loading}
      />

      {/* Main Content */}
      <Card
        style={{
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
        styles={{
          header: {
            borderBottom: "1px solid #f0f0f0",
            background: "#fafafa",
          },
        }}
      >
        {!hasGrades ? (
          <div style={{ textAlign: "center", padding: "60px 24px" }}>
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <div>
                  <Text style={{ fontSize: 16, color: "#666" }}>
                    Belum ada data nilai tersedia
                  </Text>
                  <div style={{ marginTop: 12 }}>
                    <Text type="secondary" style={{ fontSize: 14 }}>
                      Nilai akan muncul setelah Anda mengerjakan quiz atau
                      assignment
                    </Text>
                  </div>
                </div>
              }
            />
          </div>
        ) : (
          <Tabs
            activeKey={activeTab}
            onChange={onTabChange}
            type="card"
            size="large"
          >
            <TabPane
              tab={
                <Space>
                  <BarChartOutlined />
                  <span>Ringkasan & Grafik</span>
                </Space>
              }
              key="overview"
            >
              <GradeChart
                grades={grades}
                subjects={subjects}
                statistics={statistics}
                getGradeColor={getGradeColor}
                loading={loading}
              />
            </TabPane>

            <TabPane
              tab={
                <Space>
                  <FileTextOutlined />
                  <span>Detail Nilai ({grades.length})</span>
                </Space>
              }
              key="table"
            >
              <GradeTable
                grades={grades}
                getGradeColor={getGradeColor}
                getGradeLetter={getGradeLetter}
                onViewDetail={onViewDetail}
                onExport={onExport}
                loading={loading}
              />
            </TabPane>

            <TabPane
              tab={
                <Space>
                  <BarChartOutlined />
                  <span>Analitik</span>
                </Space>
              }
              key="analytics"
            >
              <PerformanceAnalytics
                grades={
                  analytics?.grades && analytics.grades.length > 0
                    ? analytics.grades
                    : grades
                }
                subjects={subjects}
                statistics={analytics?.statistics || statistics}
                loading={analyticsLoading}
              />
            </TabPane>

            <TabPane
              tab={
                <Space>
                  <StarOutlined />
                  <span>Pencapaian</span>
                </Space>
              }
              key="achievements"
            >
              <AchievementBadges grades={grades} statistics={statistics} />
            </TabPane>
          </Tabs>
        )}
      </Card>
    </>
  );
};

export default GradeContent;
