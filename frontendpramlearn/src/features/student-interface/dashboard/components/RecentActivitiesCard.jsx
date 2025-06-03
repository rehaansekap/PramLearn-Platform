import React from "react";
import { Card, List, Skeleton, Typography, Tag, Empty } from "antd";
import {
  ClockCircleOutlined,
  FileTextOutlined,
  BookOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

const RecentActivitiesCard = ({ activities, loading }) => (
  <Card
    title="Aktivitas Terbaru"
    style={{ borderRadius: 12, marginBottom: 16 }}
  >
    {loading ? (
      <Skeleton active paragraph={{ rows: 4 }} />
    ) : activities && activities.length > 0 ? (
      <List
        itemLayout="horizontal"
        dataSource={activities}
        renderItem={(item) => (
          <List.Item>
            <List.Item.Meta
              avatar={
                item.type === "material" ? (
                  <BookOutlined style={{ color: "#11418b", fontSize: 20 }} />
                ) : item.type === "assignment" ? (
                  <FileTextOutlined
                    style={{ color: "#faad14", fontSize: 20 }}
                  />
                ) : (
                  <ClockCircleOutlined
                    style={{ color: "#1677ff", fontSize: 20 }}
                  />
                )
              }
              title={
                <span>
                  <Text strong>{item.title}</Text>{" "}
                  <Tag
                    color={
                      item.type === "material"
                        ? "blue"
                        : item.type === "assignment"
                        ? "orange"
                        : "green"
                    }
                  >
                    {item.type === "material"
                      ? "Material"
                      : item.type === "assignment"
                      ? "Assignment"
                      : "Quiz"}
                  </Tag>
                </span>
              }
              description={item.description}
            />
            <div style={{ minWidth: 120, textAlign: "right" }}>
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

export default RecentActivitiesCard;
