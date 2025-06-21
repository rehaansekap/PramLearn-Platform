import React from "react";
import { Card, List, Typography, Progress, Tag, Space } from "antd";
import { CalendarOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const MonthlyPerformance = ({ monthlyPerformance }) => {
  const getGradeColor = (score) => {
    if (score >= 90) return "#52c41a";
    if (score >= 80) return "#1890ff";
    if (score >= 70) return "#faad14";
    if (score >= 60) return "#fa8c16";
    return "#ff4d4f";
  };

  const getMonthEmoji = (average) => {
    if (average >= 90) return "🌟";
    if (average >= 80) return "⭐";
    if (average >= 70) return "✨";
    if (average >= 60) return "💫";
    return "📖";
  };

  return (
    <Card
      style={{
        borderRadius: 16,
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
      }}
    >
      <Title level={4} style={{ marginBottom: 16, color: "#11418b" }}>
        <CalendarOutlined style={{ marginRight: 8 }} />
        📅 Performa Bulanan (6 Bulan Terakhir)
      </Title>

      <List
        grid={{ gutter: 16, xs: 2, sm: 3, md: 4, lg: 6 }}
        dataSource={monthlyPerformance}
        renderItem={(month) => (
          <List.Item>
            <Card
              size="small"
              style={{
                textAlign: "center",
                borderRadius: 12,
                border: `2px solid ${getGradeColor(month.average)}30`,
                background: `${getGradeColor(month.average)}05`,
                transition: "all 0.3s ease",
                height: "100%",
              }}
              hoverable
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = `0 6px 16px ${getGradeColor(
                  month.average
                )}30`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
              }}
            >
              {/* Month Header */}
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 20, marginBottom: 4 }}>
                  {getMonthEmoji(month.average)}
                </div>
                <Text
                  strong
                  style={{
                    fontSize: 13,
                    color: "#11418b",
                    display: "block",
                    lineHeight: 1.2,
                  }}
                >
                  {month.month}
                </Text>
              </div>

              {/* Average Score */}
              <div
                style={{
                  fontSize: 24,
                  fontWeight: "bold",
                  color: getGradeColor(month.average),
                  marginBottom: 12,
                }}
              >
                {month.average.toFixed(1)}
              </div>

              {/* Progress Bar */}
              <Progress
                percent={month.average}
                strokeColor={{
                  "0%": getGradeColor(month.average),
                  "100%": getGradeColor(month.average) + "AA",
                }}
                showInfo={false}
                strokeWidth={6}
                style={{ marginBottom: 12 }}
              />

              {/* Assessment Count */}
              <div style={{ fontSize: 11, color: "#666", marginBottom: 8 }}>
                <strong>{month.totalAssessments}</strong> penilaian
              </div>

              {/* Type Distribution */}
              <Space size={2}>
                <Tag
                  size="small"
                  color="blue"
                  style={{ fontSize: 9, padding: "1px 4px" }}
                >
                  {month.quizCount}K
                </Tag>
                <Tag
                  size="small"
                  color="green"
                  style={{ fontSize: 9, padding: "1px 4px" }}
                >
                  {month.assignmentCount}T
                </Tag>
              </Space>
            </Card>
          </List.Item>
        )}
      />
    </Card>
  );
};

export default MonthlyPerformance;
