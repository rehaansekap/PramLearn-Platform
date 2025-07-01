import React from "react";
import {
  Card,
  List,
  Avatar,
  Tag,
  Progress,
  Space,
  Empty,
  Typography,
} from "antd";
import { TrophyOutlined, UserOutlined, CrownOutlined } from "@ant-design/icons";
import { getGradeColor, getProgressColor } from "../utils/analyticsUtils";

const { Text } = Typography;

const TopPerformersCard = ({ topPerformers, isMobile }) => {
  const cardStyle = {
    borderRadius: 16,
    height: "100%",
    boxShadow: "0 4px 20px rgba(255, 193, 7, 0.12)",
    border: "1px solid #fff7e6",
    background: "linear-gradient(135deg, #ffffff 0%, #fffbe6 100%)",
  };

  const headerStyle = {
    background: "linear-gradient(135deg, #faad14 0%, #ffc53d 100%)",
    borderRadius: "16px 16px 0 0",
    color: "white",
    border: "none",
  };

  const getRankIcon = (index) => {
    const icons = ["🥇", "🥈", "🥉"];
    return icons[index] || "🏅";
  };

  const getRankBadgeColor = (index) => {
    const colors = ["#ffd700", "#c0c0c0", "#cd7f32"];
    return colors[index] || "#1890ff";
  };

  return (
    <Card
      title={
        <Space style={{ color: "white" }}>
          <TrophyOutlined style={{ fontSize: isMobile ? 16 : 18 }} />
          <span style={{ fontSize: isMobile ? 14 : 16, fontWeight: 600 }}>
            🏆 Top Performers
          </span>
        </Space>
      }
      style={cardStyle}
      headStyle={headerStyle}
      bodyStyle={{
        padding: isMobile ? "16px" : "24px",
        maxHeight: 400,
        overflowY: "auto",
      }}
    >
      {topPerformers.length > 0 ? (
        <List
          dataSource={topPerformers}
          renderItem={(student, index) => (
            <List.Item
              style={{
                padding: isMobile ? "12px 0" : "16px 0",
                borderBottom:
                  index === topPerformers.length - 1
                    ? "none"
                    : "1px solid #f0f0f0",
                background:
                  index < 3 ? "rgba(250, 173, 20, 0.02)" : "transparent",
                borderRadius: index < 3 ? 8 : 0,
                margin: index < 3 ? "4px 0" : 0,
              }}
            >
              <List.Item.Meta
                avatar={
                  <div style={{ position: "relative" }}>
                    <Avatar
                      icon={<UserOutlined />}
                      style={{
                        background:
                          index < 3 ? getRankBadgeColor(index) : "#1890ff",
                        border: index < 3 ? "2px solid #fff" : "none",
                        boxShadow:
                          index < 3 ? "0 2px 8px rgba(0,0,0,0.15)" : "none",
                        width: isMobile ? 40 : 44,
                        height: isMobile ? 40 : 44,
                        fontSize: isMobile ? 16 : 18,
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        top: -8,
                        right: -8,
                        fontSize: isMobile ? 16 : 20,
                        filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
                      }}
                    >
                      {getRankIcon(index)}
                    </div>
                  </div>
                }
                title={
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 4,
                    }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <Text
                        strong
                        style={{
                          fontSize: isMobile ? 13 : 15,
                          color: index < 3 ? "#d46b08" : "#333",
                        }}
                      >
                        {student.username}
                      </Text>
                      {index === 0 && (
                        <CrownOutlined
                          style={{
                            color: "#ffd700",
                            fontSize: isMobile ? 14 : 16,
                          }}
                        />
                      )}
                    </div>
                    <Tag
                      color={getGradeColor(student.average_grade || 0)}
                      style={{
                        borderRadius: 12,
                        fontWeight: 600,
                        fontSize: isMobile ? 11 : 12,
                        padding: "2px 8px",
                      }}
                    >
                      {Math.round(student.average_grade || 0)}
                    </Tag>
                  </div>
                }
                description={
                  <div>
                    <div style={{ marginBottom: 8 }}>
                      <Text
                        type="secondary"
                        style={{ fontSize: isMobile ? 11 : 12 }}
                      >
                        Progress:{" "}
                        {Math.round(student.completion_percentage || 0)}%
                      </Text>
                    </div>
                    <Progress
                      percent={student.completion_percentage || 0}
                      size="small"
                      strokeColor={{
                        "0%": getProgressColor(
                          student.completion_percentage || 0
                        ),
                        "100%": getProgressColor(
                          student.completion_percentage || 0
                        ),
                      }}
                      showInfo={false}
                      strokeWidth={4}
                      style={{
                        margin: 0,
                      }}
                    />
                    {student.motivation_level && (
                      <Tag
                        size="small"
                        style={{
                          marginTop: 6,
                          fontSize: 10,
                          borderRadius: 6,
                          background: `${getGradeColor(
                            student.average_grade || 0
                          )}15`,
                          color: getGradeColor(student.average_grade || 0),
                          border: `1px solid ${getGradeColor(
                            student.average_grade || 0
                          )}30`,
                        }}
                      >
                        Motivasi: {student.motivation_level}
                      </Tag>
                    )}
                  </div>
                }
              />
            </List.Item>
          )}
        />
      ) : (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <Text style={{ color: "#999", fontSize: isMobile ? 12 : 14 }}>
              Belum ada data performance
            </Text>
          }
          style={{
            margin: isMobile ? "20px 0" : "40px 0",
            padding: isMobile ? "20px" : "30px",
          }}
        />
      )}
    </Card>
  );
};

export default TopPerformersCard;
