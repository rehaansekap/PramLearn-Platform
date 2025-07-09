import React from "react";
import { Card, List, Typography, Progress, Tag, Space, Grid } from "antd";
import { CalendarOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

const MonthlyPerformance = ({ monthlyPerformance }) => {
  const screens = useBreakpoint();
  const isMobile = !screens.md;

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
        borderRadius: isMobile ? 12 : 16,
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
      }}
    >
      <Title
        level={4}
        style={{
          marginBottom: 16,
          color: "#11418b",
          fontSize: isMobile ? 16 : 20,
        }}
      >
        <CalendarOutlined style={{ marginRight: 8 }} />
        📅 Performa Bulanan (6 Bulan Terakhir)
      </Title>

      <List
        grid={{
          gutter: isMobile ? 12 : 16,
          xs: 2,
          sm: 3,
          md: 4,
          lg: 6,
        }}
        dataSource={monthlyPerformance}
        renderItem={(month) => (
          <List.Item>
            <Card
              size="small"
              style={{
                textAlign: "center",
                borderRadius: isMobile ? 8 : 12,
                border: `2px solid ${getGradeColor(month.average)}30`,
                background: `${getGradeColor(month.average)}05`,
                transition: "all 0.3s ease",
                height: "100%",
              }}
              hoverable={!isMobile}
              onMouseEnter={
                !isMobile
                  ? (e) => {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = `0 6px 16px ${getGradeColor(
                        month.average
                      )}30`;
                    }
                  : undefined
              }
              onMouseLeave={
                !isMobile
                  ? (e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow =
                        "0 2px 8px rgba(0,0,0,0.1)";
                    }
                  : undefined
              }
            >
              {/* Month Header */}
              <div
                style={{
                  marginBottom: isMobile ? 10 : 12,
                }}
              >
                <div
                  style={{
                    fontSize: isMobile ? 18 : 20,
                    marginBottom: isMobile ? 3 : 4,
                  }}
                >
                  {getMonthEmoji(month.average)}
                </div>
                <Text
                  strong
                  style={{
                    fontSize: isMobile ? 12 : 13,
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
                  fontSize: isMobile ? 20 : 24,
                  fontWeight: "bold",
                  color: getGradeColor(month.average),
                  marginBottom: isMobile ? 10 : 12,
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
                strokeWidth={isMobile ? 4 : 6}
                style={{
                  marginBottom: isMobile ? 10 : 12,
                }}
              />

              {/* Assessment Count */}
              <div
                style={{
                  fontSize: isMobile ? 10 : 11,
                  color: "#666",
                  marginBottom: isMobile ? 6 : 8,
                }}
              >
                <strong>{month.totalAssessments}</strong> penilaian
              </div>

              {/* Type Distribution */}
              <Space size={2}>
                <Tag
                  size="small"
                  color="blue"
                  style={{
                    fontSize: isMobile ? 8 : 9,
                    padding: isMobile ? "0px 3px" : "1px 4px",
                  }}
                >
                  {month.quizCount}K
                </Tag>
                <Tag
                  size="small"
                  color="green"
                  style={{
                    fontSize: isMobile ? 8 : 9,
                    padding: isMobile ? "0px 3px" : "1px 4px",
                  }}
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
