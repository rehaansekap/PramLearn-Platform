import React from "react";
import { Card, Typography, Space, Button, Row, Col, Avatar, Badge } from "antd";
import {
  BookOutlined,
  ClockCircleOutlined,
  UserOutlined,
  ReloadOutlined,
  DashboardOutlined,
  BellOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const TeacherWelcomeCard = ({ user, dashboard, onRefresh, refreshing }) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Selamat Pagi";
    if (hour < 17) return "Selamat Siang";
    return "Selamat Malam";
  };

  const userName =
    user?.first_name && user?.last_name
      ? `${user.first_name} ${user.last_name}`
      : user?.username || "Guru";

  const getActivitySummary = () => {
    if (!dashboard) return "Memuat data...";
    const pending = dashboard.pending_submissions || 0;
    const todaySchedule = dashboard.today_schedule?.length || 0;

    if (pending > 0) {
      return `${pending} submission menunggu penilaian`;
    } else if (todaySchedule > 0) {
      return `${todaySchedule} jadwal mengajar hari ini`;
    }
    return "Semua tugas sudah dinilai";
  };

  // Responsive detector
  const [isMobile, setIsMobile] = React.useState(window.innerWidth <= 768);

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <Card
      style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        border: "none",
        borderRadius: isMobile ? 16 : 20,
        color: "white",
        boxShadow: "0 8px 32px rgba(102, 126, 234, 0.3)",
        overflow: "hidden",
        position: "relative",
        margin: 0,
      }}
      bodyStyle={{
        padding: isMobile ? "20px 16px" : "32px 24px",
        margin: 0,
      }}
    >
      {/* Background Pattern */}
      <div
        style={{
          position: "absolute",
          top: isMobile ? -30 : -50,
          right: isMobile ? -30 : -50,
          width: isMobile ? 120 : 200,
          height: isMobile ? 120 : 200,
          background: "rgba(255, 255, 255, 0.1)",
          borderRadius: "50%",
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: isMobile ? -20 : -30,
          left: isMobile ? -20 : -30,
          width: isMobile ? 100 : 150,
          height: isMobile ? 100 : 150,
          background: "rgba(255, 255, 255, 0.05)",
          borderRadius: "50%",
          zIndex: 0,
        }}
      />

      <Row
        gutter={[isMobile ? 16 : 24, isMobile ? 16 : 20]}
        style={{
          position: "relative",
          zIndex: 1,
          margin: 0,
        }}
      >
        <Col xs={24} lg={16}>
          <Space
            direction="vertical"
            size={isMobile ? "small" : "medium"}
            style={{ width: "100%" }}
          >
            {/* Main Greeting */}
            <div
              style={{
                display: "flex",
                alignItems: isMobile ? "flex-start" : "center",
                gap: isMobile ? 12 : 16,
                flexDirection: isMobile ? "column" : "row",
                textAlign: isMobile ? "center" : "left",
              }}
            >
              <div
                style={{
                  width: isMobile ? "100%" : "auto",
                  display: "flex",
                  justifyContent: isMobile ? "center" : "flex-start",
                  marginBottom: isMobile ? 8 : 0,
                }}
              >
                <Badge
                  dot
                  color="#52c41a"
                  offset={[-4, 4]}
                  style={{ backgroundColor: "#52c41a" }}
                >
                  <Avatar
                    size={isMobile ? 56 : 64}
                    icon={<UserOutlined />}
                    style={{
                      background: "rgba(255, 255, 255, 0.2)",
                      border: "3px solid rgba(255, 255, 255, 0.3)",
                    }}
                  />
                </Badge>
              </div>
              <div style={{ width: "100%" }}>
                <Title
                  level={isMobile ? 3 : 2}
                  style={{
                    color: "white",
                    margin: 0,
                    marginBottom: isMobile ? 4 : 8,
                    fontSize: isMobile ? "20px" : "clamp(24px, 4vw, 32px)",
                    lineHeight: isMobile ? 1.3 : 1.2,
                  }}
                >
                  {getGreeting()}, {userName}!
                </Title>
                <Text
                  style={{
                    color: "rgba(255, 255, 255, 0.9)",
                    fontSize: isMobile ? 14 : 16,
                    display: "block",
                  }}
                >
                  {getActivitySummary()}
                </Text>
              </div>
            </div>

            {/* Quick Info Tags */}
            <div
              style={{
                display: "flex",
                gap: isMobile ? 8 : 12,
                flexWrap: "wrap",
                justifyContent: isMobile ? "center" : "flex-start",
                marginTop: isMobile ? 8 : 12,
              }}
            >
              <div
                style={{
                  background: "rgba(255, 255, 255, 0.15)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  borderRadius: isMobile ? 16 : 20,
                  padding: isMobile ? "4px 10px" : "6px 12px",
                  display: "flex",
                  alignItems: "center",
                  gap: isMobile ? 4 : 6,
                }}
              >
                <BookOutlined style={{ fontSize: isMobile ? 12 : 14 }} />
                <Text style={{ color: "white", fontSize: isMobile ? 11 : 13 }}>
                  {dashboard?.subjects_count || 0} Mata Pelajaran
                </Text>
              </div>
              <div
                style={{
                  background: "rgba(255, 255, 255, 0.15)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  borderRadius: isMobile ? 16 : 20,
                  padding: isMobile ? "4px 10px" : "6px 12px",
                  display: "flex",
                  alignItems: "center",
                  gap: isMobile ? 4 : 6,
                }}
              >
                <UserOutlined style={{ fontSize: isMobile ? 12 : 14 }} />
                <Text style={{ color: "white", fontSize: isMobile ? 11 : 13 }}>
                  {dashboard?.total_students || 0} Siswa
                </Text>
              </div>
              <div
                style={{
                  background: "rgba(255, 255, 255, 0.15)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  borderRadius: isMobile ? 16 : 20,
                  padding: isMobile ? "4px 10px" : "6px 12px",
                  display: "flex",
                  alignItems: "center",
                  gap: isMobile ? 4 : 6,
                }}
              >
                <ClockCircleOutlined style={{ fontSize: isMobile ? 12 : 14 }} />
                <Text style={{ color: "white", fontSize: isMobile ? 11 : 13 }}>
                  {new Date().toLocaleDateString("id-ID", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                  })}
                </Text>
              </div>
            </div>
          </Space>
        </Col>

        <Col xs={24} lg={8}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: isMobile ? 8 : 12,
              height: "100%",
              marginTop: isMobile ? 16 : 0,
            }}
          >
            {/* Quick Actions */}
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: isMobile ? "row" : "column",
                gap: isMobile ? 8 : 8,
              }}
            >
              <Button
                type="primary"
                ghost
                icon={<ReloadOutlined />}
                onClick={onRefresh}
                loading={refreshing}
                style={{
                  borderColor: "rgba(255, 255, 255, 0.5)",
                  color: "white",
                  borderRadius: isMobile ? 8 : 10,
                  height: isMobile ? 36 : 40,
                  fontSize: isMobile ? 12 : 14,
                  flex: isMobile ? 1 : "none",
                }}
                block={!isMobile}
              >
                {isMobile ? "Refresh" : "Refresh Data"}
              </Button>
              <Button
                type="primary"
                ghost
                icon={<DashboardOutlined />}
                style={{
                  borderColor: "rgba(255, 255, 255, 0.5)",
                  color: "white",
                  borderRadius: isMobile ? 8 : 10,
                  height: isMobile ? 36 : 40,
                  fontSize: isMobile ? 12 : 14,
                  flex: isMobile ? 1 : "none",
                }}
                block={!isMobile}
              >
                {isMobile ? "Kelas" : "Kelola Kelas"}
              </Button>
            </div>

            {/* Notification Badge */}
            {dashboard?.pending_submissions > 0 && (
              <div
                style={{
                  background: "rgba(255, 77, 79, 0.2)",
                  border: "1px solid rgba(255, 77, 79, 0.5)",
                  borderRadius: isMobile ? 8 : 12,
                  padding: isMobile ? "8px 12px" : "12px",
                  textAlign: "center",
                  marginTop: isMobile ? 8 : 0,
                }}
              >
                <BellOutlined
                  style={{
                    color: "#ff6b6b",
                    fontSize: isMobile ? 14 : 16,
                    marginRight: isMobile ? 6 : 8,
                  }}
                />
                <Text
                  style={{
                    color: "white",
                    fontSize: isMobile ? 11 : 12,
                  }}
                >
                  {dashboard.pending_submissions} tugas menunggu
                </Text>
              </div>
            )}
          </div>
        </Col>
      </Row>
    </Card>
  );
};

export default TeacherWelcomeCard;
