import React, { useState } from "react";
import {
  Card,
  Typography,
  Progress,
  List,
  Tag,
  Button,
  Spin,
  Space,
  Row,
  Col,
  Breadcrumb,
  Statistic,
  Avatar,
  Tooltip,
} from "antd";
import {
  ArrowLeftOutlined,
  FileTextOutlined,
  UserOutlined,
  ClockCircleOutlined,
  BookOutlined,
  HomeOutlined,
  CalendarOutlined,
  TrophyOutlined,
  PlayCircleOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

const getProgressColor = (percent) => {
  if (percent >= 80) return "#52c41a";
  if (percent >= 60) return "#faad14";
  return "#ff4d4f";
};

const SubjectDetailStudent = ({ subject, onBack }) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const materials = subject.materials || [];

  return (
    <div
      style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "24px 16px",
        minHeight: "calc(100vh - 64px)",
      }}
    >
      {/* Breadcrumb */}
      <Breadcrumb
        style={{ marginBottom: 24 }}
        items={[
          {
            href: "/student",
            title: (
              <Space>
                <HomeOutlined />
                <span>Dashboard</span>
              </Space>
            ),
          },
          {
            title: (
              <Space>
                <BookOutlined />
                <span>My Subjects</span>
              </Space>
            ),
            onClick: onBack,
            style: { cursor: "pointer" },
          },
          {
            title: (
              <Space>
                <FileTextOutlined />
                <span>{subject.name}</span>
              </Space>
            ),
          },
        ]}
      />

      {/* Header Section */}
      <div
        style={{
          background: "linear-gradient(135deg, #001529 0%, #3a3f5c 60%, #43cea2 100%)", // Sama dengan StudentLayout
          borderRadius: 16,
          padding: "32px 24px",
          marginBottom: 32,
          color: "white",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -20,
            right: -20,
            width: 100,
            height: 100,
            borderRadius: "50%",
            background: "rgba(255, 255, 255, 0.1)",
          }}
        />

        <Row gutter={[24, 24]} align="middle">
          <Col xs={24} md={16}>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={onBack}
              style={{
                marginBottom: 16,
                background: "rgba(255, 255, 255, 0.15)",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                color: "white",
                borderRadius: 8,
              }}
            >
              Kembali
            </Button>

            <Title
              level={2}
              style={{ color: "white", margin: 0, marginBottom: 12 }}
            >
              {subject.name}
            </Title>

            <Space size={16} style={{ marginBottom: 16 }}>
              <Space size={8}>
                <UserOutlined />
                <Text style={{ color: "rgba(255,255,255,0.9)" }}>
                  Guru: <strong>{subject.teacher_name || "-"}</strong>
                </Text>
              </Space>
              <Space size={8}>
                <FileTextOutlined />
                <Text style={{ color: "rgba(255,255,255,0.9)" }}>
                  {materials.length} Materi
                </Text>
              </Space>
            </Space>

            {/* Schedules */}
            {subject.schedules && subject.schedules.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <Space size={8} style={{ marginBottom: 8 }}>
                  <CalendarOutlined />
                  <Text
                    style={{ color: "rgba(255,255,255,0.9)", fontWeight: 500 }}
                  >
                    Jadwal:
                  </Text>
                </Space>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 8,
                    justifyContent: "center", // tambahkan ini agar tag di tengah
                    textAlign: "center", // tambahkan ini juga
                  }}
                >
                  {subject.schedules.map((schedule, idx) => (
                    <Tag
                      key={idx}
                      style={{
                        background: "rgba(255, 255, 255, 0.15)",
                        color: "white",
                        border: "1px solid rgba(255, 255, 255, 0.3)",
                        fontSize: 12,
                      }}
                    >
                      {schedule.day_of_week}, {schedule.time}
                    </Tag>
                  ))}
                </div>
              </div>
            )}
          </Col>

          <Col xs={24} md={8}>
            <div
              style={{
                background: "rgba(255, 255, 255, 0.15)",
                borderRadius: 16,
                padding: 24,
                textAlign: "center",
                backdropFilter: "blur(10px)",
              }}
            >
              <div style={{ marginBottom: 16 }}>
                <Progress
                  type="circle"
                  percent={subject.progress || 0}
                  strokeColor="white"
                  trailColor="rgba(255, 255, 255, 0.2)"
                  size={80}
                  format={(percent) => (
                    <span
                      style={{ color: "white", fontSize: 16, fontWeight: 600 }}
                    >
                      {percent}%
                    </span>
                  )}
                />
              </div>
              <Text
                style={{
                  color: "rgba(255,255,255,0.9)",
                  fontSize: 14,
                  fontWeight: 500,
                }}
              >
                Progress Pembelajaran
              </Text>
            </div>
          </Col>
        </Row>
      </div>

      {/* Stats Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
        <Col xs={12} sm={8} md={6}>
          <Card style={{ borderRadius: 12, textAlign: "center" }}>
            <Statistic
              title="Total Materi"
              value={materials.length}
              prefix={<FileTextOutlined style={{ color: "#1890ff" }} />}
              valueStyle={{ color: "#1890ff", fontSize: 24 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={6}>
          <Card style={{ borderRadius: 12, textAlign: "center" }}>
            <Statistic
              title="Selesai"
              value={materials.filter((m) => m.completed).length}
              prefix={<TrophyOutlined style={{ color: "#52c41a" }} />}
              valueStyle={{ color: "#52c41a", fontSize: 24 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={6}>
          <Card style={{ borderRadius: 12, textAlign: "center" }}>
            <Statistic
              title="Belum Selesai"
              value={materials.filter((m) => !m.completed).length}
              prefix={<ClockCircleOutlined style={{ color: "#faad14" }} />}
              valueStyle={{ color: "#faad14", fontSize: 24 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={6}>
          <Card style={{ borderRadius: 12, textAlign: "center" }}>
            <Statistic
              title="Progress"
              value={subject.progress || 0}
              suffix="%"
              prefix={
                <TrophyOutlined
                  style={{ color: getProgressColor(subject.progress || 0) }}
                />
              }
              valueStyle={{
                color: getProgressColor(subject.progress || 0),
                fontSize: 24,
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* Materials List */}
      <Card
        title={
          <Space>
            <FileTextOutlined style={{ color: "#11418b" }} />
            <span>Daftar Materi Pembelajaran</span>
          </Space>
        }
        style={{
          borderRadius: 16,
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}
        styles={{
          header: {
            borderBottom: "1px solid #f0f0f0",
            background: "#fafafa",
          },
        }}
      >
        <List
          itemLayout="horizontal"
          dataSource={materials}
          loading={loading}
          locale={{
            emptyText: (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <FileTextOutlined
                  style={{ fontSize: 48, color: "#d9d9d9", marginBottom: 16 }}
                />
                <div>
                  <Text style={{ fontSize: 16, color: "#666" }}>
                    Belum ada materi tersedia
                  </Text>
                </div>
              </div>
            ),
          }}
          renderItem={(item, index) => (
            <List.Item
              style={{
                padding: "20px 0",
                borderBottom:
                  index === materials.length - 1 ? "none" : "1px solid #f0f0f0",
              }}
              actions={[
                <div
                  key="actions"
                  style={{
                    display: "flex",
                    gap: 8,
                    alignItems: "center",
                    paddingLeft: 10,
                  }}
                >
                  <Button
                    type="primary"
                    icon={<PlayCircleOutlined />}
                    onClick={() => navigate(`/student/materials/${item.slug}`)}
                    style={{ borderRadius: 8 }}
                  >
                    Buka
                  </Button>
                  {item.completed ? (
                    <Tag color="success">✓ Selesai</Tag>
                  ) : (
                    <Tag color="processing">Belum Selesai</Tag>
                  )}
                </div>,
              ]}
            >
              <List.Item.Meta
                avatar={
                  <Avatar
                    style={{
                      backgroundColor: item.completed ? "#52c41a" : "#1890ff",
                      color: "white",
                      flexShrink: 0,
                    }}
                    icon={<FileTextOutlined />}
                  />
                }
                title={
                  <div style={{ width: "100%" }}>
                    <Text
                      strong
                      style={{
                        fontSize: 16,
                        color: "#333",
                        display: "block",
                        marginBottom: 12,
                      }}
                    >
                      {item.title}
                    </Text>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        width: "100%",
                        maxWidth: "100%",
                      }}
                    >
                      <Progress
                        percent={item.progress || 0}
                        size="small"
                        strokeColor={
                          item.progress >= 100 ? "#52c41a" : "#1890ff"
                        }
                        trailColor="#f0f0f0"
                        showInfo={false}
                        style={{ flex: 1, minWidth: 0 }}
                      />
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: item.progress >= 100 ? "#52c41a" : "#1890ff",
                          flexShrink: 0,
                          minWidth: 35,
                          textAlign: "right",
                        }}
                      >
                        {item.progress || 0}%
                      </Text>
                    </div>
                  </div>
                }
                description={
                  <div
                    style={{
                      width: "100%",
                      textAlign: "center",
                      marginTop: 8,
                      marginBottom: 8,
                    }}
                  >
                    <Text
                      type="secondary"
                      style={{
                        fontSize: 13,
                        textAlign: "center",
                        display: "block",
                        paddingRight: 25,
                      }}
                    >
                      {item.last_accessed
                        ? `Terakhir diakses: ${new Date(
                            item.last_accessed
                          ).toLocaleDateString("id-ID")}`
                        : "Belum pernah diakses"}
                    </Text>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
};

export default SubjectDetailStudent;
