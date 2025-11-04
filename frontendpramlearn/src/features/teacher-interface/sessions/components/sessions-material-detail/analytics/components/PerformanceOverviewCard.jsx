import React from "react";
import { Card, Row, Col, Statistic, Progress, Space } from "antd";
import {
  BarChartOutlined,
  CheckCircleOutlined,
  TrophyOutlined,
  UserOutlined,
  StarOutlined,
} from "@ant-design/icons";
import { getProgressColor, getGradeColor } from "../utils/analyticsUtils";

const PerformanceOverviewCard = ({ analytics, isMobile }) => {
  const cardStyle = {
    borderRadius: 16,
    height: "100%",
    boxShadow: "0 4px 20px rgba(102, 126, 234, 0.12)",
    border: "1px solid #e6f3ff",
    background: "linear-gradient(135deg, #ffffff 0%, #f8faff 100%)",
  };

  const headerStyle = {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    borderRadius: "16px 16px 0 0",
    color: "white",
    border: "none",
  };

  const statisticStyle = {
    padding: isMobile ? "12px 8px" : "16px 12px",
    background: "rgba(255, 255, 255, 0.9)",
    borderRadius: 12,
    border: "1px solid #f0f9ff",
    textAlign: "center",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
  };

  return (
    <Card
      title={
        <Space style={{ color: "white" }}>
          <BarChartOutlined style={{ fontSize: isMobile ? 16 : 18 }} />
          <span style={{ fontSize: isMobile ? 14 : 16, fontWeight: 600 }}>
            📊 Performance Overview
          </span>
        </Space>
      }
      style={cardStyle}
      headStyle={headerStyle}
      bodyStyle={{ padding: isMobile ? "16px" : "24px" }}
    >
      <Row gutter={[12, 16]}>
        <Col xs={24} sm={12}>
          <div style={statisticStyle}>
            <Statistic
              title={
                <span style={{ fontSize: isMobile ? 11 : 12, color: "#666" }}>
                  Progress Keseluruhan
                </span>
              }
              value={Math.round(analytics.averageCompletion)}
              suffix="%"
              valueStyle={{
                color: getProgressColor(analytics.averageCompletion),
                fontSize: isMobile ? 18 : 24,
                fontWeight: 700,
              }}
              prefix={
                <CheckCircleOutlined
                  style={{
                    fontSize: isMobile ? 14 : 16,
                    color: getProgressColor(analytics.averageCompletion),
                  }}
                />
              }
            />
            <Progress
              percent={analytics.averageCompletion}
              size="small"
              strokeColor={getProgressColor(analytics.averageCompletion)}
              style={{ marginTop: 8 }}
              strokeWidth={6}
            />
          </div>
        </Col>

        <Col xs={24} sm={12}>
          <div style={statisticStyle}>
            <Statistic
              title={
                <span style={{ fontSize: isMobile ? 11 : 12, color: "#666" }}>
                  Nilai Rata-rata
                </span>
              }
              value={Math.round(analytics.averageGrade)}
              suffix="/100"
              valueStyle={{
                color: getGradeColor(analytics.averageGrade),
                fontSize: isMobile ? 18 : 24,
                fontWeight: 700,
              }}
              prefix={
                <TrophyOutlined
                  style={{
                    fontSize: isMobile ? 14 : 16,
                    color: getGradeColor(analytics.averageGrade),
                  }}
                />
              }
            />
            <Progress
              percent={analytics.averageGrade}
              size="small"
              strokeColor={getGradeColor(analytics.averageGrade)}
              style={{ marginTop: 8 }}
              strokeWidth={6}
            />
          </div>
        </Col>

        <Col xs={24} sm={12}>
          <div style={statisticStyle}>
            <Statistic
              title={
                <span style={{ fontSize: isMobile ? 11 : 12, color: "#666" }}>
                  Siswa Aktif
                </span>
              }
              value={analytics.activeStudents}
              suffix={`/ ${analytics.totalStudents}`}
              valueStyle={{
                color: "#52c41a",
                fontSize: isMobile ? 18 : 24,
                fontWeight: 700,
              }}
              prefix={
                <UserOutlined
                  style={{ fontSize: isMobile ? 14 : 16, color: "#52c41a" }}
                />
              }
            />
            <div
              style={{
                background: "linear-gradient(90deg, #52c41a 0%, #73d13d 100%)",
                height: 6,
                borderRadius: 3,
                marginTop: 8,
                width: `${
                  analytics.totalStudents > 0
                    ? (analytics.activeStudents / analytics.totalStudents) * 100
                    : 0
                }%`,
                transition: "width 0.3s ease",
              }}
            />
          </div>
        </Col>

        <Col xs={24} sm={12}>
          <div style={statisticStyle}>
            <Statistic
              title={
                <span style={{ fontSize: isMobile ? 11 : 12, color: "#666" }}>
                  Siswa Excellent
                </span>
              }
              value={analytics.excellentStudents}
              suffix={`/ ${analytics.totalStudents}`}
              valueStyle={{
                color: "#faad14",
                fontSize: isMobile ? 18 : 24,
                fontWeight: 700,
              }}
              prefix={
                <StarOutlined
                  style={{ fontSize: isMobile ? 14 : 16, color: "#faad14" }}
                />
              }
            />
            <div
              style={{
                background: "linear-gradient(90deg, #faad14 0%, #ffc53d 100%)",
                height: 6,
                borderRadius: 3,
                marginTop: 8,
                width: `${
                  analytics.totalStudents > 0
                    ? (analytics.excellentStudents / analytics.totalStudents) *
                      100
                    : 0
                }%`,
                transition: "width 0.3s ease",
              }}
            />
          </div>
        </Col>
      </Row>
    </Card>
  );
};

export default PerformanceOverviewCard;
