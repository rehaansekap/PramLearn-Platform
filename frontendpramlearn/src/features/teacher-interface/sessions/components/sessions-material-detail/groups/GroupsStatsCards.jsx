import React from "react";
import { Row, Col, Card, Statistic } from "antd";
import {
  TeamOutlined,
  UserOutlined,
  TrophyOutlined,
  BarChartOutlined,
} from "@ant-design/icons";

const GroupsStatsCards = ({ groups = [], isMobile = false }) => {
  const calculateStats = () => {
    const totalGroups = groups.length;
    const totalMembers = groups.reduce(
      (sum, group) => sum + (group.member_count || 0),
      0
    );
    const averageMembersPerGroup =
      totalGroups > 0 ? (totalMembers / totalGroups).toFixed(1) : 0;
    const groupsWithQuizzes = groups.filter(
      (group) => (group.quiz_count || 0) > 0
    ).length;

    return {
      totalGroups,
      totalMembers,
      averageMembersPerGroup,
      groupsWithQuizzes,
    };
  };

  const stats = calculateStats();

  const statsData = [
    {
      title: "Total Kelompok",
      value: stats.totalGroups,
      icon: <TeamOutlined />,
      color: "#667eea",
      bgGradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      bgLight: "#f8faff",
    },
    {
      title: "Total Anggota",
      value: stats.totalMembers,
      subtitle: "siswa tergabung",
      icon: <UserOutlined />,
      color: "#52c41a",
      bgGradient: "linear-gradient(135deg, #52c41a 0%, #73d13d 100%)",
      bgLight: "#f6ffed",
    },
    {
      title: "Rata-rata Anggota",
      value: stats.averageMembersPerGroup,
      subtitle: "per kelompok",
      icon: <BarChartOutlined />,
      color: "#faad14",
      bgGradient: "linear-gradient(135deg, #faad14 0%, #ffc53d 100%)",
      bgLight: "#fffbe6",
    },
    {
      title: "Kelompok Aktif",
      value: stats.groupsWithQuizzes,
      subtitle: "dengan quiz",
      icon: <TrophyOutlined />,
      color: "#722ed1",
      bgGradient: "linear-gradient(135deg, #722ed1 0%, #9254de 100%)",
      bgLight: "#f9f0ff",
    },
  ];

  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
      {statsData.map((stat, index) => (
        <Col xs={12} sm={6} lg={6} key={index}>
          <Card
            style={{
              borderRadius: 16,
              border: "none",
              background: stat.bgLight,
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              overflow: "hidden",
              position: "relative",
            }}
            bodyStyle={{
              padding: isMobile ? "16px" : "20px",
              textAlign: "center",
              position: "relative",
              zIndex: 1,
            }}
            hoverable
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow = `0 8px 24px ${stat.color}20`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
            }}
          >
            {/* Background Pattern */}
            <div
              style={{
                position: "absolute",
                top: -20,
                right: -20,
                width: 80,
                height: 80,
                borderRadius: "50%",
                background: stat.bgGradient,
                opacity: 0.1,
              }}
            />

            {/* Icon */}
            <div
              style={{
                background: stat.bgGradient,
                width: isMobile ? 50 : 60,
                height: isMobile ? 50 : 60,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto",
                marginBottom: 16,
                boxShadow: `0 4px 12px ${stat.color}30`,
              }}
            >
              {React.cloneElement(stat.icon, {
                style: {
                  fontSize: isMobile ? 20 : 24,
                  color: "white",
                },
              })}
            </div>

            {/* Statistics */}
            <Statistic
              title={stat.title}
              value={stat.value}
              valueStyle={{
                color: stat.color,
                fontSize: isMobile ? 22 : 28,
                fontWeight: 700,
                lineHeight: 1,
                marginBottom: 4,
              }}
              titleStyle={{
                color: "#666",
                fontSize: isMobile ? 12 : 14,
                fontWeight: 600,
                marginBottom: 8,
              }}
            />

            {/* Subtitle */}
            {stat.subtitle && (
              <div
                style={{
                  fontSize: isMobile ? 10 : 12,
                  color: "#999",
                  marginTop: 4,
                  fontWeight: 500,
                }}
              >
                {stat.subtitle}
              </div>
            )}
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default GroupsStatsCards;
