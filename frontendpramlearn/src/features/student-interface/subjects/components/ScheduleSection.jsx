import React from "react";
import { Typography, Tag, Space } from "antd";
import { ClockCircleOutlined } from "@ant-design/icons";

const { Text } = Typography;

const ScheduleSection = ({ schedules }) => {
  const getNextSchedule = () => {
    if (!schedules || schedules.length === 0) return null;

    const now = new Date();
    const today = now.getDay(); // 0 = Minggu, 1 = Senin, dst.

    const dayMap = {
      Minggu: 0,
      Senin: 1,
      Selasa: 2,
      Rabu: 3,
      Kamis: 4,
      Jumat: 5,
      Sabtu: 6,
    };

    const nextSchedule = schedules.find((schedule) => {
      const scheduleDay = dayMap[schedule.day_of_week || schedule.day];
      return scheduleDay >= today;
    });

    return nextSchedule || schedules[0];
  };

  const nextSchedule = getNextSchedule();

  if (!nextSchedule) return null;

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ marginBottom: 8 }}>
        <Text
          style={{
            color: "#666",
            fontSize: 13,
            fontWeight: 500,
          }}
        >
          Jadwal Berikutnya:
        </Text>
      </div>

      <div
        style={{
          background: "#fff7e6",
          padding: "10px 12px",
          borderRadius: 6,
          border: "1px solid #ffd591",
        }}
      >
        <Space size={8} align="center">
          <ClockCircleOutlined
            style={{
              color: "#faad14",
              fontSize: 12,
            }}
          />
          <Text style={{ fontSize: 12, fontWeight: 500 }}>
            {nextSchedule.day_of_week || nextSchedule.day}
          </Text>
          <Text style={{ fontSize: 12, color: "#666" }}>
            {/* PERBAIKAN: Sesuaikan dengan format API response */}
            {nextSchedule.time ||
              `${nextSchedule.start_time || ""} ${
                nextSchedule.end_time ? `- ${nextSchedule.end_time}` : ""
              }`}
          </Text>
          {/* PERBAIKAN: Hanya tampilkan tag ruangan jika ada */}
          {nextSchedule.room && (
            <Tag
              color="orange"
              style={{
                fontSize: 10,
                padding: "1px 6px",
                margin: 0,
              }}
            >
              {nextSchedule.room}
            </Tag>
          )}
        </Space>
      </div>
    </div>
  );
};

export default ScheduleSection;
