import React, { useState } from "react";
import { Card, Tag, Typography, Space, Skeleton, Pagination } from "antd";
import { ClockCircleOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useMediaQuery } from "react-responsive";

const { Text } = Typography;
const PAGE_SIZE = 3;

const TodayScheduleCard = ({ schedule = [], loading }) => {
  const [page, setPage] = useState(1);
  const isMobile = useMediaQuery({ maxWidth: 768 });

  const formatTime = (timeStr) => {
    return dayjs(timeStr, "HH:mm:ss").format("HH:mm");
  };

  const getCurrentTimeStatus = (timeStr) => {
    const now = dayjs();
    const scheduleTime = dayjs(timeStr, "HH:mm:ss");
    const diffMinutes = scheduleTime.diff(now, "minute");

    if (diffMinutes < -30) {
      return { status: "finished", color: "#d9d9d9", text: "Finished" };
    } else if (diffMinutes <= 0 && diffMinutes > -30) {
      return { status: "ongoing", color: "#52c41a", text: "Ongoing" };
    } else if (diffMinutes <= 60) {
      return { status: "soon", color: "#faad14", text: "Starting Soon" };
    } else {
      return { status: "scheduled", color: "#1677ff", text: "Scheduled" };
    }
  };

  if (loading) {
    return (
      <Card
        title={
          <Space>
            <ClockCircleOutlined style={{ color: "#11418b" }} />
            <Text strong>Today's Schedule</Text>
          </Space>
        }
        style={{ borderRadius: 12 }}
        size="large"
        bodyStyle={{ padding: isMobile ? 12 : 24 }}
      >
        <Skeleton active paragraph={{ rows: 3 }} />
      </Card>
    );
  }

  // Pagination logic
  const pagedSchedule = schedule.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  return (
    <Card
      title={
        <Space>
          <ClockCircleOutlined />
          <Text strong>Today's Schedule</Text>
        </Space>
      }
      style={{ borderRadius: 12, marginBottom: 16 }}
      size="small"
      bodyStyle={{ padding: isMobile ? 12 : 24 }}
    >
      {pagedSchedule.length === 0 ? (
        <Text type="secondary">Tidak ada jadwal hari ini</Text>
      ) : (
        <>
          {pagedSchedule.map((item, idx) => {
            const status = getCurrentTimeStatus(item.time);
            return (
              <div
                key={item.id || idx}
                style={{
                  display: "flex",
                  flexDirection: isMobile ? "column" : "row",
                  alignItems: isMobile ? "center" : "center", // Center align on mobile
                  justifyContent: "space-between",
                  padding: isMobile ? "12px 0" : "12px 0",
                  borderBottom:
                    idx !== pagedSchedule.length - 1
                      ? "1px solid #f0f0f0"
                      : "none",
                  textAlign: isMobile ? "center" : "left", // Center text on mobile
                }}
              >
                {isMobile ? (
                  // Mobile layout - completely stacked and centered
                  <Space
                    direction="vertical"
                    size="small"
                    style={{ width: "100%" }}
                    align="center"
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <ClockCircleOutlined
                        style={{
                          color: status.color,
                          fontSize: 16,
                          marginRight: 8,
                        }}
                      />
                      <Text
                        strong
                        style={{
                          color: status.color,
                          fontSize: 16,
                        }}
                      >
                        {item.time?.slice(0, 5)}
                      </Text>
                    </div>

                    <Text
                      style={{
                        fontWeight: 500,
                        color:
                          status.status === "finished" ? "#bfbfbf" : "#222",
                        fontSize: 14,
                        margin: "6px 0",
                      }}
                    >
                      {item.activity}
                    </Text>

                    <Tag
                      color={status.color === "#d9d9d9" ? "default" : "blue"}
                      style={{
                        fontWeight: 500,
                        fontSize: 11,
                        borderRadius: 6,
                      }}
                    >
                      {status.text}
                    </Tag>
                  </Space>
                ) : (
                  // Desktop layout - horizontal
                  <>
                    <Space align="center" size="middle">
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <ClockCircleOutlined
                          style={{
                            color: status.color,
                            fontSize: 18,
                            marginRight: 8,
                          }}
                        />
                        <Text
                          strong
                          style={{
                            color: status.color,
                            fontSize: 16,
                            minWidth: 56,
                          }}
                        >
                          {item.time?.slice(0, 5)}
                        </Text>
                      </div>
                      <Text
                        style={{
                          fontWeight: 500,
                          color:
                            status.status === "finished" ? "#bfbfbf" : "#222",
                          fontSize: 15,
                        }}
                      >
                        {item.activity}
                      </Text>
                    </Space>

                    <Tag
                      color={status.color === "#d9d9d9" ? "default" : "blue"}
                      style={{
                        fontWeight: 500,
                        fontSize: 12,
                        borderRadius: 6,
                      }}
                    >
                      {status.text}
                    </Tag>
                  </>
                )}
              </div>
            );
          })}

          {schedule.length > PAGE_SIZE && (
            <div style={{ textAlign: "center", marginTop: 16 }}>
              <Pagination
                current={page}
                pageSize={PAGE_SIZE}
                total={schedule.length}
                onChange={setPage}
                size="small"
                showSizeChanger={false}
                simple={isMobile} // Use simple pagination on mobile
              />
            </div>
          )}
        </>
      )}
    </Card>
  );
};

export default TodayScheduleCard;
