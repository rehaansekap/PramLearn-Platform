import React from "react";
import { Card, Tabs, Space } from "antd";
import {
  BarChartOutlined,
  StarOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import SubjectPerformanceTab from "./SubjectPerformanceTab";
import GradeDistributionTab from "./GradeDistributionTab";
import ComparisonTab from "./ComparisonTab";

const { TabPane } = Tabs;

const DetailedChartTabs = ({
  subjectPerformance,
  grades,
  quizAvg,
  assignmentAvg,
  quizGrades,
  assignmentGrades,
  getGradeColor,
}) => {
  return (
    <Card
      style={{
        borderRadius: 16,
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        border: "1px solid #f0f0f0",
      }}
      styles={{
        body: { padding: "24px 0 0 0" },
      }}
    >
      <Tabs
        type="card"
        size="large"
        style={{
          padding: "0 24px",
        }}
        tabBarStyle={{
          marginBottom: 24,
          borderBottom: "2px solid #f0f0f0",
        }}
      >
        <TabPane
          tab={
            <Space>
              <BarChartOutlined />
              <span>Performa per Mata Pelajaran</span>
            </Space>
          }
          key="subjects"
        >
          <SubjectPerformanceTab subjectPerformance={subjectPerformance} />
        </TabPane>

        <TabPane
          tab={
            <Space>
              <StarOutlined />
              <span>Distribusi Nilai</span>
            </Space>
          }
          key="distribution"
        >
          <GradeDistributionTab grades={grades} />
        </TabPane>

        <TabPane
          tab={
            <Space>
              <FileTextOutlined />
              <span>Kuis vs Tugas</span>
            </Space>
          }
          key="comparison"
        >
          <ComparisonTab
            quizAvg={quizAvg}
            assignmentAvg={assignmentAvg}
            quizGrades={quizGrades}
            assignmentGrades={assignmentGrades}
          />
        </TabPane>
      </Tabs>
    </Card>
  );
};

export default DetailedChartTabs;
