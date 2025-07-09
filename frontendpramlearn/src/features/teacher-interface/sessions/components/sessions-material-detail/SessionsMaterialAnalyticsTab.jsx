import React from "react";
import { Row, Col, Card, Empty, Typography, Space } from "antd";
import { BarChartOutlined } from "@ant-design/icons";

import PerformanceOverviewCard from "./analytics/components/PerformanceOverviewCard";
import TopPerformersCard from "./analytics/components/TopPerformersCard";
import MotivationDistributionCard from "./analytics/components/MotivationDistributionCard";
import RecentActivitiesCard from "./analytics/components/RecentActivitiesCard";

import {
  calculateAnalytics,
  getTopPerformers,
  getRecentActivities,
} from "./analytics/utils/analyticsUtils";

const { Title, Text } = Typography;

const SessionsMaterialAnalyticsTab = ({ materialDetail, isMobile }) => {
  if (!materialDetail) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: isMobile ? "40px 20px" : "60px 40px",
          background: "linear-gradient(135deg, #f8fafc 0%, #e6f3ff 100%)",
          borderRadius: 16,
          border: "1px solid #e6f7ff",
        }}
      >
        <div
          style={{
            fontSize: isMobile ? 40 : 60,
            marginBottom: 16,
            opacity: 0.5,
          }}
        >
          📊
        </div>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <div>
              <Title
                level={isMobile ? 5 : 4}
                style={{ color: "#666", margin: 0 }}
              >
                Data Analytics Tidak Tersedia
              </Title>
              <Text style={{ color: "#999", fontSize: isMobile ? 12 : 14 }}>
                Pastikan material memiliki siswa dan aktivitas pembelajaran
              </Text>
            </div>
          }
        />
      </div>
    );
  }

  const { students = [] } = materialDetail;
  const analytics = calculateAnalytics(students);
  const topPerformers = getTopPerformers(students);
  const recentActivities = getRecentActivities(students);

  // Check if there's any meaningful data
  const hasData = students.length > 0;

  if (!hasData) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: isMobile ? "40px 20px" : "60px 40px",
          background: "linear-gradient(135deg, #f8fafc 0%, #e6f3ff 100%)",
          borderRadius: 16,
          border: "1px solid #e6f7ff",
        }}
      >
        <div
          style={{
            fontSize: isMobile ? 40 : 60,
            marginBottom: 16,
            opacity: 0.5,
          }}
        >
          👥
        </div>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <div>
              <Title
                level={isMobile ? 5 : 4}
                style={{ color: "#666", margin: 0 }}
              >
                Belum Ada Data Siswa
              </Title>
              <Text style={{ color: "#999", fontSize: isMobile ? 12 : 14 }}>
                Analytics akan muncul setelah ada siswa yang terdaftar di
                material ini
              </Text>
            </div>
          }
        />
      </div>
    );
  }

  return (
    <div>
      {/* Header with summary */}
      <Card
        style={{
          borderRadius: 16,
          marginBottom: 24,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          border: "none",
          color: "white",
        }}
        bodyStyle={{ padding: isMobile ? "20px" : "24px" }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: isMobile ? 32 : 48,
              marginBottom: 12,
            }}
          >
            📈
          </div>
          <Title
            level={isMobile ? 4 : 3}
            style={{ color: "white", margin: 0, marginBottom: 8 }}
          >
            Analytics Dashboard
          </Title>
          <Space
            direction={isMobile ? "vertical" : "horizontal"}
            size={isMobile ? "small" : "large"}
          >
            <Text
              style={{
                color: "rgba(255,255,255,0.9)",
                fontSize: isMobile ? 13 : 15,
              }}
            >
              📚 {analytics.totalStudents} Siswa Terdaftar
            </Text>
            <Text
              style={{
                color: "rgba(255,255,255,0.9)",
                fontSize: isMobile ? 13 : 15,
              }}
            >
              🎯 {Math.round(analytics.averageCompletion)}% Progress Rata-rata
            </Text>
            <Text
              style={{
                color: "rgba(255,255,255,0.9)",
                fontSize: isMobile ? 13 : 15,
              }}
            >
              ⭐ {Math.round(analytics.averageGrade)} Nilai Rata-rata
            </Text>
          </Space>
        </div>
      </Card>

      {/* Analytics Cards */}
      <Row gutter={[16, 16]}>
        {/* Performance Overview */}
        <Col xs={24} lg={12}>
          <PerformanceOverviewCard analytics={analytics} isMobile={isMobile} />
        </Col>

        {/* Top Performers */}
        <Col xs={24} lg={12}>
          <TopPerformersCard
            topPerformers={topPerformers}
            isMobile={isMobile}
          />
        </Col>

        {/* Motivation Distribution */}
        <Col xs={24} lg={12}>
          <MotivationDistributionCard
            analytics={analytics}
            isMobile={isMobile}
          />
        </Col>

        {/* Recent Activities */}
        <Col xs={24} lg={12}>
          <RecentActivitiesCard
            recentActivities={recentActivities}
            isMobile={isMobile}
          />
        </Col>
      </Row>

      {/* Footer Summary */}
      <Card
        style={{
          marginTop: 24,
          borderRadius: 16,
          background: "linear-gradient(135deg, #f0f9ff 0%, #e6f7ff 100%)",
          border: "1px solid #bae7ff",
        }}
        bodyStyle={{ padding: isMobile ? "16px" : "20px" }}
      >
        <div style={{ textAlign: "center" }}>
          <Text
            style={{
              color: "#0958d9",
              fontSize: isMobile ? 12 : 14,
              fontWeight: 500,
            }}
          >
            💡 Data analytics diperbarui secara real-time berdasarkan aktivitas
            siswa
          </Text>
          <br />
          <Text type="secondary" style={{ fontSize: isMobile ? 11 : 12 }}>
            Terakhir diperbarui: {new Date().toLocaleString("id-ID")}
          </Text>
        </div>
      </Card>
      <style jsx>{`
        @keyframes pulse {
          0% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
          100% {
            opacity: 1;
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default SessionsMaterialAnalyticsTab;
