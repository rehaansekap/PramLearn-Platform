import React from "react";
import { Card, Row, Col, Typography, Empty, Spin } from "antd";
import { BarChartOutlined } from "@ant-design/icons";
import PerformanceInsights from "./analytics/PerformanceInsights";
import TrendAnalysisCards from "./analytics/TrendAnalysisCards";
import SubjectPerformance from "./analytics/SubjectPerformance";
import MonthlyPerformance from "./analytics/MonthlyPerformance";
import { usePerformanceAnalytics } from "../hooks/usePerformanceAnalytics";

const { Title, Text } = Typography;

const PerformanceAnalytics = ({
  grades = [],
  subjects = [],
  statistics = {},
  loading = false,
}) => {
  const {
    trend,
    subjectPerformance,
    monthlyPerformance,
    insights,
    isInsufficientData,
  } = usePerformanceAnalytics(grades);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "60px 0" }}>
        <Spin size="large" tip="Memuat analytics..." />
      </div>
    );
  }

  if (!Array.isArray(grades) || grades.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "60px 24px" }}>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <div>
              <Text style={{ fontSize: 16, color: "#666" }}>
                Belum ada data untuk analytics
              </Text>
              <div style={{ marginTop: 12 }}>
                <Text type="secondary" style={{ fontSize: 14 }}>
                  Analytics akan muncul setelah Anda memiliki minimal 5 nilai
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
      {/* Header */}
      <Card
        style={{
          borderRadius: 16,
          marginBottom: 24,
          background: "linear-gradient(135deg, #f6faff 0%, #e6f4ff 50%, #f0f7ff 100%)",
          border: "1px solid #d6e4ff",
        }}
      >
        <div style={{ textAlign: "center", padding: "16px 0" }}>
          <BarChartOutlined
            style={{ fontSize: 32, color: "#11418b", marginBottom: 12 }}
          />
          <Title level={3} style={{ margin: 0, color: "#11418b" }}>
            📊 Analitik Performa Belajar
          </Title>
          <Text type="secondary" style={{ fontSize: 14 }}>
            Pantau perkembangan hasil belajar Anda secara mendetail
          </Text>
        </div>
      </Card>

      {/* Performance Insights */}
      {insights.length > 0 && <PerformanceInsights insights={insights} />}

      {/* Trend Analysis Cards */}
      <TrendAnalysisCards 
        trend={trend} 
        grades={grades} 
        isInsufficientData={isInsufficientData}
      />

      {/* Subject Performance Analysis */}
      <SubjectPerformance subjectPerformance={subjectPerformance} />

      {/* Monthly Performance */}
      {monthlyPerformance.length > 0 && (
        <MonthlyPerformance monthlyPerformance={monthlyPerformance} />
      )}
    </div>
  );
};

export default PerformanceAnalytics;