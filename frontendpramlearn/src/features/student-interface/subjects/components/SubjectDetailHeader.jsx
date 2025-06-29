import React from "react";
import { Card, Typography, Space, Tag, Progress, Row, Col } from "antd";
import {
  UserOutlined,
  ClockCircleOutlined,
  BookOutlined,
  CalendarOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const SubjectDetailHeader = ({ subject }) => {
  const calculateProgress = () => {
    if (subject.progress !== undefined && subject.progress !== null) {
      return subject.progress;
    }

    // Fallback: hitung dari materials jika ada
    if (subject.materials && subject.materials.length > 0) {
      const totalProgress = subject.materials.reduce(
        (sum, material) => sum + (material.progress || 0),
        0
      );
      return Math.round(totalProgress / subject.materials.length);
    }

    return 0;
  };

  const getNextSchedule = () => {
    if (!subject.schedules || subject.schedules.length === 0) return null;

    const now = new Date();
    const today = now.getDay();

    const dayMap = {
      Minggu: 0,
      Senin: 1,
      Selasa: 2,
      Rabu: 3,
      Kamis: 4,
      Jumat: 5,
      Sabtu: 6,
    };

    const nextSchedule = subject.schedules.find((schedule) => {
      const scheduleDay = dayMap[schedule.day_of_week || schedule.day];
      return scheduleDay >= today;
    });

    return nextSchedule || subject.schedules[0];
  };

  const nextSchedule = getNextSchedule();
  const progressValue = calculateProgress();

  return (
    <Card
      style={{
        marginBottom: 24,
        borderRadius: 16,
        overflow: "hidden",
        background:
          "linear-gradient(135deg, #001529 0%, #3a3f5c 60%, #43cea2 100%)",
        border: "none",
        color: "white",
      }}
      bodyStyle={{ padding: 0 }}
    >
      <div style={{ padding: "32px 28px" }}>
        <Row gutter={[24, 24]} align="middle">
          <Col xs={24} lg={16}>
            {/* Subject Info */}
            <Space direction="vertical" size={16} style={{ width: "100%" }}>
              <div>
                <Title
                  level={1}
                  style={{
                    color: "white",
                    margin: 0,
                    fontSize: 32,
                    fontWeight: 700,
                    marginBottom: 8,
                  }}
                >
                  {subject.name}
                </Title>

                <Space size={16} wrap>
                  <Space size={8}>
                    <UserOutlined style={{ color: "rgba(255,255,255,0.9)" }} />
                    <Text
                      style={{ color: "rgba(255,255,255,0.9)", fontSize: 16 }}
                    >
                      {subject.teacher_name || "Belum ada guru"}
                    </Text>
                  </Space>

                  <Space size={8}>
                    <BookOutlined style={{ color: "rgba(255,255,255,0.9)" }} />
                    <Text
                      style={{ color: "rgba(255,255,255,0.9)", fontSize: 16 }}
                    >
                      {subject.materials?.length || subject.material_count || 0}{" "}
                      Materi
                    </Text>
                  </Space>
                </Space>
              </div>

              {/* Next Schedule - PERBAIKAN format */}
              {nextSchedule && (
                <div
                  style={{
                    background: "rgba(255,255,255,0.15)",
                    padding: "16px 20px",
                    borderRadius: 12,
                    backdropFilter: "blur(10px)",
                  }}
                >
                  <Space size={12} align="center">
                    <CalendarOutlined
                      style={{ color: "white", fontSize: 16 }}
                    />
                    <div>
                      <Text
                        style={{
                          color: "white",
                          fontSize: 14,
                          fontWeight: 600,
                        }}
                      >
                        Jadwal Berikutnya:{" "}
                        {nextSchedule.day_of_week || nextSchedule.day}
                      </Text>
                      <br />
                      <Text
                        style={{ color: "rgba(255,255,255,0.9)", fontSize: 13 }}
                      >
                        {/* PERBAIKAN: Format waktu sesuai API response */}
                        {nextSchedule.time ||
                          `${nextSchedule.start_time || ""} ${
                            nextSchedule.end_time
                              ? `- ${nextSchedule.end_time}`
                              : ""
                          }`}
                        {nextSchedule.room && ` • ${nextSchedule.room}`}
                      </Text>
                    </div>
                  </Space>
                </div>
              )}
            </Space>
          </Col>

          <Col xs={24} lg={8}>
            {/* Progress Section - PERBAIKAN menggunakan progress yang benar */}
            <div
              style={{
                background: "rgba(255,255,255,0.15)",
                padding: "24px",
                borderRadius: 16,
                backdropFilter: "blur(10px)",
                textAlign: "center",
              }}
            >
              <Text
                style={{
                  color: "rgba(255,255,255,0.9)",
                  fontSize: 14,
                  display: "block",
                  marginBottom: 12,
                }}
              >
                Progress Keseluruhan
              </Text>

              <Progress
                type="circle"
                percent={progressValue}
                strokeColor="white"
                trailColor="rgba(255,255,255,0.3)"
                strokeWidth={8}
                size={120}
                format={(percent) => (
                  <span
                    style={{ color: "white", fontSize: 18, fontWeight: 600 }}
                  >
                    {percent}%
                  </span>
                )}
              />

              <Text
                style={{
                  color: "rgba(255,255,255,0.9)",
                  fontSize: 13,
                  display: "block",
                  marginTop: 12,
                }}
              >
                dari semua materi
              </Text>
            </div>
          </Col>
        </Row>
      </div>
    </Card>
  );
};

export default SubjectDetailHeader;
