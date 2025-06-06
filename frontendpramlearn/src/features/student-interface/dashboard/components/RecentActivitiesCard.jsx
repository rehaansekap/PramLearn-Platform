import React from "react";
import { Card, List, Skeleton, Typography, Tag, Empty, Space } from "antd";
import {
  ClockCircleOutlined,
  FileTextOutlined,
  BookOutlined,
} from "@ant-design/icons";
import { useMediaQuery } from "react-responsive";

const { Text } = Typography;

const RecentActivitiesCard = ({ activities, loading }) => {
  const isMobile = useMediaQuery({ maxWidth: 768 });

  return (
    <Card
      title="Aktivitas Terbaru"
      style={{ borderRadius: 12, marginBottom: 16 }}
      bodyStyle={{ padding: isMobile ? 12 : 24 }}
    >
      {loading ? (
        <Skeleton active paragraph={{ rows: 4 }} />
      ) : activities && activities.length > 0 ? (
        <List
          itemLayout={isMobile ? "vertical" : "horizontal"}
          dataSource={activities}
          renderItem={(item) => (
            <List.Item
              style={{
                flexDirection: isMobile ? "column" : "row",
                alignItems: isMobile ? "flex-start" : "center",
                padding: isMobile ? "12px 0" : "16px 0",
              }}
            >
              <List.Item.Meta
                avatar={
                  item.type === "material" ? (
                    <BookOutlined
                      style={{ color: "#11418b", fontSize: isMobile ? 16 : 20 }}
                    />
                  ) : item.type === "assignment" ? (
                    <FileTextOutlined
                      style={{ color: "#faad14", fontSize: isMobile ? 16 : 20 }}
                    />
                  ) : (
                    <ClockCircleOutlined
                      style={{ color: "#1677ff", fontSize: isMobile ? 16 : 20 }}
                    />
                  )
                }
                title={
                  <Space
                    direction={isMobile ? "vertical" : "horizontal"}
                    size={isMobile ? 4 : 8}
                    style={{ display: "flex", flexWrap: "wrap" }}
                  >
                    <Text strong style={{ fontSize: isMobile ? 13 : 14 }}>
                      {item.title}
                    </Text>
                    <Tag
                      color={
                        item.type === "material"
                          ? "blue"
                          : item.type === "assignment"
                          ? "orange"
                          : "green"
                      }
                      style={{ margin: 0 }}
                    >
                      {item.type === "material"
                        ? "Material"
                        : item.type === "assignment"
                        ? "Assignment"
                        : "Quiz"}
                    </Tag>
                  </Space>
                }
                description={
                  <Text
                    type="secondary"
                    style={{ fontSize: isMobile ? 12 : 13 }}
                  >
                    {item.description}
                  </Text>
                }
                style={{ marginBottom: isMobile ? 8 : 0 }}
              />
              <div
                style={{
                  minWidth: isMobile ? "100%" : 120,
                  textAlign: isMobile ? "left" : "right",
                  marginTop: isMobile ? 8 : 0,
                  marginLeft: isMobile ? 40 : 0, // Indent on mobile to align with description
                }}
              >
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {item.time}
                </Text>
              </div>
            </List.Item>
          )}
        />
      ) : (
        <Empty description="Belum ada aktivitas terbaru" />
      )}
    </Card>
  );
};

export default RecentActivitiesCard;
