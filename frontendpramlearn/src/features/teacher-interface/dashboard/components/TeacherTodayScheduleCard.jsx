import React from "react";
import { Card, Typography, Space, Tag, Empty, Skeleton } from "antd";
import {
  ClockCircleOutlined,
  BookOutlined,
  TeamOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

const TeacherTodayScheduleCard = ({ schedule, loading }) => {
  const getCurrentTimeStatus = (time) => {
    const now = new Date();
    const [hours, minutes] = time.split(":").map(Number);
    const scheduleTime = new Date();
    scheduleTime.setHours(hours, minutes, 0, 0);

    const diffMinutes = (scheduleTime - now) / (1000 * 60);

    if (diffMinutes < -30) {
      return { status: "finished", color: "#d9d9d9", text: "Sudah Selesai" };
    } else if (diffMinutes <= 0 && diffMinutes > -30) {
      return {
        status: "ongoing",
        color: "#52c41a",
        text: "Sedang Berlangsung",
      };
    } else if (diffMinutes <= 60) {
      return { status: "soon", color: "#faad14", text: "Akan Segera Dimulai" };
    } else {
      return { status: "scheduled", color: "#1677ff", text: "Dijadwalkan" };
    }
  };

  if (loading) {
    return (
      <Card
        title={
          <Space>
            <ClockCircleOutlined style={{ color: "#11418b" }} />
            <Text strong>Jadwal Mengajar Hari Ini</Text>
          </Space>
        }
        style={{ borderRadius: 12 }}
        bodyStyle={{ padding: 16 }}
      >
        <Skeleton active paragraph={{ rows: 3 }} />
      </Card>
    );
  }

  return (
    <Card
      title={
        <Space>
          <ClockCircleOutlined style={{ color: "#11418b" }} />
          <Text strong>Jadwal Mengajar Hari Ini</Text>
        </Space>
      }
      style={{ borderRadius: 12, marginBottom: 16 }}
      bodyStyle={{ padding: 16 }}
    >
      {schedule && schedule.length > 0 ? (
        <Space direction="vertical" style={{ width: "100%" }} size="middle">
          {schedule.map((item, idx) => {
            const status = getCurrentTimeStatus(item.time);
            return (
              <div
                key={item.id || idx}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "12px 16px",
                  background: "#fafafa",
                  borderRadius: 8,
                  border: `1px solid ${status.color}30`,
                }}
              >
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 4,
                    }}
                  >
                    <BookOutlined style={{ color: "#11418b", fontSize: 14 }} />
                    <Text strong style={{ fontSize: 14 }}>
                      {item.subject_name}
                    </Text>
                  </div>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <TeamOutlined style={{ color: "#666", fontSize: 12 }} />
                    <Text style={{ fontSize: 12, color: "#666" }}>
                      {item.class_name}
                    </Text>
                    <ClockCircleOutlined
                      style={{ color: "#666", fontSize: 12 }}
                    />
                    <Text style={{ fontSize: 12, color: "#666" }}>
                      {item.time}
                    </Text>
                  </div>
                </div>
                <Tag
                  color={status.color}
                  style={{
                    fontSize: 11,
                    fontWeight: 500,
                    borderRadius: 12,
                    padding: "2px 8px",
                  }}
                >
                  {status.text}
                </Tag>
              </div>
            );
          })}
        </Space>
      ) : (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <div>
              <Text style={{ fontSize: 14, color: "#666" }}>
                Tidak ada jadwal mengajar hari ini
              </Text>
              <br />
              <Text type="secondary" style={{ fontSize: 12 }}>
                Nikmati hari libur Anda!
              </Text>
            </div>
          }
        />
      )}
    </Card>
  );
};

export default TeacherTodayScheduleCard;
