import React from "react";
import {
  Card,
  List,
  Typography,
  Space,
  Tag,
  Empty,
  Skeleton,
  Badge,
  Tooltip,
  Button,
  Progress,
} from "antd";
import {
  ClockCircleOutlined,
  BookOutlined,
  TeamOutlined,
  CalendarOutlined,
  PlayCircleOutlined,
  CheckCircleOutlined,
  FieldTimeOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";

const { Text } = Typography;

const TeacherTodayScheduleCard = ({ schedule, loading }) => {
  const navigate = useNavigate();

  const getCurrentTimeStatus = (time) => {
    if (!time) return { status: "unknown", color: "#8c8c8c" };

    const now = dayjs();
    const scheduleTime = dayjs(time, "HH:mm");
    const scheduleEndTime = scheduleTime.add(90, "minute"); // Assuming 90 min class duration

    if (now.isBefore(scheduleTime)) {
      const minutesUntil = scheduleTime.diff(now, "minute");
      if (minutesUntil <= 15) {
        return {
          status: "starting-soon",
          color: "#faad14",
          label: `Dimulai ${minutesUntil}m lagi`,
        };
      }
      return { status: "upcoming", color: "#1677ff", label: "Akan datang" };
    } else if (now.isBefore(scheduleEndTime)) {
      return {
        status: "ongoing",
        color: "#52c41a",
        label: "Sedang berlangsung",
      };
    } else {
      return { status: "completed", color: "#8c8c8c", label: "Selesai" };
    }
  };

  const getTimeProgress = (time) => {
    if (!time) return 0;

    const now = dayjs();
    const scheduleTime = dayjs(time, "HH:mm");
    const scheduleEndTime = scheduleTime.add(90, "minute");

    if (now.isBefore(scheduleTime)) return 0;
    if (now.isAfter(scheduleEndTime)) return 100;

    const totalDuration = scheduleEndTime.diff(scheduleTime, "minute");
    const elapsed = now.diff(scheduleTime, "minute");
    return Math.round((elapsed / totalDuration) * 100);
  };

  const formatTime = (timeString) => {
    try {
      return dayjs(timeString, "HH:mm").format("HH:mm");
    } catch {
      return timeString;
    }
  };

  const getDayName = () => {
    const days = [
      "Minggu",
      "Senin",
      "Selasa",
      "Rabu",
      "Kamis",
      "Jumat",
      "Sabtu",
    ];
    return days[new Date().getDay()];
  };

  if (loading) {
    return (
      <Card
        title={
          <Space>
            <CalendarOutlined style={{ color: "#11418b" }} />
            <Text strong style={{ color: "#11418b" }}>
              Jadwal Hari Ini
            </Text>
          </Space>
        }
        style={{
          borderRadius: 16,
          marginBottom: 16,
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        <Skeleton active paragraph={{ rows: 4 }} />
      </Card>
    );
  }

  if (!schedule || schedule.length === 0) {
    return (
      <Card
        title={
          <Space>
            <CalendarOutlined style={{ color: "#11418b" }} />
            <Text strong style={{ color: "#11418b" }}>
              Jadwal Hari Ini
            </Text>
            <Tag color="blue">{getDayName()}</Tag>
          </Space>
        }
        style={{
          borderRadius: 16,
          marginBottom: 16,
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <div>
              <Text style={{ fontSize: 14, color: "#666" }}>
                Tidak ada jadwal mengajar hari ini
              </Text>
              <br />
              <Text type="secondary" style={{ fontSize: 12 }}>
                Selamat menikmati hari libur! 🎉
              </Text>
            </div>
          }
          style={{ padding: "40px 0" }}
        />
      </Card>
    );
  }

  // Sort schedule by time
  const sortedSchedule = [...schedule].sort((a, b) => {
    const timeA = dayjs(a.time, "HH:mm");
    const timeB = dayjs(b.time, "HH:mm");
    return timeA.unix() - timeB.unix();
  });

  const ongoingClasses = sortedSchedule.filter((item) => {
    const status = getCurrentTimeStatus(item.time);
    return status.status === "ongoing";
  });

  const upcomingClasses = sortedSchedule.filter((item) => {
    const status = getCurrentTimeStatus(item.time);
    return status.status === "upcoming" || status.status === "starting-soon";
  });

  return (
    <Card
      title={
        <Space>
          <CalendarOutlined style={{ color: "#11418b" }} />
          <Text strong style={{ color: "#11418b" }}>
            Jadwal Hari Ini
          </Text>
          <Tag color="blue">{getDayName()}</Tag>
          {ongoingClasses.length > 0 && (
            <Badge
              count={ongoingClasses.length}
              style={{ backgroundColor: "#52c41a" }}
            />
          )}
        </Space>
      }
      style={{
        borderRadius: 16,
        marginBottom: 16,
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      }}
      bodyStyle={{ padding: "16px" }}
      extra={
        <Button
          type="link"
          size="small"
          onClick={() => navigate("/teacher/schedule")}
        >
          Lihat Semua
        </Button>
      }
    >
      {/* Summary Stats */}
      {sortedSchedule.length > 0 && (
        <div
          style={{
            background: "#f8fafc",
            borderRadius: 12,
            padding: 16,
            marginBottom: 16,
            border: "1px solid #e2e8f0",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Space size={16}>
              <div style={{ textAlign: "center" }}>
                <div
                  style={{ fontSize: 18, fontWeight: "bold", color: "#1677ff" }}
                >
                  {sortedSchedule.length}
                </div>
                <Text style={{ fontSize: 11, color: "#666" }}>Total Kelas</Text>
              </div>
              <div style={{ textAlign: "center" }}>
                <div
                  style={{ fontSize: 18, fontWeight: "bold", color: "#52c41a" }}
                >
                  {ongoingClasses.length}
                </div>
                <Text style={{ fontSize: 11, color: "#666" }}>Berlangsung</Text>
              </div>
              <div style={{ textAlign: "center" }}>
                <div
                  style={{ fontSize: 18, fontWeight: "bold", color: "#faad14" }}
                >
                  {upcomingClasses.length}
                </div>
                <Text style={{ fontSize: 11, color: "#666" }}>Mendatang</Text>
              </div>
            </Space>
            <FieldTimeOutlined style={{ fontSize: 24, color: "#d9d9d9" }} />
          </div>
        </div>
      )}

      {/* Schedule List */}
      <List
        size="small"
        dataSource={sortedSchedule}
        renderItem={(item) => {
          const timeStatus = getCurrentTimeStatus(item.time);
          const progress = getTimeProgress(item.time);
          const isOngoing = timeStatus.status === "ongoing";
          const isStartingSoon = timeStatus.status === "starting-soon";

          return (
            <List.Item
              style={{
                padding: "16px 12px",
                background: isOngoing
                  ? "#f6ffed"
                  : isStartingSoon
                  ? "#fff7e6"
                  : "#fafafa",
                borderRadius: 12,
                marginBottom: 8,
                border: `2px solid ${
                  isOngoing ? "#b7eb8f" : isStartingSoon ? "#ffd591" : "#f0f0f0"
                }`,
                transition: "all 0.3s ease",
                position: "relative",
                overflow: "hidden",
              }}
              className="schedule-item"
            >
              {/* Progress bar for ongoing classes */}
              {isOngoing && (
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    height: 3,
                    width: `${progress}%`,
                    background: "#52c41a",
                    transition: "width 1s ease",
                  }}
                />
              )}

              <List.Item.Meta
                avatar={
                  <div style={{ position: "relative" }}>
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 12,
                        background: `linear-gradient(135deg, ${timeStatus.color} 0%, ${timeStatus.color}80 100%)`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontSize: 20,
                      }}
                    >
                      {isOngoing ? (
                        <PlayCircleOutlined />
                      ) : timeStatus.status === "completed" ? (
                        <CheckCircleOutlined />
                      ) : (
                        <ClockCircleOutlined />
                      )}
                    </div>
                    {(isOngoing || isStartingSoon) && (
                      <div
                        style={{
                          position: "absolute",
                          top: -2,
                          right: -2,
                          width: 12,
                          height: 12,
                          background: timeStatus.color,
                          borderRadius: "50%",
                          border: "2px solid white",
                          animation: isOngoing ? "pulse 2s infinite" : "none",
                        }}
                      />
                    )}
                  </div>
                }
                title={
                  <div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 4,
                      }}
                    >
                      <Text
                        strong
                        style={{
                          fontSize: 14,
                          color: "#333",
                          flex: 1,
                        }}
                      >
                        {item.subject?.name || item.subject_name}
                      </Text>
                      <Tag
                        color={timeStatus.color}
                        style={{
                          fontSize: 10,
                          padding: "2px 6px",
                          borderRadius: 8,
                          fontWeight: 500,
                        }}
                      >
                        {timeStatus.label}
                      </Tag>
                    </div>

                    {/* Time and class info */}
                    <Space wrap size={12}>
                      <Space size={4}>
                        <ClockCircleOutlined
                          style={{ fontSize: 11, color: "#666" }}
                        />
                        <Text
                          style={{
                            fontSize: 11,
                            color: "#666",
                            fontWeight: 500,
                          }}
                        >
                          {formatTime(item.time)} -{" "}
                          {dayjs(item.time, "HH:mm")
                            .add(90, "minute")
                            .format("HH:mm")}
                        </Text>
                      </Space>

                      <Space size={4}>
                        <TeamOutlined style={{ fontSize: 11, color: "#666" }} />
                        <Text style={{ fontSize: 11, color: "#666" }}>
                          {item.class?.name || item.class_name}
                        </Text>
                      </Space>

                      {item.room && (
                        <Space size={4}>
                          <EnvironmentOutlined
                            style={{ fontSize: 11, color: "#666" }}
                          />
                          <Text style={{ fontSize: 11, color: "#666" }}>
                            {item.room}
                          </Text>
                        </Space>
                      )}
                    </Space>
                  </div>
                }
                description={
                  <div style={{ marginTop: 8 }}>
                    {/* Progress bar for ongoing class */}
                    {isOngoing && (
                      <div style={{ marginBottom: 8 }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: 4,
                          }}
                        >
                          <Text style={{ fontSize: 10, color: "#666" }}>
                            Progress Kelas
                          </Text>
                          <Text
                            style={{
                              fontSize: 10,
                              color: "#52c41a",
                              fontWeight: 600,
                            }}
                          >
                            {progress}%
                          </Text>
                        </div>
                        <Progress
                          percent={progress}
                          strokeColor="#52c41a"
                          size="small"
                          showInfo={false}
                          strokeWidth={4}
                        />
                      </div>
                    )}

                    {/* Additional info */}
                    <Space wrap size={8}>
                      {item.student_count && (
                        <Tooltip title="Jumlah siswa">
                          <Space size={2}>
                            <TeamOutlined
                              style={{ fontSize: 10, color: "#1677ff" }}
                            />
                            <Text style={{ fontSize: 10, color: "#1677ff" }}>
                              {item.student_count} siswa
                            </Text>
                          </Space>
                        </Tooltip>
                      )}

                      {item.materials_count && (
                        <Tooltip title="Materi pembelajaran">
                          <Space size={2}>
                            <BookOutlined
                              style={{ fontSize: 10, color: "#fa8c16" }}
                            />
                            <Text style={{ fontSize: 10, color: "#fa8c16" }}>
                              {item.materials_count} materi
                            </Text>
                          </Space>
                        </Tooltip>
                      )}

                      {isStartingSoon && (
                        <Button
                          type="link"
                          size="small"
                          style={{
                            padding: 0,
                            height: "auto",
                            fontSize: 10,
                            color: "#faad14",
                          }}
                          onClick={() =>
                            navigate(
                              `/teacher/classes/${
                                item.class?.slug || item.class_id
                              }`
                            )
                          }
                        >
                          Masuk Kelas
                        </Button>
                      )}
                    </Space>
                  </div>
                }
              />
            </List.Item>
          );
        }}
      />

      <style jsx>{`
        .schedule-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
        }

        @keyframes pulse {
          0% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(82, 196, 26, 0.7);
          }
          70% {
            transform: scale(1);
            box-shadow: 0 0 0 6px rgba(82, 196, 26, 0);
          }
          100% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(82, 196, 26, 0);
          }
        }
      `}</style>
    </Card>
  );
};

export default TeacherTodayScheduleCard;
