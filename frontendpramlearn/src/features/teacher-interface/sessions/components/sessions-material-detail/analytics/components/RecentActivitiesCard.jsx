import React from "react";
import {
  Card,
  List,
  Avatar,
  Tag,
  Space,
  Empty,
  Typography,
  Tooltip,
} from "antd";
import { ClockCircleOutlined, UserOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/id";
import { getMotivationColor, getMotivationText } from "../utils/analyticsUtils";

dayjs.extend(relativeTime);
dayjs.locale("id");

const { Text } = Typography;

const RecentActivitiesCard = ({ recentActivities, isMobile }) => {
  const cardStyle = {
    borderRadius: 16,
    height: "100%",
    boxShadow: "0 4px 20px rgba(114, 46, 209, 0.12)",
    border: "1px solid #f9f0ff",
    background: "linear-gradient(135deg, #ffffff 0%, #f9f0ff 100%)",
  };

  const headerStyle = {
    background: "linear-gradient(135deg, #722ed1 0%, #9254de 100%)",
    borderRadius: "16px 16px 0 0",
    color: "white",
    border: "none",
  };

  const getActivityStatus = (student) => {
    const lastActivity = dayjs(student.last_activity);
    const hoursAgo = dayjs().diff(lastActivity, "hour");

    if (hoursAgo <= 1) return { status: "🟢", text: "Baru saja" };
    if (hoursAgo <= 6) return { status: "🟡", text: "Beberapa jam lalu" };
    if (hoursAgo <= 24) return { status: "🟠", text: "Hari ini" };
    return { status: "🔴", text: "Kemarin atau lebih" };
  };

  const getCompletionStatus = (percentage) => {
    if (percentage >= 90)
      return { icon: "🏆", color: "#52c41a", text: "Hampir selesai" };
    if (percentage >= 70)
      return { icon: "🎯", color: "#faad14", text: "Progres baik" };
    if (percentage >= 50)
      return { icon: "📚", color: "#1890ff", text: "Setengah jalan" };
    return { icon: "🚀", color: "#ff4d4f", text: "Baru mulai" };
  };

  return (
    <Card
      title={
        <Space style={{ color: "white" }}>
          <ClockCircleOutlined style={{ fontSize: isMobile ? 16 : 18 }} />
          <span style={{ fontSize: isMobile ? 14 : 16, fontWeight: 600 }}>
            ⏰ Aktivitas Terbaru
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
      {recentActivities.length > 0 ? (
        <List
          dataSource={recentActivities}
          renderItem={(student, index) => {
            const activityStatus = getActivityStatus(student);
            const completionStatus = getCompletionStatus(
              student.completion_percentage || 0
            );

            return (
              <List.Item
                style={{
                  padding: isMobile ? "12px 0" : "16px 0",
                  borderBottom:
                    index === recentActivities.length - 1
                      ? "none"
                      : "1px solid #f0f0f0",
                  background: student.is_online
                    ? "rgba(82, 196, 26, 0.02)"
                    : "transparent",
                  borderRadius: student.is_online ? 8 : 0,
                  margin: student.is_online ? "4px 0" : 0,
                }}
              >
                <List.Item.Meta
                  avatar={
                    <div style={{ position: "relative" }}>
                      <Avatar
                        icon={<UserOutlined />}
                        style={{
                          background: student.is_online
                            ? "linear-gradient(135deg, #52c41a 0%, #73d13d 100%)"
                            : "#d9d9d9",
                          border: student.is_online
                            ? "2px solid #f6ffed"
                            : "none",
                          width: isMobile ? 40 : 44,
                          height: isMobile ? 40 : 44,
                          fontSize: isMobile ? 16 : 18,
                          boxShadow: student.is_online
                            ? "0 2px 8px rgba(82, 196, 26, 0.3)"
                            : "none",
                        }}
                      />
                      <div
                        style={{
                          position: "absolute",
                          top: -4,
                          right: -4,
                          fontSize: isMobile ? 12 : 14,
                        }}
                      >
                        {activityStatus.status}
                      </div>
                    </div>
                  }
                  title={
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 6,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <Text
                          strong
                          style={{
                            fontSize: isMobile ? 13 : 14,
                            color: student.is_online ? "#389e0d" : "#333",
                          }}
                        >
                          {student.username}
                        </Text>
                        {student.is_online && (
                          <div
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              background: "#52c41a",
                              animation: "pulse 2s infinite",
                            }}
                          />
                        )}
                      </div>
                      <Tag
                        color={getMotivationColor(student.motivation_level)}
                        size="small"
                        style={{
                          borderRadius: 8,
                          fontSize: isMobile ? 10 : 11,
                          fontWeight: 500,
                        }}
                      >
                        {getMotivationText(student.motivation_level)}
                      </Tag>
                    </div>
                  }
                  description={
                    <div>
                      <div
                        style={{
                          marginBottom: 8,
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <span style={{ fontSize: isMobile ? 11 : 12 }}>⏱️</span>
                        <Text
                          type="secondary"
                          style={{ fontSize: isMobile ? 11 : 12 }}
                        >
                          {dayjs(student.last_activity).fromNow()}
                        </Text>
                        <Text
                          type="secondary"
                          style={{
                            fontSize: 10,
                            marginLeft: 4,
                            color:
                              activityStatus.status === "🟢"
                                ? "#52c41a"
                                : "#999",
                          }}
                        >
                          ({activityStatus.text})
                        </Text>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          marginBottom: 8,
                        }}
                      >
                        <span style={{ fontSize: isMobile ? 11 : 12 }}>
                          {completionStatus.icon}
                        </span>
                        <Text
                          type="secondary"
                          style={{ fontSize: isMobile ? 11 : 12 }}
                        >
                          Progress:{" "}
                          {Math.round(student.completion_percentage || 0)}%
                        </Text>
                        <Text
                          style={{
                            fontSize: 10,
                            color: completionStatus.color,
                            fontWeight: 500,
                          }}
                        >
                          ({completionStatus.text})
                        </Text>
                      </div>

                      <div
                        style={{
                          background: `${completionStatus.color}15`,
                          borderRadius: 6,
                          height: 4,
                          overflow: "hidden",
                          position: "relative",
                        }}
                      >
                        <div
                          style={{
                            background: `linear-gradient(90deg, ${completionStatus.color} 0%, ${completionStatus.color}cc 100%)`,
                            height: "100%",
                            width: `${student.completion_percentage || 0}%`,
                            transition: "width 0.3s ease",
                          }}
                        />
                      </div>

                      {student.last_quiz_score !== undefined && (
                        <Tag
                          size="small"
                          style={{
                            marginTop: 8,
                            fontSize: 10,
                            borderRadius: 6,
                            background: `${completionStatus.color}10`,
                            color: completionStatus.color,
                            border: `1px solid ${completionStatus.color}30`,
                          }}
                        >
                          Quiz terakhir: {student.last_quiz_score}
                        </Tag>
                      )}
                    </div>
                  }
                />
              </List.Item>
            );
          }}
        />
      ) : (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <Text style={{ color: "#999", fontSize: isMobile ? 12 : 14 }}>
              Belum ada aktivitas terbaru
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

export default RecentActivitiesCard;
