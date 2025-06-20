import React from "react";
import { Card, List, Skeleton, Typography, Tag, Empty, Space } from "antd";
import {
  ClockCircleOutlined,
  FileTextOutlined,
  BookOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";
import { useMediaQuery } from "react-responsive";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/id";

dayjs.extend(relativeTime);
dayjs.locale("id");

const { Text } = Typography;

const RecentActivitiesCard = ({ activities, loading }) => {
  const isMobile = useMediaQuery({ maxWidth: 768 });

  // Debug logging
  React.useEffect(() => {
    console.log("📝 RecentActivitiesCard received activities:", activities);
  }, [activities]);

  const getActivityIcon = (type) => {
    switch (type) {
      case "material":
        return (
          <BookOutlined
            style={{ color: "#11418b", fontSize: isMobile ? 16 : 20 }}
          />
        );
      case "assignment":
        return (
          <FileTextOutlined
            style={{ color: "#faad14", fontSize: isMobile ? 16 : 20 }}
          />
        );
      case "quiz":
        return (
          <QuestionCircleOutlined
            style={{ color: "#52c41a", fontSize: isMobile ? 16 : 20 }}
          />
        );
      default:
        return (
          <ClockCircleOutlined
            style={{ color: "#1677ff", fontSize: isMobile ? 16 : 20 }}
          />
        );
    }
  };

  const getActivityTypeLabel = (type) => {
    switch (type) {
      case "material":
        return "Materi";
      case "assignment":
        return "Tugas";
      case "quiz":
        return "Kuis";
      default:
        return "Aktivitas";
    }
  };

  const getActivityTagColor = (type) => {
    switch (type) {
      case "material":
        return "blue";
      case "assignment":
        return "orange";
      case "quiz":
        return "green";
      default:
        return "default";
    }
  };

  const formatTime = (timeString) => {
    try {
      const time = dayjs(timeString);
      if (time.isValid()) {
        // Jika lebih dari 24 jam, tampilkan tanggal
        if (dayjs().diff(time, "hour") > 24) {
          return time.format("DD MMM, HH:mm");
        }
        // Jika kurang dari 24 jam, tampilkan relative time
        return time.fromNow();
      }
      return timeString;
    } catch (error) {
      return timeString;
    }
  };

  return (
    <Card
      title={
        <Space>
          <ClockCircleOutlined style={{ color: "#11418b" }} />
          <Text strong>Aktivitas Terbaru</Text>
        </Space>
      }
      style={{ borderRadius: 12, marginBottom: 16 }}
      bodyStyle={{ padding: isMobile ? 12 : 24 }}
    >
      {loading ? (
        <Skeleton active paragraph={{ rows: 4 }} />
      ) : activities && activities.length > 0 ? (
        <List
          itemLayout={isMobile ? "vertical" : "horizontal"}
          dataSource={activities}
          renderItem={(item, index) => (
            <List.Item
              style={{
                flexDirection: isMobile ? "column" : "row",
                alignItems: isMobile ? "flex-start" : "center",
                padding: isMobile ? "12px 0" : "16px 0",
                borderBottom:
                  index === activities.length - 1
                    ? "none"
                    : "1px solid #f0f0f0",
              }}
            >
              <List.Item.Meta
                avatar={getActivityIcon(item.type)}
                title={
                  <Space
                    direction={isMobile ? "vertical" : "horizontal"}
                    size={isMobile ? 4 : 8}
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      alignItems: isMobile ? "flex-start" : "center",
                    }}
                  >
                    <Text
                      strong
                      style={{
                        fontSize: isMobile ? 13 : 14,
                        color: "#333",
                      }}
                    >
                      {item.title}
                    </Text>
                    <Tag
                      color={getActivityTagColor(item.type)}
                      style={{ margin: 0, fontSize: 11 }}
                    >
                      {getActivityTypeLabel(item.type)}
                    </Tag>
                  </Space>
                }
                description={
                  item.description && (
                    <Text
                      type="secondary"
                      style={{
                        fontSize: isMobile ? 12 : 13,
                        lineHeight: 1.4,
                      }}
                    >
                      {item.description}
                    </Text>
                  )
                }
                style={{ marginBottom: isMobile ? 8 : 0 }}
              />
              <div
                style={{
                  minWidth: isMobile ? "100%" : 120,
                  textAlign: isMobile ? "left" : "right",
                  marginTop: isMobile ? 8 : 0,
                  marginLeft: isMobile ? 40 : 0,
                }}
              >
                <Text
                  type="secondary"
                  style={{
                    fontSize: 12,
                    fontStyle: "italic",
                  }}
                >
                  {formatTime(item.time)}
                </Text>
              </div>
            </List.Item>
          )}
        />
      ) : (
        <Empty
          description="Belum ada aktivitas terbaru"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          style={{ padding: "20px 0" }}
        />
      )}
    </Card>
  );
};

export default RecentActivitiesCard;
